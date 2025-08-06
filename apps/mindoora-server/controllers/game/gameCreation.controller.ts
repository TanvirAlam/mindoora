import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { gameQueries, userQueries, notificationQueries, miscQueries } from '../../utils/query'
import { v4 as uuidv4 } from 'uuid'

interface GameQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GameCreationRequest {
  title: string;
  prompt: string;
  questions: GameQuestion[];
  createdAt: string;
}

export const createGameWithQuestionsController = async (req: Request<{}, {}, GameCreationRequest>, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { title, prompt, questions } = req.body;
    const user = res.locals.user.id;

    // Validate request
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Game title is required' 
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one question is required' 
      });
    }

    if (questions.length > 20) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum 20 questions allowed per game' 
      });
    }

    // Check for duplicate game title by user
    const existingGame = await pool.query(
      'SELECT id FROM "UserGame" WHERE title = $1 AND "user" = $2',
      [title, user]
    );

    if (existingGame.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'A game with this title already exists' 
      });
    }

    // Start transaction
    await client.query('BEGIN');

    // Create the game (assuming English as default language and support for up to 5 players)
    const gameResult = await client.query(
      'INSERT INTO "UserGame" (title, language, "nPlayer", "user") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, 'en', 5, user]
    );
    const game = gameResult.rows[0];

    // Create game details with prompt information
    await client.query(
      'INSERT INTO "UserGameDetails" ("gameId", description, category, "keyWords", "isPublic") VALUES ($1, $2, $3, $4, $5)',
      [game.id, `Generated from prompt: ${prompt}`, 'ai-generated', [prompt], true]
    );

    // Process and save questions
    const savedQuestions = [];
    
    for (const [index, questionData] of questions.entries()) {
      // Validate question structure
      if (!questionData.question || !questionData.options || questionData.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${index}`);
      }

      // Format options as JSON object with A, B, C, D keys
      const optionsObject = {
        A: questionData.options[0],
        B: questionData.options[1], 
        C: questionData.options[2],
        D: questionData.options[3]
      };

      // Save to Questions table (for game-specific questions)
      const questionResult = await client.query(
        'INSERT INTO "Questions" ("gameId", question, answer, options, "timeLimit", "qSource", "qPoints") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          game.id,
          questionData.question,
          questionData.correctAnswer, // 0-based index
          JSON.stringify(optionsObject),
          60, // Default 60 seconds
          'ai-generated',
          10 // Default 10 points
        ]
      );

      const savedQuestion = questionResult.rows[0];
      savedQuestions.push(savedQuestion);

      // Also save to QuestionDB for historical purposes
      const correctAnswerLetter = ['A', 'B', 'C', 'D'][questionData.correctAnswer];
      const incorrectAnswers = questionData.options.filter((_, idx) => idx !== questionData.correctAnswer);
      
      try {
        await client.query(
          'INSERT INTO "QuestionDB" (type, difficulty, category, question, correct_answer, incorrect_answers, extra_incorrect_answers, "user") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            'multiple-choice',
            'medium',
            'ai-generated',
            questionData.question,
            correctAnswerLetter,
            incorrectAnswers,
            [], // No extra incorrect answers
            user
          ]
        );
      } catch (dbError) {
        // Ignore duplicate question errors in QuestionDB, but continue
        console.warn(`Question already exists in QuestionDB: ${questionData.question}`);
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Get user name for notification
    const userProfile = await userQueries.getUserByRegisterId(user);
    const userName = userProfile?.name || 'Unknown User';

    // Create notifications for other users (optional - you can enable/disable this)
    try {
      const arrayOfIds = await notificationQueries.getAllUserIds(user);
      
      for (const userId of arrayOfIds) {
        const notificationId = await notificationQueries.createNotification(
          user, 
          `${userName} has created a new AI-generated game: ${title}`
        );
        await notificationQueries.createNotificationRecipient(notificationId, userId);
      }

      // Emit socket notification if available
      if (req.io) {
        req.io.emit('new_game_notification', { 
          from: user, 
          notification: `${userName} has created a new AI-generated game: ${title}`, 
          name: userName 
        });
      }
    } catch (notificationError) {
      console.warn('Failed to send notifications:', notificationError.message);
      // Don't fail the whole request due to notification errors
    }

    // Check if game is ready to play (20 questions = ready)
    const isReady = savedQuestions.length === 20;
    
    return res.status(201).json({ 
      success: true,
      message: isReady 
        ? 'Game created successfully! Your game is ready to be played with 20 questions.' 
        : `Game created successfully with ${savedQuestions.length} questions. Add ${20 - savedQuestions.length} more questions to make it ready for play.`,
      data: {
        gameId: game.id,
        title: game.title,
        questionsCount: savedQuestions.length,
        isReady,
        maxQuestions: 20,
        remainingQuestions: Math.max(0, 20 - savedQuestions.length)
      }
    });

  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    console.error('❌ Error creating game with questions:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('User ID:', res.locals.user?.id);
    console.error('Game title:', req.body.title);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create game',
      message: error.message,
      details: error.name
    });
  } finally {
    client.release();
  }
};

export const getGameQuestionsController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string;

    if (!gameId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Game ID is required' 
      });
    }

    // Verify game exists and user has access
    const gameResult = await pool.query(
      'SELECT * FROM "UserGame" WHERE id = $1 AND "user" = $2',
      [gameId, res.locals.user.id]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found or access denied' 
      });
    }

    const game = gameResult.rows[0];

    // Get all questions for the game
    const questionsResult = await pool.query(
      'SELECT id, question, answer, options, "timeLimit", "qSource", "qPoints", "createdAt" FROM "Questions" WHERE "gameId" = $1 ORDER BY "createdAt"',
      [gameId]
    );

    const questions = questionsResult.rows;
    const isReady = questions.length === 20;

    return res.status(200).json({
      success: true,
      data: {
        game: {
          id: game.id,
          title: game.title,
          language: game.language,
          nPlayer: game.nPlayer
        },
        questions,
        questionsCount: questions.length,
        isReady,
        maxQuestions: 20,
        remainingQuestions: Math.max(0, 20 - questions.length)
      }
    });

  } catch (error) {
    console.error('Error fetching game questions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch game questions',
      message: error.message
    });
  }
};

export const getMyGamesController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;

    // Get all games created by the user with question counts
    const gamesResult = await pool.query(`
      SELECT 
        ug.id,
        ug.title,
        ug.language,
        ug."nPlayer",
        ug."createdAt",
        COUNT(q.id) as "questionCount",
        ugd.description,
        ugd.category,
        ugd."isPublic"
      FROM "UserGame" ug
      LEFT JOIN "Questions" q ON ug.id = q."gameId"
      LEFT JOIN "UserGameDetails" ugd ON ug.id = ugd."gameId"
      WHERE ug."user" = $1
      GROUP BY ug.id, ug.title, ug.language, ug."nPlayer", ug."createdAt", ugd.description, ugd.category, ugd."isPublic"
      ORDER BY ug."createdAt" DESC
    `, [userId]);

    const games = gamesResult.rows.map(game => ({
      id: game.id,
      title: game.title,
      language: game.language,
      nPlayer: game.nPlayer,
      createdAt: game.createdAt,
      questionCount: parseInt(game.questionCount) || 0,
      isReady: parseInt(game.questionCount) >= 20,
      maxQuestions: 20,
      remainingQuestions: Math.max(0, 20 - (parseInt(game.questionCount) || 0)),
      description: game.description,
      category: game.category,
      isPublic: game.isPublic
    }));

    return res.status(200).json({
      success: true,
      data: {
        games,
        totalGames: games.length
      }
    });

  } catch (error) {
    console.error('Error fetching user games:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch your games',
      message: error.message
    });
  }
};

// New endpoint for multiplayer game participants to access questions
export const getGameQuestionsForRoomController = async (req: Request, res: Response) => {
  try {
    const { roomId, playerId } = req.query;

    if (!roomId || !playerId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Room ID and Player ID are required' 
      });
    }

    // Verify the player is part of this room
    const playerResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE id = $1 AND "roomId" = $2',
      [playerId, roomId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Player not found in this room or access denied' 
      });
    }

    // Get the game room to find the gameId
    const roomResult = await pool.query(
      'SELECT "gameId" FROM "GameRooms" WHERE id = $1',
      [roomId]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game room not found' 
      });
    }

    const gameId = roomResult.rows[0].gameId;

    // Get the game details
    const gameResult = await pool.query(
      'SELECT * FROM "UserGame" WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found' 
      });
    }

    const game = gameResult.rows[0];

    // Get all questions for the game
    const questionsResult = await pool.query(
      'SELECT id, question, answer, options, "timeLimit", "qSource", "qPoints", "createdAt" FROM "Questions" WHERE "gameId" = $1 ORDER BY "createdAt"',
      [gameId]
    );

    const questions = questionsResult.rows;

    return res.status(200).json({
      success: true,
      data: {
        game: {
          id: game.id,
          title: game.title,
          language: game.language,
          nPlayer: game.nPlayer
        },
        questions,
        questionsCount: questions.length,
        maxQuestions: 20
      }
    });

  } catch (error) {
    console.error('Error fetching game questions for room:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch game questions',
      message: error.message
    });
  }
};

export const deleteGameController = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { gameId } = req.params;
    const userId = res.locals.user.id;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        error: 'Game ID is required'
      });
    }

    // Start transaction
    await client.query('BEGIN');

    // Verify the game exists and belongs to the user
    const gameResult = await client.query(
      'SELECT id, title FROM "UserGame" WHERE id = $1 AND "user" = $2',
      [gameId, userId]
    );

    if (gameResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Game not found or you do not have permission to delete it'
      });
    }

    const game = gameResult.rows[0];

    // Delete in correct order to handle foreign key constraints
    
    // 1. Delete from GameRoomMessages table (depends on GamePlayers and GameRooms)
    await client.query(`
      DELETE FROM "GameRoomMessages" 
      WHERE "roomId" IN (
        SELECT id FROM "GameRooms" WHERE "gameId" = $1
      )
    `, [gameId]);
    
    // 2. Delete from QuestionsSolved table (depends on GamePlayers and Questions)
    await client.query(`
      DELETE FROM "QuestionsSolved" 
      WHERE "playerId" IN (
        SELECT gp.id FROM "GamePlayers" gp 
        JOIN "GameRooms" gr ON gp."roomId" = gr.id 
        WHERE gr."gameId" = $1
      )
    `, [gameId]);
    
    // 3. Delete from userGameScore table
    await client.query('DELETE FROM "userGameScore" WHERE "gameId" = $1', [gameId]);
    
    // 4. Delete from FeedbackGame table
    await client.query('DELETE FROM "FeedbackGame" WHERE "gameId" = $1', [gameId]);
    
    // 5. Delete from GamePlayers table (depends on GameRooms)
    await client.query(`
      DELETE FROM "GamePlayers" 
      WHERE "roomId" IN (
        SELECT id FROM "GameRooms" WHERE "gameId" = $1
      )
    `, [gameId]);
    
    // 6. Delete from GameRooms table
    await client.query('DELETE FROM "GameRooms" WHERE "gameId" = $1', [gameId]);
    
    // 7. Delete from Questions table
    await client.query('DELETE FROM "Questions" WHERE "gameId" = $1', [gameId]);
    
    // 8. Delete from UserGameDetails table
    await client.query('DELETE FROM "UserGameDetails" WHERE "gameId" = $1', [gameId]);
    
    // 9. Finally, delete from UserGame table
    await client.query('DELETE FROM "UserGame" WHERE id = $1', [gameId]);

    // Commit transaction
    await client.query('COMMIT');

    console.log(`✅ Game "${game.title}" (ID: ${gameId}) deleted successfully by user ${userId}`);

    return res.status(200).json({
      success: true,
      message: `Game "${game.title}" has been deleted successfully`,
      data: {
        deletedGameId: gameId,
        deletedGameTitle: game.title
      }
    });

  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    console.error('❌ Error deleting game:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Game ID:', req.params.gameId);
    console.error('User ID:', res.locals.user?.id);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to delete game',
      message: error.message
    });
  } finally {
    client.release();
  }
};
