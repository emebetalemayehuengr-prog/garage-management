import Joi from 'joi';

// Validation schemas
const schemas = {
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
  }),

  customer: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(10)
      .max(20)
      .required(),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().max(200).optional().allow(''),
  }),

  vehicle: Joi.object({
    customerId: Joi.number().integer().positive().required(),
    plateNumber: Joi.string().min(5).max(20).required(),
    manufacturer: Joi.string().min(2).max(50).required(),
    model: Joi.string().min(2).max(50).required(),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .required(),
    mileage: Joi.number().min(0).optional().allow(''),
    color: Joi.string().max(30).optional().allow(''),
    vin: Joi.string().length(17).optional().allow(''),
  }),

  jobCard: Joi.object({
    vehicleId: Joi.number().integer().positive().required(),
    problemDescription: Joi.string().min(10).max(1000).required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    mechanicId: Joi.number().integer().positive().optional().allow(null),
  }),

  mechanic: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    specialization: Joi.string().min(2).max(50).required(),
    photo: Joi.string().uri().optional().allow(''),
    status: Joi.string().valid('available', 'busy').default('available'),
  }),

  sparePart: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    category: Joi.string().min(2).max(50).required(),
    make: Joi.string().min(2).max(50).required(),
    model: Joi.string().min(2).max(50).required(),
    year: Joi.string().max(10).required(),
    stock: Joi.number().integer().min(0).required(),
    price: Joi.number().positive().required(),
    compatibleWith: Joi.string().max(200).optional().allow(''),
  }),

  invoice: Joi.object({
    jobCardId: Joi.number().integer().positive().required(),
    totalAmount: Joi.number().positive().required(),
    paidAmount: Joi.number().min(0).default(0),
    serviceCharge: Joi.number().min(0).optional(),
    partsCost: Joi.number().min(0).optional(),
    status: Joi.string().valid('pending', 'partial', 'paid').default('pending'),
  }),

  appointment: Joi.object({
    customerId: Joi.number().integer().positive().required(),
    vehicleId: Joi.number().integer().positive().required(),
    date: Joi.date().iso().required(),
    time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    serviceType: Joi.string().min(2).max(50).required(),
    notes: Joi.string().max(500).optional().allow(''),
    status: Joi.string()
      .valid('scheduled', 'confirmed', 'completed', 'cancelled')
      .default('scheduled'),
  }),

  user: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('owner', 'admin', 'mechanic').required(),
  }),

  serviceRecord: Joi.object({
    jobCardId: Joi.number().integer().positive().required(),
    description: Joi.string().min(10).max(1000).required(),
    partsUsed: Joi.string().max(500).optional().allow(''),
    laborHours: Joi.number().min(0).optional(),
    mechanicId: Joi.number().integer().positive().required(),
  }),
};

// Validation middleware factory
export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Invalid validation schema' });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Sanitization middleware for general input cleaning
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Remove potentially dangerous characters
        if (typeof obj[key] === 'string') {
          sanitized[key] = obj[key]
            .replace(/[<>]/g, '') // Remove < and >
            .trim();
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitize(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

export default schemas;
