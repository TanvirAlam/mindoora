import { Router } from 'express'
import {
    createQuestionSolveController,
    getAllQuestionSolvedController,
    getAllQuestionRawV2Controller
} from '../../controllers/game/questionSolved.controller';


export const questionSolvedRouter: Router = Router()

questionSolvedRouter.post('/create', createQuestionSolveController)
questionSolvedRouter.get('/allrawv2', getAllQuestionRawV2Controller)
questionSolvedRouter.get('/allsolved', getAllQuestionSolvedController)

export default questionSolvedRouter
