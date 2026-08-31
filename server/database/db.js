import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');
const databaseUrl = process.env.DATABASE_URL;
const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultData = {
  users: [
    {
      id: 1,
      name: 'Owner',
      username: 'owner',
      password: 'owner123',
      role: 'owner',
      status: 'available',
      ownerId: null,
    },
    {
      id: 2,
      name: 'Admin User',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      status: 'available',
      ownerId: null,
    },
    {
      id: 3,
      name: 'Mechanic',
      username: 'mechanic',
      password: 'mechanic123',
      role: 'mechanic',
      status: 'available',
      ownerId: 1,
    },
  ],
  customers: [],
  vehicles: [],
  job_cards: [],
  mechanics: [],
  spare_parts: [],
  invoices: [],
  service_records: [],
  appointments: [],
  notifications: [],
  company_profiles: [],
};

let data = clone(defaultData);
let pool = null;
let mutationQueue = Promise.resolve();

const hashPassword = (password) => bcrypt.hash(password, 10);

function readJsonData() {
  if (!fs.existsSync(dataPath)) return clone(defaultData);
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeJsonData(snapshot) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(snapshot, null, 2), 'utf8');
}

async function persist(snapshot) {
  if (pool) {
    await pool.query(
      `INSERT INTO garage_state (id, data, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [JSON.stringify(snapshot)]
    );
  } else {
    writeJsonData(snapshot);
  }
}

function mutate(operation) {
  const task = mutationQueue.then(async () => {
    const result = await operation();
    await persist(clone(data));
    return result;
  });
  mutationQueue = task.catch(() => {});
  return task;
}

async function migrateData(source) {
  const migrated = { ...clone(defaultData), ...source };
  let changed = false;

  for (const user of migrated.users || []) {
    if (user.password && !user.password.startsWith('$2')) {
      user.password = await hashPassword(user.password);
      changed = true;
    }
  }

  migrated.mechanics = migrated.mechanics || [];
  const legacyOwner = (migrated.users || []).find((user) => user.role === 'owner');
  for (const user of (migrated.users || []).filter((item) => item.role === 'mechanic')) {
    if (!user.ownerId && legacyOwner) {
      user.ownerId = legacyOwner.id;
      changed = true;
    }
    let mechanic = migrated.mechanics.find(
      (item) => item.userId === user.id || (user.mechanicId && item.id === user.mechanicId)
    );
    if (!mechanic && user.ownerId) {
      mechanic = {
        id: Date.now() + migrated.mechanics.length,
        name: user.name,
        specialization: 'General',
        status: 'available',
        photo: '',
        ownerId: user.ownerId,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      migrated.mechanics.push(mechanic);
      changed = true;
    }
    if (mechanic && user.mechanicId !== mechanic.id) {
      user.mechanicId = mechanic.id;
      changed = true;
    }
  }

  migrated.company_profiles = migrated.company_profiles || [];
  migrated.notifications = migrated.notifications || [];
  for (const invoice of migrated.invoices || []) {
    if (invoice.printCount === undefined) {
      invoice.printCount = 0;
      changed = true;
    }
    if (!Array.isArray(invoice.payments)) {
      invoice.payments = [];
      changed = true;
    }
    if (invoice.paidAmount > 0 && invoice.payments.length === 0) {
      invoice.payments.push({
        id: `${invoice.id}-1`,
        receiptNumber: `RCT-${invoice.id}-01`,
        amount: invoice.paidAmount,
        paymentMethod: invoice.paymentMethod || 'Previously recorded',
        paidAt: invoice.updatedAt || invoice.createdAt || new Date().toISOString(),
        printCount: 0,
      });
      changed = true;
    }
  }

  return { migrated, changed };
}

export function getAll(table) {
  return data[table] || [];
}

export function getById(table, id) {
  return getAll(table).find((row) => row.id === id);
}

export async function create(table, item) {
  return mutate(async () => {
    const newItem = { ...item, id: Date.now() };
    if (table === 'users' && newItem.password)
      newItem.password = await hashPassword(newItem.password);
    data[table] = data[table] || [];
    data[table].push(newItem);
    return newItem;
  });
}

export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export function update(table, id, updates) {
  return mutate(async () => {
    data[table] = data[table] || [];
    const index = data[table].findIndex((row) => row.id === id);
    if (index < 0) return null;
    data[table][index] = { ...data[table][index], ...updates };
    return data[table][index];
  });
}

export function remove(table, id) {
  return mutate(async () => {
    data[table] = data[table] || [];
    data[table] = data[table].filter((row) => row.id !== id);
    return true;
  });
}

export function getDatabaseStatus() {
  return pool ? 'postgresql' : 'json-fallback';
}

const db = { getAll, getById, create, update, remove };
export default db;

export async function initDatabase() {
  if (databaseUrl) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
    await pool.query(`CREATE TABLE IF NOT EXISTS garage_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const result = await pool.query('SELECT data FROM garage_state WHERE id = 1');
    const source = result.rows[0]?.data || readJsonData();
    const migrated = await migrateData(source);
    data = migrated.migrated;
    if (!result.rows[0] || migrated.changed) await persist(data);
    console.log('Database connected: PostgreSQL');
    return;
  }

  const migrated = await migrateData(readJsonData());
  data = migrated.migrated;
  if (!fs.existsSync(dataPath) || migrated.changed) writeJsonData(data);
  console.warn('DATABASE_URL is not set; using local JSON storage');
}
