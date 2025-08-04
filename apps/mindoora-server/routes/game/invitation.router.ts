import { Router } from 'express';
import { sendGameInvitation, validateEmail } from '../../controllers/game/invitation.controller';

const invitationRouter = Router();

// POST /api/invitations/send - Send game invitation email
invitationRouter.post('/send', sendGameInvitation);

// POST /api/invitations/validate-email - Validate email address (optional)
invitationRouter.post('/validate-email', validateEmail);

export default invitationRouter;
