import { Router } from 'express'
import { imageProvideController } from '../controllers/image/imageProvide.controller';

export const getImageRouter: Router = Router()

getImageRouter.get('/:filename', imageProvideController)

export default getImageRouter
