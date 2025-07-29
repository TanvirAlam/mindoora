import { Router } from 'express'
import { createGameScoreController } from '../controllers/feedback.controller'

export const gameScoreRouter: Router = Router()

gameScoreRouter.post('/create', createGameScoreController)

export default gameScoreRouter
