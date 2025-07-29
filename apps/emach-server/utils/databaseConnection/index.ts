import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_URL,
});

export async function startServer() {
  try {
    await pool.connect();
    console.log('Connected to the PostgreSQL database');

    // Start your server or perform other operations here
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

export { pool };
