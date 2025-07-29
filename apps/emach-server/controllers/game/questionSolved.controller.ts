import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { createQuestionSolveSchema, createQuestionSolveType } from '../../schema/game/questionSolve.schema'
import {calculatePoint, findDuplicate, isExpired, missingParams} from '../tools'

export const createQuestionSolveController = async (req: Request<{}, {}, createQuestionSolveType>, res: Response) => {
  try {
    const {
      playerId,
      questionId,
      answer,
      timeTaken
    } = req.body
    createQuestionSolveSchema.parse(req.body)

    const gamePlayer = await prisma.gameRooms.findFirst({
      where: {
        gamePlayers: {
          some: {
            id: playerId,
            isApproved: true
          }
        },
        status: 'live'
      }
    })

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    if(await findDuplicate('questionsSolved', { playerId, questionId }, res))return;

    let isRight = false;

    const question = await prisma.questions.findUnique({
      where: { id: questionId }
    })

    if(timeTaken === 0){
      return res.status(404).json({message: 'Too Quick Answer'})
    }

    if(timeTaken > question.timeLimit){
      return res.status(404).json({message: 'Time Limit Exceeds'})
    }

    if(question.answer === +answer){
      isRight = true
    }

    let pointAchieved = 0
    if(isRight){
      pointAchieved = calculatePoint(question.timeLimit, timeTaken)
    }

      await prisma.questionsSolved.create({
        data: {
          playerId,
          questionId,
          answer,
          rightAnswer: question.answer.toString(),
          isRight,
          timeLimit: question.timeLimit,
          timeTaken,
          point: pointAchieved
        }
      })


      const players = await prisma.gamePlayers.findMany({
        where: { roomId: gamePlayer.id  }
      });

      let result = [];

      for (const player of players) {
        const questionSolved = await prisma.questionsSolved.findMany({
          where: { playerId: player.id }
        });

        const nQuestionSolved = questionSolved.length;
        const rightAnswered = questionSolved.filter((e) => e.isRight === true).length;
        const points = questionSolved.reduce((sum, q) => sum + q.point, 0);

        result.push({
          playerName: player.name,
          nQuestionSolved,
          rightAnswered,
          points
        });
      }

      const gameRoom = await prisma.gameRooms.findUnique({
        where: {
          id: gamePlayer.id
        },
        select: {
          gamePlayers: {
            select: {
              qSolved: {
                where: {
                  questionId: questionId
                },
                select: {
                  playerId: true
                }
              }
            }
          }
        }
      })

      const solvedQuestionIds = gameRoom.gamePlayers
      .map((player) => player.qSolved.map((question) => question.playerId))
      .flat();

      req.io.to(gamePlayer.id).emit('result_response', result)
      req.io.to(gamePlayer.id).emit('q_solve_response', {questionId, playerId: solvedQuestionIds})

      return res.status(201).json({ message: 'Question Solve Saved successfully', result: {isRight} })

  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllQuestionSolvedController = async (req: Request, res: Response) => {
  try {
    let playerId = req.query?.playerId as string;
    if(missingParams({playerId}, res))return;

    const gamePlayer = await prisma.gameRooms.findFirst({
      where: {
        gamePlayers: {
          some: {
            id: playerId,
            isApproved: true
          }
        },
        status: {
          not: 'closed'
        }
      }
    })

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    const allSolvedQuestions = await prisma.questionsSolved.findMany({
      where: {playerId}
    })

    return res.status(201).json({ message: 'Got all solved question successfully', result: {allSolvedQuestions} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllQuestionRawV2Controller = async (req: Request, res: Response) => {
  try {
    let playerId = req.query?.playerId as string;
    if(missingParams({playerId}, res))return;

    const gamePlayer = await prisma.gameRooms.findFirst({
      where: {
        gamePlayers: {
          some: {
            id: playerId,
            isApproved: true
          }
        },
        status: {
          in: ['live', 'finished']
        }
      }
    })

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    const allQuestionsRaw = await prisma.questions.findMany({
      where: {gameId: gamePlayer.gameId}
    })

    const allSolvedQuestions = await prisma.questionsSolved.findMany({
      where: {playerId}
    })

    const allSolvedQuestionsId = allSolvedQuestions.map((q)=> q.questionId);
    const allQuestions = allQuestionsRaw.map((question) => {
      const { answer, ...restOfQuestion } = question;
      return {
        ...question,
        isAnswered: allSolvedQuestionsId.includes(question.id),
        answered: +allSolvedQuestions.filter((q)=> q.questionId === question.id)[0]?.answer || null
      }
    });

    return res.status(201).json({ message: 'Got all Raw Questions successfully', result: {allQuestions} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
