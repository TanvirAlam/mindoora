import { Router } from 'express'
import { saveQuestionsInDbController } from '../controllers/questionsInDB.controller'

export const qInDbRouter: Router = Router()

qInDbRouter.post('/create', saveQuestionsInDbController)

export default qInDbRouter
