import { Response } from 'express';
import { pool } from '../../utils/PrismaInstance';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import sanitizeFilename from 'sanitize-filename';

// Table name mapping for PostgreSQL queries
const tableNames: Record<string, string> = {
    userGame: 'UserGame',
    questions: 'Questions',
    userGameDetails: 'UserGameDetails',
    gameRooms: 'GameRooms',
    gamePlayers: 'GamePlayers',
    questionsSolved: 'QuestionsSolved',
    subscription: 'Subscription',
    feedback: 'Feedback',
    friends: 'Friends',
    userGameScore: 'userGameScore',
    questionDB: 'QuestionDB',
    followings: 'Followings',
    acceptTC: 'AcceptTC',
    gameExperience: 'gameExperience'
};

export const userAccess = async (modelKey: string, where: object, res: Response) => {
  try {
    const tableName = tableNames[modelKey];
    const user = res.locals.user.id;
    
    if (!tableName) {
        res.status(500).json({ message: 'Invalid model name' });
        return null;
    }

    // Build WHERE clause dynamically
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    let whereClause = '"user" = $1';
    const queryParams = [user];
    
    whereKeys.forEach((key, index) => {
        whereClause += ` AND "${key}" = $${index + 2}`;
        queryParams.push(whereValues[index]);
    });

    const query = `SELECT * FROM "${tableName}" WHERE ${whereClause}`;
    const result = await pool.query(query, queryParams);
    
    if (result.rows.length === 0) {
        res.status(404).json({ message: `${Object.keys(where)} Not Found` });
        return null;
    } else if(result.rows.length === 1) {
        return result.rows[0];
    } else {
        return result.rows;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const findDuplicate = async (modelKey: string, where: object, res: Response) => {
    const tableName = tableNames[modelKey];
    if (!tableName) {
        return res.status(500).json({ message: 'Invalid model name' });
    }

    // Build WHERE clause dynamically
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    let whereClause = whereKeys.map((key, index) => `"${key}" = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM "${tableName}" WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, whereValues);
    
    if (result.rows.length > 0) {
        return res.status(409).json({ message: `${Object.keys(where)} Exists` });
    }
};

export const findDuplicateContinue = async (modelKey: string, where: object, res: Response) => {
    const tableName = tableNames[modelKey];
    if (!tableName) {
        return false;
    }

    // Build WHERE clause dynamically
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    let whereClause = whereKeys.map((key, index) => `"${key}" = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM "${tableName}" WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, whereValues);
    
    return result.rows.length > 0;
};

export const missingParams = (params: { [key: string]: string | undefined }, res: Response) => {
  const presentParams = Object.keys(params).filter((key) => params[key] !== undefined);
  const paramsLength = Object.keys(params).length;

  if (presentParams.length === 0) {
    return res.status(400).json({ message: 'Required data not found' });
  }

  if (paramsLength > 1 && presentParams.length === paramsLength) {
    return res.status(400).json({ message: 'Any of required data is accepted' });
  }

};


function generateMixedCaseHex(hexString: string) {
  return hexString.split('').map((char, index) => {
    const randomNumber = Math.floor(Math.random() * 2) + 2;
    return index % randomNumber === 0 ? char.toUpperCase() : char.toLowerCase();
  }).join('');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      const originalFilename = sanitizeFilename(file.originalname);
      const randomHex = crypto.randomBytes(32).toString('hex');
      const uniqueFilename = generateMixedCaseHex(randomHex) + path.extname(originalFilename);
      cb(null, uniqueFilename);
    },
  });

  const fileFilter: multer.Options['fileFilter'] = function (req, file, cb) {
    const mimeType = mime.lookup(file.originalname) as string;
    if (mimeType?.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const limits = {
    fileSize: 2 * 1024 * 1024,
  };

  export const upload = multer({ storage: storage, fileFilter: fileFilter, limits: limits });

  export const isExpired = (date: Date) => date < new Date();

  export function calculatePoint(tL: number, tT: number): number {
    const ratio = (tT / tL) * 60;
    return 1100 - Math.floor(ratio * 10);
  }
