import db from '../database/db.js';

export class MechanicService {
  async getAllMechanics(userId = null) {
    let mechanics = db.getAll('mechanics');

    if (userId) {
      mechanics = mechanics.filter((m) => m.ownerId === userId);
    }

    return mechanics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getMechanicById(id) {
    const mechanic = db.getById('mechanics', id);
    if (!mechanic) {
      throw new Error('Mechanic not found');
    }
    return mechanic;
  }

  async createMechanic(mechanicData) {
    const newMechanic = await db.create('mechanics', mechanicData);
    return newMechanic;
  }

  async updateMechanic(id, updates) {
    const mechanic = db.getById('mechanics', id);
    const updatedMechanic = await db.update('mechanics', id, updates);
    if (!updatedMechanic) {
      throw new Error('Mechanic not found');
    }
    if (mechanic?.userId && updates.name !== undefined) {
      await db.update('users', mechanic.userId, { name: updates.name });
    }
    return updatedMechanic;
  }

  async deleteMechanic(id) {
    const mechanic = db.getById('mechanics', id);
    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    // Check if mechanic has assigned job cards
    const jobCards = db
      .getAll('job_cards')
      .filter((jc) => jc.mechanicId === id && jc.status !== 'delivered');
    if (jobCards.length > 0) {
      throw new Error('Cannot delete mechanic with active job cards');
    }

    await db.remove('mechanics', id);
    if (mechanic.userId) {
      await db.remove('users', mechanic.userId);
    }
    return { message: 'Mechanic deleted successfully' };
  }

  async getAvailableMechanics() {
    const mechanics = db.getAll('mechanics');
    return mechanics.filter((m) => m.status === 'available');
  }

  async getMechanicsByOwner(ownerId) {
    const mechanics = db.getAll('mechanics');
    return mechanics.filter((m) => m.ownerId === ownerId);
  }

  async updateMechanicStatus(id, status) {
    const updatedMechanic = await db.update('mechanics', id, { status });
    if (!updatedMechanic) {
      throw new Error('Mechanic not found');
    }
    return updatedMechanic;
  }
}

export default new MechanicService();
