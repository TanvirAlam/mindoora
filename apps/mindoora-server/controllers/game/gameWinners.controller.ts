import { Request, Response } from 'express'
import { Pool } from 'pg'
import { missingParams, userAccess } from '../tools'
import { z } from 'zod'

// Database connection
const pool = new Pool({
  connectionString: process.env.DB_URL || process.env.DATABASE_URL,
})

// Schemas for validation
const createGameWinnersSchema = z.object({
  gameId: z.string().uuid(),
  firstPlacePlayerId: z.string().uuid().optional(),
  secondPlacePlayerId: z.string().uuid().optional(), 
  thirdPlacePlayerId: z.string().uuid().optional(),
  firstPlaceTrophy: z.string().optional(),
  secondPlaceTrophy: z.string().optional(),
  thirdPlaceTrophy: z.string().optional(),
  firstPlacePoints: z.number().default(20),
  secondPlacePoints: z.number().default(15),
  thirdPlacePoints: z.number().default(10),
})

const updateGameWinnersSchema = z.object({
  id: z.string().uuid(),
  firstPlacePlayerId: z.string().uuid().optional(),
  secondPlacePlayerId: z.string().uuid().optional(),
  thirdPlacePlayerId: z.string().uuid().optional(),
  firstPlaceTrophy: z.string().optional(),
  secondPlaceTrophy: z.string().optional(),
  thirdPlaceTrophy: z.string().optional(),
  firstPlacePoints: z.number().optional(),
  secondPlacePoints: z.number().optional(),
  thirdPlacePoints: z.number().optional(),
})

// Create or update game winners
export const createGameWinnersController = async (req: Request, res: Response) => {
  try {
    const validatedData = createGameWinnersSchema.parse(req.body)
    const { gameId } = validatedData

    // Check if user has access to this game
    if(await userAccess('userGame', { id: gameId }, res) === null) return

    // Check if winners already exist for this game
    const existingWinners = await pool.query(
      'SELECT id FROM "GameWinners" WHERE "gameId" = $1',
      [gameId]
    )

    let result
    if (existingWinners.rows.length > 0) {
      // Update existing winners
      const winnersId = existingWinners.rows[0].id
      result = await pool.query(`
        UPDATE "GameWinners" 
        SET 
          "firstPlacePlayerId" = $2,
          "secondPlacePlayerId" = $3,
          "thirdPlacePlayerId" = $4,
          "firstPlaceTrophy" = $5,
          "secondPlaceTrophy" = $6,
          "thirdPlaceTrophy" = $7,
          "firstPlacePoints" = $8,
          "secondPlacePoints" = $9,
          "thirdPlacePoints" = $10,
          "updatedAt" = now()
        WHERE id = $1
        RETURNING *
      `, [
        winnersId,
        validatedData.firstPlacePlayerId,
        validatedData.secondPlacePlayerId,
        validatedData.thirdPlacePlayerId,
        validatedData.firstPlaceTrophy,
        validatedData.secondPlaceTrophy,
        validatedData.thirdPlaceTrophy,
        validatedData.firstPlacePoints,
        validatedData.secondPlacePoints,
        validatedData.thirdPlacePoints,
      ])
    } else {
      // Create new winners entry
      result = await pool.query(`
        INSERT INTO "GameWinners" (
          "gameId", "firstPlacePlayerId", "secondPlacePlayerId", "thirdPlacePlayerId",
          "firstPlaceTrophy", "secondPlaceTrophy", "thirdPlaceTrophy",
          "firstPlacePoints", "secondPlacePoints", "thirdPlacePoints"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        gameId,
        validatedData.firstPlacePlayerId,
        validatedData.secondPlacePlayerId,
        validatedData.thirdPlacePlayerId,
        validatedData.firstPlaceTrophy,
        validatedData.secondPlaceTrophy,
        validatedData.thirdPlaceTrophy,
        validatedData.firstPlacePoints,
        validatedData.secondPlacePoints,
        validatedData.thirdPlacePoints,
      ])
    }

    return res.status(201).json({
      message: 'Game winners saved successfully',
      result: result.rows[0]
    })

  } catch (error) {
    console.error('Error in createGameWinnersController:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}

// Get game winners
export const getGameWinnersController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string

    if (missingParams({ gameId }, res)) return

    // Check if user has access to this game
    if(await userAccess('userGame', { id: gameId }, res) === null) return

    const result = await pool.query(`
      SELECT 
        gw.*,
        fp.name as "firstPlacePlayerName",
        sp.name as "secondPlacePlayerName", 
        tp.name as "thirdPlacePlayerName"
      FROM "GameWinners" gw
      LEFT JOIN "GamePlayers" fp ON gw."firstPlacePlayerId" = fp.id
      LEFT JOIN "GamePlayers" sp ON gw."secondPlacePlayerId" = sp.id
      LEFT JOIN "GamePlayers" tp ON gw."thirdPlacePlayerId" = tp.id
      WHERE gw."gameId" = $1
    `, [gameId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No winners found for this game' })
    }

    return res.status(200).json({
      message: 'Game winners retrieved successfully',
      result: result.rows[0]
    })

  } catch (error) {
    console.error('Error in getGameWinnersController:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}

// Update game winners
export const updateGameWinnersController = async (req: Request, res: Response) => {
  try {
    const validatedData = updateGameWinnersSchema.parse(req.body)
    const { id } = validatedData

    // First get the gameId to check user access
    const winnersResult = await pool.query(
      'SELECT "gameId" FROM "GameWinners" WHERE id = $1',
      [id]
    )

    if (winnersResult.rows.length === 0) {
      return res.status(404).json({ message: 'Winners record not found' })
    }

    const gameId = winnersResult.rows[0].gameId

    // Check if user has access to this game
    if(await userAccess('userGame', { id: gameId }, res) === null) return

    // Build update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = [id]
    let paramIndex = 2

    Object.entries(validatedData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        updateFields.push(`"${key}" = $${paramIndex}`)
        updateValues.push(value)
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    updateFields.push('"updatedAt" = now()')

    const result = await pool.query(`
      UPDATE "GameWinners" 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `, updateValues)

    return res.status(200).json({
      message: 'Game winners updated successfully',
      result: result.rows[0]
    })

  } catch (error) {
    console.error('Error in updateGameWinnersController:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}

// Delete game winners
export const deleteGameWinnersController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string

    if (missingParams({ gameId }, res)) return

    // Check if user has access to this game
    if(await userAccess('userGame', { id: gameId }, res) === null) return

    const result = await pool.query(
      'DELETE FROM "GameWinners" WHERE "gameId" = $1 RETURNING *',
      [gameId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No winners found for this game' })
    }

    return res.status(200).json({
      message: 'Game winners deleted successfully'
    })

  } catch (error) {
    console.error('Error in deleteGameWinnersController:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}

// Get all game players for a specific game (for dropdown population)
export const getGamePlayersController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string

    if (missingParams({ gameId }, res)) return

    // Check if user has access to this game
    if(await userAccess('userGame', { id: gameId }, res) === null) return

    // Get all rooms for this game
    const roomsResult = await pool.query(
      'SELECT id FROM "GameRooms" WHERE "gameId" = $1',
      [gameId]
    )

    if (roomsResult.rows.length === 0) {
      return res.status(200).json({
        message: 'No players found - no game rooms exist yet',
        result: []
      })
    }

    const roomIds = roomsResult.rows.map(row => row.id)
    
    // Get all players from all rooms for this game
    const playersResult = await pool.query(`
      SELECT DISTINCT id, name, "imgUrl"
      FROM "GamePlayers" 
      WHERE "roomId" = ANY($1::uuid[])
      ORDER BY name
    `, [roomIds])

    return res.status(200).json({
      message: 'Game players retrieved successfully',
      result: playersResult.rows
    })

  } catch (error) {
    console.error('Error in getGamePlayersController:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}
