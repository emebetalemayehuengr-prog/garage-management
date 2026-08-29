import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import db, { initDatabase, verifyPassword } from './database/db.js';
import { generateToken, authenticateToken, requireRole, requireOwnerOrAdmin, requireOwnerOrAdminOrMechanic } from './middleware/auth.js';
import { validate, sanitizeInput } from './middleware/validation.js';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js';
import { 
  authService, 
  customerService, 
  vehicleService, 
  jobCardService, 
  mechanicService, 
  inventoryService, 
  billingService, 
  appointmentService, 
  serviceRecordService 
} from './services/index.js';

await initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

const distPath = join(__dirname, '..', 'dist');
const indexPath = join(distPath, 'index.html');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(bodyParser.json());
app.use(sanitizeInput);
app.use(generalLimiter);

const getUserId = (req) => {
  if (req.user?.id) return Number(req.user.id);
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

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Garage Management API is running', version: '1.0.0' });
});

app.post('/api/v1/login', authLimiter, validate('login'), asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  logRequest(req, `login attempt for username=${req.body?.username || 'missing'}`);
  
  const result = await authService.login(username, password);
  res.json(result);
}));

console.log(`Starting server on port ${PORT}`);
console.log(`Dist path: ${distPath}`);
console.log(`Index path: ${indexPath}`);

app.get('/api/v1/users', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, 'list users');
  const userId = getUserId(req);
  const users = await authService.getAllUsers(userId);
  res.json(users);
}));

app.post('/api/v1/users', authenticateToken, requireOwnerOrAdmin, validate('user'), asyncHandler(async (req, res) => {
  logRequest(req, `create user name=${req.body?.name || 'missing'} role=${req.body?.role || 'missing'}`);
  const user = await authService.createUser(req.body);
  const { password, ...rest } = user;
  res.json(rest);
}));

app.put('/api/v1/users/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update user id=${req.params.id}`);
  const user = await authService.updateUser(Number(req.params.id), req.body);
  const { password, ...rest } = user;
  res.json(rest);
}));

app.delete('/api/v1/users/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete user id=${req.params.id}`);
  await authService.deleteUser(Number(req.params.id));
  res.json({ message: 'User deleted' });
}));

app.get('/api/v1/customers', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, 'list customers');
  const userId = getUserId(req);
  const customers = await customerService.getAllCustomers(userId);
  res.json(customers);
}));

app.post('/api/v1/customers', authenticateToken, requireOwnerOrAdmin, validate('customer'), asyncHandler(async (req, res) => {
  logRequest(req, `create customer name=${req.body?.name || 'missing'}`);
  const customer = await customerService.createCustomer(req.body);
  res.json(customer);
}));

app.put('/api/v1/customers/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update customer id=${req.params.id}`);
  const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
  res.json(customer);
}));

app.delete('/api/v1/customers/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete customer id=${req.params.id}`);
  const result = await customerService.deleteCustomer(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/vehicles', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, 'list vehicles');
  const userId = getUserId(req);
  const vehicles = await vehicleService.getAllVehicles(userId);
  res.json(vehicles);
}));

app.post('/api/v1/vehicles', authenticateToken, requireOwnerOrAdmin, validate('vehicle'), asyncHandler(async (req, res) => {
  logRequest(req, `create vehicle plate=${req.body?.plateNumber || 'missing'}`);
  const vehicle = await vehicleService.createVehicle(req.body);
  res.json(vehicle);
}));

app.put('/api/v1/vehicles/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update vehicle id=${req.params.id}`);
  const vehicle = await vehicleService.updateVehicle(Number(req.params.id), req.body);
  res.json(vehicle);
}));

app.delete('/api/v1/vehicles/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete vehicle id=${req.params.id}`);
  const result = await vehicleService.deleteVehicle(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/job-cards', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, 'list job cards');
  const userId = getUserId(req);
  const jobCards = await jobCardService.getAllJobCards(userId);
  res.json(jobCards);
}));

app.post('/api/v1/job-cards', authenticateToken, requireOwnerOrAdmin, validate('jobCard'), asyncHandler(async (req, res) => {
  logRequest(req, `create job card vehicleId=${req.body?.vehicleId || 'missing'}`);
  const jobCard = await jobCardService.createJobCard(req.body);
  res.json(jobCard);
}));

app.put('/api/v1/job-cards/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update job card id=${req.params.id}`);
  const jobCard = await jobCardService.updateJobCard(Number(req.params.id), req.body);
  res.json(jobCard);
}));

app.delete('/api/v1/job-cards/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete job card id=${req.params.id}`);
  const result = await jobCardService.deleteJobCard(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/mechanics', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, 'list mechanics');
  const userId = getUserId(req);
  const mechanics = await mechanicService.getAllMechanics(userId);
  res.json(mechanics);
}));

app.post('/api/v1/mechanics', authenticateToken, requireOwnerOrAdmin, validate('mechanic'), asyncHandler(async (req, res) => {
  logRequest(req, `create mechanic name=${req.body?.name || 'missing'}`);
  const mechanic = await mechanicService.createMechanic(req.body);
  res.json(mechanic);
}));

app.put('/api/v1/mechanics/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update mechanic id=${req.params.id}`);
  const mechanic = await mechanicService.updateMechanic(Number(req.params.id), req.body);
  res.json(mechanic);
}));

app.delete('/api/v1/mechanics/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete mechanic id=${req.params.id}`);
  const result = await mechanicService.deleteMechanic(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/spare-parts', authenticateToken, requireOwnerOrAdminOrMechanic, asyncHandler(async (req, res) => {
  logRequest(req, 'list spare parts');
  const userId = getUserId(req);
  const spareParts = await inventoryService.getAllSpareParts(userId);
  res.json(spareParts);
}));

app.post('/api/v1/spare-parts', authenticateToken, requireOwnerOrAdmin, validate('sparePart'), asyncHandler(async (req, res) => {
  logRequest(req, `create spare part name=${req.body?.name || 'missing'}`);
  const sparePart = await inventoryService.createSparePart(req.body);
  res.json(sparePart);
}));

app.put('/api/v1/spare-parts/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update spare part id=${req.params.id}`);
  const sparePart = await inventoryService.updateSparePart(Number(req.params.id), req.body);
  res.json(sparePart);
}));

app.delete('/api/v1/spare-parts/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete spare part id=${req.params.id}`);
  const result = await inventoryService.deleteSparePart(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/invoices', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, 'list invoices');
  const userId = getUserId(req);
  const invoices = await billingService.getAllInvoices(userId);
  res.json(invoices);
}));

app.post('/api/v1/invoices', authenticateToken, requireOwnerOrAdmin, validate('invoice'), asyncHandler(async (req, res) => {
  logRequest(req, `create invoice jobCardId=${req.body?.jobCardId || 'missing'}`);
  const invoice = await billingService.createInvoice(req.body);
  res.json(invoice);
}));

app.put('/api/v1/invoices/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update invoice id=${req.params.id}`);
  const invoice = await billingService.updateInvoice(Number(req.params.id), req.body);
  res.json(invoice);
}));

app.delete('/api/v1/invoices/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete invoice id=${req.params.id}`);
  const result = await billingService.deleteInvoice(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/service-records', authenticateToken, requireOwnerOrAdminOrMechanic, asyncHandler(async (req, res) => {
  logRequest(req, 'list service records');
  const userId = getUserId(req);
  const serviceRecords = await serviceRecordService.getAllServiceRecords(userId);
  res.json(serviceRecords);
}));

app.post('/api/v1/service-records', authenticateToken, requireOwnerOrAdminOrMechanic, validate('serviceRecord'), asyncHandler(async (req, res) => {
  logRequest(req, `create service record jobCardId=${req.body?.jobCardId || 'missing'}`);
  const serviceRecord = await serviceRecordService.createServiceRecord(req.body);
  res.json(serviceRecord);
}));

app.delete('/api/v1/service-records/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete service record id=${req.params.id}`);
  const result = await serviceRecordService.deleteServiceRecord(Number(req.params.id));
  res.json(result);
}));

app.get('/api/v1/appointments', authenticateToken, requireOwnerOrAdminOrMechanic, asyncHandler(async (req, res) => {
  logRequest(req, 'list appointments');
  const userId = getUserId(req);
  const appointments = await appointmentService.getAllAppointments(userId);
  res.json(appointments);
}));

app.post('/api/v1/appointments', authenticateToken, requireOwnerOrAdmin, validate('appointment'), asyncHandler(async (req, res) => {
  logRequest(req, `create appointment date=${req.body?.date || 'missing'}`);
  const appointment = await appointmentService.createAppointment(req.body);
  res.json(appointment);
}));

app.put('/api/v1/appointments/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `update appointment id=${req.params.id}`);
  const appointment = await appointmentService.updateAppointment(Number(req.params.id), req.body);
  res.json(appointment);
}));

app.delete('/api/v1/appointments/:id', authenticateToken, requireOwnerOrAdmin, asyncHandler(async (req, res) => {
  logRequest(req, `delete appointment id=${req.params.id}`);
  const result = await appointmentService.deleteAppointment(Number(req.params.id));
  res.json(result);
}));

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

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Garage Management API running on http://localhost:${PORT}`);
});
