import { Router } from 'express'
import * as FC from '../controllers/user/follow.controller'

export const followRouter: Router = Router()

followRouter.post('/create', FC.followUserController)
followRouter.delete('/delete', FC.unfollowUserController)
followRouter.get('/isfollowing', FC.isFollowing)

export default followRouter
