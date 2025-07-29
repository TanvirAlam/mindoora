# Database Management

This directory contains all database-related files and scripts for the Mindoora application.

## Directory Structure

```
db/
├── README.md           # This documentation
├── schema.sql          # PostgreSQL database schema
├── schema.ts           # Drizzle ORM schema (for basic example)
├── setup-database.ts   # Setup script to create database schema
├── migrate.ts          # Drizzle migration runner
├── reset.ts            # Database reset script
└── seeds/
    └── index.ts        # Database seeding script
```

## Available Scripts

Run these commands from the project root:

### Initial Setup
```bash
# Apply the PostgreSQL schema to your database
pnpm run setup-db
```

### Seeding
```bash
# Seed the database with initial data
pnpm run seed
```

### Migrations (Drizzle)
```bash
# Generate new migrations
pnpm run generate

# Run migrations
pnpm run migrate
```

### Database Reset
```bash
# Drop all tables and types (WARNING: This will delete all data)
pnpm run reset
```

### Drizzle Studio
```bash
# Open Drizzle Studio for database management
pnpm run studio
```

## Schema Files

- **`schema.sql`**: Pure PostgreSQL schema converted from the original Prisma schema. Contains all tables, indexes, foreign keys, enums, and triggers.
- **`schema.ts`**: Basic Drizzle ORM schema example (can be expanded as needed).

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Database connection (use either DATABASE_URL or DB_URL)
DATABASE_URL="postgresql://username:password@host:port/database"
# OR
DB_URL="postgresql://username:password@host:port/database"
```

## Database Features

The schema includes:
- **UUID Support**: Uses `uuid-ossp` extension for UUID generation
- **JSONB Support**: For flexible metadata storage
- **Array Support**: For storing arrays of strings
- **Enums**: Custom types for status fields
- **Cascading Deletes**: Proper foreign key relationships
- **Indexes**: Optimized for common queries
- **Triggers**: Auto-updating timestamps

## Migration from Prisma

This setup has been migrated from Prisma to pure PostgreSQL with Drizzle ORM support:
- ✅ Prisma packages removed
- ✅ Schema converted to SQL
- ✅ Database connection updated to use `pg`
- ✅ All migration and seeding scripts moved to `./db`
- ✅ Scripts updated in `package.json`
