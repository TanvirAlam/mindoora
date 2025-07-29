import { Request, Response } from 'express'
import { authQueries } from '../../utils/query'
import { pool } from '../../utils/PrismaInstance'

export const getLoginHistoryController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id
    const limit = parseInt(req.query.limit as string) || 25
    const offset = parseInt(req.query.offset as string) || 0

    const loginHistory = await authQueries.getLoginHistory(userId, limit, offset)

    return res.status(200).json({
      message: 'Login history retrieved successfully',
      data: loginHistory,
      pagination: {
        limit,
        offset,
        total: loginHistory.length
      }
    })
  } catch (error) {
    console.error('Get login history error:', error)
    return res.status(500).json({ message: 'Failed to retrieve login history' })
  }
}

export const getAllLoginHistoryController = async (req: Request, res: Response) => {
  try {
    // This endpoint is for admin purposes - you might want to add admin auth middleware
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    const result = await pool.query(
      `SELECT lh.*, r.email, u.name 
       FROM "LoginHistory" lh
       JOIN "Register" r ON lh."userId" = r.id
       LEFT JOIN "User" u ON r.id = u."registerId"
       ORDER BY lh."loginTime" DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return res.status(200).json({
      message: 'All login history retrieved successfully',
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length
      }
    })
  } catch (error) {
    console.error('Get all login history error:', error)
    return res.status(500).json({ message: 'Failed to retrieve login history' })
  }
}

export const getLoginStatisticsController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id

    // Get login statistics for the user
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_logins,
        COUNT(CASE WHEN "success" = true THEN 1 END) as successful_logins,
        COUNT(CASE WHEN "success" = false THEN 1 END) as failed_logins,
        COUNT(DISTINCT "loginMethod") as unique_methods,
        COUNT(DISTINCT DATE("loginTime")) as active_days,
        MAX("loginTime") as last_login,
        MIN("loginTime") as first_login
       FROM "LoginHistory" 
       WHERE "userId" = $1`,
      [userId]
    )

    const methodStatsResult = await pool.query(
      `SELECT "loginMethod", COUNT(*) as count
       FROM "LoginHistory" 
       WHERE "userId" = $1 
       GROUP BY "loginMethod"
       ORDER BY count DESC`,
      [userId]
    )

    return res.status(200).json({
      message: 'Login statistics retrieved successfully',
      stats: statsResult.rows[0],
      methodBreakdown: methodStatsResult.rows
    })
  } catch (error) {
    console.error('Get login statistics error:', error)
    return res.status(500).json({ message: 'Failed to retrieve login statistics' })
  }
}
