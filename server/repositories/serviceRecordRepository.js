import { BaseRepository } from './baseRepository.js';

export class ServiceRecordRepository extends BaseRepository {
  constructor() {
    super('service_records');
  }

  async findByJobCardId(jobCardId) {
    return this.filter(sr => sr.jobCardId === jobCardId);
  }

  async findByMechanicId(mechanicId) {
    return this.filter(sr => sr.mechanicId === mechanicId);
  }

  async findByOwnerId(ownerId) {
    return this.filter(sr => sr.ownerId === ownerId);
  }

  async getServiceHistoryByCustomer(customerId) {
    const vehicles = db.getAll('vehicles').filter(v => v.customerId === customerId);
    const vehicleIds = vehicles.map(v => v.id);
    const jobCards = db.getAll('job_cards').filter(jc => vehicleIds.includes(jc.vehicleId));
    const jobCardIds = jobCards.map(jc => jc.id);

    const serviceRecords = await this.getAll();
    return serviceRecords.filter(sr => jobCardIds.includes(sr.jobCardId));
  }
}

export default new ServiceRecordRepository();
