import bcrypt from 'bcrypt';
import db from '../database/db.js';
import { verifyPassword } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';

const SALT_ROUNDS = 10;

export class AuthService {
  async login(username, password) {
    const users = db.getAll('users');
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);
    
    return {
      user: userWithoutPassword,
      token,
      expiresIn: '24h'
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

  async getAllUsers(userId = null) {
    let users = db.getAll('users');
    
    if (userId) {
      users = users.filter(u => u.ownerId === userId || u.ownerId === null);
    }
    
    return users.map(({ password, ...rest }) => rest).sort((a, b) => b.id - a.id);
  }

  async createUser(userData) {
    const newUser = await db.create('users', userData);
    const { password, ...rest } = newUser;
    return rest;
  }

  async updateUser(id, updates) {
    let updateData = { ...updates };
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }
    
    const updatedUser = db.update('users', id, updateData);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    const { password, ...rest } = updatedUser;
    return rest;
  }

  async deleteUser(id) {
    const user = db.getById('users', id);
    if (!user) {
      throw new Error('User not found');
    }
    
    db.remove('users', id);
    return { message: 'User deleted successfully' };
  }
}

export default new AuthService();