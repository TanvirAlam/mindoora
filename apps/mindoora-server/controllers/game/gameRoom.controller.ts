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
      'SELECT * FROM "gameRooms" WHERE "gameId" = $1 AND "user" = $2 AND status IN ($3, $4) ORDER BY "createdAt" DESC LIMIT 1',
      [gameId, user, 'live', 'created']
    )
    let roomInfo = roomInfoResult.rows[0]

    const isGameRoomExpired = roomInfo ? isExpired(roomInfo.expiredAt) : true;

    // Get user info
    const userInfoResult = await pool.query(
      'SELECT * FROM "user" WHERE "registerId" = $1',
      [user]
    )
    const userInfo = userInfoResult.rows[0]

    if (isGameRoomExpired) {
      let inviteCode
      let duplicateInviteCode

      do {
        inviteCode = generateRandomCode()
        duplicateInviteCode = await findDuplicate('gameRooms', { inviteCode, status: {
          in: ['live', 'created']
      }  }, res)
      } while (duplicateInviteCode)

      const now = new Date();
      const expiredAt = new Date(now.setHours(now.getHours() + 1))

      // Create new game room
      const newRoomResult = await pool.query(
        'INSERT INTO "gameRooms" ("gameId", status, "inviteCode", "user", "expiredAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [gameId, 'created', inviteCode, user, expiredAt]
      )
      roomInfo = newRoomResult.rows[0]

      // Create game player (admin)
      await pool.query(
        'INSERT INTO "gamePlayers" ("roomId", name, "imgUrl", role, "isApproved") VALUES ($1, $2, $3, $4, $5)',
        [roomInfo.id, userInfo.name, userInfo.image, 'admin', true]
      )
    }

    // Get all players for this room
    const allPlayersResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
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
    return res.status(500).json(error)
  }
}

export const deleteGameRoomController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if(missingParams({id}, res))return;
    if(await userAccess('gameRooms', {id}, res) === null) return;

    await pool.query(
      'DELETE FROM "gameRooms" WHERE id = $1',
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

export const updateGameRoomStatusController = async (req: Request<{}, {}, updateGameRoomStatusType>, res: Response) => {
  try {

    const {
      id,
      status
    } = req.body
    updateGameRoomStatusSchema.parse(req.body)
    if(await userAccess('gameRooms', {id}, res) === null)return;

    const gameRoomResult = await pool.query(
      'UPDATE "gameRooms" SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    const gameRoom = gameRoomResult.rows[0]

    req.io.to(gameRoom.id).emit('game_status', {id: gameRoom.id, status: gameRoom.status})
    return res.status(201).json({ message: `Game Room Status Updated successfully`, result: {gameRoom} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
