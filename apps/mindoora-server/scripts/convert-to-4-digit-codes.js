const { Pool } = require('pg');
require('dotenv').config();

// Function to generate 4-digit code
function generateRandomCode() {
    const min = 1000;
    const max = 9999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomCode.toString().padStart(4, '0');
}

async function convertTo4DigitCodes() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.DB_URL,
    });

    try {
        console.log('🔍 Finding game rooms with 6-digit invite codes...');
        console.log('🔌 Connecting to database...');
        
        // Test connection first
        await pool.query('SELECT 1');
        console.log('✅ Database connected successfully');
        
        // Find all game rooms with 6-digit invite codes
        const result = await pool.query(
            'SELECT id, "inviteCode" FROM "GameRooms" WHERE LENGTH("inviteCode") = 6'
        );
        
        if (result.rows.length === 0) {
            console.log('✅ No 6-digit invite codes found. All codes are already 4 digits.');
            return;
        }
        
        console.log(`📊 Found ${result.rows.length} game rooms with 6-digit codes`);
        
        for (const room of result.rows) {
            let newCode;
            let duplicateExists;
            
            // Generate unique 4-digit code
            do {
                newCode = generateRandomCode();
                const duplicateCheck = await pool.query(
                    'SELECT id FROM "GameRooms" WHERE "inviteCode" = $1 AND id != $2',
                    [newCode, room.id]
                );
                duplicateExists = duplicateCheck.rows.length > 0;
            } while (duplicateExists);
            
            // Update the invite code
            await pool.query(
                'UPDATE "GameRooms" SET "inviteCode" = $1 WHERE id = $2',
                [newCode, room.id]
            );
            
            console.log(`✅ Updated room ${room.id}: ${room.inviteCode} → ${newCode}`);
        }
        
        console.log('🎉 All invite codes have been converted to 4 digits!');
        
    } catch (error) {
        console.error('❌ Error converting invite codes:', error);
    } finally {
        await pool.end();
    }
}

convertTo4DigitCodes();
