import { Router } from 'express'
import {
    imageUploadController
} from '../controllers/image/imageUpload.controller';
import { upload } from '../controllers/tools';

import { imageProvideController } from '../controllers/image/imageProvide.controller';

export const imageRouter: Router = Router()

imageRouter.post('/upload', upload.single('image'), imageUploadController)
imageRouter.get('/:filename', imageProvideController)

export default imageRouter
