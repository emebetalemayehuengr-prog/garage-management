import { BaseRepository } from './baseRepository.js';

export class MechanicRepository extends BaseRepository {
  constructor() {
    super('mechanics');
  }

  async findBySpecialization(specialization) {
    return this.filter(mechanic => mechanic.specialization === specialization);
  }

  async findByStatus(status) {
    return this.filter(mechanic => mechanic.status === status);
  }

  async findByOwnerId(ownerId) {
    return this.filter(mechanic => mechanic.ownerId === ownerId);
  }

  async getAvailableMechanics() {
    return this.filter(mechanic => mechanic.status === 'available');
  }
}

export default new MechanicRepository();
