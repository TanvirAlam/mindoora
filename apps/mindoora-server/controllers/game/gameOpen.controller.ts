import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { missingParams } from '../tools'


export const getOnePublicGameController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;

    if(missingParams({id}, res)) return;


    const { rows: gameRows } = await pool.query(
      'SELECT * FROM userGame WHERE id = $1',
      [id]
    );
    const oneGame = gameRows[0];

    if(oneGame === null) return res.status(400).json({ message: 'Not Found Game'});


    const { rows: creatorRows } = await pool.query(
      'SELECT id, name, image FROM "user" WHERE registerId = $1',
      [oneGame?.user]
    );
    const gameCreator = creatorRows[0];


    const { rows: detailsRows } = await pool.query(
      'SELECT imgUrl, description, category, theme, keyWords FROM userGameDetails WHERE gameId = $1',
      [oneGame?.id]
    );
    const gameDetails = detailsRows[0];

    const { rows: questionCountRows } = await pool.query(
      'SELECT COUNT(*) as count FROM questions WHERE gameId = $1',
      [oneGame?.id]
    );
    const nQuestions = parseInt(questionCountRows[0].count);

    const { rows: gameScores } = await pool.query(
      'SELECT score FROM userGameScore WHERE gameId = $1',
      [oneGame?.id]
    );

    const averageScore = gameScores.length > 0 ? gameScores.reduce((acc, gs)=> acc + gs.score, 0)/gameScores.length : 0;

    const { rows: gameRooms } = await pool.query(
      'SELECT gr.*, COUNT(gp.id) as player_count FROM gameRooms gr LEFT JOIN gamePlayers gp ON gr.id = gp.gameRoomId WHERE gr.gameId = $1 GROUP BY gr.id',
      [oneGame?.id]
    );

    const nGameRooms = gameRooms.length

    const totalPlayers = gameRooms.reduce((acc: number, gr: any) => acc + parseInt(gr.player_count), 0);


    const gameAllDetails = {
      ...oneGame,
      ...gameDetails,
      userId: gameCreator?.id,
      name: gameCreator?.name,
      image: gameCreator?.image,
      nQuestions,
      nGameRooms,
      averageScore,
      totalPlayers,
      registerId: oneGame?.user
    }

    delete gameAllDetails.createdAt;



    return res.status(201).json({ message: 'Got One Game successfully', result: {...gameAllDetails} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
