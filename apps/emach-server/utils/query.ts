import { pool } from './PrismaInstance';

// =====================================
// AUTH QUERIES
// =====================================

export const authQueries = {
  // Register queries
  findUserByEmail: async (email: string) => {
    const result = await pool.query(
      'SELECT * FROM "Register" WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  createUser: async (email: string, password: string, role: string, verified: boolean) => {
    const result = await pool.query(
      `INSERT INTO "Register" (email, phone, password, role, "accessToken", verified, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [email, password, password, role, '', verified]
    );
    return result.rows[0];
  },

  createLoginHistory: async (userId: string, loginMethod: string = 'password', ipAddress?: string, userAgent?: string, deviceInfo?: any, location?: string) => {
    console.log('📊 CREATING LOGIN HISTORY:', { userId, loginMethod, ipAddress, userAgent });
    
    // For login, always set status to LOGGED IN
    const loginStatus = 'LOGGED IN';
    
    await pool.query(
      `INSERT INTO "LoginHistory" ("userId", "loginTime", "loginMethod", "ipAddress", "userAgent", "deviceInfo", "location", "success", "loginStatus") 
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, true, $7)`,
      [userId, loginMethod, ipAddress, userAgent, deviceInfo, location, loginStatus]
    );
    console.log('✅ LOGIN HISTORY CREATED SUCCESSFULLY with status:', loginStatus);
  },

  createLogoutHistory: async (userId: string, provider: string = 'logout', ipAddress?: string, userAgent?: string, deviceInfo?: any, location?: string) => {
    console.log('📊 CREATING LOGOUT HISTORY:', { userId, provider, ipAddress, userAgent });
    
    // For logout, always set status to LOGGED OUT but keep the original provider as loginMethod
    const loginStatus = 'LOGGED OUT';
    
    await pool.query(
      `INSERT INTO "LoginHistory" ("userId", "loginTime", "loginMethod", "ipAddress", "userAgent", "deviceInfo", "location", "success", "loginStatus") 
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, true, $7)`,
      [userId, provider, ipAddress, userAgent, deviceInfo, location, loginStatus]
    );
    console.log('✅ LOGOUT HISTORY CREATED SUCCESSFULLY with status:', loginStatus, 'and provider:', provider);
  },

  createFailedLoginHistory: async (userId: string, loginMethod: string = 'password', ipAddress?: string, userAgent?: string, reason?: string) => {
    await pool.query(
      `INSERT INTO "LoginHistory" ("userId", "loginTime", "loginMethod", "ipAddress", "userAgent", "deviceInfo", "success") 
       VALUES ($1, NOW(), $2, $3, $4, $5, false)`,
      [userId, loginMethod, ipAddress, userAgent, { reason }]
    );
  },

  getLoginHistory: async (userId: string, limit: number = 25, offset: number = 0) => {
    const result = await pool.query(
      `SELECT "loginTime", "loginMethod", "ipAddress", "userAgent", "location", "success", "loginStatus" 
       FROM "LoginHistory" 
       WHERE "userId" = $1 
       ORDER BY "loginTime" DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  getCurrentLoginStatus: async (userId: string) => {
    const result = await pool.query(
      `SELECT "loginStatus", "loginTime", "loginMethod" 
       FROM "LoginHistory" 
       WHERE "userId" = $1 
       ORDER BY "loginTime" DESC 
       LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  createEmailVerification: async (email: string, expirationTime: Date, verifyCode: number) => {
    await pool.query(
      'INSERT INTO "EmailVerify" (email, "createAt", "expireAt", code) VALUES ($1, NOW(), $2, $3)',
      [email, expirationTime, verifyCode]
    );
  },

  deleteAccount: async (userId: string) => {
    await pool.query(
      'DELETE FROM "Register" WHERE id = $1',
      [userId]
    );
  },

  // Login queries
  findUserProfile: async (registerId: string) => {
    const result = await pool.query(
      'SELECT * FROM "User" WHERE "registerId" = $1',
      [registerId]
    );
    return result.rows[0];
  },

  updateAccessToken: async (token: string, userId: string) => {
    await pool.query(
      'UPDATE "Register" SET "accessToken" = $1 WHERE id = $2',
      [token, userId]
    );
  },

  // Verification queries
  getLatestVerificationCode: async (email: string) => {
    const result = await pool.query(
      'SELECT * FROM "EmailVerify" WHERE email = $1 ORDER BY "createAt" DESC LIMIT 1',
      [email]
    );
    return result.rows[0];
  },

  verifyAccount: async (email: string) => {
    await pool.query(
      'UPDATE "Register" SET verified = true WHERE email = $1',
      [email]
    );
  },

  // Reset password queries
  findUserForReset: async (email: string) => {
    const result = await pool.query(
      'SELECT id, otp, expireTime FROM register WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  updatePassword: async (hashedPassword: string, userId: string) => {
    await pool.query(
      'UPDATE register SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
  },

  // OAuth queries
  insertOAuthProvider: async (userId: string, provider: string, providerId: string) => {
    const query = `
      INSERT INTO "OAuthProviders" ("userId", provider, "providerId", "lastUsed") 
      VALUES ($1, $2, $3, NOW()) 
      ON CONFLICT ("userId", provider) 
      DO UPDATE SET "providerId" = $3, "lastUsed" = NOW()
    `;
    return await pool.query(query, [userId, provider, providerId]);
  },

  getOAuthProviders: async (userId: string) => {
    const query = 'SELECT provider, "lastUsed" FROM "OAuthProviders" WHERE "userId" = $1 ORDER BY "lastUsed" DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  deleteOAuthProvider: async (userId: string, provider: string) => {
    const query = 'DELETE FROM "OAuthProviders" WHERE "userId" = $1 AND provider = $2';
    return await pool.query(query, [userId, provider]);
  },

  countOAuthProviders: async (userId: string) => {
    const query = 'SELECT COUNT(*) as count FROM "OAuthProviders" WHERE "userId" = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
};

// =====================================
// USER QUERIES
// =====================================

export const userQueries = {
  // Follow queries
  createFollow: async (followerId: string, followingId: string) => {
    await pool.query(
      'INSERT INTO followings (followerId, followingId) VALUES ($1, $2)',
      [followerId, followingId]
    );
  },

  findFollowRelation: async (followerId: string, followingId: string) => {
    const result = await pool.query(
      'SELECT id FROM followings WHERE followerId = $1 AND followingId = $2',
      [followerId, followingId]
    );
    return result.rows[0];
  },

  deleteFollow: async (followId: string) => {
    await pool.query(
      'DELETE FROM followings WHERE id = $1',
      [followId]
    );
  },

  // User profile queries
  getUserByRegisterId: async (registerId: string) => {
    const result = await pool.query(
      'SELECT id, name, image FROM "user" WHERE registerId = $1',
      [registerId]
    );
    return result.rows[0];
  },

  getAllUsers: async (offset: number, limit: number = 25) => {
    const result = await pool.query(
      'SELECT * FROM "user" OFFSET $1 LIMIT $2',
      [offset, limit]
    );
    return result.rows;
  },

  getUserByName: async (name: string) => {
    const result = await pool.query(
      'SELECT name FROM "user" WHERE id = $1',
      [name]
    );
    return result.rows[0];
  }
};

// =====================================
// GAME QUERIES
// =====================================

export const gameQueries = {
  // User Game queries
  createUserGame: async (title: string, language: string, nPlayer: number, userId: string) => {
    const result = await pool.query(
      'INSERT INTO "userGame" (title, language, "nPlayer", "user") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, language, nPlayer, userId]
    );
    return result.rows[0];
  },

  deleteUserGame: async (gameId: string) => {
    await pool.query(
      'DELETE FROM "userGame" WHERE id = $1',
      [gameId]
    );
  },

  findGameById: async (gameId: string) => {
    const result = await pool.query(
      'SELECT * FROM userGame WHERE id = $1',
      [gameId]
    );
    return result.rows[0];
  },

  updateUserGame: async (title: string, language: string, nPlayer: number, gameId: string) => {
    const result = await pool.query(
      'UPDATE "userGame" SET title = $1, language = $2, "nPlayer" = $3 WHERE id = $4 RETURNING *',
      [title, language, nPlayer, gameId]
    );
    return result.rows[0];
  },

  // Game Details queries
  getGameDetails: async (gameId: string) => {
    const result = await pool.query(
      'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
      [gameId]
    );
    return result.rows[0];
  },

  createGameDetails: async (gameId: string, imgUrl: string, description: string, isPublic: boolean, category: string, theme: string, keyWords: string[]) => {
    const result = await pool.query(
      'INSERT INTO "userGameDetails" ("gameId", "imgUrl", description, "isPublic", category, theme, "keyWords") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [gameId, imgUrl, description, isPublic, category, theme, keyWords]
    );
    return result.rows[0];
  },

  updateGameDetails: async (gameId: string, imgUrl: string, description: string, isPublic: boolean, category: string, theme: string, keyWords: string[]) => {
    const result = await pool.query(
      'UPDATE "userGameDetails" SET "imgUrl" = $1, description = $2, "isPublic" = $3, category = $4, theme = $5, "keyWords" = $6 WHERE "gameId" = $7 RETURNING *',
      [imgUrl, description, isPublic, category, theme, keyWords, gameId]
    );
    return result.rows[0];
  },

  deleteGameDetails: async (gameId: string) => {
    await pool.query(
      'DELETE FROM "userGameDetails" WHERE "gameId" = $1',
      [gameId]
    );
  },

  // Public game queries
  getPublicGames: async () => {
    const result = await pool.query(
      'SELECT ug.* FROM "userGame" ug JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" WHERE ugd."isPublic" = true'
    );
    return result.rows;
  },

  getPublicGamesWithPagination: async (offset: number, category?: string) => {
    let query = `
      SELECT ug.* FROM "userGame" ug 
      JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" 
      WHERE ugd."isPublic" = true
    `;
    const params = [];
    
    if (category) {
      query += ' AND ugd.category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY ug."createdAt" ASC OFFSET $' + (params.length + 1) + ' LIMIT 10';
    params.push(offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  findPublicGameById: async (gameId: string) => {
    const result = await pool.query(
      'SELECT ug.* FROM "userGame" ug JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" WHERE ug.id = $1 AND ugd."isPublic" = true',
      [gameId]
    );
    return result.rows[0];
  },

  findPublicGameByTitle: async (title: string) => {
    const result = await pool.query(
      'SELECT ug.* FROM "userGame" ug JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" WHERE ug.title = $1 AND ugd."isPublic" = true',
      [title]
    );
    return result.rows[0];
  },

  // Game stats queries
  getGameRoomsCount: async (gameId: string) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM "gameRooms" WHERE "gameId" = $1',
      [gameId]
    );
    return parseInt(result.rows[0].count);
  },

  getQuestionsCount: async (gameId: string) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM questions WHERE "gameId" = $1',
      [gameId]
    );
    return parseInt(result.rows[0].count);
  },

  getGameScores: async (gameId: string) => {
    const result = await pool.query(
      'SELECT score FROM "userGameScore" WHERE "gameId" = $1',
      [gameId]
    );
    return result.rows;
  },

  getGameRoomsWithPlayerCount: async (gameId: string) => {
    const result = await pool.query(
      'SELECT gr.*, COUNT(gp.id) as player_count FROM gameRooms gr LEFT JOIN gamePlayers gp ON gr.id = gp.gameRoomId WHERE gr.gameId = $1 GROUP BY gr.id',
      [gameId]
    );
    return result.rows;
  },

  getUserOwnGames: async (userId: string, offset: number, limit: number = 10) => {
    const result = await pool.query(
      'SELECT * FROM "userGame" WHERE "user" = $1 ORDER BY "createdAt" ASC OFFSET $2 LIMIT $3',
      [userId, offset, limit]
    );
    return result.rows;
  },

  // Helper function to get complete game stats
  getGameWithStats: async (gameId: string, userId: string) => {
    const gameDetails = await gameQueries.getGameDetails(gameId);
    const user = await userQueries.getUserByRegisterId(userId);
    const nRoomsCreated = await gameQueries.getGameRoomsCount(gameId);
    const nQuestions = await gameQueries.getQuestionsCount(gameId);
    const gameStars = await gameQueries.getGameScores(gameId);
    const nReviews = gameStars.length;
    const averageStars = nReviews > 0 ? gameStars.reduce((acc: number, gs: any) => acc + gs.score, 0) / nReviews : 0;
    
    return {
      gameDetails,
      user,
      nRoomsCreated,
      nQuestions,
      nReviews,
      averageStars
    };
  }
};

// =====================================
// QUESTION QUERIES
// =====================================

export const questionQueries = {
  // Basic question operations
  createQuestion: async (question: string, options: string[], answer: string, gameId: string) => {
    const result = await pool.query(
      'INSERT INTO questions (question, options, answer, "gameId") VALUES ($1, $2, $3, $4) RETURNING *',
      [question, options, answer, gameId]
    );
    return result.rows[0];
  },

  getQuestionsByGameId: async (gameId: string) => {
    const result = await pool.query(
      'SELECT * FROM questions WHERE "gameId" = $1',
      [gameId]
    );
    return result.rows;
  },

  updateQuestion: async (questionId: string, question: string, options: string[], answer: string) => {
    const result = await pool.query(
      'UPDATE questions SET question = $1, options = $2, answer = $3 WHERE id = $4 RETURNING *',
      [question, options, answer, questionId]
    );
    return result.rows[0];
  },

  deleteQuestion: async (questionId: string) => {
    await pool.query(
      'DELETE FROM questions WHERE id = $1',
      [questionId]
    );
  },

  // Question solved queries
  getQuestionSolvedByPlayer: async (gameRoomId: string, playerId: string) => {
    const result = await pool.query(
      'SELECT * FROM "questionSolved" WHERE "gameRoomId" = $1 AND "playerId" = $2',
      [gameRoomId, playerId]
    );
    return result.rows;
  },

  createQuestionSolved: async (gameRoomId: string, playerId: string, questionId: string, playerAnswer: string, isCorrect: boolean, timeTaken: number) => {
    const result = await pool.query(
      'INSERT INTO "questionSolved" ("gameRoomId", "playerId", "questionId", "playerAnswer", "isCorrect", "timeTaken") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [gameRoomId, playerId, questionId, playerAnswer, isCorrect, timeTaken]
    );
    return result.rows[0];
  },

  getQuestionSolvedWithDetails: async (gameRoomId: string) => {
    const result = await pool.query(
      `SELECT qs.*, q.question, q.answer, q.options, gp.name as playerName, gp.image as playerImage
       FROM "questionSolved" qs
       JOIN questions q ON qs."questionId" = q.id
       JOIN "gamePlayers" gp ON qs."playerId" = gp.id
       WHERE qs."gameRoomId" = $1`,
      [gameRoomId]
    );
    return result.rows;
  }
};

// =====================================
// GAME ROOM QUERIES
// =====================================

export const gameRoomQueries = {
  // Game room operations
  createGameRoom: async (gameId: string, roomName: string, maxPlayers: number, playerId: string) => {
    const result = await pool.query(
      'INSERT INTO "gameRooms" ("gameId", "roomName", "maxPlayers", "playerId", status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [gameId, roomName, maxPlayers, playerId, 'created']
    );
    return result.rows[0];
  },

  findGameRoomById: async (roomId: string) => {
    const result = await pool.query(
      'SELECT * FROM "gameRooms" WHERE id = $1',
      [roomId]
    );
    return result.rows[0];
  },

  updateGameRoomStatus: async (roomId: string, status: string) => {
    const result = await pool.query(
      'UPDATE "gameRooms" SET status = $1 WHERE id = $2 RETURNING *',
      [status, roomId]
    );
    return result.rows[0];
  },

  deleteGameRoom: async (roomId: string) => {
    await pool.query(
      'DELETE FROM "gameRooms" WHERE id = $1',
      [roomId]
    );
  },

  getGameRoomsByGameId: async (gameId: string) => {
    const result = await pool.query(
      'SELECT * FROM "gameRooms" WHERE "gameId" = $1',
      [gameId]
    );
    return result.rows;
  },

  findLiveRoomByStatus: async (roomId: string, statuses: string[]) => {
    const placeholders = statuses.map((_, index) => `$${index + 2}`).join(', ');
    const result = await pool.query(
      `SELECT id FROM gameRooms WHERE id = $1 AND status IN (${placeholders})`,
      [roomId, ...statuses]
    );
    return result.rows[0];
  }
};

// =====================================
// GAME PLAYER QUERIES
// =====================================

export const gamePlayerQueries = {
  // Game player operations
  createGamePlayer: async (roomId: string, name: string, image: string, userId?: string) => {
    const result = await pool.query(
      'INSERT INTO "gamePlayers" ("roomId", name, image, "userId", "isApproved") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [roomId, name, image, userId || null, false]
    );
    return result.rows[0];
  },

  findGamePlayerById: async (playerId: string) => {
    const result = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE id = $1',
      [playerId]
    );
    return result.rows[0];
  },

  approveGamePlayer: async (playerId: string) => {
    const result = await pool.query(
      'UPDATE "gamePlayers" SET "isApproved" = true WHERE id = $1 RETURNING *',
      [playerId]
    );
    return result.rows[0];
  },

  removeGamePlayer: async (playerId: string) => {
    await pool.query(
      'DELETE FROM "gamePlayers" WHERE id = $1',
      [playerId]
    );
  },

  getGamePlayersByRoomId: async (roomId: string) => {
    const result = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
      [roomId]
    );
    return result.rows;
  },

  getApprovedGamePlayer: async (playerId: string) => {
    const result = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE id = $1 AND "isApproved" = true LIMIT 1',
      [playerId]
    );
    return result.rows[0];
  },

  findGamePlayerInLiveRoom: async (gameId: string, playerId: string) => {
    const result = await pool.query(
      `SELECT gr.* FROM "gameRooms" gr 
       JOIN "gamePlayers" gp ON gr.id = gp."roomId" 
       WHERE gr."gameId" = $1 AND gp.id = $2 AND gr.status != 'closed' 
       LIMIT 1`,
      [gameId, playerId]
    );
    return result.rows[0];
  }
};

// =====================================
// FEEDBACK & RATING QUERIES
// =====================================

export const feedbackQueries = {
  createFeedback: async (score: number, feedback: string, userId: string) => {
    await pool.query(
      'INSERT INTO feedback (score, feedback, "isActive", "userId") VALUES ($1, $2, $3, $4)',
      [score, feedback, true, userId]
    );
  },

  createGameScore: async (score: number, playerId: string, gameId: string) => {
    await pool.query(
      'INSERT INTO "userGameScore" (score, "playerId", "gameId") VALUES ($1, $2, $3)',
      [score, playerId, gameId]
    );
  }
};

// =====================================
// NOTIFICATION QUERIES
// =====================================

export const notificationQueries = {
  createNotification: async (fromUserId: string, notification: string) => {
    const result = await pool.query(
      'INSERT INTO notifications ("from", notification) VALUES ($1, $2) RETURNING id',
      [fromUserId, notification]
    );
    return result.rows[0].id;
  },

  createNotificationRecipient: async (notificationId: string, recipientId: string) => {
    await pool.query(
      'INSERT INTO "NotificationRecipient" ("notificationId", "recipientId") VALUES ($1, $2)',
      [notificationId, recipientId]
    );
  },

  getNotificationsForUser: async (userId: string, offset: number, limit: number = 25) => {
    const result = await pool.query(
      `SELECT n."from", n.notification 
       FROM notifications n 
       JOIN "NotificationRecipient" nr ON n.id = nr."notificationId" 
       WHERE nr."recipientId" = $1 
       OFFSET $2 LIMIT $3`,
      [userId, offset, limit]
    );
    return result.rows;
  },

  getAllUserIds: async (excludeUserId: string) => {
    const result = await pool.query(
      'SELECT id FROM register WHERE id != $1',
      [excludeUserId]
    );
    return result.rows.map((obj: any) => obj.id);
  }
};

// =====================================
// SUBSCRIPTION & MISC QUERIES
// =====================================

export const miscQueries = {
  createSubscription: async (email: string, ipAddress: string) => {
    await pool.query(
      'INSERT INTO subscription (email, "ipAdress", "isActive") VALUES ($1, $2, $3)',
      [email, ipAddress, true]
    );
  },

  createAcceptTC: async (ipAddress: string, userId: string, metadata: any) => {
    await pool.query(
      'INSERT INTO "acceptTC" ("ipAddress", "user", metadata) VALUES ($1, $2, $3)',
      [ipAddress, userId, metadata]
    );
  },

  getAcceptTC: async (userId: string) => {
    const result = await pool.query(
      'SELECT * FROM "acceptTC" WHERE "user" = $1 LIMIT 1',
      [userId]
    );
    return result.rows[0];
  },

  getGameExperience: async (gameId: string) => {
    const result = await pool.query(
      'SELECT * FROM "gameExperience" WHERE "gameId" = $1',
      [gameId]
    );
    return result.rows;
  },

  getQuestionsInDB: async () => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM questions'
    );
    return parseInt(result.rows[0].count);
  },

  uploadImage: async (imageUrl: string) => {
    const result = await pool.query(
      'INSERT INTO "imageUpload" ("imageUrl") VALUES ($1) RETURNING *',
      [imageUrl]
    );
    return result.rows[0];
  },

  saveQuestionInDB: async (type: string, question: string, difficulty: string, category: string, correct_answer: string, incorrect_answers: string[], extra_incorrect_answers: string[], userId: string) => {
    await pool.query(
      'INSERT INTO "questionDB" (type, question, difficulty, category, correct_answer, incorrect_answers, extra_incorrect_answers, "user") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [type, question, difficulty, category, correct_answer, incorrect_answers, extra_incorrect_answers, userId]
    );
  },

  saveGameExperience: async (roomId: string, totalQ: number, timeTaken: number, totalText: number, lavelOfFun: number) => {
    await pool.query(
      'INSERT INTO "gameExperience" ("roomId", "totalQ", "timeTaken", "totalText", "lavelOfFun") VALUES ($1, $2, $3, $4, $5)',
      [roomId, totalQ, timeTaken, totalText, lavelOfFun]
    );
  },

  saveImageUpload: async (imgName: string, userId: string) => {
    const result = await pool.query(
      'INSERT INTO images ("imgName", "user") VALUES ($1, $2) RETURNING *',
      [imgName, userId]
    );
    return result.rows[0];
  }
};

// =====================================
// FRIENDS QUERIES
// =====================================

export const friendsQueries = {
  sendFriendRequest: async (senderId: string, receiverId: string) => {
    const result = await pool.query(
      'INSERT INTO "friendRequests" ("senderId", "receiverId", status) VALUES ($1, $2, $3) RETURNING *',
      [senderId, receiverId, 'pending']
    );
    return result.rows[0];
  },

  findFriendRequest: async (senderId: string, receiverId: string) => {
    const result = await pool.query(
      'SELECT * FROM "friendRequests" WHERE "senderId" = $1 AND "receiverId" = $2',
      [senderId, receiverId]
    );
    return result.rows[0];
  },

  findFriendRequestById: async (requestId: string) => {
    const result = await pool.query(
      'SELECT * FROM "friendRequests" WHERE id = $1',
      [requestId]
    );
    return result.rows[0];
  },

  updateFriendRequestStatus: async (requestId: string, status: string) => {
    const result = await pool.query(
      'UPDATE "friendRequests" SET status = $1 WHERE id = $2 RETURNING *',
      [status, requestId]
    );
    return result.rows[0];
  },

  deleteFriendRequest: async (requestId: string) => {
    await pool.query(
      'DELETE FROM "friendRequests" WHERE id = $1',
      [requestId]
    );
  },

  getFriendRequestsReceived: async (userId: string, offset: number, limit: number = 25) => {
    const result = await pool.query(
      'SELECT * FROM "friendRequests" WHERE "receiverId" = $1 AND status = $2 OFFSET $3 LIMIT $4',
      [userId, 'pending', offset, limit]
    );
    return result.rows;
  },

  getFriendRequestsSent: async (userId: string, offset: number, limit: number = 25) => {
    const result = await pool.query(
      'SELECT * FROM "friendRequests" WHERE "senderId" = $1 AND status = $2 OFFSET $3 LIMIT $4',
      [userId, 'pending', offset, limit]
    );
    return result.rows;
  },

  getAcceptedFriends: async (userId: string, offset: number, limit: number = 25) => {
    const result = await pool.query(
      `SELECT * FROM "friendRequests" 
       WHERE (("senderId" = $1 OR "receiverId" = $1) AND status = $2) 
       OFFSET $3 LIMIT $4`,
      [userId, 'accepted', offset, limit]
    );
    return result.rows;
  }
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

export const utilityQueries = {
  checkDuplicate: async (tableName: string, conditions: Record<string, any>) => {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(' AND ');
    
    const result = await pool.query(
      `SELECT * FROM "${tableName}" WHERE ${whereClause} LIMIT 1`,
      values
    );
    return result.rows[0];
  },

  getUserAccess: async (tableName: string, conditions: Record<string, any>, userId: string) => {
    const keys = Object.keys(conditions);
    const values = [...Object.values(conditions), userId];
    
    let whereClause = '';
    if (keys.length > 0) {
      whereClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(' AND ') + ' AND ';
    }
    whereClause += `"user" = $${values.length}`;
    
    const result = await pool.query(
      `SELECT * FROM "${tableName}" WHERE ${whereClause}`,
      values
    );
    return result.rows.length === 1 ? result.rows[0] : result.rows;
  }
};
