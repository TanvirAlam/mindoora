import { Router } from 'express'
import { getTopAuthorsController, searchAuthorsController, getOneUserController } from '../controllers/user/getAllusers.controller'
import { getUserProfileController, updateUserProfileController, updateUserAvatarController } from '../controllers/user/profile.controller'

export const userRouter: Router = Router();

userRouter.get('/getTopAuthors', getTopAuthorsController)
userRouter.get('/getSearchedAuthors', searchAuthorsController)
userRouter.get('/getOne', getOneUserController)

// Profile endpoints
userRouter.get('/profile', getUserProfileController)
userRouter.put('/profile', updateUserProfileController)
userRouter.put('/profile/avatar', updateUserAvatarController)

export default userRouter
