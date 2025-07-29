import { Router } from 'express'
import { saveGameExperienceController } from '../controllers/gameExperience.controller';

export const gameExpRouter: Router = Router()

gameExpRouter.post('/save', saveGameExperienceController)

export default gameExpRouter
