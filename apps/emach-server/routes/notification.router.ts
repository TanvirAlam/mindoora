import { Router } from 'express'
import { getAllNotificationsController } from './../controllers/notifications.controller'

export const notificationRouter: Router = Router()

notificationRouter.get('/all', getAllNotificationsController)

export default notificationRouter
