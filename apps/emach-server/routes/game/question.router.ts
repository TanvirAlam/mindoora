import { Router } from 'express'
import {
    createQuestionController,
    updateQuestionController,
    deleteQuestionController,
    getAllQuestionController,
    getOneQuestionController
} from '../../controllers/game/question.controller';


export const questionRouter: Router = Router()

questionRouter.post('/create', createQuestionController)
questionRouter.put('/update', updateQuestionController)
questionRouter.delete('/delete', deleteQuestionController)
questionRouter.get('/all', getAllQuestionController)
questionRouter.get('/one', getOneQuestionController)
export default questionRouter
