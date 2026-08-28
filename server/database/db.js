import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const primaryPath = path.join(__dirname, 'data.json');
const fallbackPath = path.join(process.cwd(), 'server', 'database', 'data.json');

let dataPath = primaryPath;
if (!fs.existsSync(path.dirname(primaryPath))) {
  dataPath = fallbackPath;
}

console.log(`Database path: ${dataPath}`);
console.log(`Database directory exists: ${fs.existsSync(path.dirname(dataPath))}`);

const defaultData = {
  users: [
    { id: 1, name: 'Owner', username: 'owner', password: 'owner123', role: 'owner', status: 'available' },
    { id: 2, name: 'Admin User', username: 'admin', password: 'admin123', role: 'admin', status: 'available' },
    { id: 3, name: 'አበበ ክቡር', username: 'mechanic', password: 'mechanic123', role: 'mechanic', status: 'available' }
  ],
  customers: [],
  vehicles: [],
  job_cards: [],
  mechanics: [],
  spare_parts: [],
  invoices: [],
  service_records: [],
  appointments: []
};

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  return { ...defaultData };
}

function writeData(data) {
  try {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

export function getAll(table) {
  const data = readData();
  return data[table] || [];
}

export function getById(table, id) {
  const rows = getAll(table);
  return rows.find(row => row.id === id);
}

export function create(table, item) {
  const data = readData();
  const newItem = { ...item, id: Date.now() };
  data[table] = data[table] || [];
  data[table].push(newItem);
  writeData(data);
  return newItem;
}

export function update(table, id, updates) {
  const data = readData();
  data[table] = data[table] || [];
  const index = data[table].findIndex(row => row.id === id);
  if (index >= 0) {
    data[table][index] = { ...data[table][index], ...updates };
    writeData(data);
    return data[table][index];
  }
  return null;
}

export function remove(table, id) {
  const data = readData();
  data[table] = data[table] || [];
  data[table] = data[table].filter(row => row.id !== id);
  writeData(data);
  return true;
}

const db = { getAll, getById, create, update, remove };

export default db;

export function initDatabase() {
  if (!fs.existsSync(dataPath)) {
    writeData(defaultData);
    console.log('Database initialized at', dataPath);
  }
}
