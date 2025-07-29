import { Router } from 'express'
import {
    deleteGamePlayerController,
    getAllPlayersOfARoomController,
    updateGamePlayerStatusController,
    updateConfirmAllGamePlayerController
} from '../../controllers/game/gamePlayerProtected.controller';


export const gamePlayerProtectedRouter: Router = Router()

gamePlayerProtectedRouter.delete('/delete', deleteGamePlayerController)
gamePlayerProtectedRouter.get('/allplayer', getAllPlayersOfARoomController)
gamePlayerProtectedRouter.put('/update', updateGamePlayerStatusController)
gamePlayerProtectedRouter.put('/confirmall', updateConfirmAllGamePlayerController)

export default gamePlayerProtectedRouter
