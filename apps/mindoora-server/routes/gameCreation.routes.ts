import { Router } from 'express';
import { createGameWithQuestionsController, getGameQuestionsController, getMyGamesController, deleteGameController } from '../controllers/game/gameCreation.controller';
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

/**
 * @route GET /api/games/my-games
 * @desc Get all games created by the current user
 * @access Private (requires authentication)
 */
router.get('/my-games', authenticateJWT, getMyGamesController);

/**
 * @route DELETE /api/games/:gameId
 * @desc Delete a game and all its related data
 * @access Private (requires authentication)
 * @param gameId: string
 */
router.delete('/:gameId', authenticateJWT, deleteGameController);

export default router;
