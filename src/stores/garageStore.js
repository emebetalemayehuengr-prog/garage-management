import { create } from 'zustand';
import { api } from '../utils/api';

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
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  loadData: async () => {
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
      ] = await Promise.all([
        api.get('/customers'),
        api.get('/vehicles'),
        api.get('/job-cards'),
        api.get('/mechanics'),
        api.get('/spare-parts'),
        api.get('/invoices'),
        api.get('/appointments'),
        api.get('/service-records'),
        api.get('/users'),
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
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message || 'Failed to load data', isLoading: false });
    }
  },

  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  updateCustomer: (id, updates) =>
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    })),

  addVehicle: (vehicle) => set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
  updateVehicle: (id, updates) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),
  deleteVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    })),

  addJobCard: (jobCard) => set((state) => ({ jobCards: [...state.jobCards, jobCard] })),
  updateJobCard: (id, updates) =>
    set((state) => ({
      jobCards: state.jobCards.map((jc) => (jc.id === id ? { ...jc, ...updates } : jc)),
    })),

  addMechanic: (mechanic) => set((state) => ({ mechanics: [...state.mechanics, mechanic] })),
  updateMechanic: (id, updates) =>
    set((state) => ({
      mechanics: state.mechanics.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  addSparePart: (part) => set((state) => ({ spareParts: [...state.spareParts, part] })),
  updateSparePart: (id, updates) =>
    set((state) => ({
      spareParts: state.spareParts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteSparePart: (id) =>
    set((state) => ({
      spareParts: state.spareParts.filter((p) => p.id !== id),
    })),

  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    })),

  addAppointment: (appointment) =>
    set((state) => ({ appointments: [...state.appointments, appointment] })),
  updateAppointment: (id, updates) =>
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  addServiceRecord: (record) =>
    set((state) => ({ serviceRecords: [...state.serviceRecords, record] })),
  deleteServiceRecord: (id) =>
    set((state) => ({
      serviceRecords: state.serviceRecords.filter((sr) => sr.id !== id),
    })),

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
