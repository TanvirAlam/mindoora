import { Router } from 'express'
import {
    createGameRoomController,
    deleteGameRoomController,
    getOneGameRoomController,
    updateGameRoomStatusController,
    getAllGameRoomByStatusController
} from '../../controllers/game/gameRoom.controller';


export const gameRoomRouter: Router = Router()

gameRoomRouter.post('/create', createGameRoomController)
gameRoomRouter.delete('/delete', deleteGameRoomController)
gameRoomRouter.put('/update', updateGameRoomStatusController)
gameRoomRouter.get('/one', getOneGameRoomController)
gameRoomRouter.get('/allbystatus', getAllGameRoomByStatusController)


export default gameRoomRouter
