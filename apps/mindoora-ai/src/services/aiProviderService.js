import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import cacheService from './cacheService.js';
import localModelService from './localModelService.js';

class AIProviderService {
  constructor() {
    this.providers = {};
    this.initProviders();
  }

  initProviders() {
    // Initialize OpenAI
    if (config.openai.apiKey) {
      this.providers.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
      logger.info('OpenAI provider initialized');
    }

    // Initialize Hugging Face
    if (config.huggingface.apiKey) {
      this.providers.huggingface = new HfInference(config.huggingface.apiKey);
      logger.info('Hugging Face provider initialized');
    }

    // Initialize Google AI
    if (config.googleAI.apiKey) {
      this.providers.googleai = new GoogleGenerativeAI(config.googleAI.apiKey);
      logger.info('Google AI provider initialized');
    }
  }

  /**
   * Generate questions using the specified provider
   */
  async generateQuestions(prompt, options = {}) {
    const {
      provider = config.ai.defaultProvider,
      count = 5,
      difficulty = 'medium',
      questionTypes = ['multiple-choice'],
      useCache = true,
    } = options;

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'questions',
      provider,
      this.hashString(prompt),
      count,
      difficulty,
      questionTypes.join('-')
    );

    // Check cache first
    if (useCache) {
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('Questions retrieved from cache');
        return cachedResult;
      }
    }

    const startTime = Date.now();
    let result;

    try {
      switch (provider) {
        case 'openai':
          result = await this.generateWithOpenAI(prompt, { count, difficulty, questionTypes });
          break;
        case 'huggingface':
          result = await this.generateWithHuggingFace(prompt, { count, difficulty, questionTypes });
          break;
        case 'googleai':
          result = await this.generateWithGoogleAI(prompt, { count, difficulty, questionTypes });
          break;
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }

      const duration = Date.now() - startTime;
      logger.logAIRequest(provider, prompt, duration, true);

      // Cache the result
      if (useCache && result) {
        await cacheService.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logAIRequest(provider, prompt, duration, false);
      logger.logError(error, { context: 'AI question generation failed', provider });

      // Try fallback provider
      if (provider !== config.ai.fallbackProvider) {
        logger.info(`Attempting fallback to ${config.ai.fallbackProvider}`);
        return this.generateQuestions(prompt, { 
          ...options, 
          provider: config.ai.fallbackProvider 
        });
      }

      throw error;
    }
  }

  /**
   * Generate questions using OpenAI
   */
  async generateWithOpenAI(prompt, options) {
    if (!this.providers.openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const { count, difficulty, questionTypes } = options;
    
    const systemPrompt = this.buildSystemPrompt(count, difficulty, questionTypes);
    const userPrompt = `Topic: ${prompt}`;

    const response = await this.providers.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return this.parseQuestionsFromResponse(content);
  }

  /**
   * Generate questions using Hugging Face
   */
  async generateWithHuggingFace(prompt, options) {
    if (!this.providers.huggingface) {
      throw new Error('Hugging Face provider not initialized');
    }

    const { count, difficulty, questionTypes } = options;
    
    const systemPrompt = this.buildSystemPrompt(count, difficulty, questionTypes);
    const fullPrompt = `${systemPrompt}\n\nTopic: ${prompt}`;

    const response = await this.providers.huggingface.textGeneration({
      model: 'microsoft/DialoGPT-large',
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false,
      },
    });

    const content = response.generated_text;
    if (!content) {
      throw new Error('No content received from Hugging Face');
    }

    return this.parseQuestionsFromResponse(content);
  }

  /**
   * Generate questions using Google AI
   */
  async generateWithGoogleAI(prompt, options) {
    if (!this.providers.googleai) {
      throw new Error('Google AI provider not initialized');
    }

    const { count, difficulty, questionTypes } = options;
    
    const model = this.providers.googleai.getGenerativeModel({ model: 'gemini-pro' });
    
    const systemPrompt = this.buildSystemPrompt(count, difficulty, questionTypes);
    const fullPrompt = `${systemPrompt}\n\nTopic: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No content received from Google AI');
    }

    return this.parseQuestionsFromResponse(content);
  }

  /**
   * Build system prompt for question generation
   */
  buildSystemPrompt(count, difficulty, questionTypes) {
    return `You are an expert quiz question generator. Generate ${count} ${difficulty} difficulty quiz questions based on the given topic.

Requirements:
- Question types: ${questionTypes.join(', ')}
- Difficulty: ${difficulty}
- Each question should have 4 answer options (A, B, C, D) with only one correct answer
- Provide the correct answer for each question
- Include a brief explanation for the correct answer
- Format your response as valid JSON

Response format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "${difficulty}",
      "topic": "Relevant topic/category"
    }
  ]
}`;
  }

  /**
   * Parse questions from AI response
   */
  parseQuestionsFromResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response format: missing questions array');
      }

      // Validate each question
      const validatedQuestions = parsed.questions.map((q, index) => {
        if (!q.question || !q.options || !q.correctAnswer) {
          throw new Error(`Invalid question format at index ${index}`);
        }

        return {
          id: q.id || index + 1,
          question: q.question.trim(),
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          topic: q.topic || 'General',
        };
      });

      return {
        questions: validatedQuestions,
        metadata: {
          generated_at: new Date().toISOString(),
          count: validatedQuestions.length,
          provider: 'ai',
        },
      };

    } catch (error) {
      logger.logError(error, { context: 'Failed to parse AI response', content });
      throw new Error('Failed to parse questions from AI response');
    }
  }

  /**
   * Analyze content difficulty
   */
  async analyzeContent(text, provider = config.ai.defaultProvider) {
    const cacheKey = cacheService.generateKey('analysis', provider, this.hashString(text));
    
    // Check cache first
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const prompt = `Analyze the following text and provide:
1. Reading difficulty level (beginner, intermediate, advanced)
2. Key topics and concepts
3. Suggested question types for this content

Text: ${text}

Respond in JSON format:
{
  "difficulty": "intermediate",
  "topics": ["topic1", "topic2"],
  "suggestedQuestionTypes": ["multiple-choice", "true-false"],
  "keyPoints": ["point1", "point2"]
}`;

    try {
      const result = await this.generateQuestions(prompt, { 
        provider, 
        count: 1,
        useCache: false 
      });
      
      await cacheService.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.logError(error, { context: 'Content analysis failed' });
      throw error;
    }
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
   * Get available providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Health check for providers
   */
  async healthCheck() {
    const results = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        // Simple test request
        await this.generateQuestions('Test topic', { 
          provider: name, 
          count: 1, 
          useCache: false 
        });
        results[name] = { status: 'healthy' };
      } catch (error) {
        results[name] = { status: 'error', message: error.message };
      }
    }

    return results;
  }
}

export default new AIProviderService();
