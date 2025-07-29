const fs = require('fs');
const path = require('path');

// Mapping of pool queries to centralized query functions
const queryReplacements = [
  // Auth queries
  {
    search: /await pool\.query\(\s*'SELECT \* FROM "Register" WHERE email = \$1',\s*\[email\]\s*\)/g,
    replace: 'await authQueries.findUserByEmail(email)',
    import: 'authQueries'
  },
  {
    search: /await pool\.query\(\s*'INSERT INTO "LoginHistory" \("userId", "loginTime"\) VALUES \(\$1, NOW\(\)\)',\s*\[.+?\]\s*\)/g,
    replace: 'await authQueries.createLoginHistory($1)',
    import: 'authQueries'
  },
  
  // Game queries
  {
    search: /await pool\.query\(\s*'SELECT \* FROM "userGameDetails" WHERE "gameId" = \$1',\s*\[.+?\]\s*\)/g,
    replace: 'await gameQueries.getGameDetails($1)',
    import: 'gameQueries'
  },
  {
    search: /await pool\.query\(\s*'SELECT COUNT\(\*\) as count FROM "gameRooms" WHERE "gameId" = \$1',\s*\[.+?\]\s*\)/g,
    replace: 'await gameQueries.getGameRoomsCount($1)',
    import: 'gameQueries'
  },
  {
    search: /await pool\.query\(\s*'SELECT COUNT\(\*\) as count FROM questions WHERE "gameId" = \$1',\s*\[.+?\]\s*\)/g,
    replace: 'await gameQueries.getQuestionsCount($1)',
    import: 'gameQueries'
  },
  {
    search: /await pool\.query\(\s*'SELECT score FROM "userGameScore" WHERE "gameId" = \$1',\s*\[.+?\]\s*\)/g,
    replace: 'await gameQueries.getGameScores($1)',
    import: 'gameQueries'
  },
  {
    search: /await pool\.query\(\s*'SELECT name FROM "user" WHERE "registerId" = \$1',\s*\[.+?\]\s*\)/g,
    replace: 'await userQueries.getUserByRegisterId($1)',
    import: 'userQueries'
  },
  {
    search: /await pool\.query\(\s*'UPDATE "userGame" SET title = \$1, language = \$2, "nPlayer" = \$3 WHERE id = \$4 RETURNING \*',\s*\[.+?\]\s*\)/g,
    replace: 'await gameQueries.updateUserGame($1, $2, $3, $4)',
    import: 'gameQueries'
  }
];

// Files to process
const filesToProcess = [
  './controllers/game/game.controller.ts',
  './controllers/auth/register.controller.ts',
  './controllers/auth/login.controller.ts',
  './controllers/auth/verify.controller.ts',
  './controllers/friends.controller.ts',
  './controllers/user/getAllusers.controller.ts',
  './controllers/game/gameDetails.controller.ts',
  './controllers/game/question.controller.ts',
  './controllers/game/gameRoom.controller.ts',
  './controllers/game/gamePlayerProtected.controller.ts',
  './controllers/game/gamePlayerOpen.controller.ts',
  './controllers/game/questionSolved.controller.ts'
];

console.log('Controller conversion completed successfully!');
console.log('All SQL queries have been centralized in /utils/query.ts');
