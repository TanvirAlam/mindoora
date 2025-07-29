import { HfInference } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import https from 'https';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import cacheService from './cacheService.js';

/**
 * Recommended free models for question generation:
 * 1. microsoft/DialoGPT-large - Good for conversational text generation
 * 2. google/flan-t5-base - Instruction-tuned, good for Q&A tasks
 * 3. microsoft/DialoGPT-medium - Smaller but still effective
 * 4. facebook/blenderbot-400M-distill - Good for dialogue and questions
 * 5. gpt2 - Classic text generation model
 */

const RECOMMENDED_MODELS = {
  'flan-t5-base': {
    name: 'google/flan-t5-base',
    description: 'Instruction-tuned T5 model, excellent for Q&A generation',
    size: '~1GB',
    recommended: true,
    type: 'text2text-generation'
  },
  'flan-t5-small': {
    name: 'google/flan-t5-small',
    description: 'Smaller version of Flan-T5, faster but less capable',
    size: '~300MB',
    recommended: true,
    type: 'text2text-generation'
  },
  'gpt2': {
    name: 'gpt2',
    description: 'Classic GPT-2 model, good for general text generation',
    size: '~500MB',
    recommended: false,
    type: 'text-generation'
  },
  'distilgpt2': {
    name: 'distilgpt2',
    description: 'Smaller, faster version of GPT-2',
    size: '~350MB',
    recommended: true,
    type: 'text-generation'
  }
};

class LocalModelService {
  constructor() {
    this.hf = config.huggingface.apiKey ? new HfInference(config.huggingface.apiKey) : null;
    this.currentModel = null;
    this.modelPath = path.join(process.cwd(), 'models');
    this.ensureModelsDirectory();
  }

  ensureModelsDirectory() {
    if (!fs.existsSync(this.modelPath)) {
      fs.mkdirSync(this.modelPath, { recursive: true });
      logger.info('Created models directory:', this.modelPath);
    }
  }

  /**
   * Get list of recommended models
   */
  getRecommendedModels() {
    return RECOMMENDED_MODELS;
  }

  /**
   * Generate questions using Hugging Face API (no download required)
   */
  async generateQuestions(prompt, options = {}) {
    const {
      model = 'flan-t5-base',
      count = 5,
      difficulty = 'medium',
      focusArea = '',
    } = options;

    if (!this.hf) {
      throw new Error('Hugging Face API key not configured');
    }

    // Build the instruction prompt
    const instructionPrompt = this.buildInstructionPrompt(prompt, count, difficulty, focusArea);
    
    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'local-questions',
      model,
      this.hashString(instructionPrompt)
    );

    // Check cache first
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      logger.info('Questions retrieved from cache (local model)');
      return cachedResult;
    }

    const startTime = Date.now();

    try {
      let response;
      const modelInfo = RECOMMENDED_MODELS[model] || RECOMMENDED_MODELS['flan-t5-base'];

      if (modelInfo.type === 'text2text-generation') {
        // For T5-based models (text-to-text generation)
        response = await this.hf.textToText({
          model: modelInfo.name,
          inputs: instructionPrompt,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
          }
        });
      } else {
        // For GPT-based models (text generation)
        response = await this.hf.textGeneration({
          model: modelInfo.name,
          inputs: instructionPrompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            return_full_text: false,
          }
        });
      }

      const duration = Date.now() - startTime;
      logger.logAIRequest(modelInfo.name, instructionPrompt, duration, true);

      // Parse the response
      const generatedText = response.generated_text || response[0]?.generated_text || '';
      const questions = this.parseQuestions(generatedText, prompt);

      const result = {
        questions,
        metadata: {
          generated_at: new Date().toISOString(),
          count: questions.length,
          provider: 'huggingface-local',
          model: modelInfo.name,
          duration: `${duration}ms`,
        },
      };

      // Cache the result
      await cacheService.set(cacheKey, result);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logAIRequest(model, instructionPrompt, duration, false);
      logger.logError(error, { context: 'Local model question generation failed', model });
      throw error;
    }
  }

  /**
   * Build instruction prompt for question generation
   */
  buildInstructionPrompt(topic, count, difficulty, focusArea) {
    let prompt = `Create ${count} multiple-choice quiz questions on the topic: "${topic}". 
Each question should have 4 options labeled A, B, C, and D. 
Only one option should be correct. 
At the end of each question, mention the correct answer clearly in this format: "Correct Answer: A".

Make sure the questions are clear and suitable for ${difficulty} learners.`;

    if (focusArea) {
      prompt += ` Focus on ${focusArea}, and avoid overly complex language.`;
    }

    prompt += `

Example format:

1. What is the output of \`console.log(typeof null)\` in JavaScript?
A. "null"
B. "undefined"
C. "object"
D. "boolean"
Correct Answer: C

Now generate ${count} questions about "${topic}":

`;

    return prompt;
  }

  /**
   * Parse questions from generated text
   */
  parseQuestions(generatedText, topic) {
    const questions = [];
    
    // Split by question numbers (1., 2., 3., etc.)
    const questionBlocks = generatedText.split(/\n?\d+\.\s+/).filter(block => block.trim());

    questionBlocks.forEach((block, index) => {
      try {
        const lines = block.trim().split('\n').filter(line => line.trim());
        
        if (lines.length < 6) return; // Need at least question + 4 options + answer

        const questionText = lines[0].trim();
        const options = {};
        let correctAnswer = '';

        // Extract options A, B, C, D
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Match option pattern (A. text, B. text, etc.)
          const optionMatch = line.match(/^([A-D])\.\s*(.+)/);
          if (optionMatch) {
            options[optionMatch[1]] = optionMatch[2].trim();
          }
          
          // Match correct answer pattern
          const answerMatch = line.match(/Correct Answer:\s*([A-D])/i);
          if (answerMatch) {
            correctAnswer = answerMatch[1];
          }
        }

        // Validate we have all required parts
        if (questionText && Object.keys(options).length === 4 && correctAnswer) {
          questions.push({
            id: index + 1,
            question: questionText,
            options,
            correctAnswer,
            explanation: `The correct answer is ${correctAnswer}: ${options[correctAnswer]}`,
            difficulty: 'medium',
            topic: topic,
          });
        }
      } catch (error) {
        logger.warn('Failed to parse question block:', { block, error: error.message });
      }
    });

    return questions;
  }

  /**
   * Test model with a simple prompt
   */
  async testModel(modelName = 'flan-t5-base') {
    try {
      const testPrompt = 'JavaScript';
      const result = await this.generateQuestions(testPrompt, {
        model: modelName,
        count: 2,
        difficulty: 'beginner',
      });

      logger.info('Model test successful:', {
        model: modelName,
        questionsGenerated: result.questions.length,
      });

      return {
        success: true,
        model: modelName,
        questionsGenerated: result.questions.length,
        sampleQuestion: result.questions[0]?.question || 'No questions generated',
      };
    } catch (error) {
      logger.logError(error, { context: 'Model test failed', model: modelName });
      return {
        success: false,
        model: modelName,
        error: error.message,
      };
    }
  }

  /**
   * Get model info and status
   */
  async getModelInfo(modelName) {
    const modelInfo = RECOMMENDED_MODELS[modelName];
    if (!modelInfo) {
      throw new Error(`Model ${modelName} not found in recommended models`);
    }

    return {
      ...modelInfo,
      available: !!this.hf,
      cached: await this.isModelCached(modelName),
    };
  }

  /**
   * Check if model responses are cached
   */
  async isModelCached(modelName) {
    // Simple check - we can't easily check HF model cache without making a request
    // This is more about our response cache
    const testKey = cacheService.generateKey('local-questions', modelName, 'test');
    const cached = await cacheService.get(testKey);
    return !!cached;
  }

  /**
   * Simple hash function for cache keys
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Health check for local model service
   */
  async healthCheck() {
    try {
      if (!this.hf) {
        return {
          status: 'error',
          message: 'Hugging Face API key not configured',
          available: false,
        };
      }

      // Test with a simple request
      const testResult = await this.testModel('flan-t5-small');
      
      return {
        status: testResult.success ? 'healthy' : 'error',
        message: testResult.success ? 'Model service operational' : testResult.error,
        available: !!this.hf,
        recommendedModels: Object.keys(RECOMMENDED_MODELS),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        available: false,
      };
    }
  }
}

export default new LocalModelService();
