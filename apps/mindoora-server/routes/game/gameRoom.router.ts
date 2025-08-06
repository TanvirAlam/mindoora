import { Router } from 'express'
import {
    createGameRoomController,
    deleteGameRoomController,
    getOneGameRoomController,
    updateGameRoomStatusController,
    getAllGameRoomByStatusController,
    startGameController
} from '../../controllers/game/gameRoom.controller';


export const gameRoomRouter: Router = Router()

gameRoomRouter.post('/create', createGameRoomController)
gameRoomRouter.post('/start', startGameController)
gameRoomRouter.delete('/delete', deleteGameRoomController)
gameRoomRouter.put('/update', updateGameRoomStatusController)
gameRoomRouter.get('/one', getOneGameRoomController)
gameRoomRouter.get('/allbystatus', getAllGameRoomByStatusController)


export default gameRoomRouter
