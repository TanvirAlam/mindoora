import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { createTransporter } from '../../utils/nodemailer/nodemailerConfiguration';
import { invitationEmailData } from '../../utils/nodemailer/invitationEmailData';
import { sendMailgunEmail, validateMailgunConfig } from '../../utils/nodemailer/mailgunConfiguration';
import { db } from '../../db/connection';
import { UserGame, Register, User } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for invitation request
const sendInvitationSchema = z.object({
  gameId: z.string().uuid('Invalid game ID format'),
  recipientEmail: z.string().email('Invalid email format'),
gameCode: z.string().min(4, 'Game code must be at least 4 digits').max(4, 'Game code must be exactly 4 digits')
});

export const sendGameInvitation = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = sendInvitationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors
      });
    }

    const { gameId, recipientEmail, gameCode } = validationResult.data;
    const user = res.locals.user;
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Fetch game details and verify ownership
    const game = await db
      .select({
        id: UserGame.id,
        title: UserGame.title,
        userId: UserGame.user
      })
      .from(UserGame)
      .where(eq(UserGame.id, gameId))
      .limit(1);

    if (game.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game[0].userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send invitations for this game'
      });
    }

    // Fetch sender's name
const sender = await db
      .select({
        name: User.name,
        email: Register.email
      })
      .from(User)
      .innerJoin(Register, eq(User.registerId, Register.id))
      .where(eq(User.registerId, userId))
      .limit(1);

    if (sender.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    const senderName = sender[0].name || 'A Mindoora Player';
    const gameTitle = game[0].title;

    // Generate email content
    const mailData = invitationEmailData(
      recipientEmail,
      gameTitle,
      gameCode,
      senderName
    );

// Send email using Mailgun
    const mailResult = await sendMailgunEmail(
      recipientEmail,
      `Invitation to join "${gameTitle}" game`,
      mailData.html,
      mailData.text
    );

    console.log(`✅ Invitation email sent successfully via Mailgun to ${recipientEmail} for game "${gameTitle}" with code ${gameCode}`);

    return res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        recipientEmail,
        gameTitle,
        gameCode,
        senderName
      }
    });

  } catch (error) {
    console.error('❌ Error sending invitation email:', error);
    
    // Handle specific nodemailer errors
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Email service authentication failed'
      });
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        message: 'Email service is temporarily unavailable'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to send invitation email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional endpoint to validate email addresses (optional)
export const validateEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email validation using zod
    const emailSchema = z.string().email();
    const isValid = emailSchema.safeParse(email).success;

    return res.status(200).json({
      success: true,
      isValid,
      email
    });

  } catch (error) {
    console.error('Error validating email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate email'
    });
  }
};
