import { BaseRepository } from './baseRepository.js';

export class CustomerRepository extends BaseRepository {
  constructor() {
    super('customers');
  }

  async findByPhone(phone) {
    return this.find(customer => customer.phone === phone);
  }

  async findByEmail(email) {
    return this.find(customer => customer.email === email);
  }

  async findByOwnerId(ownerId) {
    return this.filter(customer => customer.ownerId === ownerId);
  }

  async searchByName(query) {
    const customers = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery)
    );
  }
}

export default new CustomerRepository();
