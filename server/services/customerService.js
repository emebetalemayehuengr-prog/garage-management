import customerRepository from '../repositories/customerRepository.js';
import db from '../database/db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class CustomerService {
  async getAllCustomers(userId = null) {
    let customers = await customerRepository.getAll();
    
    if (userId) {
      customers = await customerRepository.findByOwnerId(userId);
    }
    
    return customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getCustomerById(id) {
    const customer = await customerRepository.getById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async createCustomer(customerData) {
    const { username, password, ...customerFields } = customerData;
    const newCustomer = await customerRepository.create(customerFields);
    
    if (username && password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.create('users', {
        name: newCustomer.name,
        username,
        password: hashedPassword,
        role: 'customer',
        status: 'available',
        ownerId: null,
        customerId: newCustomer.id
      });
    }
    
    return newCustomer;
  }

  async updateCustomer(id, updates) {
    const updatedCustomer = await customerRepository.update(id, updates);
    if (!updatedCustomer) {
      throw new Error('Customer not found');
    }
    return updatedCustomer;
  }

  async deleteCustomer(id) {
    const customer = await customerRepository.getById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    const vehicles = db.getAll('vehicles').filter(v => v.customerId === id);
    if (vehicles.length > 0) {
      throw new Error('Cannot delete customer with associated vehicles');
    }
    
    await customerRepository.delete(id);
    return { message: 'Customer deleted successfully' };
  }

  async getCustomersByOwner(ownerId) {
    return customerRepository.findByOwnerId(ownerId);
  }

  async searchCustomers(query) {
    return customerRepository.searchByName(query);
  }
}

export default new CustomerService();