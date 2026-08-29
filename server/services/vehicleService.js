import db from '../database/db.js';

export class VehicleService {
  async getAllVehicles(userId = null) {
    let vehicles = db.getAll('vehicles');
    
    if (userId) {
      vehicles = vehicles.filter(v => v.ownerId === userId);
    }
    
    return vehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getVehicleById(id) {
    const vehicle = db.getById('vehicles', id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return vehicle;
  }

  async createVehicle(vehicleData) {
    // Validate customer exists
    const customer = db.getById('customers', vehicleData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    const newVehicle = await db.create('vehicles', vehicleData);
    return newVehicle;
  }

  async updateVehicle(id, updates) {
    const updatedVehicle = await db.update('vehicles', id, updates);
    if (!updatedVehicle) {
      throw new Error('Vehicle not found');
    }
    return updatedVehicle;
  }

  async deleteVehicle(id) {
    const vehicle = db.getById('vehicles', id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Check if vehicle has job cards
    const jobCards = db.getAll('job_cards').filter(jc => jc.vehicleId === id);
    if (jobCards.length > 0) {
      throw new Error('Cannot delete vehicle with associated job cards');
    }
    
    await db.remove('vehicles', id);
    return { message: 'Vehicle deleted successfully' };
  }

  async getVehiclesByCustomer(customerId) {
    const vehicles = db.getAll('vehicles');
    return vehicles.filter(v => v.customerId === customerId);
  }

  async getVehiclesByOwner(ownerId) {
    const vehicles = db.getAll('vehicles');
    return vehicles.filter(v => v.ownerId === ownerId);
  }
}

export default new VehicleService();
