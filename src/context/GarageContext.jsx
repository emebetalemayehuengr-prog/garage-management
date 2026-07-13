import React, { createContext, useContext, useState, useEffect } from 'react';
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

const STORAGE_KEYS = {
  customers: 'garage_customers',
  vehicles: 'garage_vehicles',
  jobCards: 'garage_jobCards',
  mechanics: 'garage_mechanics',
  spareParts: 'garage_spareParts',
  invoices: 'garage_invoices',
  serviceRecords: 'garage_serviceRecords',
};

export const GarageProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.customers);
    return saved ? JSON.parse(saved) : initialCustomers;
  });
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.vehicles);
    return saved ? JSON.parse(saved) : initialVehicles;
  });
  const [jobCards, setJobCards] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.jobCards);
    return saved ? JSON.parse(saved) : initialJobCards;
  });
  const [mechanics, setMechanics] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.mechanics);
    return saved ? JSON.parse(saved) : initialMechanics;
  });
  const [spareParts, setSpareParts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.spareParts);
    return saved ? JSON.parse(saved) : initialSpareParts;
  });
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.invoices);
    return saved ? JSON.parse(saved) : initialInvoices;
  });
  const [serviceRecords, setServiceRecords] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.serviceRecords);
    return saved ? JSON.parse(saved) : initialServiceRecords;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.jobCards, JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.mechanics, JSON.stringify(mechanics));
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.spareParts, JSON.stringify(spareParts));
  }, [spareParts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.serviceRecords, JSON.stringify(serviceRecords));
  }, [serviceRecords]);

  const resetData = () => {
    setCustomers(initialCustomers);
    setVehicles(initialVehicles);
    setJobCards(initialJobCards);
    setMechanics(initialMechanics);
    setSpareParts(initialSpareParts);
    setInvoices(initialInvoices);
    setServiceRecords(initialServiceRecords);
  };

  const exportData = () => {
    const data = {
      customers,
      vehicles,
      jobCards,
      mechanics,
      spareParts,
      invoices,
      serviceRecords,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garage-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers) setCustomers(data.customers);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.jobCards) setJobCards(data.jobCards);
      if (data.mechanics) setMechanics(data.mechanics);
      if (data.spareParts) setSpareParts(data.spareParts);
      if (data.invoices) setInvoices(data.invoices);
      if (data.serviceRecords) setServiceRecords(data.serviceRecords);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  };

  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now() };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };

  const getCustomer = (id) => customers.find((c) => c.id === id);

  const addVehicle = (vehicle) => {
    const newVehicle = { ...vehicle, id: Date.now() };
    setVehicles([...vehicles, newVehicle]);
    return newVehicle;
  };

  const getVehicle = (id) => vehicles.find((v) => v.id === id);

  const getVehiclesByCustomer = (customerId) =>
    vehicles.filter((v) => v.customerId === customerId);

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

  const updateMechanic = (mechanicId, updates) => {
    setMechanics(
      mechanics.map((m) =>
        m.id === mechanicId ? { ...m, ...updates } : m
      )
    );
  };

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
    updateMechanic,
    updateSparePartStock,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    createInvoice,
    updateInvoicePayment,
    createServiceRecord,
    resetData,
    exportData,
    importData,
    JOB_CARD_STATUS,
    PAYMENT_STATUS,
  };

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
};
