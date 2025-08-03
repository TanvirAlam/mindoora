import { Request, Response } from 'express';
import { db } from '../db/connection';
import { UserTrophies } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createUserTrophySchema, updateUserTrophySchema, getUserTrophiesSchema } from '../db/schemas/userTrophies.schema';
import path from 'path';
import fs from 'fs';
import sanitizeFilename from 'sanitize-filename';

// Create assets/users directory if it doesn't exist
const assetsUsersDir = path.join(process.cwd(), 'assets', 'users');
if (!fs.existsSync(assetsUsersDir)) {
  fs.mkdirSync(assetsUsersDir, { recursive: true });
}

export const createUserTrophy = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (!req.file.mimetype.startsWith('image')) {
      return res.status(400).json({ message: 'File must be an image' });
    }

    if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({ message: 'Image size exceeds 5MB limit' });
    }

    // Validate request body
    const validatedData = createUserTrophySchema.parse(req.body);
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const sanitizedName = sanitizeFilename(validatedData.name.replace(/[^a-zA-Z0-9]/g, '_'));
    const filename = `${sanitizedName}_${Date.now()}${fileExtension}`;
    
    // Save the uploaded file to assets/users/
    const filePath = path.join(assetsUsersDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    // Insert trophy record into database
    const [newTrophy] = await db.insert(UserTrophies).values({
      name: validatedData.name,
      description: validatedData.description,
      trophyRank: validatedData.trophyRank,
      imageSrc: filename,
      userId: userId,
    }).returning();

    return res.status(201).json({
      message: 'Trophy created successfully',
      trophy: {
        id: newTrophy.id,
        name: newTrophy.name,
        description: newTrophy.description,
        trophyRank: newTrophy.trophyRank,
        imageSrc: newTrophy.imageSrc,
        imageUrl: `/assets/users/${newTrophy.imageSrc}`,
        createdAt: newTrophy.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user trophy:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserTrophies = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    
    // Convert string query parameters to numbers before validation
    const queryParams = {
      ...req.query,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    };
    
    const { limit = 10, offset = 0 } = getUserTrophiesSchema.parse(queryParams);

    const trophies = await db
      .select()
      .from(UserTrophies)
      .where(eq(UserTrophies.userId, userId))
      .orderBy(desc(UserTrophies.createdAt))
      .limit(limit)
      .offset(offset);

const trophiesWithUrls = trophies.map((trophy: any) => ({
      ...trophy,
      imageUrl: `/assets/users/${trophy.imageSrc}`
    }));

    return res.status(200).json({
      message: 'Trophies retrieved successfully',
      trophies: trophiesWithUrls,
      pagination: {
        limit,
        offset,
        total: trophies.length
      }
    });
  } catch (error) {
    console.error('Error getting user trophies:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserTrophy = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const trophyId = req.params.id;
    
    if (!trophyId) {
      return res.status(400).json({ message: 'Trophy ID is required' });
    }

    // Validate request body
    const validatedData = updateUserTrophySchema.parse(req.body);

    // Check if trophy exists and belongs to user
    const existingTrophy = await db
      .select()
      .from(UserTrophies)
      .where(and(eq(UserTrophies.id, trophyId), eq(UserTrophies.userId, userId)))
      .limit(1);

    if (existingTrophy.length === 0) {
      return res.status(404).json({ message: 'Trophy not found or access denied' });
    }

    // Update trophy
    const [updatedTrophy] = await db
      .update(UserTrophies)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(UserTrophies.id, trophyId), eq(UserTrophies.userId, userId)))
      .returning();

    return res.status(200).json({
      message: 'Trophy updated successfully',
      trophy: {
        ...updatedTrophy,
        imageUrl: `/assets/users/${updatedTrophy.imageSrc}`
      }
    });
  } catch (error) {
    console.error('Error updating user trophy:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUserTrophy = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const trophyId = req.params.id;
    
    if (!trophyId) {
      return res.status(400).json({ message: 'Trophy ID is required' });
    }

    // Check if trophy exists and belongs to user
    const existingTrophy = await db
      .select()
      .from(UserTrophies)
      .where(and(eq(UserTrophies.id, trophyId), eq(UserTrophies.userId, userId)))
      .limit(1);

    if (existingTrophy.length === 0) {
      return res.status(404).json({ message: 'Trophy not found or access denied' });
    }

    // Delete the image file
    const imagePath = path.join(assetsUsersDir, existingTrophy[0].imageSrc);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete trophy from database
    await db
      .delete(UserTrophies)
      .where(and(eq(UserTrophies.id, trophyId), eq(UserTrophies.userId, userId)));

    return res.status(200).json({
      message: 'Trophy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user trophy:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrophyById = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const trophyId = req.params.id;
    
    if (!trophyId) {
      return res.status(400).json({ message: 'Trophy ID is required' });
    }

    const trophy = await db
      .select()
      .from(UserTrophies)
      .where(and(eq(UserTrophies.id, trophyId), eq(UserTrophies.userId, userId)))
      .limit(1);

    if (trophy.length === 0) {
      return res.status(404).json({ message: 'Trophy not found or access denied' });
    }

    return res.status(200).json({
      message: 'Trophy retrieved successfully',
      trophy: {
        ...trophy[0],
        imageUrl: `/assets/users/${trophy[0].imageSrc}`
      }
    });
  } catch (error) {
    console.error('Error getting trophy by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
