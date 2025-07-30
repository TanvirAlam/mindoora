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
  'gpt2': {
    name: 'gpt2',
    description: 'Classic GPT-2 model, good for general text generation',
    size: '~500MB',
    recommended: true,
    type: 'text-generation'
  },
  'distilgpt2': {
    name: 'distilgpt2',
    description: 'Smaller, faster version of GPT-2',
    size: '~350MB',
    recommended: true,
    type: 'text-generation'
  },
  'gpt2-medium': {
    name: 'gpt2-medium',
    description: 'Medium-sized GPT-2 model, better quality than base',
    size: '~1.5GB',
    recommended: true,
    type: 'text-generation'
  },
  'microsoft/DialoGPT-medium': {
    name: 'microsoft/DialoGPT-medium',
    description: 'Microsoft DialoGPT medium model, good for conversational text',
    size: '~1GB',
    recommended: true,
    type: 'text-generation'
  },
  'flan-t5-small': {
    name: 'google/flan-t5-small',
    description: 'Smaller version of Flan-T5, faster but less capable',
    size: '~300MB',
    recommended: false, // Set to false due to frequent sleeping
    type: 'text2text-generation'
  },
  'flan-t5-base': {
    name: 'google/flan-t5-base',
    description: 'Instruction-tuned T5 model, excellent for Q&A generation',
    size: '~1GB',
    recommended: false, // Set to false due to frequent sleeping
    type: 'text2text-generation'
  }
};

// Fallback order for models when one fails (most reliable first)
const MODEL_FALLBACK_ORDER = ['gpt2', 'distilgpt2', 'gpt2-medium', 'microsoft/DialoGPT-medium'];

class LocalModelService {
  constructor() {
    this.hf = config.huggingface.apiKey ? new HfInference(config.huggingface.apiKey) : null;
    if (this.hf) {
      logger.info('Hugging Face API key loaded, service initialized.');
    } else {
      logger.warn('Hugging Face API key not found. Local model service will be disabled.');
    }
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
      model = 'gpt2', // Changed default to more reliable model
      count = 5,
      difficulty = 'medium',
      focusArea = '',
    } = options;

    if (!this.hf) {
      throw new Error('Hugging Face API key not configured');
    }

    // Try with fallback models if the requested model fails
    const modelsToTry = [model, ...MODEL_FALLBACK_ORDER.filter(m => m !== model)];
    const errors = [];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      try {
        logger.info(`Trying model ${i + 1}/${modelsToTry.length}: ${currentModel}`);
        const result = await this.generateWithModel(currentModel, prompt, count, difficulty, focusArea);
        
        if (result && result.questions && result.questions.length > 0) {
          logger.info(`Successfully generated ${result.questions.length} questions with model: ${currentModel}`);
          return result;
        } else {
          logger.warn(`Model ${currentModel} returned no questions`);
          errors.push(`${currentModel}: No questions generated`);
        }
      } catch (error) {
        logger.warn(`Model ${currentModel} failed:`, error.message);
        errors.push(`${currentModel}: ${error.message}`);
        
        // Continue to next model unless this is the last one
        if (i < modelsToTry.length - 1) {
          logger.info(`Trying next model in fallback sequence...`);
          continue;
        }
      }
    }
    
    // If we get here, all models failed - provide fallback mock questions
    logger.warn(`All ${modelsToTry.length} models failed, generating fallback questions`);
    logger.error(`Model failures: ${errors.join('; ')}`);
    
    return this.generateFallbackQuestions(prompt, count, difficulty);
  }

  /**
   * Generate questions with a specific model
   */
  async generateWithModel(model, prompt, count, difficulty, focusArea) {
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
      logger.info(`Questions retrieved from cache (local model: ${model})`);
      return cachedResult;
    }

    const startTime = Date.now();
    const modelInfo = RECOMMENDED_MODELS[model] || RECOMMENDED_MODELS['gpt2'];

    logger.info(`Attempting to generate questions with model: ${modelInfo.name}`);

    // Try with retries and timeout
    const maxRetries = 2;
    const timeoutMs = 30000; // 30 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Model ${modelInfo.name} - Attempt ${attempt}/${maxRetries}`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Model request timeout')), timeoutMs);
        });
        
        // Create the API request promise
        const apiRequest = this.hf.textGeneration({
          model: modelInfo.name,
          inputs: instructionPrompt,
          parameters: {
            max_new_tokens: modelInfo.type === 'text2text-generation' ? 800 : 600, // Reduced tokens
            temperature: 0.8,
            do_sample: true,
            top_p: 0.95,
            return_full_text: false,
            pad_token_id: 50256, // GPT-2 pad token
          },
          options: {
            wait_for_model: attempt === 1, // Only wait on first attempt
            use_cache: false,
          }
        });
        
        // Race between API request and timeout
        const response = await Promise.race([apiRequest, timeoutPromise]);
        
        const duration = Date.now() - startTime;
        logger.logAIRequest(modelInfo.name, instructionPrompt, duration, true);

        // Parse the response
        const generatedText = response.generated_text || response[0]?.generated_text || '';
        
        if (!generatedText || generatedText.trim().length === 0) {
          throw new Error('Empty response from model');
        }
        
        const questions = this.parseQuestions(generatedText, prompt);

        const result = {
          questions,
          metadata: {
            generated_at: new Date().toISOString(),
            count: questions.length,
            provider: 'huggingface-local',
            model: modelInfo.name,
            duration: `${duration}ms`,
            attempts: attempt,
            note: model !== 'gpt2' ? `Fallback used: ${modelInfo.name}` : undefined,
          },
        };

        // Only cache if we got questions
        if (questions.length > 0) {
          await cacheService.set(cacheKey, result);
        }

        return result;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.warn(`Model ${modelInfo.name} attempt ${attempt} failed:`, error.message);
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          logger.logAIRequest(modelInfo.name, instructionPrompt, duration, false);
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        logger.info(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
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
   * Generate fallback mock questions when all models fail
   */
  generateFallbackQuestions(topic, count, difficulty) {
    const MOCK_QUESTION_BANK = {
      javascript: [
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: { A: "var myVar;", B: "let myVar;", C: "const myVar;", D: "All of the above" },
          correctAnswer: "D",
          explanation: "`var`, `let`, and `const` are all valid ways to declare variables in JavaScript, each with different scoping rules."
        },
        {
          question: "Which of these is NOT a primitive data type in JavaScript?",
          options: { A: "String", B: "Number", C: "Object", D: "Boolean" },
          correctAnswer: "C",
          explanation: "Object is a composite data type, not a primitive type."
        },
        {
          question: "What does the '===' operator do in JavaScript?",
          options: { A: "Checks for equality only", B: "Checks for strict equality (value and type)", C: "Assigns a value", D: "Compares references" },
          correctAnswer: "B",
          explanation: "The '===' operator checks for strict equality, comparing both value and type without type coercion."
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: { A: "push()", B: "pop()", C: "shift()", D: "unshift()" },
          correctAnswer: "A",
          explanation: "The push() method adds one or more elements to the end of an array and returns the new length."
        },
        {
          question: "What is the output of 'typeof NaN' in JavaScript?",
          options: { A: "'NaN'", B: "'undefined'", C: "'number'", D: "'object'" },
          correctAnswer: "C",
          explanation: "Despite being 'Not a Number', NaN is of type 'number' in JavaScript."
        }
      ],
      python: [
        {
          question: "Which of these is the correct way to create a list in Python?",
          options: { A: "list = {1, 2, 3}", B: "list = [1, 2, 3]", C: "list = (1, 2, 3)", D: "list = <1, 2, 3>" },
          correctAnswer: "B",
          explanation: "Square brackets [] are used to create lists in Python."
        },
        {
          question: "What does the 'len()' function do in Python?",
          options: { A: "Returns the length of an object", B: "Creates a new list", C: "Sorts a list", D: "Removes an element" },
          correctAnswer: "A",
          explanation: "The len() function returns the number of items in an object (list, string, tuple, etc.)."
        },
        {
          question: "Which keyword is used to define a function in Python?",
          options: { A: "function", B: "def", C: "func", D: "define" },
          correctAnswer: "B",
          explanation: "The 'def' keyword is used to define functions in Python."
        }
      ],
      react: [
        {
          question: "What is JSX in React?",
          options: { A: "A JavaScript library", B: "A syntax extension for JavaScript", C: "A CSS framework", D: "A database" },
          correctAnswer: "B",
          explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files."
        },
        {
          question: "Which hook is used to manage state in functional components?",
          options: { A: "useEffect", B: "useContext", C: "useState", D: "useReducer" },
          correctAnswer: "C",
          explanation: "The useState hook is the primary way to add state to functional components in React."
        }
      ],
      history: [
        {
          question: "Who was the first President of the United States?",
          options: { A: "Thomas Jefferson", B: "Abraham Lincoln", C: "George Washington", D: "John Adams" },
          correctAnswer: "C",
          explanation: "George Washington was the first President, serving from 1789 to 1797."
        },
        {
          question: "When did World War II end?",
          options: { A: "1944", B: "1945", C: "1946", D: "1947" },
          correctAnswer: "B",
          explanation: "World War II ended in 1945 with Japan's surrender in September."
        },
        {
          question: "Which empire was ruled by Julius Caesar?",
          options: { A: "Greek Empire", B: "Roman Empire", C: "Persian Empire", D: "Ottoman Empire" },
          correctAnswer: "B",
          explanation: "Julius Caesar was a Roman general and statesman who played a critical role in the Roman Empire."
        }
      ],
      science: [
        {
          question: "What is the chemical symbol for water?",
          options: { A: "H2O", B: "CO2", C: "O2", D: "NaCl" },
          correctAnswer: "A",
          explanation: "Water is composed of two hydrogen atoms and one oxygen atom, hence H2O."
        },
        {
          question: "What is the speed of light in vacuum?",
          options: { A: "300,000 km/s", B: "299,792,458 m/s", C: "186,000 miles/s", D: "Both A and B" },
          correctAnswer: "D",
          explanation: "The speed of light is approximately 300,000 km/s or exactly 299,792,458 m/s."
        },
        {
          question: "Which planet is closest to the Sun?",
          options: { A: "Venus", B: "Earth", C: "Mercury", D: "Mars" },
          correctAnswer: "C",
          explanation: "Mercury is the innermost planet in our solar system, closest to the Sun."
        }
      ],
      math: [
        {
          question: "What is the value of π (pi) approximately?",
          options: { A: "3.14", B: "3.14159", C: "22/7", D: "All of the above are approximations" },
          correctAnswer: "D",
          explanation: "π is an irrational number, so all given options are approximations of its true value."
        },
        {
          question: "What is the Pythagorean theorem?",
          options: { A: "a + b = c", B: "a² + b² = c²", C: "a × b = c", D: "a - b = c" },
          correctAnswer: "B",
          explanation: "The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse."
        }
      ],
      geography: [
        {
          question: "What is the capital of Australia?",
          options: { A: "Sydney", B: "Melbourne", C: "Canberra", D: "Perth" },
          correctAnswer: "C",
          explanation: "Canberra is the capital city of Australia, though Sydney and Melbourne are larger cities."
        },
        {
          question: "Which is the longest river in the world?",
          options: { A: "Amazon River", B: "Nile River", C: "Mississippi River", D: "Yangtze River" },
          correctAnswer: "B",
          explanation: "The Nile River is traditionally considered the longest river in the world at about 6,650 km."
        }
      ]
    };
    
    const questions = [];
    const topicKey = topic.toLowerCase();
    const bank = MOCK_QUESTION_BANK[topicKey] || [];

    for (let i = 1; i <= count; i++) {
      if (bank.length > 0 && i <= bank.length) {
        // Use questions from the bank first
        questions.push({ ...bank[i - 1], id: i, difficulty, topic });
      } else {
        // Generate more generic but realistic questions if the bank is exhausted or the topic is not found
        const correctAnswer = ['A', 'B', 'C', 'D'][i % 4];
        questions.push({
          id: i,
          question: `What is a key concept in ${topic}? (Mock Question)`,
          options: {
            A: `An introductory concept for ${topic}`,
            B: `A more advanced concept for ${topic}`,
            C: `A related but incorrect concept for ${topic}`,
            D: `A completely unrelated concept`,
          },
          correctAnswer,
          explanation: `This is a generated mock explanation. The correct answer for this placeholder question is ${correctAnswer}.`,
          difficulty,
          topic: topic,
        });
      }
    }

    return {
      questions,
      metadata: {
        generated_at: new Date().toISOString(),
        count: questions.length,
        provider: 'fallback-mock',
        model: 'mock-question-bank',
        duration: '0ms',
        note: 'AI models failed; these are placeholder questions from the internal bank.',
      },
    };
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
