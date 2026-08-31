import { create } from 'zustand';
import { api } from '../utils/api';

const getAllowedData = async (endpoint) => {
  try {
    return await api.get(endpoint);
  } catch (error) {
    if (error.status === 403) return [];
    throw error;
  }
};

export const useGarageStore = create((set) => ({
  customers: [],
  vehicles: [],
  jobCards: [],
  appointments: [],
  mechanics: [],
  spareParts: [],
  invoices: [],
  serviceRecords: [],
  users: [],
  notifications: [],
  companyProfile: null,
  isLoading: true,
  error: '',

  setCustomers: (customers) => set({ customers }),
  setVehicles: (vehicles) => set({ vehicles }),
  setJobCards: (jobCards) => set({ jobCards }),
  setAppointments: (appointments) => set({ appointments }),
  setMechanics: (mechanics) => set({ mechanics }),
  setSpareParts: (spareParts) => set({ spareParts }),
  setInvoices: (invoices) => set({ invoices }),
  setServiceRecords: (serviceRecords) => set({ serviceRecords }),
  setUsers: (users) => set({ users }),
  setNotifications: (notifications) => set({ notifications }),
  setCompanyProfile: (companyProfile) => set({ companyProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadData: async (role) => {
    set({ isLoading: true, error: '' });
    try {
      const [
        customers,
        vehicles,
        jobCards,
        mechanics,
        spareParts,
        invoices,
        appointments,
        serviceRecords,
        users,
        notifications,
        companyProfile,
      ] = await Promise.all([
        getAllowedData('/customers'),
        getAllowedData('/vehicles'),
        getAllowedData('/job-cards'),
        getAllowedData('/mechanics'),
        getAllowedData('/spare-parts'),
        role === 'mechanic' ? Promise.resolve([]) : getAllowedData('/invoices'),
        getAllowedData('/appointments'),
        getAllowedData('/service-records'),
        role === 'mechanic' ? Promise.resolve([]) : getAllowedData('/users'),
        getAllowedData('/notifications'),
        role === 'owner' || role === 'admin'
          ? getAllowedData('/company-profile')
          : Promise.resolve(null),
      ]);
      set({
        customers,
        vehicles,
        jobCards,
        mechanics,
        spareParts,
        invoices,
        appointments,
        serviceRecords,
        users,
        notifications,
        companyProfile,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message || 'Failed to load data', isLoading: false });
    }
  },

  addCustomer: async (customer) => {
    const created = await api.post('/customers', customer);
    set((state) => ({ customers: [...state.customers, created] }));
    return created;
  },
  updateCustomer: async (id, updates) => {
    const updated = await api.put(`/customers/${id}`, updates);
    set((state) => ({
      customers: state.customers.map((customer) => (customer.id === id ? updated : customer)),
    }));
    return updated;
  },
  deleteCustomer: async (id) => {
    await api.delete(`/customers/${id}`);
    set((state) => ({ customers: state.customers.filter((customer) => customer.id !== id) }));
  },

  addVehicle: async (vehicle) => {
    const created = await api.post('/vehicles', vehicle);
    set((state) => ({ vehicles: [...state.vehicles, created] }));
    return created;
  },
  updateVehicle: async (id, updates) => {
    const updated = await api.put(`/vehicles/${id}`, updates);
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) => (vehicle.id === id ? updated : vehicle)),
    }));
    return updated;
  },
  deleteVehicle: async (id) => {
    await api.delete(`/vehicles/${id}`);
    set((state) => ({ vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id) }));
  },

  addJobCard: async (jobCard) => {
    const created = await api.post('/job-cards', jobCard);
    set((state) => ({ jobCards: [...state.jobCards, created] }));
    return created;
  },
  updateJobCard: async (id, updates) => {
    const updated = await api.put(`/job-cards/${id}`, updates);
    set((state) => ({
      jobCards: state.jobCards.map((jobCard) => (jobCard.id === id ? updated : jobCard)),
    }));
    return updated;
  },
  loadNotifications: async () => {
    const notifications = await getAllowedData('/notifications');
    set({ notifications });
    return notifications;
  },
  markNotificationRead: async (id) => {
    const updated = await api.put(`/notifications/${id}/read`, {});
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  },
  saveCompanyProfile: async (profile) => {
    const saved = await api.put('/company-profile', profile);
    set({ companyProfile: saved });
    return saved;
  },
  registerInvoicePrint: async (id) => {
    const result = await api.post(`/invoices/${id}/print`, {});
    set((state) => ({
      invoices: state.invoices.map((item) => (item.id === id ? result.invoice : item)),
    }));
    return result;
  },
  recordInvoicePayment: async (id, amount, paymentMethod) => {
    const result = await api.post(`/invoices/${id}/payments`, { amount, paymentMethod });
    set((state) => ({
      invoices: state.invoices.map((item) => (item.id === id ? result.invoice : item)),
    }));
    return result;
  },
  registerReceiptPrint: async (invoiceId, paymentId) => {
    const result = await api.post(
      `/invoices/${invoiceId}/receipts/${encodeURIComponent(paymentId)}/print`,
      {}
    );
    set((state) => ({
      invoices: state.invoices.map((item) => (item.id === invoiceId ? result.invoice : item)),
    }));
    return result;
  },

  addMechanic: async (mechanic) => {
    const created = await api.post('/mechanics', mechanic);
    set((state) => ({ mechanics: [...state.mechanics, created] }));
    return created;
  },
  updateMechanic: async (id, updates) => {
    const updated = await api.put(`/mechanics/${id}`, updates);
    set((state) => ({
      mechanics: state.mechanics.map((mechanic) => (mechanic.id === id ? updated : mechanic)),
    }));
    return updated;
  },

  addSparePart: async (part) => {
    const created = await api.post('/spare-parts', part);
    set((state) => ({ spareParts: [...state.spareParts, created] }));
    return created;
  },
  updateSparePart: async (id, updates) => {
    const updated = await api.put(`/spare-parts/${id}`, updates);
    set((state) => ({
      spareParts: state.spareParts.map((part) => (part.id === id ? updated : part)),
    }));
    return updated;
  },
  deleteSparePart: async (id) => {
    await api.delete(`/spare-parts/${id}`);
    set((state) => ({ spareParts: state.spareParts.filter((part) => part.id !== id) }));
  },

  addInvoice: async (invoice) => {
    const created = await api.post('/invoices', invoice);
    set((state) => ({ invoices: [...state.invoices, created] }));
    return created;
  },
  updateInvoice: async (id, updates) => {
    const updated = await api.put(`/invoices/${id}`, updates);
    set((state) => ({
      invoices: state.invoices.map((invoice) => (invoice.id === id ? updated : invoice)),
    }));
    return updated;
  },

  addAppointment: async (appointment) => {
    const created = await api.post('/appointments', appointment);
    set((state) => ({ appointments: [...state.appointments, created] }));
    return created;
  },
  updateAppointment: async (id, updates) => {
    const updated = await api.put(`/appointments/${id}`, updates);
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === id ? updated : appointment
      ),
    }));
    return updated;
  },

  addServiceRecord: async (record) => {
    const created = await api.post('/service-records', record);
    set((state) => ({ serviceRecords: [...state.serviceRecords, created] }));
    return created;
  },
  deleteServiceRecord: async (id) => {
    await api.delete(`/service-records/${id}`);
    set((state) => ({ serviceRecords: state.serviceRecords.filter((record) => record.id !== id) }));
  },

  addUser: async (user) => {
    const created = await api.post('/users', user);
    const mechanics = created.role === 'mechanic' ? await api.get('/mechanics') : null;
    set((state) => ({
      users: [...state.users, created],
      ...(mechanics ? { mechanics } : {}),
    }));
    return created;
  },
  updateUser: async (id, updates) => {
    const updated = await api.put(`/users/${id}`, updates);
    const mechanics = updated.role === 'mechanic' ? await api.get('/mechanics') : null;
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? updated : u)),
      ...(mechanics ? { mechanics } : {}),
    }));
    return updated;
  },
  deleteUser: async (id) => {
    const deletingMechanic = useGarageStore
      .getState()
      .users.some((user) => user.id === id && user.role === 'mechanic');
    await api.delete(`/users/${id}`);
    const mechanics = deletingMechanic ? await api.get('/mechanics') : null;
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      ...(mechanics ? { mechanics } : {}),
    }));
  },
}));
