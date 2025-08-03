import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from './schema';

config();

const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL!;

// Create the postgres client
const sql = postgres(databaseUrl);

// Create the drizzle database instance
export const db = drizzle(sql, { schema });

// Export the sql client for advanced usage if needed
export { sql };
