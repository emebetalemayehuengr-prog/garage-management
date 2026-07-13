import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db, { initDatabase } from './database/db.js';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Garage Management API is running' });
});

app.get('/api/users', (req, res) => {
  try {
    const rows = db.getAll('users').map(({ password, ...rest }) => rest).sort((a, b) => b.id - a.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const item = db.create('users', { name, username, password, role: role || 'mechanic', status: 'available' });
    const { password: _, ...rest } = item;
    res.json(rest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const item = db.update('users', Number(req.params.id), { name, username, password, role });
    if (!item) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...rest } = item;
    res.json(rest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    db.remove('users', Number(req.params.id));
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers', (req, res) => {
  try {
    const rows = db.getAll('customers').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    const item = db.create('customers', { name, phone, email, address });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    const item = db.update('customers', Number(req.params.id), { name, phone, email, address });
    if (!item) return res.status(404).json({ error: 'Customer not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    db.remove('customers', Number(req.params.id));
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vehicles', (req, res) => {
  try {
    const rows = db.getAll('vehicles').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', (req, res) => {
  const { customerId, plateNumber, manufacturer, model, year, color, vin } = req.body;
  try {
    const item = db.create('vehicles', { customerId, plateNumber, manufacturer, model, year, color, vin });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehicles/:id', (req, res) => {
  const { customerId, plateNumber, manufacturer, model, year, color, vin } = req.body;
  try {
    const item = db.update('vehicles', Number(req.params.id), { customerId, plateNumber, manufacturer, model, year, color, vin });
    if (!item) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  try {
    db.remove('vehicles', Number(req.params.id));
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/job-cards', (req, res) => {
  try {
    const rows = db.getAll('job_cards').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/job-cards', (req, res) => {
  const { vehicleId, problemDescription, priority, mechanicId } = req.body;
  try {
    const item = db.create('job_cards', { vehicleId, problemDescription, priority: priority || 'normal', mechanicId, status: 'created' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/job-cards/:id', (req, res) => {
  const { status, mechanicId } = req.body;
  try {
    const item = db.update('job_cards', Number(req.params.id), { status, mechanicId, updatedAt: new Date().toISOString() });
    if (!item) return res.status(404).json({ error: 'Job card not found' });
    res.json({ id: item.id, status: item.status, mechanicId: item.mechanicId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/job-cards/:id', (req, res) => {
  try {
    db.remove('job_cards', Number(req.params.id));
    res.json({ message: 'Job card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mechanics', (req, res) => {
  try {
    const rows = db.getAll('mechanics').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mechanics', (req, res) => {
  const { name, specialization, photo } = req.body;
  try {
    const item = db.create('mechanics', { name, specialization, photo, status: 'available' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mechanics/:id', (req, res) => {
  const { name, specialization, status, photo } = req.body;
  try {
    const item = db.update('mechanics', Number(req.params.id), { name, specialization, status, photo });
    if (!item) return res.status(404).json({ error: 'Mechanic not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/mechanics/:id', (req, res) => {
  try {
    db.remove('mechanics', Number(req.params.id));
    res.json({ message: 'Mechanic deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/spare-parts', (req, res) => {
  try {
    const rows = db.getAll('spare_parts').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/spare-parts', (req, res) => {
  const { name, category, make, model, year, stock, price, compatibleWith } = req.body;
  try {
    const item = db.create('spare_parts', { name, category, make, model, year, stock, price, compatibleWith });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/spare-parts/:id', (req, res) => {
  const { name, category, make, model, year, stock, price, compatibleWith } = req.body;
  try {
    const item = db.update('spare_parts', Number(req.params.id), { name, category, make, model, year, stock, price, compatibleWith });
    if (!item) return res.status(404).json({ error: 'Spare part not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/spare-parts/:id', (req, res) => {
  try {
    db.remove('spare_parts', Number(req.params.id));
    res.json({ message: 'Spare part deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', (req, res) => {
  try {
    const rows = db.getAll('invoices').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', (req, res) => {
  const { jobCardId, totalAmount, paidAmount, status } = req.body;
  try {
    const item = db.create('invoices', { jobCardId, totalAmount, paidAmount: paidAmount || 0, status: status || 'pending' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', (req, res) => {
  const { paidAmount, status } = req.body;
  try {
    const item = db.update('invoices', Number(req.params.id), { paidAmount, status });
    if (!item) return res.status(404).json({ error: 'Invoice not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', (req, res) => {
  try {
    db.remove('invoices', Number(req.params.id));
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/service-records', (req, res) => {
  try {
    const rows = db.getAll('service_records').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/service-records', (req, res) => {
  const { jobCardId, description, partsUsed, laborHours, mechanicId } = req.body;
  try {
    const item = db.create('service_records', { jobCardId, description, partsUsed, laborHours, mechanicId });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/service-records/:id', (req, res) => {
  try {
    db.remove('service_records', Number(req.params.id));
    res.json({ message: 'Service record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments', (req, res) => {
  try {
    const rows = db.getAll('appointments').sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', (req, res) => {
  const { customerId, vehicleId, date, time, serviceType, notes, status } = req.body;
  try {
    const item = db.create('appointments', { customerId, vehicleId, date, time, serviceType, notes, status: status || 'scheduled' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', (req, res) => {
  const { customerId, vehicleId, date, time, serviceType, notes, status } = req.body;
  try {
    const item = db.update('appointments', Number(req.params.id), { customerId, vehicleId, date, time, serviceType, notes, status });
    if (!item) return res.status(404).json({ error: 'Appointment not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  try {
    db.remove('appointments', Number(req.params.id));
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Garage Management API running on http://localhost:${PORT}`);
});
