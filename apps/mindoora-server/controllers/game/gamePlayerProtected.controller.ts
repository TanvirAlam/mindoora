import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { missingParams, userAccess } from '../tools';
import { updateGamePlayerStatusType, updateGamePlayerStatusSchema, updateConfirmAllGamePlayerType, updateConfirmAllGamePlayerSchema } from '../../schema/game/gamePlayers.schema';

export const deleteGamePlayerController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if (missingParams({ id }, res)) return;
    if (await userAccess('gameRooms', {
      gamePlayers: { some: { id } }, status: {
        in: ['live', 'created']
      }
    }, res) === null) return;

    await pool.query(
      'DELETE FROM "gamePlayers" WHERE id = $1',
      [id]
    )
    return res.status(204).json({ message: 'Game Player deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPlayersOfARoomController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    if (missingParams({ roomId }, res)) return;
    if (await userAccess('gameRooms', { id: roomId }, res) === null) return;

    const allPlayersResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
      [roomId]
    )
    const allPlayers = allPlayersResult.rows

    return res.status(201).json({ message: 'Got all Players successfully', result: { allPlayers } })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateGamePlayerStatusController = async (
  req: Request<{}, {}, updateGamePlayerStatusType>,
  res: Response
) => {
  try {
    const { id, isApproved } = req.body
    updateGamePlayerStatusSchema.parse(req.body)
    if (await userAccess('gameRooms', {
      gamePlayers: { some: { id } }, status: {
        in: ['live', 'created']
      }
    }, res) === null) return;

    const updatedPlayerResult = await pool.query(
      'UPDATE "gamePlayers" SET "isApproved" = $1 WHERE id = $2 RETURNING *',
      [isApproved, id]
    )
    const updatedPlayer = updatedPlayerResult.rows[0]

    const allPlayerResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
      [updatedPlayer.roomId]
    )
    const allPlayer = allPlayerResult.rows

    const roomStatusResult = await pool.query(
      'SELECT * FROM "gameRooms" WHERE id = $1',
      [updatedPlayer.roomId]
    )
    const roomStatus = roomStatusResult.rows[0]

    req.io.to(roomStatus.id).emit('players_response', allPlayer)
    req.io.to(roomStatus.id).emit('game_status', { id: roomStatus.id, status: roomStatus.status })

    return res.status(201).json({ message: 'Game player Status updated successfully.', updatedPlayer })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateConfirmAllGamePlayerController = async (
  req: Request<{}, {}, updateConfirmAllGamePlayerType>,
  res: Response
) => {
  try {
    const currentDate = new Date();
    const { roomId } = req.body
    updateConfirmAllGamePlayerSchema.parse(req.body)

    if (await userAccess('gameRooms', {id: roomId, status: {
      in: ['created', 'live']
    }, expiredAt: {
      gt: currentDate
    } }, res) === null) return;

    await pool.query(
      'UPDATE "gamePlayers" SET "isApproved" = true WHERE "roomId" = $1',
      [roomId]
    )

    const allPlayerResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
      [roomId]
    )
    const allPlayer = allPlayerResult.rows

    req.io.to(roomId).emit('players_response', allPlayer)

    return res.status(201).json({ message: 'Game player Status updated successfully.', allPlayer })
  } catch (error) {
    return res.status(500).json(error)
  }
}
