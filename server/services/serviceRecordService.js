import db from '../database/db.js';

export class ServiceRecordService {
  async getAllServiceRecords(userId = null) {
    let serviceRecords = db.getAll('service_records');
    
    if (userId) {
      serviceRecords = serviceRecords.filter(sr => sr.ownerId === userId);
    }
    
    return serviceRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getServiceRecordById(id) {
    const serviceRecord = db.getById('service_records', id);
    if (!serviceRecord) {
      throw new Error('Service record not found');
    }
    return serviceRecord;
  }

  async createServiceRecord(serviceRecordData) {
    // Validate job card exists
    const jobCard = db.getById('job_cards', serviceRecordData.jobCardId);
    if (!jobCard) {
      throw new Error('Job card not found');
    }
    
    const newServiceRecord = await db.create('service_records', serviceRecordData);
    return newServiceRecord;
  }

  async deleteServiceRecord(id) {
    const serviceRecord = db.getById('service_records', id);
    if (!serviceRecord) {
      throw new Error('Service record not found');
    }
    
    db.remove('service_records', id);
    return { message: 'Service record deleted successfully' };
  }

  async getServiceRecordsByJobCard(jobCardId) {
    const serviceRecords = db.getAll('service_records');
    return serviceRecords.filter(sr => sr.jobCardId === jobCardId);
  }

  async getServiceRecordsByMechanic(mechanicId) {
    const serviceRecords = db.getAll('service_records');
    return serviceRecords.filter(sr => sr.mechanicId === mechanicId);
  }

  async getServiceRecordsByOwner(ownerId) {
    const serviceRecords = db.getAll('service_records');
    return serviceRecords.filter(sr => sr.ownerId === ownerId);
  }

  async getServiceRecordsByVehicle(vehicleId) {
    const serviceRecords = db.getAll('service_records');
    const jobCards = db.getAll('job_cards').filter(jc => jc.vehicleId === vehicleId);
    const jobCardIds = jobCards.map(jc => jc.id);
    
    return serviceRecords.filter(sr => jobCardIds.includes(sr.jobCardId));
  }

  async getServiceHistoryByCustomer(customerId) {
    const vehicles = db.getAll('vehicles').filter(v => v.customerId === customerId);
    const vehicleIds = vehicles.map(v => v.id);
    const jobCards = db.getAll('job_cards').filter(jc => vehicleIds.includes(jc.vehicleId));
    const jobCardIds = jobCards.map(jc => jc.id);
    
    const serviceRecords = db.getAll('service_records');
    return serviceRecords.filter(sr => jobCardIds.includes(sr.jobCardId));
  }
}

export default new ServiceRecordService();
