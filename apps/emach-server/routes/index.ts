import { NextFunction, Request, Response, Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { loggingMiddleware } from '../middleware/logging.middleware';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';
import gameRouter from './game/userGame.router';
import gameDetailsRouter from './game/gameDetails.router';
import questionRouter from './game/question.router';
import { rootRouter } from './root.router';
import imageRouter from './image.router';
import getImageRouter from './getImage.router';
import gameRoomRouter from './game/gameRoom.router';
import gamePlayerProtectedRouter from './game/gamePlayerProtected.router';
import gamePlayerOpenRouter from './game/gamePlayerOpen.router';
import questionSolvedRouter from './game/questionSolved.router';
import subscriptionRouter from './subscription.router';
import liveKitRouter from './livekit.router';
import feedbackRouter from './feedback.router';
import friendsRouter from './friends.router';
import gameScoreRouter from './gameScore.router';
import qInDbRouter from './qInDb.router';
import notificationRouter from './notification.router';
import gameOpenRouter from './game/userGameOpen.router';
import followersRouter from './follow.router';
import acceptTCRouter from './acceptTC.router';
import gameExpRouter from './gameExperience.router';
import deleteAccountRouter from './deleteAccount.router'

export const router: Router = Router()

// Open routes
router.use(rootRouter)
router.use('/api/v1/auth', authRouter)
router.use('/api/v1/getimage', getImageRouter)
router.use('/api/v1/ogameplayer', gamePlayerOpenRouter)
router.use('/api/v1/questionsolved', questionSolvedRouter)
router.use('/api/v1/subscription', subscriptionRouter)
router.use('/api/v1/livekit', liveKitRouter)
router.use('/api/v1/gamescore', gameScoreRouter)
router.use('/api/v1/ousergame', gameOpenRouter)

router.use((req: Request, res: Response, next: NextFunction) => {
  authenticateJWT(req, res, next)
})

// Made protected routes
router.use('/api/v1/usergame', gameRouter)
router.use('/api/v1/question', questionRouter)
router.use('/api/v1/gamedetails', gameDetailsRouter)
router.use('/api/v1/image', imageRouter)
router.use('/api/v1/gameroom', gameRoomRouter)
router.use('/api/v1/pgameplayer', gamePlayerProtectedRouter)
router.use('/api/v1/feedback', feedbackRouter)
router.use('/api/v1/friend', friendsRouter)
router.use('/api/v1/qindb', qInDbRouter)
router.use('/api/v1/user', userRouter)
router.use('/api/v1/notification', notificationRouter)
router.use('/api/v1/follow', followersRouter)
router.use('/api/v1/accepttc', acceptTCRouter)
router.use('/api/v1/gameexp', gameExpRouter)
router.use('/api/v1/account', deleteAccountRouter)
