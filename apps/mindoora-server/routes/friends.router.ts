import { Router } from 'express'
import * as FC from './../controllers/friends.controller'

export const friendsRouter: Router = Router()

friendsRouter.post('/send', FC.sendRequestController)
friendsRouter.delete('/delete', FC.deleteFriendController)
friendsRouter.put('/accept', FC.acceptRequestController)
friendsRouter.put('/reject', FC.rejectRequestController)
friendsRouter.get('/status', FC.friendStatusController)
friendsRouter.get('/all', FC.friendListController)
friendsRouter.get('/allmutual', FC.mutualFriendController)
friendsRouter.get('/allpendingtome', FC.pendingRequestsToUserController)
friendsRouter.get('/allpendingtofriend', FC.pendingRequestsToFriendController)

export default friendsRouter
