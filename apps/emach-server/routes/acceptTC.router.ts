import { Router } from 'express'
import { saveAcceptTCController, getAcceptTCController } from '../controllers/acceptTC.controller';

export const acceptTCRouter: Router = Router()

acceptTCRouter.post('/save', saveAcceptTCController)
acceptTCRouter.get('/get', getAcceptTCController)

export default acceptTCRouter
