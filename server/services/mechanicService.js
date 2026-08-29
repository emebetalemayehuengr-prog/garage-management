import db from '../database/db.js';

export class MechanicService {
  async getAllMechanics(userId = null) {
    let mechanics = db.getAll('mechanics');
    
    if (userId) {
      mechanics = mechanics.filter(m => m.ownerId === userId);
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
    const updatedMechanic = db.update('mechanics', id, updates);
    if (!updatedMechanic) {
      throw new Error('Mechanic not found');
    }
    return updatedMechanic;
  }

  async deleteMechanic(id) {
    const mechanic = db.getById('mechanics', id);
    if (!mechanic) {
      throw new Error('Mechanic not found');
    }
    
    // Check if mechanic has assigned job cards
    const jobCards = db.getAll('job_cards').filter(jc => jc.mechanicId === id && jc.status !== 'delivered');
    if (jobCards.length > 0) {
      throw new Error('Cannot delete mechanic with active job cards');
    }
    
    db.remove('mechanics', id);
    return { message: 'Mechanic deleted successfully' };
  }

  async getAvailableMechanics() {
    const mechanics = db.getAll('mechanics');
    return mechanics.filter(m => m.status === 'available');
  }

  async getMechanicsByOwner(ownerId) {
    const mechanics = db.getAll('mechanics');
    return mechanics.filter(m => m.ownerId === ownerId);
  }

  async updateMechanicStatus(id, status) {
    const updatedMechanic = db.update('mechanics', id, { status });
    if (!updatedMechanic) {
      throw new Error('Mechanic not found');
    }
    return updatedMechanic;
  }
}

export default new MechanicService();
