import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { missingParams } from '../tools'

/**
 * Gets real-time leaderboard with enhanced metrics during active games
 */
export const getRealTimeLeaderboardController = async (req: Request, res: Response) => {
  try {
    const roomId = req.query?.roomId as string;
    
    if (missingParams({ roomId }, res)) return;
    
    // Find the active session for this room
    const sessionResult = await pool.query(
      `SELECT * FROM "GameSessions" WHERE "roomId" = $1 AND status IN ('waiting', 'in_progress') 
       ORDER BY "sessionStartedAt" DESC LIMIT 1`,
      [roomId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'No active game session found for this room' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get enhanced leaderboard with detailed metrics
    const leaderboardResult = await pool.query(
      `SELECT 
         ll.*,
         gp."imgUrl" as "playerImage",
         pp."averageReactionTime",
         pp."fastestCorrectAnswer",
         pp."slowestCorrectAnswer", 
         pp."maxStreak",
         pp."streak" as "currentStreak",
         ROUND((ll."correctAnswers"::DECIMAL / NULLIF(ll."questionsAnswered", 0) * 100), 2) as "accuracyPercentage",
         -- Count how many times this player was first to answer correctly
         (SELECT COUNT(*) FROM "QuestionsSolved" qs 
          WHERE qs."playerId" = ll."playerId" AND qs."answerOrder" = 1 AND qs."isRight" = true) as "firstCorrectAnswers"
       FROM "LiveLeaderboard" ll
       JOIN "GamePlayers" gp ON gp."id" = ll."playerId"
       LEFT JOIN "PlayerPerformance" pp ON pp."sessionId" = ll."sessionId" AND pp."playerId" = ll."playerId"
       WHERE ll."sessionId" = $1
       ORDER BY ll."currentRank" ASC`,
      [session.id]
    );
    
    // Calculate additional metrics for each player
    const enhancedLeaderboard = await Promise.all(
      leaderboardResult.rows.map(async (player) => {
        // Get recent answer streak (last 5 answers)
        const recentAnswersResult = await pool.query(
          `SELECT "isRight" FROM "QuestionsSolved" 
           WHERE "playerId" = $1 
           ORDER BY "createdAt" DESC 
           LIMIT 5`,
          [player.playerId]
        );
        
        const recentAnswers = recentAnswersResult.rows;
        const recentCorrectCount = recentAnswers.filter(a => a.isRight).length;
        
        // Get speed rank among all players for this session
        const speedRankResult = await pool.query(
          `SELECT COUNT(*) + 1 as speed_rank
           FROM "LiveLeaderboard" ll2
           LEFT JOIN "PlayerPerformance" pp2 ON pp2."sessionId" = ll2."sessionId" AND pp2."playerId" = ll2."playerId"
           WHERE ll2."sessionId" = $1 
           AND pp2."averageReactionTime" < $2
           AND pp2."averageReactionTime" IS NOT NULL`,
          [session.id, player.averageReactionTime]
        );
        
        const speedRank = player.averageReactionTime ? parseInt(speedRankResult.rows[0].speed_rank) : null;
        
        return {
          playerId: player.playerId,
          playerName: player.playerName,
          playerImage: player.playerImage,
          currentPoints: player.currentPoints,
          currentRank: player.currentRank,
          questionsAnswered: player.questionsAnswered,
          correctAnswers: player.correctAnswers,
          accuracyPercentage: player.accuracyPercentage,
          currentStreak: player.currentStreak || 0,
          maxStreak: player.maxStreak || 0,
          averageReactionTime: player.averageReactionTime,
          fastestCorrectAnswer: player.fastestCorrectAnswer,
          slowestCorrectAnswer: player.slowestCorrectAnswer,
          firstCorrectAnswers: player.firstCorrectAnswers,
          speedRank: speedRank,
          recentForm: `${recentCorrectCount}/5`, // Recent performance (correct answers in last 5)
          lastUpdated: player.lastUpdated,
          // Performance grades
          accuracyGrade: getAccuracyGrade(player.accuracyPercentage),
          speedGrade: getSpeedGrade(player.averageReactionTime)
        };
      })
    );
    
    return res.status(200).json({
      message: 'Real-time leaderboard retrieved successfully',
      result: {
        sessionId: session.id,
        gameMode: session.gameMode,
        totalQuestions: session.totalQuestions,
        totalPlayers: session.totalPlayers,
        currentQuestionIndex: session.currentQuestionIndex,
        leaderboard: enhancedLeaderboard,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error getting real-time leaderboard:', error);
    return res.status(500).json(error);
  }
}

/**
 * Gets detailed question-by-question analysis for a session
 */
export const getQuestionAnalysisController = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query?.sessionId as string;
    const questionId = req.query?.questionId as string;
    
    if (missingParams({ sessionId }, res)) return;
    
    let whereClause = `qa."sessionId" = $1`;
    let params = [sessionId];
    
    if (questionId) {
      whereClause += ` AND qa."questionId" = $2`;
      params.push(questionId);
    }
    
    // Get detailed question attempts with player rankings
    const analysisResult = await pool.query(
      `SELECT 
         q."id" as "questionId",
         q."question" as "questionText",
         q."timeLimit",
         qa."playerId",
         gp."name" as "playerName",
         gp."imgUrl" as "playerImage",
         qa."attemptedAnswer",
         qa."isCorrect",
         qa."timeTakenMs",
         qa."pointsEarned",
         qa."speedRank",
         qa."wasFirstCorrect",
         qa."displayedAt",
         qa."answeredAt",
         -- Calculate how many milliseconds faster than the next player
         qa."timeTakenMs" - LEAD(qa."timeTakenMs") OVER (
           PARTITION BY qa."questionId" 
           ORDER BY qa."timeTakenMs" ASC
         ) as "timeAdvantageMs"
       FROM "QuestionAttempts" qa
       JOIN "Questions" q ON q."id" = qa."questionId"
       JOIN "GamePlayers" gp ON gp."id" = qa."playerId"
       WHERE ${whereClause}
       ORDER BY qa."questionId", qa."timeTakenMs" ASC`,
      params
    );
    
    // Group results by question
    const questionGroups = analysisResult.rows.reduce((groups, attempt) => {
      if (!groups[attempt.questionId]) {
        groups[attempt.questionId] = {
          questionId: attempt.questionId,
          questionText: attempt.questionText,
          timeLimit: attempt.timeLimit,
          totalAttempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          fastestCorrectTime: null,
          slowestCorrectTime: null,
          averageCorrectTime: null,
          attempts: []
        };
      }
      
      const group = groups[attempt.questionId];
      group.totalAttempts++;
      group.attempts.push(attempt);
      
      if (attempt.isCorrect) {
        group.correctAttempts++;
        if (group.fastestCorrectTime === null || attempt.timeTakenMs < group.fastestCorrectTime) {
          group.fastestCorrectTime = attempt.timeTakenMs;
        }
        if (group.slowestCorrectTime === null || attempt.timeTakenMs > group.slowestCorrectTime) {
          group.slowestCorrectTime = attempt.timeTakenMs;
        }
      } else {
        group.incorrectAttempts++;
      }
      
      return groups;
    }, {});
    
    // Calculate averages and success rates
    Object.values(questionGroups).forEach((group: any) => {
      if (group.correctAttempts > 0) {
        const correctAttempts = group.attempts.filter((a: any) => a.isCorrect);
        group.averageCorrectTime = Math.round(
          correctAttempts.reduce((sum: number, a: any) => sum + a.timeTakenMs, 0) / correctAttempts.length
        );
      }
      group.successRate = Math.round((group.correctAttempts / group.totalAttempts) * 100);
      
      // Sort attempts by speed for this question
      group.attempts.sort((a: any, b: any) => a.timeTakenMs - b.timeTakenMs);
    });
    
    const questions = Object.values(questionGroups);
    
    return res.status(200).json({
      message: 'Question analysis retrieved successfully',
      result: {
        sessionId,
        questionsAnalyzed: questions.length,
        questions
      }
    });
    
  } catch (error) {
    console.error('Error getting question analysis:', error);
    return res.status(500).json(error);
  }
}

/**
 * Gets comprehensive session summary and winner determination
 */
export const getSessionSummaryController = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Get session details
    const sessionResult = await pool.query(
      `SELECT gs.*, ug."title" as "gameTitle" FROM "GameSessions" gs
       JOIN "UserGame" ug ON ug."id" = gs."gameId"
       WHERE gs."id" = $1`,
      [sessionId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get final standings using the GameResultsDetailed view
    const standingsResult = await pool.query(
      `SELECT * FROM "GameResultsDetailed" WHERE "sessionId" = $1 ORDER BY "finalRank" ASC`,
      [sessionId]
    );
    
    // Get question difficulty analysis
    const questionDifficultyResult = await pool.query(
      `SELECT * FROM "QuestionAnalytics" WHERE "gameId" = $1`,
      [session.gameId]
    );
    
    // Get speed champions (players who answered first most often)
    const speedChampionsResult = await pool.query(
      `SELECT 
         gp."name" as "playerName",
         gp."imgUrl" as "playerImage",
         COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END) as "firstCorrectAnswers",
         COUNT(CASE WHEN qs."isRight" = true THEN 1 END) as "totalCorrectAnswers",
         AVG(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as "avgReactionTime"
       FROM "GamePlayers" gp
       LEFT JOIN "QuestionsSolved" qs ON qs."playerId" = gp."id"
       WHERE gp."roomId" = (SELECT "roomId" FROM "GameSessions" WHERE "id" = $1)
       GROUP BY gp."id", gp."name", gp."imgUrl"
       HAVING COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END) > 0
       ORDER BY "firstCorrectAnswers" DESC, "avgReactionTime" ASC
       LIMIT 3`,
      [sessionId]
    );
    
    // Calculate session statistics
    const sessionStats = {
      duration: session.sessionEndedAt ? 
        Math.round((new Date(session.sessionEndedAt).getTime() - new Date(session.sessionStartedAt).getTime()) / 1000) : null,
      totalQuestions: session.totalQuestions,
      totalPlayers: session.totalPlayers,
      completedQuestions: standingsResult.rows.length > 0 ? standingsResult.rows[0].questionsAnswered : 0,
      averageScore: standingsResult.rows.length > 0 ?
        Math.round(standingsResult.rows.reduce((sum, p) => sum + (p.finalScore || 0), 0) / standingsResult.rows.length) : 0,
      averageAccuracy: standingsResult.rows.length > 0 ?
        Math.round(standingsResult.rows.reduce((sum, p) => sum + (p.accuracyPercentage || 0), 0) / standingsResult.rows.length) : 0
    };
    
    return res.status(200).json({
      message: 'Session summary retrieved successfully',
      result: {
        session: {
          id: session.id,
          gameTitle: session.gameTitle,
          gameMode: session.gameMode,
          status: session.status,
          startedAt: session.sessionStartedAt,
          endedAt: session.sessionEndedAt,
          statistics: sessionStats
        },
        standings: standingsResult.rows,
        speedChampions: speedChampionsResult.rows,
        questionDifficulty: questionDifficultyResult.rows.slice(0, 5), // Top 5 hardest/easiest
        winner: standingsResult.rows.length > 0 ? standingsResult.rows[0] : null
      }
    });
    
  } catch (error) {
    console.error('Error getting session summary:', error);
    return res.status(500).json(error);
  }
}

/**
 * Helper function to determine accuracy grade
 */
function getAccuracyGrade(accuracy: number): string {
  if (accuracy >= 90) return 'A+';
  if (accuracy >= 80) return 'A';
  if (accuracy >= 70) return 'B';
  if (accuracy >= 60) return 'C';
  if (accuracy >= 50) return 'D';
  return 'F';
}

/**
 * Helper function to determine speed grade based on reaction time
 */
function getSpeedGrade(avgReactionTime: number): string {
  if (!avgReactionTime) return 'N/A';
  if (avgReactionTime <= 2000) return 'Lightning';
  if (avgReactionTime <= 5000) return 'Fast';
  if (avgReactionTime <= 8000) return 'Average';
  if (avgReactionTime <= 12000) return 'Slow';
  return 'Very Slow';
}
