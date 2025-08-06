import { Router } from 'express'
import {
    createGamePlayerController,
    getAllPlayersOfARoomController,
    getResultOfARoomController,
    getPlayersByInviteCodeController,
    getGameProgressController
} from '../../controllers/game/gamePlayerOpen.controller';


export const gamePlayerOpenRouter: Router = Router()

gamePlayerOpenRouter.post('/create', createGamePlayerController)
gamePlayerOpenRouter.get('/allplayer', getAllPlayersOfARoomController)
gamePlayerOpenRouter.get('/players-by-code', getPlayersByInviteCodeController)
gamePlayerOpenRouter.get('/result', getResultOfARoomController)
gamePlayerOpenRouter.get('/progress', getGameProgressController)

export default gamePlayerOpenRouter
