import { Router } from 'express'
import {createFeedbackController} from './../controllers/feedback.controller'

export const feedbackRouter: Router = Router()

feedbackRouter.post('/create', createFeedbackController)

export default feedbackRouter
