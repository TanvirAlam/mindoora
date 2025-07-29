import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DB_URL,
  });

  try {
    console.log('Reading schema file...');
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Applying schema to database...');
    await client.query(schema);

    console.log('✅ Database schema applied successfully!');
    
    client.release();
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
