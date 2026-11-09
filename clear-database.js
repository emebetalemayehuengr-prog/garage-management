import pg from 'pg';

const { Pool } = pg;

const dbUrl = "postgresql://garage_management_db_dsfh_user:6I5x1AD9WxvXlg3amQoC5EQLHML6CB9N@dpg-da9mn3hf2nfc7380jv6g-a.oregon-postgres.render.com/garage_management_db_dsfh";

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function clearDatabase() {
  try {
    console.log('Connecting to Render database...');
    await pool.connect();
    
    console.log('Clearing garage_state table...');
    const result = await pool.query('DELETE FROM garage_state WHERE id = 1');
    console.log(`Deleted ${result.rowCount} row(s)`);
    
    console.log('Database cleared successfully!');
    console.log('Now redeploy your garage-management service on Render.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

clearDatabase();
