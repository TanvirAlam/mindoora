import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Running migrations...');
  
  const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL!;
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations completed successfully.');
  await sql.end();
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
