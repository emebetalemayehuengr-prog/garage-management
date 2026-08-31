import db from '../database/db.js';

export class BillingService {
  async getAllInvoices(userId = null) {
    let invoices = db.getAll('invoices');

    if (userId) {
      invoices = invoices.filter((inv) => inv.ownerId === userId);
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

    const serviceTotal = (invoiceData.serviceItems || []).reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
    const partsTotal = (invoiceData.partItems || []).reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
    const baseSubtotal = serviceTotal + partsTotal + (invoiceData.laborCost || 0);
    const hasLineItems =
      (invoiceData.serviceItems || []).length || (invoiceData.partItems || []).length;
    const subtotal = hasLineItems
      ? Math.max(0, baseSubtotal - (invoiceData.discount || 0))
      : invoiceData.totalAmount;
    const taxAmount = subtotal * ((invoiceData.vatRate || 0) / 100);
    const totalAmount = hasLineItems ? subtotal + taxAmount : invoiceData.totalAmount;
    const newInvoice = await db.create('invoices', {
      ...invoiceData,
      serviceCharge: hasLineItems
        ? serviceTotal + (invoiceData.laborCost || 0)
        : invoiceData.serviceCharge,
      partsCost: hasLineItems ? partsTotal : invoiceData.partsCost,
      subtotal,
      taxAmount,
      totalAmount,
      printCount: 0,
      payments: [],
    });
    return newInvoice;
  }

  async registerPrint(id) {
    const invoice = db.getById('invoices', id);
    if (!invoice) throw new Error('Invoice not found');
    const printCount = (invoice.printCount || 0) + 1;
    const updatedInvoice = await db.update('invoices', id, {
      printCount,
      lastPrintedAt: new Date().toISOString(),
    });
    return { invoice: updatedInvoice, isDuplicate: printCount > 1 };
  }

  async recordPayment(id, amount, paymentMethod) {
    const invoice = db.getById('invoices', id);
    if (!invoice) throw new Error('Invoice not found');
    const balance = Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0));
    if (amount > balance) throw new Error('Payment cannot exceed the remaining balance');
    const sequence = (invoice.payments || []).length + 1;
    const payment = {
      id: `${id}-${sequence}`,
      receiptNumber: `RCT-${id}-${String(sequence).padStart(2, '0')}`,
      amount,
      paymentMethod,
      paidAt: new Date().toISOString(),
      printCount: 0,
    };
    const paidAmount = (invoice.paidAmount || 0) + amount;
    const status = paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
    const updatedInvoice = await db.update('invoices', id, {
      paidAmount,
      paymentMethod,
      status,
      payments: [...(invoice.payments || []), payment],
    });
    return { invoice: updatedInvoice, payment };
  }

  async registerReceiptPrint(id, paymentId) {
    const invoice = db.getById('invoices', id);
    if (!invoice) throw new Error('Invoice not found');
    const payment = (invoice.payments || []).find((item) => item.id === paymentId);
    if (!payment) throw new Error('Receipt not found');
    const printCount = (payment.printCount || 0) + 1;
    const updatedPayment = { ...payment, printCount, lastPrintedAt: new Date().toISOString() };
    const payments = invoice.payments.map((item) =>
      item.id === paymentId ? updatedPayment : item
    );
    const updatedInvoice = await db.update('invoices', id, { payments });
    return { invoice: updatedInvoice, payment: updatedPayment, isDuplicate: printCount > 1 };
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
    return invoices.filter((inv) => inv.jobCardId === jobCardId);
  }

  async getInvoicesByOwner(ownerId) {
    const invoices = db.getAll('invoices');
    return invoices.filter((inv) => inv.ownerId === ownerId);
  }

  async getPendingInvoices() {
    const invoices = db.getAll('invoices');
    return invoices.filter((inv) => inv.status !== 'paid');
  }

  async getRevenueByDateRange(startDate, endDate) {
    const invoices = db.getAll('invoices');
    const filteredInvoices = invoices.filter((inv) => {
      const invoiceDate = new Date(inv.createdAt);
      return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });

    return filteredInvoices.reduce((total, inv) => total + (inv.paidAmount || 0), 0);
  }
}

export default new BillingService();
