import db from '../database/db.js';

export class BillingService {
  async getAllInvoices(userId = null) {
    let invoices = db.getAll('invoices');
    
    if (userId) {
      invoices = invoices.filter(inv => inv.ownerId === userId);
    }
    
    return invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getInvoiceById(id) {
    const invoice = db.getById('invoices', id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async createInvoice(invoiceData) {
    // Validate job card exists
    const jobCard = db.getById('job_cards', invoiceData.jobCardId);
    if (!jobCard) {
      throw new Error('Job card not found');
    }
    
    const newInvoice = await db.create('invoices', invoiceData);
    return newInvoice;
  }

  async updateInvoice(id, updates) {
    const updatedInvoice = await db.update('invoices', id, updates);
    if (!updatedInvoice) {
      throw new Error('Invoice not found');
    }
    return updatedInvoice;
  }

  async deleteInvoice(id) {
    const invoice = db.getById('invoices', id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    // Check if invoice is paid
    if (invoice.status === 'paid') {
      throw new Error('Cannot delete paid invoice');
    }
    
    await db.remove('invoices', id);
    return { message: 'Invoice deleted successfully' };
  }

  async processPayment(invoiceId, amount) {
    const invoice = db.getById('invoices', invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const paidAmount = (invoice.paidAmount || 0) + amount;
    const totalAmount = invoice.totalAmount;
    
    let status = 'pending';
    if (paidAmount >= totalAmount) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }
    
    const updatedInvoice = await db.update('invoices', invoiceId, { paidAmount, status });
    return updatedInvoice;
  }

  async getInvoicesByJobCard(jobCardId) {
    const invoices = db.getAll('invoices');
    return invoices.filter(inv => inv.jobCardId === jobCardId);
  }

  async getInvoicesByOwner(ownerId) {
    const invoices = db.getAll('invoices');
    return invoices.filter(inv => inv.ownerId === ownerId);
  }

  async getPendingInvoices() {
    const invoices = db.getAll('invoices');
    return invoices.filter(inv => inv.status !== 'paid');
  }

  async getRevenueByDateRange(startDate, endDate) {
    const invoices = db.getAll('invoices');
    const filteredInvoices = invoices.filter(inv => {
      const invoiceDate = new Date(inv.createdAt);
      return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });
    
    return filteredInvoices.reduce((total, inv) => total + (inv.paidAmount || 0), 0);
  }
}

export default new BillingService();
