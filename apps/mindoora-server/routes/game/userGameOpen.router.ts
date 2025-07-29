import { Router } from 'express'
import {
    getOnePublicGameController
} from '../../controllers/game/gameOpen.controller';


export const gameOpenRouter: Router = Router()

gameOpenRouter.get('/one', getOnePublicGameController)

export default gameOpenRouter
