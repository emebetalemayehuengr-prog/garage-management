import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import db, { initDatabase } from './database/db.js';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

const distPath = join(__dirname, '..', 'dist');
const indexPath = join(distPath, 'index.html');

app.use(cors());
app.use(bodyParser.json());

const getUserId = (req) => {
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId) return Number(headerUserId);
  const bodyUserId = req.body?.ownerId;
  if (bodyUserId) return Number(bodyUserId);
  return null;
};

const matchesOwner = (row, userId) => {
  if (!userId) return true;
  return row.ownerId === userId || row.ownerId === null || row.ownerId === undefined;
};

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

const logRequest = (req, action) => {
  if (!DEBUG) return;
  const userId = getUserId(req);
  console.log(`[API] ${req.method} ${req.path} | user=${userId || 'anon'} | ${action}`);
};

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj };
  if (sanitized.password) sanitized.password = '***';
  if (sanitized.ownerId !== undefined) sanitized.ownerId = Number(sanitized.ownerId);
  return sanitized;
};

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

if (DEBUG) {
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = (body) => {
      logRequest(req, `-> ${JSON.stringify(sanitize(body)).substring(0, 200)}`);
      return originalJson.call(res, body);
    };
    next();
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Garage Management API is running' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  logRequest(req, `login attempt for username=${req.body?.username || 'missing'}`);
  try {
    const rows = db.getAll('users');
    const user = rows.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    const { password: _, ...rest } = user;
    res.json(rest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

console.log(`Starting server on port ${PORT}`);
console.log(`Dist path: ${distPath}`);
console.log(`Index path: ${indexPath}`);

app.get('/api/users', (req, res) => {
  try {
    logRequest(req, 'list users');
    const userId = getUserId(req);
    let rows = db.getAll('users');
    if (userId) rows = rows.filter(u => matchesOwner(u, userId));
    res.json(rows.map(({ password, ...rest }) => rest).sort((a, b) => b.id - a.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req, res) => {
  const { name, username, password, role, ownerId } = req.body;
  try {
    logRequest(req, `create user name=${req.body?.name || 'missing'} role=${req.body?.role || 'missing'}`);
    const item = db.create('users', { name, username, password, role: role || 'mechanic', status: 'available', ownerId: ownerId ? Number(ownerId) : null });
    const { password: _, ...rest } = item;
    res.json(rest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    logRequest(req, `update user id=${req.params.id}`);
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
    logRequest(req, `delete user id=${req.params.id}`);
    db.remove('users', Number(req.params.id));
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers', (req, res) => {
  try {
    logRequest(req, 'list customers');
    const userId = getUserId(req);
    let rows = db.getAll('customers');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  const { name, phone, email, address, ownerId } = req.body;
  try {
    logRequest(req, `create customer name=${req.body?.name || 'missing'}`);
    const item = db.create('customers', { name, phone, email, address, ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    logRequest(req, `update customer id=${req.params.id}`);
    const item = db.update('customers', Number(req.params.id), { name, phone, email, address });
    if (!item) return res.status(404).json({ error: 'Customer not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    logRequest(req, `delete customer id=${req.params.id}`);
    db.remove('customers', Number(req.params.id));
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vehicles', (req, res) => {
  try {
    logRequest(req, 'list vehicles');
    const userId = getUserId(req);
    let rows = db.getAll('vehicles');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', (req, res) => {
  const { customerId, plateNumber, manufacturer, model, year, color, vin, ownerId } = req.body;
  try {
    logRequest(req, `create vehicle plate=${req.body?.plateNumber || 'missing'}`);
    const item = db.create('vehicles', { customerId, plateNumber, manufacturer, model, year, color, vin, ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehicles/:id', (req, res) => {
  const { customerId, plateNumber, manufacturer, model, year, color, vin } = req.body;
  try {
    logRequest(req, `update vehicle id=${req.params.id}`);
    const item = db.update('vehicles', Number(req.params.id), { customerId, plateNumber, manufacturer, model, year, color, vin });
    if (!item) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  try {
    logRequest(req, `delete vehicle id=${req.params.id}`);
    db.remove('vehicles', Number(req.params.id));
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/job-cards', (req, res) => {
  try {
    logRequest(req, 'list job cards');
    const userId = getUserId(req);
    let rows = db.getAll('job_cards');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/job-cards', (req, res) => {
  const { vehicleId, problemDescription, priority, mechanicId, ownerId } = req.body;
  try {
    logRequest(req, `create job card vehicleId=${req.body?.vehicleId || 'missing'}`);
    const item = db.create('job_cards', { vehicleId, problemDescription, priority: priority || 'normal', mechanicId, status: 'created', ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/job-cards/:id', (req, res) => {
  const { status, mechanicId } = req.body;
  try {
    logRequest(req, `update job card id=${req.params.id}`);
    const item = db.update('job_cards', Number(req.params.id), { status, mechanicId, updatedAt: new Date().toISOString() });
    if (!item) return res.status(404).json({ error: 'Job card not found' });
    res.json({ id: item.id, status: item.status, mechanicId: item.mechanicId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/job-cards/:id', (req, res) => {
  try {
    logRequest(req, `delete job card id=${req.params.id}`);
    db.remove('job_cards', Number(req.params.id));
    res.json({ message: 'Job card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mechanics', (req, res) => {
  try {
    logRequest(req, 'list mechanics');
    const userId = getUserId(req);
    let rows = db.getAll('mechanics');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mechanics', (req, res) => {
  const { name, specialization, photo, ownerId } = req.body;
  try {
    logRequest(req, `create mechanic name=${req.body?.name || 'missing'}`);
    const item = db.create('mechanics', { name, specialization, photo, status: 'available', ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mechanics/:id', (req, res) => {
  const { name, specialization, status, photo } = req.body;
  try {
    logRequest(req, `update mechanic id=${req.params.id}`);
    const item = db.update('mechanics', Number(req.params.id), { name, specialization, status, photo });
    if (!item) return res.status(404).json({ error: 'Mechanic not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/mechanics/:id', (req, res) => {
  try {
    logRequest(req, `delete mechanic id=${req.params.id}`);
    db.remove('mechanics', Number(req.params.id));
    res.json({ message: 'Mechanic deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/spare-parts', authenticateToken, requireOwnerOrAdminOrMechanic, (req, res) => {
  try {
    logRequest(req, 'list spare parts');
    const userId = getUserId(req);
    let rows = db.getAll('spare_parts');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/spare-parts', authenticateToken, requireOwnerOrAdmin, async (req, res) => {
  const { name, category, make, model, year, stock, price, compatibleWith, ownerId } = req.body;
  try {
    logRequest(req, `create spare part name=${req.body?.name || 'missing'}`);
    const item = await db.create('spare_parts', { name, category, make, model, year, stock, price, compatibleWith, ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/spare-parts/:id', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  const { name, category, make, model, year, stock, price, compatibleWith } = req.body;
  try {
    logRequest(req, `update spare part id=${req.params.id}`);
    const item = db.update('spare_parts', Number(req.params.id), { name, category, make, model, year, stock, price, compatibleWith });
    if (!item) return res.status(404).json({ error: 'Spare part not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/spare-parts/:id', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  try {
    logRequest(req, `delete spare part id=${req.params.id}`);
    db.remove('spare_parts', Number(req.params.id));
    res.json({ message: 'Spare part deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  try {
    logRequest(req, 'list invoices');
    const userId = getUserId(req);
    let rows = db.getAll('invoices');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', authenticateToken, requireOwnerOrAdmin, async (req, res) => {
  const { jobCardId, totalAmount, paidAmount, status, ownerId } = req.body;
  try {
    logRequest(req, `create invoice jobCardId=${req.body?.jobCardId || 'missing'}`);
    const item = await db.create('invoices', { jobCardId, totalAmount, paidAmount: paidAmount || 0, status: status || 'pending', ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  const { paidAmount, status } = req.body;
  try {
    logRequest(req, `update invoice id=${req.params.id}`);
    const item = db.update('invoices', Number(req.params.id), { paidAmount, status });
    if (!item) return res.status(404).json({ error: 'Invoice not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  try {
    logRequest(req, `delete invoice id=${req.params.id}`);
    db.remove('invoices', Number(req.params.id));
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/service-records', authenticateToken, requireOwnerOrAdminOrMechanic, (req, res) => {
  try {
    logRequest(req, 'list service records');
    const userId = getUserId(req);
    let rows = db.getAll('service_records');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/service-records', authenticateToken, requireOwnerOrAdminOrMechanic, async (req, res) => {
  const { jobCardId, description, partsUsed, laborHours, mechanicId, ownerId } = req.body;
  try {
    logRequest(req, `create service record jobCardId=${req.body?.jobCardId || 'missing'}`);
    const item = await db.create('service_records', { jobCardId, description, partsUsed, laborHours, mechanicId, ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/service-records/:id', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  try {
    logRequest(req, `delete service record id=${req.params.id}`);
    db.remove('service_records', Number(req.params.id));
    res.json({ message: 'Service record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments', authenticateToken, requireOwnerOrAdminOrMechanic, (req, res) => {
  try {
    logRequest(req, 'list appointments');
    const userId = getUserId(req);
    let rows = db.getAll('appointments');
    if (userId) rows = rows.filter(r => matchesOwner(r, userId));
    res.json(rows.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', authenticateToken, requireOwnerOrAdmin, async (req, res) => {
  const { customerId, vehicleId, date, time, serviceType, notes, status, ownerId } = req.body;
  try {
    logRequest(req, `create appointment date=${req.body?.date || 'missing'}`);
    const item = db.create('appointments', { customerId: Number(customerId), vehicleId: Number(vehicleId), date, time, serviceType, notes, status: status || 'scheduled', ownerId: ownerId ? Number(ownerId) : null });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', (req, res) => {
  const { customerId, vehicleId, date, time, serviceType, notes, status } = req.body;
  try {
    logRequest(req, `update appointment id=${req.params.id}`);
    const item = db.update('appointments', Number(req.params.id), { customerId: Number(customerId), vehicleId: Number(vehicleId), date, time, serviceType, notes, status });
    if (!item) return res.status(404).json({ error: 'Appointment not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  try {
    logRequest(req, `delete appointment id=${req.params.id}`);
    db.remove('appointments', Number(req.params.id));
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  const distExists = fs.existsSync(distPath);
  const indexExists = fs.existsSync(indexPath);
  console.log(`Dist directory exists: ${distExists}`);
  console.log(`Index.html exists: ${indexExists}`);

  if (distExists) {
    app.use(express.static(distPath));
  }
  app.get('/', (req, res) => {
    console.log('Serving index.html for root path');
    res.sendFile(indexPath);
  });
  app.get('/*', (req, res) => {
    console.log(`SPA fallback for: ${req.path}`);
    res.sendFile(indexPath);
  });
}

app.listen(PORT, () => {
  console.log(`Garage Management API running on http://localhost:${PORT}`);
});
