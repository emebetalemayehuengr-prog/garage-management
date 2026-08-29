import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
import { useAuth } from './AuthContext';

const GarageContext = createContext();

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
};

export const GarageProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const ownerId = currentUser?.role === 'admin' ? null : (currentUser?.ownerId || currentUser?.id || null);
  const ownerHeaders = ownerId ? { 'X-User-Id': String(ownerId) } : {};
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
        api.get('/customers', { headers: ownerHeaders }),
        api.get('/vehicles', { headers: ownerHeaders }),
        api.get('/job-cards', { headers: ownerHeaders }),
        api.get('/appointments', { headers: ownerHeaders }),
        api.get('/mechanics', { headers: ownerHeaders }),
        api.get('/spare-parts', { headers: ownerHeaders }),
        api.get('/invoices', { headers: ownerHeaders }),
        api.get('/service-records', { headers: ownerHeaders })
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
      const newCustomer = await api.post('/customers', { ...customer, ownerId }, { headers: ownerHeaders });
      setCustomers([...customers, newCustomer]);
      toast.success('Customer added successfully');
      return newCustomer;
    } catch (error) {
      console.error('Failed to add customer:', error);
      toast.error('Failed to add customer');
      throw error;
    }
  };

  const getCustomer = (id) => customers.find((c) => c.id === id);

  const updateCustomer = async (id, updates) => {
    try {
      const updated = await api.put(`/customers/${id}`, updates, { headers: ownerHeaders });
      setCustomers(customers.map(c => c.id === id ? updated : c));
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await api.delete(`/customers/${id}`, { headers: ownerHeaders });
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
      throw error;
    }
  };

  const addVehicle = async (vehicle) => {
    try {
      const newVehicle = await api.post('/vehicles', { ...vehicle, ownerId }, { headers: ownerHeaders });
      setVehicles([...vehicles, newVehicle]);
      toast.success('Vehicle added successfully');
      return newVehicle;
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      toast.error('Failed to add vehicle');
      throw error;
    }
  };

  const getVehicle = (id) => vehicles.find((v) => v.id === id);

  const updateVehicle = async (id, updates) => {
    try {
      const updated = await api.put(`/vehicles/${id}`, updates, { headers: ownerHeaders });
      setVehicles(vehicles.map(v => v.id === id ? updated : v));
      toast.success('Vehicle updated successfully');
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      toast.error('Failed to update vehicle');
      throw error;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`, { headers: ownerHeaders });
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      toast.error('Failed to delete vehicle');
      throw error;
    }
  };

  const getVehiclesByCustomer = (customerId) =>
    vehicles.filter((v) => v.customerId === customerId);

  const addAppointment = async (appointment) => {
    try {
      const newAppointment = await api.post('/appointments', { ...appointment, ownerId }, { headers: ownerHeaders });
      setAppointments([...appointments, newAppointment]);
      toast.success('Appointment created successfully');
      return newAppointment;
    } catch (error) {
      console.error('Failed to add appointment:', error);
      toast.error('Failed to create appointment');
      throw error;
    }
  };

  const createJobCard = async (jobCard) => {
    try {
      const newJobCard = await api.post('/job-cards', {
        ...jobCard,
        status: JOB_CARD_STATUS.CREATED,
        ownerId
      }, { headers: ownerHeaders });
      setJobCards([...jobCards, newJobCard]);
      toast.success('Job card created successfully');
      return newJobCard;
    } catch (error) {
      console.error('Failed to create job card:', error);
      toast.error('Failed to create job card');
      throw error;
    }
  };

  const updateJobCardStatus = async (id, status) => {
    try {
      await api.put(`/job-cards/${id}`, { status }, { headers: ownerHeaders });
      setJobCards(
        jobCards.map((jc) =>
          jc.id === id ? { ...jc, status, updatedAt: new Date().toISOString() } : jc
        )
      );
      toast.success('Job card status updated');
    } catch (error) {
      console.error('Failed to update job card status:', error);
      toast.error('Failed to update job card status');
      throw error;
    }
  };

  const updateJobCard = async (id, updates) => {
    try {
      await api.put(`/job-cards/${id}`, updates, { headers: ownerHeaders });
      setJobCards(
        jobCards.map((jc) =>
          jc.id === id ? { ...jc, ...updates, updatedAt: new Date().toISOString() } : jc
        )
      );
      toast.success('Job card updated successfully');
    } catch (error) {
      console.error('Failed to update job card:', error);
      toast.error('Failed to update job card');
      throw error;
    }
  };

  const getJobCard = (id) => jobCards.find((jc) => jc.id === id);

  const assignMechanic = async (jobCardId, mechanicId) => {
    try {
      await api.put(`/job-cards/${jobCardId}`, { mechanicId, status: JOB_CARD_STATUS.ASSIGNED }, { headers: ownerHeaders });
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
      toast.success('Mechanic assigned successfully');
    } catch (error) {
      console.error('Failed to assign mechanic:', error);
      toast.error('Failed to assign mechanic');
      throw error;
    }
  };

  const releaseMechanic = async (mechanicId) => {
    try {
      await api.put(`/mechanics/${mechanicId}`, { status: 'available' }, { headers: ownerHeaders });
      setMechanics(
        mechanics.map((m) =>
          m.id === mechanicId ? { ...m, status: 'available' } : m
        )
      );
      toast.success('Mechanic released successfully');
    } catch (error) {
      console.error('Failed to release mechanic:', error);
      toast.error('Failed to release mechanic');
      throw error;
    }
  };

  const updateMechanic = async (mechanicId, updates) => {
    try {
      await api.put(`/mechanics/${mechanicId}`, updates, { headers: ownerHeaders });
      setMechanics(
        mechanics.map((m) =>
          m.id === mechanicId ? { ...m, ...updates } : m
        )
      );
      toast.success('Mechanic updated successfully');
    } catch (error) {
      console.error('Failed to update mechanic:', error);
      toast.error('Failed to update mechanic');
      throw error;
    }
  };

  const addMechanic = async (mechanic) => {
    try {
      const newMechanic = await api.post('/mechanics', { ...mechanic, ownerId }, { headers: ownerHeaders });
      setMechanics([...mechanics, newMechanic]);
      toast.success('Mechanic added successfully');
      return newMechanic;
    } catch (error) {
      console.error('Failed to add mechanic:', error);
      toast.error('Failed to add mechanic');
      throw error;
    }
  };

  const updateSparePartStock = async (partId, quantity) => {
    try {
      const part = spareParts.find(p => p.id === partId);
      if (part) {
        await api.put(`/spare-parts/${partId}`, { stock: Math.max(0, part.stock - quantity) }, { headers: ownerHeaders });
        setSpareParts(
          spareParts.map((p) =>
            p.id === partId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
          )
        );
        toast.success('Stock updated successfully');
      }
    } catch (error) {
      console.error('Failed to update spare part stock:', error);
      toast.error('Failed to update stock');
      throw error;
    }
  };

  const addSparePart = async (part) => {
    try {
      const newPart = await api.post('/spare-parts', { ...part, ownerId }, { headers: ownerHeaders });
      setSpareParts([...spareParts, newPart]);
      toast.success('Spare part added successfully');
      return newPart;
    } catch (error) {
      console.error('Failed to add spare part:', error);
      toast.error('Failed to add spare part');
      throw error;
    }
  };

  const updateSparePart = async (partId, updates) => {
    try {
      await api.put(`/spare-parts/${partId}`, updates, { headers: ownerHeaders });
      setSpareParts(
        spareParts.map((part) =>
          part.id === partId ? { ...part, ...updates } : part
        )
      );
      toast.success('Spare part updated successfully');
    } catch (error) {
      console.error('Failed to update spare part:', error);
      toast.error('Failed to update spare part');
      throw error;
    }
  };

  const deleteSparePart = async (partId) => {
    try {
      await api.delete(`/spare-parts/${partId}`, { headers: ownerHeaders });
      setSpareParts(spareParts.filter((part) => part.id !== partId));
      toast.success('Spare part deleted successfully');
    } catch (error) {
      console.error('Failed to delete spare part:', error);
      toast.error('Failed to delete spare part');
      throw error;
    }
  };

  const createInvoice = async (invoice) => {
    try {
      const newInvoice = await api.post('/invoices', {
        ...invoice,
        status: PAYMENT_STATUS.PENDING,
        ownerId
      }, { headers: ownerHeaders });
      setInvoices([...invoices, newInvoice]);
      toast.success('Invoice created successfully');
      return newInvoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
      throw error;
    }
  };

  const updateInvoicePayment = async (invoiceId, amount) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        const paidAmount = (invoice.paidAmount || 0) + amount;
        const status = paidAmount >= invoice.totalAmount ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL;
        await api.put(`/invoices/${invoiceId}`, { paidAmount, status }, { headers: ownerHeaders });
        setInvoices(
          invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, paidAmount, status } : inv
          )
        );
        toast.success('Payment recorded successfully');
      }
    } catch (error) {
      console.error('Failed to update invoice payment:', error);
      toast.error('Failed to record payment');
      throw error;
    }
  };

  const createServiceRecord = async (record) => {
    try {
      const newRecord = await api.post('/service-records', { ...record, ownerId }, { headers: ownerHeaders });
      setServiceRecords([...serviceRecords, newRecord]);
      toast.success('Service record created successfully');
      return newRecord;
    } catch (error) {
      console.error('Failed to create service record:', error);
      toast.error('Failed to create service record');
      throw error;
    }
  };

  const resetData = async () => {
    try {
      await Promise.all([
        api.get('/customers', { headers: ownerHeaders }).then(data => setCustomers(data)),
        api.get('/vehicles', { headers: ownerHeaders }).then(data => setVehicles(data)),
        api.get('/job-cards', { headers: ownerHeaders }).then(data => setJobCards(data)),
        api.get('/appointments', { headers: ownerHeaders }).then(data => setAppointments(data)),
        api.get('/mechanics', { headers: ownerHeaders }).then(data => setMechanics(data)),
        api.get('/spare-parts', { headers: ownerHeaders }).then(data => setSpareParts(data)),
        api.get('/invoices', { headers: ownerHeaders }).then(data => setInvoices(data)),
        api.get('/service-records', { headers: ownerHeaders }).then(data => setServiceRecords(data))
      ]);
      toast.success('Data reset successfully');
    } catch (error) {
      console.error('Failed to reset data:', error);
      toast.error('Failed to reset data');
    }
  };

  const exportData = async () => {
    try {
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
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  const importData = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers) {
        for (const customer of data.customers) {
          await api.post('/customers', { ...customer, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.vehicles) {
        for (const vehicle of data.vehicles) {
          await api.post('/vehicles', { ...vehicle, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.jobCards) {
        for (const jobCard of data.jobCards) {
          await api.post('/job-cards', { ...jobCard, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.appointments) {
        for (const appointment of data.appointments) {
          await api.post('/appointments', { ...appointment, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.mechanics) {
        for (const mechanic of data.mechanics) {
          await api.post('/mechanics', { ...mechanic, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.spareParts) {
        for (const part of data.spareParts) {
          await api.post('/spare-parts', { ...part, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.invoices) {
        for (const invoice of data.invoices) {
          await api.post('/invoices', { ...invoice, ownerId }, { headers: ownerHeaders });
        }
      }
      if (data.serviceRecords) {
        for (const record of data.serviceRecords) {
          await api.post('/service-records', { ...record, ownerId }, { headers: ownerHeaders });
        }
      }
      await loadInitialData();
      toast.success('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      toast.error('Failed to import data');
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
    addMechanic,
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
