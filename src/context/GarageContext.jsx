import React, { createContext, useContext, useState } from 'react';
import {
  initialCustomers,
  initialVehicles,
  initialJobCards,
  initialMechanics,
  initialSpareParts,
  initialInvoices,
  initialServiceRecords,
  JOB_CARD_STATUS,
  PAYMENT_STATUS,
} from '../data/models';

const GarageContext = createContext();

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
};

export const GarageProvider = ({ children }) => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [jobCards, setJobCards] = useState(initialJobCards);
  const [mechanics, setMechanics] = useState(initialMechanics);
  const [spareParts, setSpareParts] = useState(initialSpareParts);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [serviceRecords, setServiceRecords] = useState(initialServiceRecords);

  // Customer operations
  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now() };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };

  const getCustomer = (id) => customers.find((c) => c.id === id);

  // Vehicle operations
  const addVehicle = (vehicle) => {
    const newVehicle = { ...vehicle, id: Date.now() };
    setVehicles([...vehicles, newVehicle]);
    return newVehicle;
  };

  const getVehicle = (id) => vehicles.find((v) => v.id === id);

  const getVehiclesByCustomer = (customerId) =>
    vehicles.filter((v) => v.customerId === customerId);

  // Job Card operations
  const createJobCard = (jobCard) => {
    const newJobCard = {
      ...jobCard,
      id: Date.now(),
      status: JOB_CARD_STATUS.CREATED,
      createdAt: new Date().toISOString(),
    };
    setJobCards([...jobCards, newJobCard]);
    return newJobCard;
  };

  const updateJobCardStatus = (id, status) => {
    setJobCards(
      jobCards.map((jc) =>
        jc.id === id ? { ...jc, status, updatedAt: new Date().toISOString() } : jc
      )
    );
  };

  const updateJobCard = (id, updates) => {
    setJobCards(
      jobCards.map((jc) =>
        jc.id === id ? { ...jc, ...updates, updatedAt: new Date().toISOString() } : jc
      )
    );
  };

  const getJobCard = (id) => jobCards.find((jc) => jc.id === id);

  // Mechanic operations
  const assignMechanic = (jobCardId, mechanicId) => {
    setMechanics(
      mechanics.map((m) =>
        m.id === mechanicId ? { ...m, status: 'busy' } : m
      )
    );
    updateJobCard(jobCardId, { mechanicId, status: JOB_CARD_STATUS.ASSIGNED });
  };

  const releaseMechanic = (mechanicId) => {
    setMechanics(
      mechanics.map((m) =>
        m.id === mechanicId ? { ...m, status: 'available' } : m
      )
    );
  };

  // Spare Parts operations
  const updateSparePartStock = (partId, quantity) => {
    setSpareParts(
      spareParts.map((part) =>
        part.id === partId
          ? { ...part, stock: Math.max(0, part.stock - quantity) }
          : part
      )
    );
  };

  const addSparePart = (part) => {
    const newPart = { ...part, id: Date.now() };
    setSpareParts([...spareParts, newPart]);
    return newPart;
  };

  const updateSparePart = (partId, updates) => {
    setSpareParts(
      spareParts.map((part) =>
        part.id === partId ? { ...part, ...updates } : part
      )
    );
  };

  const deleteSparePart = (partId) => {
    setSpareParts(spareParts.filter((part) => part.id !== partId));
  };

  // Invoice operations
  const createInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now(),
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };
    setInvoices([...invoices, newInvoice]);
    return newInvoice;
  };

  const updateInvoicePayment = (invoiceId, amount) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const paidAmount = (inv.paidAmount || 0) + amount;
          const status = paidAmount >= inv.totalAmount ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL;
          return { ...inv, paidAmount, status };
        }
        return inv;
      })
    );
  };

  // Service Record operations
  const createServiceRecord = (record) => {
    const newRecord = {
      ...record,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setServiceRecords([...serviceRecords, newRecord]);
    return newRecord;
  };

  const value = {
    customers,
    vehicles,
    jobCards,
    mechanics,
    setMechanics,
    spareParts,
    invoices,
    serviceRecords,
    addCustomer,
    getCustomer,
    addVehicle,
    getVehicle,
    getVehiclesByCustomer,
    createJobCard,
    updateJobCardStatus,
    updateJobCard,
    getJobCard,
    assignMechanic,
    releaseMechanic,
    updateSparePartStock,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    createInvoice,
    updateInvoicePayment,
    createServiceRecord,
    JOB_CARD_STATUS,
    PAYMENT_STATUS,
  };

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
};
