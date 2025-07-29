import { Router } from 'express'
import { liveKitController } from '../controllers/livekit/liveKit.controller'

export const liveKitRouter: Router = Router()

liveKitRouter.get('/get', liveKitController)
export default liveKitRouter
