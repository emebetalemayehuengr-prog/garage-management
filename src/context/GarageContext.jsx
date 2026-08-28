import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialCustomers,
  initialVehicles,
  initialJobCards,
  initialAppointments,
  initialMechanics,
  initialSpareParts,
  initialInvoices,
  initialServiceRecords,
  JOB_CARD_STATUS,
  PAYMENT_STATUS,
} from '../data/models';
import { api } from '../utils/api';

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
  const [appointments, setAppointments] = useState(initialAppointments);
  const [mechanics, setMechanics] = useState(initialMechanics);
  const [spareParts, setSpareParts] = useState(initialSpareParts);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [serviceRecords, setServiceRecords] = useState(initialServiceRecords);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [customersData, vehiclesData, jobCardsData, appointmentsData, mechanicsData, sparePartsData, invoicesData, serviceRecordsData] = await Promise.all([
        api.get('/customers'),
        api.get('/vehicles'),
        api.get('/job-cards'),
        api.get('/appointments'),
        api.get('/mechanics'),
        api.get('/spare-parts'),
        api.get('/invoices'),
        api.get('/service-records')
      ]);

      setCustomers(customersData);
      setVehicles(vehiclesData);
      setJobCards(jobCardsData);
      setAppointments(appointmentsData);
      setMechanics(mechanicsData);
      setSpareParts(sparePartsData);
      setInvoices(invoicesData);
      setServiceRecords(serviceRecordsData);
    } catch (error) {
      console.error('Failed to load data from API, using local defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomer = async (customer) => {
    try {
      const newCustomer = await api.post('/customers', customer);
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Failed to add customer:', error);
      throw error;
    }
  };

  const getCustomer = (id) => customers.find((c) => c.id === id);

  const updateCustomer = async (id, updates) => {
    try {
      const updated = await api.put(`/customers/${id}`, updates);
      setCustomers(customers.map(c => c.id === id ? updated : c));
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  };

  const addVehicle = async (vehicle) => {
    try {
      const newVehicle = await api.post('/vehicles', vehicle);
      setVehicles([...vehicles, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      throw error;
    }
  };

  const getVehicle = (id) => vehicles.find((v) => v.id === id);

  const updateVehicle = async (id, updates) => {
    try {
      const updated = await api.put(`/vehicles/${id}`, updates);
      setVehicles(vehicles.map(v => v.id === id ? updated : v));
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      throw error;
    }
  };

  const getVehiclesByCustomer = (customerId) =>
    vehicles.filter((v) => v.customerId === customerId);

  const addAppointment = async (appointment) => {
    try {
      const newAppointment = await api.post('/appointments', appointment);
      setAppointments([...appointments, newAppointment]);
      return newAppointment;
    } catch (error) {
      console.error('Failed to add appointment:', error);
      throw error;
    }
  };

  const createJobCard = async (jobCard) => {
    try {
      const newJobCard = await api.post('/job-cards', {
        ...jobCard,
        status: JOB_CARD_STATUS.CREATED
      });
      setJobCards([...jobCards, newJobCard]);
      return newJobCard;
    } catch (error) {
      console.error('Failed to create job card:', error);
      throw error;
    }
  };

  const updateJobCardStatus = async (id, status) => {
    try {
      await api.put(`/job-cards/${id}`, { status });
      setJobCards(
        jobCards.map((jc) =>
          jc.id === id ? { ...jc, status, updatedAt: new Date().toISOString() } : jc
        )
      );
    } catch (error) {
      console.error('Failed to update job card status:', error);
      throw error;
    }
  };

  const updateJobCard = async (id, updates) => {
    try {
      await api.put(`/job-cards/${id}`, updates);
      setJobCards(
        jobCards.map((jc) =>
          jc.id === id ? { ...jc, ...updates, updatedAt: new Date().toISOString() } : jc
        )
      );
    } catch (error) {
      console.error('Failed to update job card:', error);
      throw error;
    }
  };

  const getJobCard = (id) => jobCards.find((jc) => jc.id === id);

  const assignMechanic = async (jobCardId, mechanicId) => {
    try {
      await api.put(`/job-cards/${jobCardId}`, { mechanicId, status: JOB_CARD_STATUS.ASSIGNED });
      setMechanics(
        mechanics.map((m) =>
          m.id === mechanicId ? { ...m, status: 'busy' } : m
        )
      );
      setJobCards(
        jobCards.map((jc) =>
          jc.id === jobCardId ? { ...jc, mechanicId, status: JOB_CARD_STATUS.ASSIGNED } : jc
        )
      );
    } catch (error) {
      console.error('Failed to assign mechanic:', error);
      throw error;
    }
  };

  const releaseMechanic = async (mechanicId) => {
    try {
      await api.put(`/mechanics/${mechanicId}`, { status: 'available' });
      setMechanics(
        mechanics.map((m) =>
          m.id === mechanicId ? { ...m, status: 'available' } : m
        )
      );
    } catch (error) {
      console.error('Failed to release mechanic:', error);
      throw error;
    }
  };

  const updateMechanic = async (mechanicId, updates) => {
    try {
      await api.put(`/mechanics/${mechanicId}`, updates);
      setMechanics(
        mechanics.map((m) =>
          m.id === mechanicId ? { ...m, ...updates } : m
        )
      );
    } catch (error) {
      console.error('Failed to update mechanic:', error);
      throw error;
    }
  };

  const updateSparePartStock = async (partId, quantity) => {
    try {
      const part = spareParts.find(p => p.id === partId);
      if (part) {
        await api.put(`/spare-parts/${partId}`, { stock: Math.max(0, part.stock - quantity) });
        setSpareParts(
          spareParts.map((p) =>
            p.id === partId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to update spare part stock:', error);
      throw error;
    }
  };

  const addSparePart = async (part) => {
    try {
      const newPart = await api.post('/spare-parts', part);
      setSpareParts([...spareParts, newPart]);
      return newPart;
    } catch (error) {
      console.error('Failed to add spare part:', error);
      throw error;
    }
  };

  const updateSparePart = async (partId, updates) => {
    try {
      await api.put(`/spare-parts/${partId}`, updates);
      setSpareParts(
        spareParts.map((part) =>
          part.id === partId ? { ...part, ...updates } : part
        )
      );
    } catch (error) {
      console.error('Failed to update spare part:', error);
      throw error;
    }
  };

  const deleteSparePart = async (partId) => {
    try {
      await api.delete(`/spare-parts/${partId}`);
      setSpareParts(spareParts.filter((part) => part.id !== partId));
    } catch (error) {
      console.error('Failed to delete spare part:', error);
      throw error;
    }
  };

  const createInvoice = async (invoice) => {
    try {
      const newInvoice = await api.post('/invoices', {
        ...invoice,
        status: PAYMENT_STATUS.PENDING
      });
      setInvoices([...invoices, newInvoice]);
      return newInvoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  };

  const updateInvoicePayment = async (invoiceId, amount) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        const paidAmount = (invoice.paidAmount || 0) + amount;
        const status = paidAmount >= invoice.totalAmount ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL;
        await api.put(`/invoices/${invoiceId}`, { paidAmount, status });
        setInvoices(
          invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, paidAmount, status } : inv
          )
        );
      }
    } catch (error) {
      console.error('Failed to update invoice payment:', error);
      throw error;
    }
  };

  const createServiceRecord = async (record) => {
    try {
      const newRecord = await api.post('/service-records', record);
      setServiceRecords([...serviceRecords, newRecord]);
      return newRecord;
    } catch (error) {
      console.error('Failed to create service record:', error);
      throw error;
    }
  };

  const resetData = async () => {
    try {
      await Promise.all([
        api.get('/customers').then(data => setCustomers(data)),
        api.get('/vehicles').then(data => setVehicles(data)),
        api.get('/job-cards').then(data => setJobCards(data)),
        api.get('/appointments').then(data => setAppointments(data)),
        api.get('/mechanics').then(data => setMechanics(data)),
        api.get('/spare-parts').then(data => setSpareParts(data)),
        api.get('/invoices').then(data => setInvoices(data)),
        api.get('/service-records').then(data => setServiceRecords(data))
      ]);
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  const exportData = async () => {
    const data = {
      customers,
      vehicles,
      jobCards,
      appointments,
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

  const importData = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers) {
        for (const customer of data.customers) {
          await api.post('/customers', customer);
        }
      }
      if (data.vehicles) {
        for (const vehicle of data.vehicles) {
          await api.post('/vehicles', vehicle);
        }
      }
      if (data.jobCards) {
        for (const jobCard of data.jobCards) {
          await api.post('/job-cards', jobCard);
        }
      }
      if (data.appointments) {
        for (const appointment of data.appointments) {
          await api.post('/appointments', appointment);
        }
      }
      if (data.mechanics) {
        for (const mechanic of data.mechanics) {
          await api.post('/mechanics', mechanic);
        }
      }
      if (data.spareParts) {
        for (const part of data.spareParts) {
          await api.post('/spare-parts', part);
        }
      }
      if (data.invoices) {
        for (const invoice of data.invoices) {
          await api.post('/invoices', invoice);
        }
      }
      if (data.serviceRecords) {
        for (const record of data.serviceRecords) {
          await api.post('/service-records', record);
        }
      }
      await loadInitialData();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  };

  const value = {
    customers,
    vehicles,
    jobCards,
    appointments,
    mechanics,
    setMechanics,
    spareParts,
    invoices,
    serviceRecords,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
    getVehiclesByCustomer,
    addAppointment,
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
