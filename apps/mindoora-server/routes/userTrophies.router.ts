import express from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  createUserTrophy,
  getUserTrophies,
  updateUserTrophy,
  deleteUserTrophy,
  getTrophyById
} from '../controllers/userTrophies.controller';

const router = express.Router();

// Configure multer for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Apply auth middleware to all routes
router.use(authenticateJWT);

// Routes
router.post('/', upload.single('image'), createUserTrophy);
router.get('/', getUserTrophies);
router.get('/:id', getTrophyById);
router.put('/:id', updateUserTrophy);
router.delete('/:id', deleteUserTrophy);

export { router as userTrophiesRouter };
