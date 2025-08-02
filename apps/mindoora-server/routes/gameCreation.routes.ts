import { Router } from 'express';
import { createGameWithQuestionsController, getGameQuestionsController } from '../controllers/game/gameCreation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route POST /api/games
 * @desc Create a new game with questions
 * @access Private (requires authentication)
 * @body {
 *   title: string,
 *   prompt: string,
 *   questions: Array<{
 *     question: string,
 *     options: string[],
 *     correctAnswer: number
 *   }>,
 *   createdAt: string
 * }
 */
router.post('/', authenticateJWT, createGameWithQuestionsController);

/**
 * @route GET /api/games/questions
 * @desc Get questions for a specific game
 * @access Private (requires authentication)
 * @query gameId: string
 */
router.get('/questions', authenticateJWT, getGameQuestionsController);

export default router;
