export const formatETB = (amount) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatETBCustom = (amount) => {
  const parts = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return parts;
};

export const parseETB = (value) => {
  const numeric = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
    : value;
  return isNaN(numeric) ? 0 : numeric;
};
