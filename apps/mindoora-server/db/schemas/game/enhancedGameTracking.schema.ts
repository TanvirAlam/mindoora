import { z } from 'zod'

// ============================================================================
// Game Session Schemas
// ============================================================================

export const gameSessionCreateSchema = z.object({
  roomId: z.string().uuid('Invalid room ID format'),
  gameId: z.string().uuid('Invalid game ID format'),
  totalQuestions: z.number().int().min(1, 'Game must have at least 1 question'),
  totalPlayers: z.number().int().min(1, 'Game must have at least 1 player').max(10, 'Maximum 10 players allowed'),
  gameMode: z.enum(['standard', 'speed', 'survival', 'practice']).default('standard'),
  maxPlayersAllowed: z.number().int().min(2).max(10).default(5),
  sessionMetadata: z.record(z.any()).optional().default({})
})

export const gameSessionUpdateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  currentQuestionIndex: z.number().int().min(0).optional(),
  status: z.enum(['waiting', 'in_progress', 'completed', 'aborted']).optional(),
  sessionEndedAt: z.string().datetime().optional(),
  sessionMetadata: z.record(z.any()).optional()
})

export const gameSessionQuerySchema = z.object({
  roomId: z.string().uuid('Invalid room ID format').optional(),
  gameId: z.string().uuid('Invalid game ID format').optional(),
  status: z.enum(['waiting', 'in_progress', 'completed', 'aborted']).optional(),
  gameMode: z.enum(['standard', 'speed', 'survival', 'practice']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})

export type GameSessionCreateType = z.infer<typeof gameSessionCreateSchema>
export type GameSessionUpdateType = z.infer<typeof gameSessionUpdateSchema>
export type GameSessionQueryType = z.infer<typeof gameSessionQuerySchema>

// ============================================================================
// Player Performance Schemas
// ============================================================================

export const playerPerformanceCreateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  playerId: z.string().uuid('Invalid player ID format'),
  totalPoints: z.number().int().min(0).default(0),
  correctAnswers: z.number().int().min(0).default(0),
  incorrectAnswers: z.number().int().min(0).default(0),
  questionsAttempted: z.number().int().min(0).default(0),
  averageReactionTime: z.number().int().min(0).default(0),
  performanceMetadata: z.record(z.any()).optional().default({})
})

export const playerPerformanceUpdateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  playerId: z.string().uuid('Invalid player ID format'),
  totalPoints: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  incorrectAnswers: z.number().int().min(0).optional(),
  questionsAttempted: z.number().int().min(0).optional(),
  averageReactionTime: z.number().int().min(0).optional(),
  fastestCorrectAnswer: z.number().int().min(0).optional(),
  slowestCorrectAnswer: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  maxStreak: z.number().int().min(0).optional(),
  rank: z.number().int().min(1).optional(),
  pointsFromSpeed: z.number().int().min(0).optional(),
  pointsFromAccuracy: z.number().int().min(0).optional(),
  performanceMetadata: z.record(z.any()).optional()
})

export type PlayerPerformanceCreateType = z.infer<typeof playerPerformanceCreateSchema>
export type PlayerPerformanceUpdateType = z.infer<typeof playerPerformanceUpdateSchema>

// ============================================================================
// Question Attempts Schemas
// ============================================================================

export const questionAttemptCreateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  questionId: z.string().uuid('Invalid question ID format'),
  playerId: z.string().uuid('Invalid player ID format'),
  attemptedAnswer: z.string().min(1, 'Answer cannot be empty'),
  isCorrect: z.boolean(),
  timeTakenMs: z.number().int().min(0, 'Time taken cannot be negative'),
  displayedAt: z.string().datetime('Invalid display timestamp'),
  answeredAt: z.string().datetime('Invalid answer timestamp').optional(),
  timeoutAt: z.string().datetime('Invalid timeout timestamp').optional(),
  pointsEarned: z.number().int().min(0).default(0),
  speedRank: z.number().int().min(1).optional(),
  wasFirstCorrect: z.boolean().default(false),
  attemptMetadata: z.record(z.any()).optional().default({})
})

export const questionAttemptQuerySchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format').optional(),
  questionId: z.string().uuid('Invalid question ID format').optional(),
  playerId: z.string().uuid('Invalid player ID format').optional(),
  isCorrect: z.boolean().optional(),
  wasFirstCorrect: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
})

export type QuestionAttemptCreateType = z.infer<typeof questionAttemptCreateSchema>
export type QuestionAttemptQueryType = z.infer<typeof questionAttemptQuerySchema>

// ============================================================================
// Enhanced Question Solved Schema (for existing table updates)
// ============================================================================

export const enhancedQuestionSolveSchema = z.object({
  playerId: z.string().uuid('Invalid player ID format'),
  questionId: z.string().uuid('Invalid question ID format'),
  answer: z.string().min(1, 'Answer cannot be empty'),
  timeTaken: z.number().int().min(1, 'Time taken must be at least 1 second'),
  answeredAtMs: z.number().int().min(0).optional(), // Millisecond timestamp
  reactionTime: z.number().int().min(0).optional(), // Reaction time in ms
  sessionId: z.string().uuid('Invalid session ID format').optional()
})

export type EnhancedQuestionSolveType = z.infer<typeof enhancedQuestionSolveSchema>

// ============================================================================
// Live Leaderboard Schemas
// ============================================================================

export const liveLeaderboardQuerySchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  limit: z.number().int().min(1).max(10).default(10),
  includeMetrics: z.boolean().default(true)
})

export const liveLeaderboardUpdateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  playerId: z.string().uuid('Invalid player ID format'),
  currentPoints: z.number().int().min(0).optional(),
  questionsAnswered: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  currentStreak: z.number().int().min(0).optional()
})

export type LiveLeaderboardQueryType = z.infer<typeof liveLeaderboardQuerySchema>
export type LiveLeaderboardUpdateType = z.infer<typeof liveLeaderboardUpdateSchema>

// ============================================================================
// Game Results and Analytics Schemas
// ============================================================================

export const gameResultsQuerySchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format').optional(),
  gameId: z.string().uuid('Invalid game ID format').optional(),
  playerId: z.string().uuid('Invalid player ID format').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeDetails: z.boolean().default(true),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})

export const questionAnalyticsQuerySchema = z.object({
  gameId: z.string().uuid('Invalid game ID format').optional(),
  questionId: z.string().uuid('Invalid question ID format').optional(),
  minSuccessRate: z.number().min(0).max(100).optional(),
  maxSuccessRate: z.number().min(0).max(100).optional(),
  sortBy: z.enum(['successRate', 'totalAttempts', 'avgCorrectTime']).default('successRate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
})

export type GameResultsQueryType = z.infer<typeof gameResultsQuerySchema>
export type QuestionAnalyticsQueryType = z.infer<typeof questionAnalyticsQuerySchema>

// ============================================================================
// Winner Determination Schema
// ============================================================================

export const calculateWinnersSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  criteria: z.object({
    primarySort: z.enum(['totalPoints', 'correctAnswers', 'averageReactionTime']).default('totalPoints'),
    secondarySort: z.enum(['correctAnswers', 'averageReactionTime', 'questionsAttempted']).default('correctAnswers'),
    speedBonusMultiplier: z.number().min(0).max(2).default(1.2),
    accuracyBonusMultiplier: z.number().min(0).max(2).default(1.5)
  }).optional().default({
    primarySort: 'totalPoints',
    secondarySort: 'correctAnswers',
    speedBonusMultiplier: 1.2,
    accuracyBonusMultiplier: 1.5
  })
})

export type CalculateWinnersType = z.infer<typeof calculateWinnersSchema>

// ============================================================================
// Real-time Game State Schema
// ============================================================================

export const gameStateUpdateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  currentQuestionId: z.string().uuid('Invalid question ID format').optional(),
  currentQuestionIndex: z.number().int().min(0).optional(),
  timeRemaining: z.number().int().min(0).optional(), // seconds remaining for current question
  playersAnswered: z.array(z.string().uuid()).optional(), // list of player IDs who answered
  gameStatus: z.enum(['waiting', 'in_progress', 'question_active', 'question_ended', 'completed']).optional()
})

export const realTimeAnswerSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  questionId: z.string().uuid('Invalid question ID format'),
  playerId: z.string().uuid('Invalid player ID format'),
  answer: z.string().min(1, 'Answer cannot be empty'),
  submittedAt: z.number().int().min(0), // Millisecond timestamp
  clientLatency: z.number().int().min(0).optional() // Network latency in ms
})

export type GameStateUpdateType = z.infer<typeof gameStateUpdateSchema>
export type RealTimeAnswerType = z.infer<typeof realTimeAnswerSchema>

// ============================================================================
// Validation Helper Functions
// ============================================================================

export const validateTimestamp = (timestamp: string | number): boolean => {
  if (typeof timestamp === 'number') {
    return timestamp > 0 && timestamp <= Date.now()
  }
  const date = new Date(timestamp)
  return !isNaN(date.getTime()) && date.getTime() <= Date.now()
}

export const validateGameSession = (sessionData: any) => {
  try {
    return gameSessionCreateSchema.parse(sessionData)
  } catch (error) {
    throw new Error(`Invalid game session data: ${error}`)
  }
}

export const validateQuestionAttempt = (attemptData: any) => {
  try {
    return questionAttemptCreateSchema.parse(attemptData)
  } catch (error) {
    throw new Error(`Invalid question attempt data: ${error}`)
  }
}

export const validatePlayerPerformance = (performanceData: any) => {
  try {
    return playerPerformanceCreateSchema.parse(performanceData)
  } catch (error) {
    throw new Error(`Invalid player performance data: ${error}`)
  }
}
