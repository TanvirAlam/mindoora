import { Response } from 'express';
import { prisma } from '../../utils/PrismaInstance';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import sanitizeFilename from 'sanitize-filename';


const models: Record<string, any> = {
    userGame: prisma.userGame,
    questions: prisma.questions,
    userGameDetails: prisma.userGameDetails,
    gameRooms: prisma.gameRooms,
    questionsSolved: prisma.questionsSolved,
    subscription: prisma.subscription,
    feedback: prisma.feedback,
    friends: prisma.friends,
    userGameScore: prisma.userGameScore,
    questionDB: prisma.questionDB,
    followings: prisma.followings,
    acceptTC: prisma.acceptTC,
    gameExperience: prisma.gameExperience
};

export const userAccess = async (modelKey: string, where: object, res: Response) => {
  try {
    const model = models[modelKey];
    const user = res.locals.user.id
    if (!model) {
        res.status(500).json({ message: 'Invalid model name' });
        return null;
    }
    const findMany = await model.findMany({
        where: {...where, user}
    });
    if (findMany.length === 0) {
        res.status(404).json({ message: `${Object.keys(where)} Not Found` });
        return null;
    }else if(findMany.length === 1) {
        return findMany[0];
    }else{
        return findMany;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const findDuplicate = async (modelKey: string, where: object, res: Response) => {
    const model = models[modelKey];
    if (!model) {
        return res.status(500).json({ message: 'Invalid model name' });
    }
    const findDuplicateEntry = await model.findFirst({
        where: {...where}
    });
    if (findDuplicateEntry) {
        return res.status(409).json({ message: `${Object.keys(where)} Exists` });
    }
};

export const findDuplicateContinue = async (modelKey: string, where: object, res: Response) => {
  const model = models[modelKey];
  const findDuplicateEntry = await model.findFirst({
      where: {...where}
  });
  if (findDuplicateEntry) {
      return true;
  }
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
