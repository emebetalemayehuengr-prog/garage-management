import { BaseRepository } from './baseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByUsername(username) {
    return this.find(user => user.username === username);
  }

  async findByRole(role) {
    return this.filter(user => user.role === role);
  }

  async findByOwnerId(ownerId) {
    return this.filter(user => user.ownerId === ownerId);
  }

  async getAvailableMechanics() {
    return this.filter(user => user.role === 'mechanic' && user.status === 'available');
  }

  async getBusyMechanics() {
    return this.filter(user => user.role === 'mechanic' && user.status === 'busy');
  }
}

export default new UserRepository();
