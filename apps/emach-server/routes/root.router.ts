import { Router } from 'express'
import { rootController } from '../controllers/root.controller'

export const rootRouter: Router = Router()
rootRouter.get('/', rootController)
