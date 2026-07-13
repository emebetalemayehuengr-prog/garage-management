export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
  return null;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number';
  }
  return null;
};

export const validateNumber = (value, min, max, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  return null;
};

export const validateLength = (value, min, max, fieldName) => {
  const len = value?.length || 0;
  if (min !== undefined && len < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (max !== undefined && len > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
};

export const validateForm = (values, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = values[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, field);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  
  return errors;
};

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
