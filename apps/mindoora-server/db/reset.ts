import { Pool } from 'pg';
import { config } from 'dotenv';

config();

async function resetDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DB_URL,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Dropping all tables...');
    
    // Drop all tables in cascade order
    const dropQueries = [
      'DROP TABLE IF EXISTS "gameExperience" CASCADE;',
      'DROP TABLE IF EXISTS "AcceptTC" CASCADE;',
      'DROP TABLE IF EXISTS "QuestionDB" CASCADE;',
      'DROP TABLE IF EXISTS "FeedbackGame" CASCADE;',
      'DROP TABLE IF EXISTS "Subscription" CASCADE;',
      'DROP TABLE IF EXISTS "GameRoomMessages" CASCADE;',
      'DROP TABLE IF EXISTS "userGameScore" CASCADE;',
      'DROP TABLE IF EXISTS "QuestionsSolved" CASCADE;',
      'DROP TABLE IF EXISTS "GamePlayers" CASCADE;',
      'DROP TABLE IF EXISTS "GameRooms" CASCADE;',
      'DROP TABLE IF EXISTS "Images" CASCADE;',
      'DROP TABLE IF EXISTS "Questions" CASCADE;',
      'DROP TABLE IF EXISTS "UserGameDetails" CASCADE;',
      'DROP TABLE IF EXISTS "UserGame" CASCADE;',
      'DROP TABLE IF EXISTS "Languages" CASCADE;',
      'DROP TABLE IF EXISTS "EmailVerify" CASCADE;',
      'DROP TABLE IF EXISTS "Friends" CASCADE;',
      'DROP TABLE IF EXISTS "NRecipients" CASCADE;',
      'DROP TABLE IF EXISTS "Notifications" CASCADE;',
      'DROP TABLE IF EXISTS "Feedback" CASCADE;',
      'DROP TABLE IF EXISTS "LoginHistory" CASCADE;',
      'DROP TABLE IF EXISTS "Followings" CASCADE;',
      'DROP TABLE IF EXISTS "User" CASCADE;',
      'DROP TABLE IF EXISTS "Register" CASCADE;',
      'DROP TYPE IF EXISTS game_role CASCADE;',
      'DROP TYPE IF EXISTS game_status CASCADE;',
      'DROP TYPE IF EXISTS f_status CASCADE;'
    ];

    for (const query of dropQueries) {
      await client.query(query);
    }

    console.log('✅ Database reset completed successfully!');
    
    client.release();
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
