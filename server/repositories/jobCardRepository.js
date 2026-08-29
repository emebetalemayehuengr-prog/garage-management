import { BaseRepository } from './baseRepository.js';

export class JobCardRepository extends BaseRepository {
  constructor() {
    super('job_cards');
  }

  async findByVehicleId(vehicleId) {
    return this.filter(jobCard => jobCard.vehicleId === vehicleId);
  }

  async findByMechanicId(mechanicId) {
    return this.filter(jobCard => jobCard.mechanicId === mechanicId);
  }

  async findByStatus(status) {
    return this.filter(jobCard => jobCard.status === status);
  }

  async findByOwnerId(ownerId) {
    return this.filter(jobCard => jobCard.ownerId === ownerId);
  }

  async findByPriority(priority) {
    return this.filter(jobCard => jobCard.priority === priority);
  }

  async getActiveJobCards() {
    const activeStatuses = ['created', 'assigned', 'diagnosed', 'repairing', 'quality_check'];
    return this.filter(jobCard => activeStatuses.includes(jobCard.status));
  }

  async getCompletedJobCards() {
    return this.filter(jobCard => jobCard.status === 'delivered');
  }

  async searchByDescription(query) {
    const jobCards = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return jobCards.filter(jobCard => 
      jobCard.problemDescription.toLowerCase().includes(lowerQuery)
    );
  }
}

export default new JobCardRepository();
