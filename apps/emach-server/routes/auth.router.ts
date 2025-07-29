import { Router } from 'express'
import { registerController } from '../controllers/auth/register.controller'
import { loginController } from '../controllers/auth/login.controller'
import verifyController from "../controllers/auth/verify.controller";
import { 
  oauthLoginController, 
  getOAuthProvidersController, 
  oauthLogoutController,
  unlinkOAuthProviderController 
} from '../controllers/auth/oauth.controller'
import { 
  getLoginHistoryController, 
  getAllLoginHistoryController, 
  getLoginStatisticsController 
} from '../controllers/auth/loginHistory.controller'
import { authenticateJWT } from '../middleware/auth.middleware'

export const authRouter: Router = Router();

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.post('/verify', verifyController)

authRouter.post('/oauth/login', oauthLoginController)
authRouter.get('/oauth/providers', authenticateJWT, getOAuthProvidersController)
authRouter.post('/oauth/logout', oauthLogoutController)
authRouter.delete('/oauth/providers/:provider', authenticateJWT, unlinkOAuthProviderController)

// Login history routes
authRouter.get('/login-history', authenticateJWT, getLoginHistoryController)
authRouter.get('/login-history/all', authenticateJWT, getAllLoginHistoryController)
authRouter.get('/login-statistics', authenticateJWT, getLoginStatisticsController)

export default authRouter
