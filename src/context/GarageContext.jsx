import React, { createContext, useContext } from 'react';
import { useGarageStore } from '../stores/garageStore';

const GarageContext = createContext();

export const useGarage = () => {
  const store = useGarageStore();
  return {
    ...store,
    getCustomer: (id) => store.customers.find((c) => c.id === id),
    getVehicle: (id) => store.vehicles.find((v) => v.id === id),
    getJobCard: (id) => store.jobCards.find((jc) => jc.id === id),
    getVehiclesByCustomer: (customerId) => store.vehicles.filter((v) => v.customerId === customerId),
    assignMechanic: async (jobCardId, mechanicId) => {
      await useGarageStore.getState().updateJobCard(jobCardId, { mechanicId, status: 'assigned' });
      await useGarageStore.getState().updateMechanic(mechanicId, { status: 'busy' });
    },
    releaseMechanic: async (mechanicId) => {
      await useGarageStore.getState().updateMechanic(mechanicId, { status: 'available' });
    },
    updateSparePartStock: async (partId, quantity) => {
      const part = store.spareParts.find((p) => p.id === partId);
      if (part) {
        await useGarageStore.getState().updateSparePart(partId, { stock: Math.max(0, part.stock - quantity) });
      }
    },
    updateInvoicePayment: async (invoiceId, amount) => {
      const invoice = store.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        const paidAmount = (invoice.paidAmount || 0) + amount;
        const status = paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
        await useGarageStore.getState().updateInvoice(invoiceId, { paidAmount, status });
      }
    },
    createServiceRecord: async (record) => {
      await useGarageStore.getState().addServiceRecord(record);
    },
    resetData: async () => {
      useGarageStore.getState().setLoading(true);
    },
    exportData: () => {
      const data = {
        customers: store.customers,
        vehicles: store.vehicles,
        jobCards: store.jobCards,
        appointments: store.appointments,
        mechanics: store.mechanics,
        spareParts: store.spareParts,
        invoices: store.invoices,
        serviceRecords: store.serviceRecords,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `garage-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    importData: async (jsonString) => {
      const data = JSON.parse(jsonString);
      if (data.customers) for (const customer of data.customers) await useGarageStore.getState().addCustomer(customer);
      if (data.vehicles) for (const vehicle of data.vehicles) await useGarageStore.getState().addVehicle(vehicle);
      if (data.jobCards) for (const jobCard of data.jobCards) await useGarageStore.getState().addJobCard(jobCard);
      if (data.appointments) for (const appointment of data.appointments) await useGarageStore.getState().addAppointment(appointment);
      if (data.mechanics) for (const mechanic of data.mechanics) await useGarageStore.getState().addMechanic(mechanic);
      if (data.spareParts) for (const part of data.spareParts) await useGarageStore.getState().addSparePart(part);
      if (data.invoices) for (const invoice of data.invoices) await useGarageStore.getState().addInvoice(invoice);
      if (data.serviceRecords) for (const record of data.serviceRecords) await useGarageStore.getState().addServiceRecord(record);
      return true;
    },
    JOB_CARD_STATUS: { CREATED: 'created', ASSIGNED: 'assigned', DIAGNOSED: 'diagnosed', REPAIRING: 'repairing', QUALITY_CHECK: 'quality_check', INVOICED: 'invoiced', PAID: 'paid', DELIVERED: 'delivered' },
    PAYMENT_STATUS: { PENDING: 'pending', PARTIAL: 'partial', PAID: 'paid' },
  };
};

export const GarageProvider = ({ children }) => {
  return <GarageContext.Provider value={{}}>{children}</GarageContext.Provider>;
};
