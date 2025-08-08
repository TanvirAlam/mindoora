import { Router } from 'express'
import { 
  getRealTimeLeaderboardController, 
  getQuestionAnalysisController, 
  getSessionSummaryController 
} from '../../controllers/game/enhancedLeaderboard.controller'
import { authenticateJWT } from '../../middleware/auth.middleware'

const enhancedGameAnalyticsRouter = Router()

// Real-time leaderboard during active games
enhancedGameAnalyticsRouter.get('/leaderboard/realtime', authenticateJWT, getRealTimeLeaderboardController)

// Detailed question-by-question analysis
enhancedGameAnalyticsRouter.get('/analysis/questions', authenticateJWT, getQuestionAnalysisController)

// Comprehensive session summary with winners
enhancedGameAnalyticsRouter.get('/session/:sessionId/summary', authenticateJWT, getSessionSummaryController)

export default enhancedGameAnalyticsRouter
