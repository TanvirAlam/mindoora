import express from 'express';
import questionController from '../controllers/questionController.js';
import { apiKeyAuth, requestTimeout } from '../middleware/index.js';

const router = express.Router();

// Apply API key authentication if enabled
router.use(apiKeyAuth);

// Apply request timeout for AI operations
router.use(requestTimeout(30000)); // 30 seconds

/**
 * @route   POST /api/questions/generate
 * @desc    Generate quiz questions based on a prompt
 * @access  Public (with API key if enabled)
 * @body    {
 *            prompt: string (required),
 *            count: number (optional, default: 5),
 *            difficulty: string (optional, default: 'medium'),
 *            questionTypes: array (optional, default: ['multiple-choice']),
 *            provider: string (optional),
 *            useCache: boolean (optional, default: true)
 *          }
 */
router.post('/generate', questionController.generateQuestions);

/**
 * @route   POST /api/questions/analyze
 * @desc    Analyze content for difficulty and suggested question types
 * @access  Public (with API key if enabled)
 * @body    {
 *            text: string (required),
 *            provider: string (optional)
 *          }
 */
router.post('/analyze', questionController.analyzeContent);

/**
 * @route   GET /api/questions/providers
 * @desc    Get available AI providers
 * @access  Public (with API key if enabled)
 */
router.get('/providers', questionController.getProviders);

/**
 * @route   GET /api/questions/health
 * @desc    Health check for AI providers
 * @access  Public (with API key if enabled)
 */
router.get('/health', questionController.healthCheck);

/**
 * @route   GET /api/questions/stats
 * @desc    Get service statistics
 * @access  Public (with API key if enabled)
 */
router.get('/stats', questionController.getStats);

/**
 * @route   DELETE /api/questions/cache
 * @desc    Clear question cache
 * @access  Public (with API key if enabled)
 */
router.delete('/cache', questionController.clearCache);

export default router;
