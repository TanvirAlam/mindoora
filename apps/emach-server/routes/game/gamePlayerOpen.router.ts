import { Router } from 'express'
import {
    createGamePlayerController,
    getAllPlayersOfARoomController,
    getResultOfARoomController
} from '../../controllers/game/gamePlayerOpen.controller';


export const gamePlayerOpenRouter: Router = Router()

gamePlayerOpenRouter.post('/create', createGamePlayerController)
gamePlayerOpenRouter.get('/allplayer', getAllPlayersOfARoomController)
gamePlayerOpenRouter.get('/result', getResultOfARoomController)

export default gamePlayerOpenRouter
