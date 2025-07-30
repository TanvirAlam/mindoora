const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DB_URL || process.env.DATABASE_URL,
});

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Migrations table ready');
  } catch (error) {
    console.error('❌ Error creating migrations table:', error.message);
    throw error;
  }
}

// Get list of executed migrations
async function getExecutedMigrations() {
  try {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
  } catch (error) {
    console.error('❌ Error getting executed migrations:', error.message);
    return [];
  }
}

// Mark migration as executed
async function markMigrationExecuted(filename) {
  try {
    await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    console.log(`✅ Marked migration as executed: ${filename}`);
  } catch (error) {
    console.error(`❌ Error marking migration as executed: ${filename}`, error.message);
  }
}

// Execute a single migration file
async function executeMigration(filename, filepath) {
  console.log(`🔄 Executing migration: ${filename}`);
  
  try {
    const sql = fs.readFileSync(filepath, 'utf8');
    await pool.query(sql);
    await markMigrationExecuted(filename);
    console.log(`✅ Successfully executed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing migration ${filename}:`, error.message);
    return false;
  }
}

// Main migration function
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  try {
    console.log('🚀 Starting database migrations...');
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get list of migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order
    
    if (migrationFiles.length === 0) {
      console.log('📝 No migration files found');
      return;
    }
    
    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Filter out already executed migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
    
    // Execute pending migrations
    let successCount = 0;
    for (const filename of pendingMigrations) {
      const filepath = path.join(migrationsDir, filename);
      const success = await executeMigration(filename, filepath);
      if (success) {
        successCount++;
      } else {
        console.log('🛑 Migration failed. Stopping execution.');
        break;
      }
    }
    
    console.log(`\n🎉 Migration summary: ${successCount}/${pendingMigrations.length} migrations executed successfully`);
    
  } catch (error) {
    console.error('❌ Migration process failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations };
