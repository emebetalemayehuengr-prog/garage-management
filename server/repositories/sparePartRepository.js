import { BaseRepository } from './baseRepository.js';

export class SparePartRepository extends BaseRepository {
  constructor() {
    super('spare_parts');
  }

  async findByCategory(category) {
    return this.filter(part => part.category === category);
  }

  async findByMake(make) {
    return this.filter(part => part.make === make);
  }

  async findByOwnerId(ownerId) {
    return this.filter(part => part.ownerId === ownerId);
  }

  async getLowStockItems(threshold = 10) {
    return this.filter(part => part.stock < threshold);
  }

  async search(query) {
    const parts = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return parts.filter(part =>
      part.name.toLowerCase().includes(lowerQuery) ||
      part.category.toLowerCase().includes(lowerQuery) ||
      part.make.toLowerCase().includes(lowerQuery) ||
      part.model.toLowerCase().includes(lowerQuery)
    );
  }
}

export default new SparePartRepository();
