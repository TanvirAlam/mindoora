import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createGameRoomSchema, createGameRoomType, updateGameRoomStatusSchema, updateGameRoomStatusType } from '../../db/schemas/game/gameRooms.schema'
import { findDuplicate, isExpired, missingParams, userAccess } from '../tools'
import { generateRandomCode } from '../../utils/game/gameRoom'

export const createGameRoomController = async (req: Request<{}, {}, createGameRoomType>, res: Response) => {
  try {
    const { gameId } = req.body
    createGameRoomSchema.parse(req.body)
    const user = res.locals.user.id

    // Find existing room for this user and game
    const roomInfoResult = await pool.query(
      'SELECT * FROM "GameRooms" WHERE "gameId" = $1 AND "user" = $2 AND status IN ($3, $4) ORDER BY "createdAt" DESC LIMIT 1',
      [gameId, user, 'created', 'live']
    )
    let roomInfo = roomInfoResult.rows[0]

    const isGameRoomExpired = roomInfo ? isExpired(roomInfo.expiredAt) : true;

    // Get user info
    const userInfoResult = await pool.query(
      'SELECT * FROM "User" WHERE "registerId" = $1',
      [user]
    )
    const userInfo = userInfoResult.rows[0]

    if (isGameRoomExpired) {
      let inviteCode
      let duplicateInviteCode

      do {
        inviteCode = generateRandomCode()
        
        // Check for duplicate invite code in active game rooms
        const duplicateResult = await pool.query(
          'SELECT * FROM "GameRooms" WHERE "inviteCode" = $1 AND status IN ($2, $3) LIMIT 1',
          [inviteCode, 'live', 'created']
        )
        duplicateInviteCode = duplicateResult.rows.length > 0
      } while (duplicateInviteCode)

      const now = new Date();
      const expiredAt = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes from now

      // Create new game room
      const newRoomResult = await pool.query(
        'INSERT INTO "GameRooms" ("gameId", status, "inviteCode", "user", "expiredAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [gameId, 'created', inviteCode, user, expiredAt]
      )
      roomInfo = newRoomResult.rows[0]

      // Create game player (admin)
      await pool.query(
        'INSERT INTO "GamePlayers" ("roomId", name, "imgUrl", role, "isApproved") VALUES ($1, $2, $3, $4, $5)',
        [roomInfo.id, userInfo.name, userInfo.image, 'admin', true]
      )
    }

    // Get all players for this room
    const allPlayersResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1',
      [roomInfo.id]
    )
    const allPlayers = allPlayersResult.rows

    req.io.to(roomInfo.id).emit('players_response', allPlayers)
    return res
      .status(201)
      .json({
        message: 'Game Room Created successfully',
        roomId: roomInfo.id,
        inviteCode: roomInfo.inviteCode,
        name: userInfo.name,
        allPlayers
      })
  } catch (error) {
    console.error('Error creating game room:', error)
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteGameRoomController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if(missingParams({id}, res))return;
    if(await userAccess('gameRooms', {id}, res) === null) return;

    await pool.query(
      'DELETE FROM "GameRooms" WHERE id = $1',
      [id]
    )
    return res.status(204).json({ message: 'Game Room deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllGameRoomByStatusController = async (req: Request, res: Response) => {
  try {
    const validStatuses: ('live' | 'finished' | 'closed' | 'created')[] = ['live', 'finished', 'closed', 'created'];
    const status: 'live' | 'finished' | 'closed' | undefined = validStatuses.includes(req.query.status as 'live' | 'finished' | 'closed') ? req.query.status as 'live' | 'finished' | 'closed' : undefined;

    if(missingParams({status}, res))return;

    const gameRoom = await userAccess('gameRooms', {status}, res);
    if(gameRoom === null)return;
    const gameRooms = Array.isArray(gameRoom)? gameRoom: [gameRoom]

    return res.status(201).json({ message: `Got All ${status} Game Room successfully`, result: {gameRooms: gameRooms} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getOneGameRoomController = async (req: Request, res: Response) => {
  try {
    let id = req.query?.id as string;
    if(missingParams({id}, res))return;

    const oneGameRoom = await userAccess('gameRooms', {id}, res);
    if(oneGameRoom === null)return;

    return res.status(201).json({ message: 'Got One Game Room successfully', result: {gameRoom: oneGameRoom} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const startGameController = async (req: Request, res: Response) => {
  try {
    const roomId = req.body.roomId as string
    if(missingParams({roomId}, res))return;
    
    // Check if user has access to this room (is the admin)
    const roomAccessResult = await pool.query(
      'SELECT gr.*, gp.role FROM "GameRooms" gr JOIN "GamePlayers" gp ON gr.id = gp."roomId" WHERE gr.id = $1 AND gp.role = $2 AND gr."user" = $3',
      [roomId, 'admin', res.locals.user.id]
    )
    
    if(roomAccessResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied. Only room admin can start the game.' })
    }
    
    const room = roomAccessResult.rows[0]
    
    // Check if room is in a valid state to be started
    if (room.status !== 'created' && room.status !== 'live') {
      return res.status(400).json({ message: 'Game can only be started from created or live status.' });
    }

    // Check if room has expired
    if (isExpired(room.expiredAt)) {
      return res.status(400).json({ message: 'Game room has expired.' });
    }

    // Check if there are at least 2 approved players
    const approvedPlayersResult = await pool.query(
      'SELECT COUNT(*) FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
      [roomId]
    );
    const approvedPlayersCount = parseInt(approvedPlayersResult.rows[0].count);
    
    if (approvedPlayersCount < 2) {
      return res.status(400).json({ message: 'At least 2 players are required to start the game.' });
    }

    // Update room status to 'started'
    const gameRoomResult = await pool.query(
      'UPDATE "GameRooms" SET status = $1 WHERE id = $2 RETURNING *',
      ['started', roomId]
    );
    const gameRoom = gameRoomResult.rows[0]

    req.io.to(gameRoom.id).emit('game_started', {id: gameRoom.id, status: gameRoom.status})
    return res.status(200).json({ message: 'Game started successfully', result: {gameRoom} })
  } catch (error) {
    console.error('Error starting game:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const updateGameRoomStatusController = async (req: Request<{}, {}, updateGameRoomStatusType>, res: Response) => {
  try {

    const {
      id,
      status
    } = req.body
    updateGameRoomStatusSchema.parse(req.body)
    if(await userAccess('gameRooms', {id}, res) === null)return;

    const gameRoomResult = await pool.query(
      'UPDATE "GameRooms" SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    const gameRoom = gameRoomResult.rows[0]

    req.io.to(gameRoom.id).emit('game_status', {id: gameRoom.id, status: gameRoom.status})
    return res.status(201).json({ message: `Game Room Status Updated successfully`, result: {gameRoom} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
