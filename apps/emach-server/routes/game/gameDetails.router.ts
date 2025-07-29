import { Router } from 'express'
import {
    createGameDetailsController,
    updateGameDetailsController,
    deleteGameDetailsController,
    getOneGameDetailsController
} from '../../controllers/game/gameDetails.controller';

export const gameDetailsRouter: Router = Router()

gameDetailsRouter.post('/create', createGameDetailsController)
gameDetailsRouter.put('/update', updateGameDetailsController)
gameDetailsRouter.delete('/delete', deleteGameDetailsController)
gameDetailsRouter.get('/one', getOneGameDetailsController)

export default gameDetailsRouter
