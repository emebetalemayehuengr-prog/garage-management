import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import db, { initDatabase } from './database/db.js';
import {
  authenticateToken,
  requireOwnerOrAdmin,
  requireOwnerOrAdminOrMechanic,
} from './middleware/auth.js';
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
  serviceRecordService,
} from './services/index.js';

await initDatabase();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Garage Management API',
      version: '1.0.0',
      description: 'API for garage management system',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./server/index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

const distPath = join(__dirname, '..', 'dist');
const indexPath = join(distPath, 'index.html');

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
const allowedOrigins = [
  ...configuredOrigins,
  'https://garage-management-1h9b.onrender.com',
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

app.use(
  '/api/v1',
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        const error = new Error('Origin is not allowed');
        error.statusCode = 403;
        callback(error);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { error: 'Too many failed login attempts. Please try again in 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.startsWith('/api/'),
});

app.use(bodyParser.json());
app.use(sanitizeInput);
app.use(generalLimiter);

const getUserId = (req) => {
  if (req.user?.role === 'owner') return Number(req.user.id);
  if (req.user?.ownerId) return Number(req.user.ownerId);
  return null;
};

const matchesOwner = (row, userId) => {
  if (!userId) return true;
  return row.ownerId === userId;
};

const withTenant = (req) => ({ ...req.body, ownerId: getUserId(req) });

const requireTenantRecord = (table) => (req, res, next) => {
  const row = db.getById(table, Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Record not found' });
  if (!matchesOwner(row, getUserId(req))) {
    return res.status(403).json({ error: "You cannot access another garage's data" });
  }
  next();
};

const requireTenantReferences = (references) => (req, res, next) => {
  const tenantId = getUserId(req);
  for (const [field, table] of Object.entries(references)) {
    const id = req.body[field];
    if (id === undefined || id === null) continue;
    const row = db.getById(table, Number(id));
    if (!row || !matchesOwner(row, tenantId)) {
      return res.status(400).json({ error: `Invalid ${field} for this garage` });
    }
  }
  next();
};

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

const logRequest = (req, action) => {
  if (!DEBUG) return;
  const userId = getUserId(req);
  logger.debug(`[API] ${req.method} ${req.path} | user=${userId || 'anon'} | ${action}`);
};

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj };
  if (sanitized.password) sanitized.password = '***';
  if (sanitized.ownerId !== undefined) sanitized.ownerId = Number(sanitized.ownerId);
  return sanitized;
};

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
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

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.post(
  '/api/v1/login',
  authLimiter,
  validate('login'),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    logRequest(req, `login attempt for username=${req.body?.username || 'missing'}`);

    const result = await authService.login(username, password);
    res.json(result);
  })
);

console.log(`Starting server on port ${PORT}`);
console.log(`Dist path: ${distPath}`);
console.log(`Index path: ${indexPath}`);

app.get(
  '/api/v1/users',
  authenticateToken,
  requireOwnerOrAdmin,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list users');
    const users = await authService.getAllUsers(req.user);
    res.json(users);
  })
);

app.post(
  '/api/v1/users',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('user'),
  asyncHandler(async (req, res) => {
    logRequest(
      req,
      `create user name=${req.body?.name || 'missing'} role=${req.body?.role || 'missing'}`
    );
    const user = await authService.createUser(req.user, req.body);
    const { password, ...rest } = user;
    res.json(rest);
  })
);

app.put(
  '/api/v1/users/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  asyncHandler(async (req, res) => {
    logRequest(req, `update user id=${req.params.id}`);
    const user = await authService.updateUser(req.user, Number(req.params.id), req.body);
    const { password, ...rest } = user;
    res.json(rest);
  })
);

app.delete(
  '/api/v1/users/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  asyncHandler(async (req, res) => {
    logRequest(req, `delete user id=${req.params.id}`);
    await authService.deleteUser(req.user, Number(req.params.id));
    res.json({ message: 'User deleted' });
  })
);

app.get(
  '/api/v1/customers',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list customers');
    const userId = getUserId(req);
    const customers = await customerService.getAllCustomers(userId);
    res.json(customers);
  })
);

app.post(
  '/api/v1/customers',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('customer'),
  asyncHandler(async (req, res) => {
    logRequest(req, `create customer name=${req.body?.name || 'missing'}`);
    const customer = await customerService.createCustomer(withTenant(req));
    res.json(customer);
  })
);

app.put(
  '/api/v1/customers/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('customers'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update customer id=${req.params.id}`);
    const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
    res.json(customer);
  })
);

app.delete(
  '/api/v1/customers/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('customers'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete customer id=${req.params.id}`);
    const result = await customerService.deleteCustomer(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/vehicles',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list vehicles');
    const userId = getUserId(req);
    const vehicles = await vehicleService.getAllVehicles(userId);
    res.json(vehicles);
  })
);

app.post(
  '/api/v1/vehicles',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('vehicle'),
  requireTenantReferences({ customerId: 'customers' }),
  asyncHandler(async (req, res) => {
    logRequest(req, `create vehicle plate=${req.body?.plateNumber || 'missing'}`);
    const vehicle = await vehicleService.createVehicle(withTenant(req));
    res.json(vehicle);
  })
);

app.put(
  '/api/v1/vehicles/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('vehicles'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update vehicle id=${req.params.id}`);
    const vehicle = await vehicleService.updateVehicle(Number(req.params.id), req.body);
    res.json(vehicle);
  })
);

app.delete(
  '/api/v1/vehicles/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('vehicles'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete vehicle id=${req.params.id}`);
    const result = await vehicleService.deleteVehicle(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/job-cards',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list job cards');
    const userId = getUserId(req);
    const jobCards = await jobCardService.getAllJobCards(userId);
    const visibleJobCards =
      req.user.role === 'mechanic'
        ? jobCards.filter((jobCard) => jobCard.mechanicId === req.user.mechanicId)
        : jobCards;
    res.json(visibleJobCards);
  })
);

app.post(
  '/api/v1/job-cards',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('jobCard'),
  requireTenantReferences({ vehicleId: 'vehicles', mechanicId: 'mechanics' }),
  asyncHandler(async (req, res) => {
    logRequest(req, `create job card vehicleId=${req.body?.vehicleId || 'missing'}`);
    const jobCard = await jobCardService.createJobCard(withTenant(req));
    res.json(jobCard);
  })
);

app.put(
  '/api/v1/job-cards/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('job_cards'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update job card id=${req.params.id}`);
    const jobCard = await jobCardService.updateJobCard(Number(req.params.id), req.body);
    res.json(jobCard);
  })
);

app.delete(
  '/api/v1/job-cards/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('job_cards'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete job card id=${req.params.id}`);
    const result = await jobCardService.deleteJobCard(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/mechanics',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list mechanics');
    const userId = getUserId(req);
    const mechanics = await mechanicService.getAllMechanics(userId);
    res.json(mechanics);
  })
);

app.post(
  '/api/v1/mechanics',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('mechanic'),
  asyncHandler(async (req, res) => {
    logRequest(req, `create mechanic name=${req.body?.name || 'missing'}`);
    const mechanic = await mechanicService.createMechanic(withTenant(req));
    res.json(mechanic);
  })
);

app.put(
  '/api/v1/mechanics/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('mechanics'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update mechanic id=${req.params.id}`);
    const mechanic = await mechanicService.updateMechanic(Number(req.params.id), req.body);
    res.json(mechanic);
  })
);

app.delete(
  '/api/v1/mechanics/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('mechanics'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete mechanic id=${req.params.id}`);
    const result = await mechanicService.deleteMechanic(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/spare-parts',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list spare parts');
    const userId = getUserId(req);
    const spareParts = await inventoryService.getAllSpareParts(userId);
    res.json(spareParts);
  })
);

app.post(
  '/api/v1/spare-parts',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('sparePart'),
  asyncHandler(async (req, res) => {
    logRequest(req, `create spare part name=${req.body?.name || 'missing'}`);
    const sparePart = await inventoryService.createSparePart(withTenant(req));
    res.json(sparePart);
  })
);

app.put(
  '/api/v1/spare-parts/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('spare_parts'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update spare part id=${req.params.id}`);
    const sparePart = await inventoryService.updateSparePart(Number(req.params.id), req.body);
    res.json(sparePart);
  })
);

app.delete(
  '/api/v1/spare-parts/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('spare_parts'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete spare part id=${req.params.id}`);
    const result = await inventoryService.deleteSparePart(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/invoices',
  authenticateToken,
  requireOwnerOrAdmin,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list invoices');
    const userId = getUserId(req);
    const invoices = await billingService.getAllInvoices(userId);
    res.json(invoices);
  })
);

app.post(
  '/api/v1/invoices',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('invoice'),
  requireTenantReferences({ jobCardId: 'job_cards' }),
  asyncHandler(async (req, res) => {
    logRequest(req, `create invoice jobCardId=${req.body?.jobCardId || 'missing'}`);
    const invoice = await billingService.createInvoice(withTenant(req));
    res.json(invoice);
  })
);

app.put(
  '/api/v1/invoices/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('invoices'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update invoice id=${req.params.id}`);
    const invoice = await billingService.updateInvoice(Number(req.params.id), req.body);
    res.json(invoice);
  })
);

app.delete(
  '/api/v1/invoices/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('invoices'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete invoice id=${req.params.id}`);
    const result = await billingService.deleteInvoice(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/service-records',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list service records');
    const userId = getUserId(req);
    const serviceRecords = await serviceRecordService.getAllServiceRecords(userId);
    const visibleRecords =
      req.user.role === 'mechanic'
        ? serviceRecords.filter((record) => record.mechanicId === req.user.mechanicId)
        : serviceRecords;
    res.json(visibleRecords);
  })
);

app.post(
  '/api/v1/service-records',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  validate('serviceRecord'),
  requireTenantReferences({ jobCardId: 'job_cards', mechanicId: 'mechanics' }),
  asyncHandler(async (req, res) => {
    logRequest(req, `create service record jobCardId=${req.body?.jobCardId || 'missing'}`);
    const serviceRecord = await serviceRecordService.createServiceRecord(withTenant(req));
    res.json(serviceRecord);
  })
);

app.delete(
  '/api/v1/service-records/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('service_records'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete service record id=${req.params.id}`);
    const result = await serviceRecordService.deleteServiceRecord(Number(req.params.id));
    res.json(result);
  })
);

app.get(
  '/api/v1/appointments',
  authenticateToken,
  requireOwnerOrAdminOrMechanic,
  asyncHandler(async (req, res) => {
    logRequest(req, 'list appointments');
    const userId = getUserId(req);
    const appointments = await appointmentService.getAllAppointments(userId);
    res.json(appointments);
  })
);

app.post(
  '/api/v1/appointments',
  authenticateToken,
  requireOwnerOrAdmin,
  validate('appointment'),
  requireTenantReferences({ customerId: 'customers', vehicleId: 'vehicles' }),
  asyncHandler(async (req, res) => {
    logRequest(req, `create appointment date=${req.body?.date || 'missing'}`);
    const appointment = await appointmentService.createAppointment(withTenant(req));
    res.json(appointment);
  })
);

app.put(
  '/api/v1/appointments/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('appointments'),
  asyncHandler(async (req, res) => {
    logRequest(req, `update appointment id=${req.params.id}`);
    const appointment = await appointmentService.updateAppointment(Number(req.params.id), req.body);
    res.json(appointment);
  })
);

app.delete(
  '/api/v1/appointments/:id',
  authenticateToken,
  requireOwnerOrAdmin,
  requireTenantRecord('appointments'),
  asyncHandler(async (req, res) => {
    logRequest(req, `delete appointment id=${req.params.id}`);
    const result = await appointmentService.deleteAppointment(Number(req.params.id));
    res.json(result);
  })
);

if (process.env.NODE_ENV === 'production') {
  const distExists = fs.existsSync(distPath);
  const indexExists = fs.existsSync(indexPath);
  console.log(`Dist directory exists: ${distExists}`);
  console.log(`Index.html exists: ${indexExists}`);

  if (distExists) {
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          } else if (filePath.includes(`${join('dist', 'assets')}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
  }
  app.get('/', (req, res) => {
    logger.info('Serving index.html for root path');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(indexPath);
  });
  app.get('/assets/*', (req, res) => {
    res
      .status(404)
      .json({ error: 'Static asset not found. Reload the page for the latest version.' });
  });
  app.get('/*', (req, res) => {
    console.log(`SPA fallback for: ${req.path}`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(indexPath);
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Garage Management API running on http://localhost:${PORT}`);
});
