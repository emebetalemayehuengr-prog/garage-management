import bcrypt from 'bcrypt';
import db from '../database/db.js';
import { verifyPassword } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../middleware/errorHandler.js';

const SALT_ROUNDS = 10;

export class AuthService {
  async login(username, password) {
    const users = db.getAll('users');
    const user = users.find((u) => u.username === username);

    if (!user) {
      throw new AuthenticationError('Invalid username or password');
    }

    if (user.status === 'disabled') {
      throw new AuthorizationError('Account is disabled');
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid username or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
      expiresIn: '24h',
    };
  }

  async getUserById(id) {
    const user = db.getById('users', id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(actor) {
    let users = db.getAll('users');

    if (actor.role === 'admin') {
      users = users.filter((user) => user.role === 'owner');
    } else if (actor.role === 'owner') {
      users = users.filter((user) => user.role === 'mechanic' && user.ownerId === actor.id);
    } else {
      users = [];
    }

    return users.map(({ password, ...rest }) => rest).sort((a, b) => b.id - a.id);
  }

  async createUser(actor, userData) {
    const existingUser = db
      .getAll('users')
      .find((user) => user.username.toLowerCase() === userData.username.toLowerCase());
    if (existingUser) {
      throw new ConflictError('Username is already in use');
    }

    let accountData;
    if (actor.role === 'admin') {
      if (userData.role !== 'owner')
        throw new AuthorizationError('Platform admins can only create garage owner accounts');
      accountData = { ...userData, role: 'owner', ownerId: null, status: 'active' };
    } else if (actor.role === 'owner') {
      if (userData.role !== 'mechanic')
        throw new AuthorizationError('Garage owners can only create mechanic accounts');
      accountData = { ...userData, role: 'mechanic', ownerId: actor.id, status: 'active' };
    } else {
      throw new AuthorizationError('You are not allowed to create accounts');
    }

    let newUser = await db.create('users', accountData);
    if (newUser.role === 'mechanic') {
      const mechanic = await db.create('mechanics', {
        name: newUser.name,
        specialization: 'General',
        status: 'available',
        photo: '',
        ownerId: actor.id,
        userId: newUser.id,
        createdAt: new Date().toISOString(),
      });
      newUser = await db.update('users', newUser.id, { mechanicId: mechanic.id });
    }
    const { password, ...rest } = newUser;
    return rest;
  }

  async updateUser(actor, id, updates) {
    const target = db.getById('users', id);
    if (!target) throw new NotFoundError('User not found');
    this.assertCanManage(actor, target);

    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.username !== undefined) {
      const duplicate = db
        .getAll('users')
        .find(
          (user) => user.id !== id && user.username.toLowerCase() === updates.username.toLowerCase()
        );
      if (duplicate) throw new ConflictError('Username is already in use');
      updateData.username = updates.username;
    }
    if (updates.status !== undefined) {
      if (!['active', 'disabled'].includes(updates.status))
        throw new ValidationError('Invalid account status');
      updateData.status = updates.status;
    }
    if (updates.password) updateData.password = updates.password;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    const updatedUser = await db.update('users', id, updateData);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    if (target.role === 'mechanic' && target.mechanicId && updateData.name !== undefined) {
      await db.update('mechanics', target.mechanicId, { name: updateData.name });
    }
    const { password, ...rest } = updatedUser;
    return rest;
  }

  async deleteUser(actor, id) {
    const user = db.getById('users', id);
    if (!user) {
      throw new Error('User not found');
    }

    this.assertCanManage(actor, user);
    if (user.role === 'mechanic') {
      const mechanic = user.mechanicId
        ? db.getById('mechanics', user.mechanicId)
        : db.getAll('mechanics').find((item) => item.userId === user.id);
      if (mechanic) {
        const activeJobs = db
          .getAll('job_cards')
          .filter((job) => job.mechanicId === mechanic.id && job.status !== 'delivered');
        if (activeJobs.length > 0) {
          throw new ConflictError('Cannot delete a mechanic with active job cards');
        }
        await db.remove('mechanics', mechanic.id);
      }
    }
    await db.remove('users', id);
    return { message: 'User deleted successfully' };
  }

  assertCanManage(actor, target) {
    const allowed =
      actor.role === 'admin'
        ? target.role === 'owner'
        : actor.role === 'owner' && target.role === 'mechanic' && target.ownerId === actor.id;
    if (!allowed) throw new AuthorizationError('You cannot manage this account');
  }
}

export default new AuthService();
