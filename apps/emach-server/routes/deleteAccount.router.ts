import { Router } from 'express'
import { deleteAccountController } from '../controllers/auth/register.controller'

export const deleteAccountRouter: Router = Router();

deleteAccountRouter.delete('/delete', deleteAccountController);

export default deleteAccountRouter
