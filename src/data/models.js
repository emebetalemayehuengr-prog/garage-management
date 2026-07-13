// Data Models for Garage Management System

export const initialCustomers = [];
export const initialVehicles = [];
export const initialJobCards = [];
export const initialMechanics = [
  { id: 1, name: 'John Smith', specialization: 'Engine', status: 'available' },
  { id: 2, name: 'Mike Johnson', specialization: 'Brakes', status: 'available' },
  { id: 3, name: 'Sarah Williams', specialization: 'Electrical', status: 'available' },
  { id: 4, name: 'David Brown', specialization: 'General', status: 'available' },
];
export const initialSpareParts = [
  { id: 1, name: 'Oil Filter', stock: 50, price: 15.00 },
  { id: 2, name: 'Brake Pads', stock: 30, price: 45.00 },
  { id: 3, name: 'Spark Plug', stock: 100, price: 8.00 },
  { id: 4, name: 'Air Filter', stock: 40, price: 12.00 },
  { id: 5, name: 'Battery', stock: 20, price: 120.00 },
];
export const initialInvoices = [];
export const initialServiceRecords = [];

// Status constants
export const JOB_CARD_STATUS = {
  CREATED: 'created',
  INSPECTED: 'inspected',
  ASSIGNED: 'assigned',
  DIAGNOSED: 'diagnosed',
  REPAIRING: 'repairing',
  QUALITY_CHECK: 'quality_check',
  INVOICED: 'invoiced',
  PAID: 'paid',
  DELIVERED: 'delivered',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
};
