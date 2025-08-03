import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { missingParams } from '../tools'

// Type definitions for profile data
interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  socialMedia: {
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  trophies: unknown[];
  totalScore: number;
  verified: boolean;
  memberSince: Date | null;
}

interface UpdateProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  socialMedia: {
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  verified: boolean;
}

// Get user profile (includes Register and User data)
export const getUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id // This is Register.id from auth middleware

    // Get complete user profile information
    const profileResult = await pool.query(`
      SELECT 
        r.id as register_id,
        r.email,
        r.phone,
        r.verified,
        r."createdAt" as registered_at,
        u.id as user_id,
        u.name,
        u.image,
        u.bio,
        u.location,
        u.website,
        u.twitter,
        u.instagram,
        u.linkedin
      FROM "Register" r
      LEFT JOIN "User" u ON r.id = u."registerId"
      WHERE r.id = $1
      LIMIT 1
    `, [userId]);

    const profile = profileResult.rows[0];

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get user's trophies count
    const trophiesResult = await pool.query(`
      SELECT COUNT(*) as trophy_count
      FROM "UserTrophies" 
      WHERE "userId" = $1
    `, [userId]);

    const trophyCount = parseInt(trophiesResult.rows[0].trophy_count) || 0;

    // Get total game score (sum of all game scores)
    const scoresResult = await pool.query(`
      SELECT COALESCE(SUM(ugs.score), 0) as total_score
      FROM "userGameScore" ugs
      JOIN "GamePlayers" gp ON ugs."playerId" = gp.id
      JOIN "GameRooms" gr ON gp."roomId" = gr.id
      WHERE gr."user" = $1
    `, [userId]);

    const totalScore = parseInt(scoresResult.rows[0].total_score) || 0;

    // Transform the result to match expected mobile app format
    const profileData: ProfileData = {
      id: profile.register_id,
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      avatar: profile.image || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      socialMedia: {
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        linkedin: profile.linkedin || ''
      },
      trophies: [] as unknown[], // We'll populate this separately if needed
      totalScore: totalScore,
      verified: profile.verified || false,
      memberSince: profile.registered_at
    };

    res.setHeader('Cache-Control', 'public, s-maxage=3600'); // Cache for 1 hour
    return res.status(200).json({
      message: 'Profile retrieved successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Failed to fetch profile data' });
  }
}

// Update user profile
export const updateUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id // This is Register.id from auth middleware
    const {
      name,
      bio,
      location,
      website,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Sanitize social media URLs (remove @ if present)
    const sanitizedTwitter = twitter ? twitter.replace('@', '') : '';
    const sanitizedInstagram = instagram ? instagram.replace('@', '') : '';
    
    // Update User table with profile information
    const updateResult = await pool.query(`
      UPDATE "User" 
      SET 
        name = $1,
        bio = $2,
        location = $3,
        website = $4,
        twitter = $5,
        instagram = $6,
        linkedin = $7
      WHERE "registerId" = $8
      RETURNING id, name, bio, location, website, twitter, instagram, linkedin
    `, [
      name.trim(),
      bio?.trim() || null,
      location?.trim() || null,
      website?.trim() || null,
      sanitizedTwitter.trim() || null,
      sanitizedInstagram.trim() || null,
      linkedin?.trim() || null,
      userId
    ]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const updatedProfile = updateResult.rows[0];

    // Get updated complete profile data
    const profileResult = await pool.query(`
      SELECT 
        r.id as register_id,
        r.email,
        r.phone,
        r.verified,
        u.name,
        u.image,
        u.bio,
        u.location,
        u.website,
        u.twitter,
        u.instagram,
        u.linkedin
      FROM "Register" r
      LEFT JOIN "User" u ON r.id = u."registerId"
      WHERE r.id = $1
      LIMIT 1
    `, [userId]);

    const profile = profileResult.rows[0];

    const profileData: UpdateProfileData = {
      id: profile.register_id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.image || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      socialMedia: {
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        linkedin: profile.linkedin || ''
      },
      verified: profile.verified
    };

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}

// Update user avatar/image
export const updateUserAvatarController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id // This is Register.id from auth middleware
    const { imageUrl } = req.body;

    if (missingParams({ imageUrl }, res)) return;

    // Update User table with new image
    const updateResult = await pool.query(`
      UPDATE "User" 
      SET image = $1
      WHERE "registerId" = $2
      RETURNING id, name, image
    `, [imageUrl, userId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = updateResult.rows[0];

    return res.status(200).json({
      message: 'Avatar updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.image
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    return res.status(500).json({ message: 'Failed to update avatar' });
  }
}
