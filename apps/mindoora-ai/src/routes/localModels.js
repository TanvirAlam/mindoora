import express from 'express';
import localModelController from '../controllers/localModelController.js';
import { apiKeyAuth, requestTimeout } from '../middleware/index.js';

const router = express.Router();

// Apply API key authentication if enabled
router.use(apiKeyAuth);

// Apply request timeout for model operations (longer timeout for model inference)
router.use(requestTimeout(60000)); // 60 seconds

/**
 * @route   POST /api/local/generate
 * @desc    Generate quiz questions using free Hugging Face models
 * @access  Public (with API key if enabled)
 * @body    {
 *            prompt: string (required),
 *            model: string (optional, default: 'flan-t5-small'),
 *            count: number (optional, default: 3),
 *            difficulty: string (optional, default: 'medium'),
 *            focusArea: string (optional)
 *          }
 */
router.post('/generate', localModelController.generateQuestions);

/**
 * @route   POST /api/local/test
 * @desc    Test a specific model with a sample prompt
 * @access  Public (with API key if enabled)
 * @body    {
 *            model: string (optional, default: 'flan-t5-small')
 *          }
 */
router.post('/test', localModelController.testModel);

/**
 * @route   GET /api/local/models
 * @desc    Get available models and their information
 * @access  Public (with API key if enabled)
 */
router.get('/models', localModelController.getModels);

/**
 * @route   GET /api/local/models/:modelName
 * @desc    Get information about a specific model
 * @access  Public (with API key if enabled)
 */
router.get('/models/:modelName', localModelController.getModelInfo);

/**
 * @route   GET /api/local/health
 * @desc    Health check for local model service
 * @access  Public (with API key if enabled)
 */
router.get('/health', localModelController.healthCheck);

/**
 * @route   GET /api/local/quick-test
 * @desc    Quick test endpoint for development (random topic)
 * @access  Public (with API key if enabled)
 */
router.get('/quick-test', localModelController.quickTest);

export default router;
