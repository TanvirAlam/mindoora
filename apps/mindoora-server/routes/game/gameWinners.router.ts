import { Router } from 'express'
import { authenticateJWT } from '../../middleware/auth.middleware'
import {
  createGameWinnersController,
  getGameWinnersController,
  updateGameWinnersController,
  deleteGameWinnersController,
  getGamePlayersController
} from '../../controllers/game/gameWinners.controller'

const router = Router()

// All routes require authentication
router.use(authenticateJWT)

// POST /api/v1/game/winners - Create or update game winners
router.post('/', createGameWinnersController)

// GET /api/v1/game/winners?gameId={gameId} - Get winners for a game
router.get('/', getGameWinnersController)

// PUT /api/v1/game/winners - Update game winners
router.put('/', updateGameWinnersController)

// DELETE /api/v1/game/winners?gameId={gameId} - Delete winners for a game
router.delete('/', deleteGameWinnersController)

// GET /api/v1/game/winners/players?gameId={gameId} - Get all players for a game (for dropdowns)
router.get('/players', getGamePlayersController)

export default router
