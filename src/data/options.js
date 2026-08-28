export const MANUFACTURERS = [
  'Toyota', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Subaru', 'Mitsubishi',
  'Suzuki', 'Isuzu', 'Ford', 'Chevrolet', 'Volkswagen', 'Mercedes-Benz', 'BMW',
  'Audi', 'Lexus', 'Land Rover', 'Jeep', 'Renault', 'Peugeot', 'Other'
];

export const COMMON_COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
  'Brown', 'Beige', 'Gold', 'Orange', 'Purple', 'Other'
];

export const SERVICE_TYPES = [
  'Oil Change', 'Brake Service', 'Engine Repair', 'Transmission Service',
  'Electrical Repair', 'AC Service', 'Tire Service', 'Battery Replacement',
  'General Inspection', 'Body Work', 'Paint Job', 'Suspension Repair',
  'Cooling System', 'Fuel System', 'Exhaust Repair', 'Other'
];

export const SPECIALIZATIONS = [
  'Engine', 'Transmission', 'Electrical', 'Brakes', 'Suspension',
  'AC & Heating', 'Body & Paint', 'Tires', 'General', 'Diagnostics'
];

export const YEARS = Array.from({ length: 30 }, (_, i) => String(2024 - i));
