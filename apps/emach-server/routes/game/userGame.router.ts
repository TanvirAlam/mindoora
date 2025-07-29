import { Router } from 'express'
import {
    createUserGameController,
    updateUserGameController,
    deleteUserGameController,
    getAllGameController,
    getAllPublicGameController,
    getOneGameController,
    getAllOfAGameController,
    getAllPublicGameV2Controller,
    getAllOwnGamesControllerV2
} from '../../controllers/game/game.controller';


export const gameRouter: Router = Router()

gameRouter.post('/create', createUserGameController)
gameRouter.put('/update', updateUserGameController)
gameRouter.delete('/delete', deleteUserGameController)
gameRouter.get('/all', getAllGameController)
gameRouter.get('/allv2', getAllOwnGamesControllerV2)
gameRouter.get('/allpublic', getAllPublicGameController)
gameRouter.get('/allpublicv2', getAllPublicGameV2Controller)
gameRouter.get('/one', getOneGameController)
gameRouter.get('/allofgame', getAllOfAGameController)

export default gameRouter
