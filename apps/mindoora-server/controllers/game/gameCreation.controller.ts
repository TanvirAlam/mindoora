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

    // Create the game (assuming English as default language and single player)
    const gameResult = await client.query(
      'INSERT INTO "UserGame" (title, language, "nPlayer", "user") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, 'en', 1, user]
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
