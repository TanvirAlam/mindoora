import { Router } from 'express'
import { getTopAuthorsController, searchAuthorsController, getOneUserController } from '../controllers/user/getAllusers.controller'

export const userRouter: Router = Router();

userRouter.get('/getTopAuthors', getTopAuthorsController)
userRouter.get('/getSearchedAuthors', searchAuthorsController)
userRouter.get('/getOne', getOneUserController)
export default userRouter
