// Utility script to create a game room for testing
// Usage: node src/utils/createGameRoom.js [gameId]

const authService = require('../services/auth/authService');

async function createGameRoom(gameId) {
  try {
    // Get the current user's token
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser || !currentUser.accessToken) {
      console.error('❌ User is not authenticated. Please sign in first.');
      return;
    }

    console.log('🎮 Creating game room for game ID:', gameId);
    
    const response = await fetch('http://localhost:8080/api/v1/gameroom/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.accessToken}`
      },
      body: JSON.stringify({ gameId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status} error`);
    }

    const result = await response.json();
    console.log('✅ Game room created successfully!');
    
    // Extract the 4-digit code from the full invite code (following user's rule preference)
    const fullInviteCode = result.inviteCode.toString();
    const displayCode = fullInviteCode.slice(-4);
    
    console.log('📋 Room details:', {
      id: result.roomId,
      fullInviteCode: fullInviteCode,
      displayCode: displayCode,
      playerName: result.name,
      message: result.message
    });
    
    console.log('\n🎯 Players can now join using 4-digit invite code:', displayCode);
    console.log('🔗 Full invite code for backend:', fullInviteCode);
    
    return result;
  } catch (error) {
    console.error('❌ Error creating game room:', error.message);
    throw error;
  }
}

// If called directly from command line
if (require.main === module) {
  const gameId = process.argv[2];
  
  if (!gameId) {
    console.error('❌ Please provide a game ID');
    console.log('Usage: node src/utils/createGameRoom.js [gameId]');
    process.exit(1);
  }
  
  createGameRoom(gameId).catch(console.error);
}

module.exports = { createGameRoom };
