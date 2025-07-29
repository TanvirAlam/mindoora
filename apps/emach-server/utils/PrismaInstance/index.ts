import { Pool } from 'pg';
import { config } from 'dotenv';

config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_URL,
});

// For backward compatibility, export as 'prisma' (though it's now a pg pool)
export const prisma = pool;
