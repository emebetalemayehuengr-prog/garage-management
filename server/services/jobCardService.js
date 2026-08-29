import db from '../database/db.js';

export class JobCardService {
  async getAllJobCards(userId = null) {
    let jobCards = db.getAll('job_cards');
    
    if (userId) {
      jobCards = jobCards.filter(jc => jc.ownerId === userId);
    }
    
    return jobCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getJobCardById(id) {
    const jobCard = db.getById('job_cards', id);
    if (!jobCard) {
      throw new Error('Job card not found');
    }
    return jobCard;
  }

  async createJobCard(jobCardData) {
    // Validate vehicle exists
    const vehicle = db.getById('vehicles', jobCardData.vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    const newJobCard = await db.create('job_cards', jobCardData);
    return newJobCard;
  }

  async updateJobCard(id, updates) {
    const updatedJobCard = db.update('job_cards', id, updates);
    if (!updatedJobCard) {
      throw new Error('Job card not found');
    }
    return updatedJobCard;
  }

  async updateJobCardStatus(id, status) {
    const updatedJobCard = db.update('job_cards', id, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    if (!updatedJobCard) {
      throw new Error('Job card not found');
    }
    return updatedJobCard;
  }

  async deleteJobCard(id) {
    const jobCard = db.getById('job_cards', id);
    if (!jobCard) {
      throw new Error('Job card not found');
    }
    
    // Check if job card has invoices
    const invoices = db.getAll('invoices').filter(inv => inv.jobCardId === id);
    if (invoices.length > 0) {
      throw new Error('Cannot delete job card with associated invoices');
    }
    
    db.remove('job_cards', id);
    return { message: 'Job card deleted successfully' };
  }

  async assignMechanic(jobCardId, mechanicId) {
    // Validate job card exists
    const jobCard = db.getById('job_cards', jobCardId);
    if (!jobCard) {
      throw new Error('Job card not found');
    }
    
    // Validate mechanic exists
    const mechanic = db.getById('mechanics', mechanicId);
    if (!mechanic) {
      throw new Error('Mechanic not found');
    }
    
    // Update job card
    const updatedJobCard = db.update('job_cards', jobCardId, { 
      mechanicId, 
      status: 'assigned' 
    });
    
    // Update mechanic status
    db.update('mechanics', mechanicId, { status: 'busy' });
    
    return updatedJobCard;
  }

  async releaseMechanic(mechanicId) {
    const updatedMechanic = db.update('mechanics', mechanicId, { status: 'available' });
    if (!updatedMechanic) {
      throw new Error('Mechanic not found');
    }
    return updatedMechanic;
  }

  async getJobCardsByMechanic(mechanicId) {
    const jobCards = db.getAll('job_cards');
    return jobCards.filter(jc => jc.mechanicId === mechanicId);
  }

  async getJobCardsByOwner(ownerId) {
    const jobCards = db.getAll('job_cards');
    return jobCards.filter(jc => jc.ownerId === ownerId);
  }
}

export default new JobCardService();
