import { Pool } from 'pg';
import { config } from 'dotenv';

config();

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DB_URL,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Seeding database...');

    // Seed Languages
    await client.query(`
      INSERT INTO "Languages" (name, "imgUrl", "shortName", "isActive") VALUES
      ('English', 'https://example.com/en.png', 'en', true),
      ('Spanish', 'https://example.com/es.png', 'es', true),
      ('French', 'https://example.com/fr.png', 'fr', true),
      ('German', 'https://example.com/de.png', 'de', true),
      ('Japanese', 'https://example.com/ja.png', 'ja', true)
      ON CONFLICT ("shortName") DO NOTHING;
    `);

    // Seed sample users
    await client.query(`
      INSERT INTO "Register" (id, email, phone, password, role, "accessToken", verified, "createdAt") VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'admin@mindoora.com', '+1234567890', '$2b$10$example.hash', 'admin', 'sample_token_1', true, NOW()),
      ('550e8400-e29b-41d4-a716-446655440002', 'user@mindoora.com', '+1234567891', '$2b$10$example.hash', 'user', 'sample_token_2', true, NOW()),
      ('550e8400-e29b-41d4-a716-446655440003', 'moderator@mindoora.com', '+1234567892', '$2b$10$example.hash', 'moderator', 'sample_token_3', true, NOW())
      ON CONFLICT (email) DO NOTHING;
    `);

    // Seed User profiles
    await client.query(`
      INSERT INTO "User" (id, name, image, "registerId") VALUES
      ('550e8400-e29b-41d4-a716-446655440101', 'Admin User', 'https://example.com/admin.jpg', '550e8400-e29b-41d4-a716-446655440001'),
      ('550e8400-e29b-41d4-a716-446655440102', 'Regular User', 'https://example.com/user.jpg', '550e8400-e29b-41d4-a716-446655440002'),
      ('550e8400-e29b-41d4-a716-446655440103', 'Moderator User', 'https://example.com/mod.jpg', '550e8400-e29b-41d4-a716-446655440003')
      ON CONFLICT ("registerId") DO NOTHING;
    `);

    console.log('✅ Database seeded successfully!');
    
    client.release();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
