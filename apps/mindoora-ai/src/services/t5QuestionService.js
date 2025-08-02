import { HfInference } from '@huggingface/inference';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import cacheService from './cacheService.js';

/**
 * T5 Question Generation Service
 * Uses a public T5 model that can be accessed without an API key for basic functionality.
 * For full functionality, a Hugging Face API key is recommended.
 * Model: google/flan-t5-small
 */
class T5QuestionService {
  constructor() {
    // Try to initialize with API key, but also allow fallback
    this.hf = config.huggingface.apiKey ? new HfInference(config.huggingface.apiKey) : new HfInference();
    this.modelName = 'mrm8488/t5-base-finetuned-question-generation-ap'; // Fine-tuned specifically for question generation
    this.hasApiKey = !!config.huggingface.apiKey;
    this.apiKeyValid = false; // Will be checked on first use
    this.fallbackMode = false;
    
    if (this.hasApiKey) {
      logger.info('T5 Question Generation Service initialized with API key and model:', this.modelName);
      this.validateApiKey(); // Async validation
    } else {
      logger.warn('T5 Question Generation Service initialized without API key (using fallback mode)');
      logger.warn('For AI-generated questions, add HUGGINGFACE_API_KEY to your .env file.');
      logger.warn('Get a valid API key from: https://huggingface.co/settings/tokens');
      this.fallbackMode = true;
    }
  }

  /**
   * Validate the API key asynchronously
   */
  async validateApiKey() {
    if (!this.hasApiKey) {
      this.fallbackMode = true;
      return false;
    }

    try {
      // Test with a simple API call
      const response = await fetch('https://huggingface.co/api/whoami', {
        headers: {
          'Authorization': `Bearer ${config.huggingface.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        logger.info('✅ Hugging Face API key is valid for user:', data.name || 'Unknown');
        this.apiKeyValid = true;
        this.fallbackMode = false;
        return true;
      } else {
        logger.warn('❌ Hugging Face API key validation failed:', response.status, response.statusText);
        logger.warn('Please get a new API key from: https://huggingface.co/settings/tokens');
        this.apiKeyValid = false;
        this.fallbackMode = true;
        return false;
      }
    } catch (error) {
      logger.warn('❌ Could not validate Hugging Face API key:', error.message);
      logger.warn('Switching to fallback mode. For AI-generated questions, get a valid API key from: https://huggingface.co/settings/tokens');
      this.apiKeyValid = false;
      this.fallbackMode = true;
      return false;
    }
  }

  /**
   * Generate questions using the T5 fine-tuned model
   */
  async generateQuestions(prompt, options = {}) {
    const {
      count = 5,
      difficulty = 'medium',
      questionType = 'multiple choice question',
      useCache = true,
    } = options;

    if (!this.hf) {
      logger.warn('Hugging Face API key not configured, using fallback questions');
      return this.generateFallbackQuestions(prompt, count, difficulty);
    }

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      't5-questions',
      this.hashString(prompt),
      count,
      difficulty,
      questionType
    );

    // Check cache first
    if (useCache) {
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('T5 Questions retrieved from cache');
        return cachedResult;
      }
    }

    const startTime = Date.now();

    try {
      const questions = [];
      
      // Generate questions one by one for better control and parsing
      for (let i = 1; i <= count; i++) {
        try {
          const singleQuestion = await this.generateSingleQuestion(prompt, difficulty, questionType, i);
          if (singleQuestion) {
            questions.push(singleQuestion);
          }
        } catch (error) {
          logger.warn(`T5 model generation failed for question ${i}:`, error.message);
          logger.error('Full error details:', error);
          // Continue with other questions even if one fails
        }
      }

      const duration = Date.now() - startTime;
      logger.logAIRequest(this.modelName, prompt, duration, true);

      const result = {
        questions,
        metadata: {
          generated_at: new Date().toISOString(),
          count: questions.length,
          provider: 'huggingface-t5',
          model: this.modelName,
          duration: `${duration}ms`,
          difficulty,
          questionType,
        },
      };

      // Cache the result if we got questions
      if (useCache && questions.length > 0) {
        await cacheService.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logAIRequest(this.modelName, prompt, duration, false);
      logger.logError(error, { context: 'T5 question generation failed' });
      throw error;
    }
  }

  /**
   * Generate a single question using the T5 model with retry mechanism
   */
  async generateSingleQuestion(context, difficulty, questionType, questionId, maxRetries = 3) {
    // Build the input prompt according to T5 model's expected format
    const input = this.buildT5Prompt(context, difficulty, questionType);
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`T5 generation attempt ${attempt}/${maxRetries} for question ${questionId}`);
        
        const response = await this.makeT5Request(input, attempt);
        const generatedText = response.generated_text || response[0]?.generated_text || '';
        
        if (!generatedText || generatedText.trim().length === 0) {
          throw new Error('Empty response from T5 model');
        }

        logger.info(`T5 generated text for question ${questionId}:`, generatedText.substring(0, 100) + '...');

        // Parse the generated question
        const parsedQuestion = this.parseT5Response(generatedText, context, difficulty, questionId);
        
        return parsedQuestion;

      } catch (error) {
        lastError = error;
        logger.warn(`T5 model generation attempt ${attempt}/${maxRetries} failed for question ${questionId}:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          logger.info(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError;
  }

  /**
   * Make the actual T5 API request with different strategies
   */
  async makeT5Request(input, attempt) {
    const baseParams = {
      max_new_tokens: 100,
      temperature: 0.8,
      do_sample: true,
      top_p: 0.9,
      repetition_penalty: 1.2,
      return_full_text: false,
    };

    // Adjust parameters based on attempt
    const params = {
      ...baseParams,
      temperature: Math.max(0.3, baseParams.temperature - (attempt - 1) * 0.1),
      max_new_tokens: baseParams.max_new_tokens + (attempt - 1) * 50,
    };

    // Try multiple approaches
    const strategies = [
      // Strategy 1: Use HfInference library
      async () => {
        return await this.hf.textGeneration({
          model: this.modelName,
          inputs: input,
          parameters: params,
          options: {
            wait_for_model: true,
            use_cache: false,
          }
        });
      },
      
      // Strategy 2: Direct fetch to inference API
      async () => {
        const response = await fetch(`https://api-inference.huggingface.co/models/${this.modelName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.huggingface.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: input,
            parameters: params,
            options: {
              wait_for_model: true,
              use_cache: false,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return Array.isArray(result) ? result[0] : result;
      },
      
      // Strategy 3: Simpler direct API call
      async () => {
        const response = await fetch(`https://api-inference.huggingface.co/models/${this.modelName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.huggingface.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: input,
            parameters: {
              max_new_tokens: 50,
              temperature: 0.7,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return Array.isArray(result) ? result[0] : result;
      }
    ];

    let lastError = null;
    
    for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex++) {
      try {
        logger.info(`Trying strategy ${strategyIndex + 1}/${strategies.length} for attempt ${attempt}`);
        const response = await strategies[strategyIndex]();
        logger.info(`Strategy ${strategyIndex + 1} succeeded for attempt ${attempt}`);
        return response;
      } catch (error) {
        lastError = error;
        logger.warn(`Strategy ${strategyIndex + 1} failed:`, error.message);
      }
    }

    // Enhanced error logging
    logger.error(`All strategies failed for attempt ${attempt}:`, {
      errorType: lastError?.constructor.name,
      message: lastError?.message,
      input: input.substring(0, 100) + '...',
      params,
    });
    
    throw lastError;
  }

  /**
   * Build input prompt for T5 model
   * The mrm8488/t5-base-finetuned-question-generation-ap model expects context for question generation
   */
  buildT5Prompt(context, difficulty, questionType) {
    // This model is fine-tuned to generate questions from context
    // Format: provide context and let it generate questions
    return `context: ${context} programming concepts and ${difficulty} level understanding`;
  }

  /**
   * Parse T5 model response into structured question format
   */
  parseT5Response(generatedText, context, difficulty, questionId) {
    try {
      // Clean the generated text
      const cleanText = generatedText.trim();
      
      // The T5 model might generate in different formats, so we need to be flexible
      // Try to extract question and options
      
      // Look for question pattern
      const questionMatch = cleanText.match(/(?:Question:|Q:)?\s*(.+?)(?:\?|$)/i);
      const questionText = questionMatch ? questionMatch[1].trim() + '?' : cleanText;

      // Try to extract options if they exist
      const optionMatches = cleanText.match(/([A-D][\)\.]\s*.+?)(?=[A-D][\)\.]|$)/gi);
      
      let options = {};
      let correctAnswer = 'A';

      if (optionMatches && optionMatches.length >= 4) {
        // Parse existing options
        optionMatches.forEach((match, index) => {
          if (index < 4) {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const optionText = match.replace(/^[A-D][\)\.]\s*/, '').trim();
            options[letter] = optionText;
          }
        });
      } else {
        // Generate plausible options if not provided
        options = this.generateOptionsForQuestion(questionText, context);
      }

      // Try to identify correct answer from the response
      const correctAnswerMatch = cleanText.match(/(?:Answer:|Correct:|Answer is)?\s*([A-D])/i);
      correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].toUpperCase() : 'A';

      // Ensure we have exactly 4 options
      const optionKeys = Object.keys(options);
      if (optionKeys.length < 4) {
        const additionalOptions = this.generateOptionsForQuestion(questionText, context);
        ['A', 'B', 'C', 'D'].forEach(key => {
          if (!options[key]) {
            options[key] = additionalOptions[key] || `Option ${key}`;
          }
        });
      }

      return {
        id: questionId,
        question: questionText,
        options,
        correctAnswer,
        explanation: `This question tests understanding of ${context}. The correct answer is ${correctAnswer}.`,
        difficulty,
        topic: context,
        context: null,
        source: 'T5BaseQuestionGeneration'
      };

    } catch (error) {
      logger.warn('Failed to parse T5 response:', { error: error.message, response: generatedText });
      
      // Return a fallback question if parsing fails
      return {
        id: questionId,
        question: `What is an important concept related to ${context}?`,
        options: {
          A: `A fundamental aspect of ${context}`,
          B: `An advanced feature of ${context}`,
          C: `A common misconception about ${context}`,
          D: `An unrelated concept`
        },
        correctAnswer: 'A',
        explanation: `This is a fallback question about ${context}.`,
        difficulty,
        topic: context,
        context: null,
        source: 'T5BaseQuestionGeneration-fallback'
      };
    }
  }

  /**
   * Generate plausible options for a question
   */
  generateOptionsForQuestion(questionText, context) {
    // This is a simple option generator - you could make this more sophisticated
    // based on the question type and context
    
    const contextWords = context.toLowerCase().split(/\s+/);
    const questionWords = questionText.toLowerCase().split(/\s+/);
    
    return {
      A: `A correct answer related to ${context}`,
      B: `An alternative approach in ${context}`,
      C: `A common mistake regarding ${context}`,
      D: `An incorrect assumption about ${context}`
    };
  }

  /**
   * Test the T5 model with a simple prompt
   */
  async testModel() {
    try {
      const testPrompt = 'JavaScript programming';
      const result = await this.generateQuestions(testPrompt, {
        count: 1,
        difficulty: 'medium',
        questionType: 'multiple choice question',
        useCache: false
      });

      logger.info('T5 Model test successful:', {
        model: this.modelName,
        questionsGenerated: result.questions.length,
      });

      return {
        success: true,
        model: this.modelName,
        questionsGenerated: result.questions.length,
        sampleQuestion: result.questions[0]?.question || 'No questions generated',
      };
    } catch (error) {
      logger.logError(error, { context: 'T5 Model test failed' });
      return {
        success: false,
        model: this.modelName,
        error: error.message,
      };
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      name: this.modelName,
      description: 'T5-Base model fine-tuned specifically for question generation from context',
      capabilities: ['context-based questions', 'educational questions', 'comprehension questions'],
      difficulty_levels: ['easy', 'medium', 'hard'],
      size: '~850MB',
      type: 'text2text-generation',
      available: !!this.hf,
      optimized_for: 'question_generation_from_context',
      author: 'mrm8488',
      model_card: 'https://huggingface.co/mrm8488/t5-base-finetuned-question-generation-ap'
    };
  }

  /**
   * Health check for T5 service
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

      const testResult = await this.testModel();
      
      return {
        status: testResult.success ? 'healthy' : 'error',
        message: testResult.success ? 'T5 Question Generation service operational' : testResult.error,
        available: !!this.hf,
        model: this.modelName,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        available: false,
      };
    }
  }

  /**
   * Generate fallback questions when API is unavailable
   */
  generateFallbackQuestions(prompt, count = 5, difficulty = 'medium') {
    const questions = [];
    
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: i,
        question: `What is an important aspect of ${prompt}?`,
        options: {
          A: `A fundamental concept in ${prompt}`,
          B: `An advanced technique in ${prompt}`,
          C: `A common mistake when working with ${prompt}`,
          D: `An unrelated topic to ${prompt}`
        },
        correctAnswer: String.fromCharCode(65 + (i % 4)), // Rotate A, B, C, D
        explanation: `This question tests understanding of ${prompt}. This is a generated fallback question.`,
        difficulty,
        topic: prompt,
        context: null,
        source: 'T5BaseQuestionGeneration-fallback'
      });
    }
    
    return {
      questions,
      metadata: {
        generated_at: new Date().toISOString(),
        count: questions.length,
        provider: 'huggingface-t5-fallback',
        model: 'fallback-generator',
        duration: '0ms',
        difficulty,
        questionType: 'multiple choice question',
      },
    };
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
}

export default new T5QuestionService();
