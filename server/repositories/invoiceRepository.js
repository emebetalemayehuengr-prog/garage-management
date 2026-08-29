import { BaseRepository } from './baseRepository.js';

export class InvoiceRepository extends BaseRepository {
  constructor() {
    super('invoices');
  }

  async findByJobCardId(jobCardId) {
    return this.filter(invoice => invoice.jobCardId === jobCardId);
  }

  async findByStatus(status) {
    return this.filter(invoice => invoice.status === status);
  }

  async findByOwnerId(ownerId) {
    return this.filter(invoice => invoice.ownerId === ownerId);
  }

  async getPendingInvoices() {
    return this.filter(invoice => invoice.status !== 'paid');
  }

  async getPaidInvoices() {
    return this.filter(invoice => invoice.status === 'paid');
  }
}

export default new InvoiceRepository();
