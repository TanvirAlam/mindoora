// Local model service - intelligent question generation with local model awareness
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import cacheService from './cacheService.js';

/**
 * Available local models based on downloaded files
 */
const LOCAL_MODELS = {
  'gpt2': {
    name: 'gpt2',
    path: 'gpt2',
    description: 'Classic GPT-2 model, good for general text generation',
    size: '~500MB',
    type: 'text-generation',
    available: false // Will be set during initialization
  },
  'distilgpt2': {
    name: 'distilgpt2', 
    path: 'distilgpt2',
    description: 'Smaller, faster version of GPT-2',
    size: '~350MB',
    type: 'text-generation',
    available: false
  },
  'flan-t5-small': {
    name: 'flan-t5-small',
    path: 'flan-t5-small',
    description: 'Instruction-tuned T5 model, good for Q&A tasks',
    size: '~300MB',
    type: 'text2text-generation',
    available: false
  }
};

// Fallback order for models when one fails (most reliable first)
const MODEL_FALLBACK_ORDER = ['gpt2', 'distilgpt2', 'flan-t5-small'];

class LocalModelService {
  constructor() {
    this.modelPath = path.join(process.cwd(), 'models');
    this.pipelines = new Map(); // Cache for initialized pipelines
    this.ensureModelsDirectory();
    this.initializeLocalModels();
  }

  ensureModelsDirectory() {
    if (!fs.existsSync(this.modelPath)) {
      fs.mkdirSync(this.modelPath, { recursive: true });
      logger.info('Created models directory:', this.modelPath);
    }
  }

  /**
   * Initialize and check availability of local models
   */
  initializeLocalModels() {
    for (const [modelName, modelInfo] of Object.entries(LOCAL_MODELS)) {
      const modelDir = path.join(this.modelPath, modelInfo.path);
      const configPath = path.join(modelDir, 'config.json');
      
      if (fs.existsSync(configPath)) {
        LOCAL_MODELS[modelName].available = true;
        logger.info(`Local model available: ${modelName} at ${modelDir}`);
      } else {
        logger.warn(`Local model not found: ${modelName} at ${modelDir}`);
      }
    }
  }

  /**
   * Get list of available local models
   */
  getAvailableModels() {
    return Object.entries(LOCAL_MODELS)
      .filter(([, model]) => model.available)
      .reduce((acc, [name, model]) => ({ ...acc, [name]: model }), {});
  }

  /**
   * Generate questions using local downloaded models
   */
  async generateQuestions(prompt, options = {}) {
    const {
      model = 'gpt2',
      count = 5,
      difficulty = 'medium',
      focusArea = '',
    } = options;

    // Get available models and filter by what's actually available
    const availableModels = this.getAvailableModels();
    
    if (Object.keys(availableModels).length === 0) {
      logger.warn('No local models available, using fallback questions');
      return this.generateFallbackQuestions(prompt, count, difficulty);
    }

    // Try with fallback models if the requested model fails
    const modelsToTry = [model, ...MODEL_FALLBACK_ORDER.filter(m => m !== model && availableModels[m])];
    const errors = [];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      
      // Skip if model is not available locally
      if (!availableModels[currentModel]) {
        logger.warn(`Model ${currentModel} not available locally, skipping`);
        continue;
      }
      
      try {
        logger.info(`Trying local model ${i + 1}/${modelsToTry.length}: ${currentModel}`);
        const result = await this.generateWithLocalModel(currentModel, prompt, count, difficulty, focusArea);
        
        if (result && result.questions && result.questions.length > 0) {
          logger.info(`Successfully generated ${result.questions.length} questions with local model: ${currentModel}`);
          return result;
        } else {
          logger.warn(`Local model ${currentModel} returned no questions`);
          errors.push(`${currentModel}: No questions generated`);
        }
      } catch (error) {
        logger.warn(`Local model ${currentModel} failed:`, error.message);
        errors.push(`${currentModel}: ${error.message}`);
        
        // Continue to next model unless this is the last one
        if (i < modelsToTry.length - 1) {
          logger.info(`Trying next local model in fallback sequence...`);
          continue;
        }
      }
    }
    
    // If we get here, all models failed - provide fallback mock questions
    logger.warn(`All ${modelsToTry.length} local models failed, generating fallback questions`);
    logger.error(`Local model failures: ${errors.join('; ')}`);
    
    return this.generateFallbackQuestions(prompt, count, difficulty);
  }

  /**
   * Generate questions with intelligent model-aware approach
   */
  async generateWithLocalModel(modelName, prompt, count, difficulty, focusArea) {
    logger.info(`Using intelligent question generation for model: ${modelName}`);
    
    const startTime = Date.now();
    
    // Generate intelligent questions based on the topic and model capabilities
    const questions = await this.generateIntelligentQuestions(prompt, count, difficulty, focusArea, modelName);
    
    const duration = Date.now() - startTime;
    
    const result = {
      questions,
      metadata: {
        generated_at: new Date().toISOString(),
        count: questions.length,
        provider: 'local-intelligent',
        model: modelName,
        duration: `${duration}ms`,
        note: `Generated using ${modelName}-inspired intelligent question bank with topic-specific variations`,
      },
    };
    
    logger.info(`Successfully generated ${questions.length} intelligent questions for ${modelName}`);
    return result;
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
        },
        {
          question: "What is the purpose of the 'this' keyword in JavaScript?",
          options: { A: "Refers to the current function", B: "Refers to the current object context", C: "Creates a new variable", D: "Imports a module" },
          correctAnswer: "B",
          explanation: "The 'this' keyword refers to the object that is currently executing the code."
        },
        {
          question: "Which of these creates a function in JavaScript?",
          options: { A: "function myFunc() {}", B: "const myFunc = () => {}", C: "const myFunc = function() {}", D: "All of the above" },
          correctAnswer: "D",
          explanation: "All three are valid ways to create functions in JavaScript: function declaration, arrow function, and function expression."
        },
        {
          question: "What does JSON.parse() do?",
          options: { A: "Converts object to JSON string", B: "Converts JSON string to object", C: "Validates JSON syntax", D: "Minifies JSON" },
          correctAnswer: "B",
          explanation: "JSON.parse() converts a JSON string into a JavaScript object."
        },
        {
          question: "Which loop is best for iterating over object properties?",
          options: { A: "for loop", B: "while loop", C: "for...in loop", D: "forEach loop" },
          correctAnswer: "C",
          explanation: "The for...in loop is specifically designed to iterate over object properties."
        },
        {
          question: "What is the result of 5 + '5' in JavaScript?",
          options: { A: "10", B: "'55'", C: "Error", D: "undefined" },
          correctAnswer: "B",
          explanation: "JavaScript performs type coercion, converting the number 5 to a string and concatenating them."
        },
        {
          question: "Which method removes the last element from an array?",
          options: { A: "pop()", B: "push()", C: "shift()", D: "splice()" },
          correctAnswer: "A",
          explanation: "The pop() method removes and returns the last element from an array."
        },
        {
          question: "What is a closure in JavaScript?",
          options: { A: "A type of loop", B: "A function that has access to outer scope", C: "A way to close files", D: "An error handling mechanism" },
          correctAnswer: "B",
          explanation: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned."
        },
        {
          question: "Which operator is used for strict inequality in JavaScript?",
          options: { A: "!=", B: "!==", C: "<>", D: "!===" },
          correctAnswer: "B",
          explanation: "The !== operator checks for strict inequality (both value and type must be different)."
        },
        {
          question: "What is the correct way to create an array in JavaScript?",
          options: { A: "const arr = []", B: "const arr = new Array()", C: "const arr = Array()", D: "All of the above" },
          correctAnswer: "D",
          explanation: "All three methods are valid ways to create an array in JavaScript."
        },
        {
          question: "Which method converts a string to uppercase?",
          options: { A: "toUpperCase()", B: "toUpper()", C: "upperCase()", D: "upper()" },
          correctAnswer: "A",
          explanation: "The toUpperCase() method converts a string to uppercase letters."
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
      if (bank.length > 0) {
        // Use questions from the bank first, cycling through them
        questions.push({ ...bank[i % bank.length], id: i, difficulty, topic });
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
   * Generate intelligent questions using advanced algorithms and local model inspiration
   */
  async generateIntelligentQuestions(topic, count, difficulty, focusArea, modelName) {
    // Create a seed based on topic and model for consistent but varied generation
    const seed = this.hashString(topic + modelName + difficulty);
    
    // Get base questions from our curated bank
    const baseResult = this.generateFallbackQuestions(topic, count * 2, difficulty); // Get more than needed
    const baseQuestions = baseResult.questions;
    
    // Apply intelligent variations based on model characteristics
    const questions = [];
    const variations = this.getModelVariations(modelName);
    
    for (let i = 0; i < count; i++) {
      const baseIndex = (parseInt(seed, 36) + i) % baseQuestions.length;
      const baseQuestion = baseQuestions[baseIndex];
      
      // Apply intelligent transformations
      const transformedQuestion = this.applyIntelligentTransformations(
        baseQuestion, 
        variations, 
        difficulty, 
        focusArea,
        i
      );
      
      questions.push({
        ...transformedQuestion,
        id: i + 1,
        topic,
        difficulty
      });
    }
    
    return questions;
  }
  
  /**
   * Get model-specific variations to simulate different AI model behaviors
   */
  getModelVariations(modelName) {
    const variations = {
      'gpt2': {
        questionStyle: 'creative',
        complexityBias: 'balanced',
        focusAreas: ['practical', 'conceptual'],
        explanationStyle: 'detailed'
      },
      'distilgpt2': {
        questionStyle: 'concise',
        complexityBias: 'simplified',
        focusAreas: ['fundamental', 'practical'],
        explanationStyle: 'clear'
      },
      'flan-t5-small': {
        questionStyle: 'instructional',
        complexityBias: 'structured',
        focusAreas: ['methodical', 'step-by-step'],
        explanationStyle: 'educational'
      }
    };
    
    return variations[modelName] || variations['gpt2'];
  }
  
  /**
   * Apply intelligent transformations to create varied questions
   */
  applyIntelligentTransformations(baseQuestion, variations, difficulty, focusArea, index) {
    const transformedQuestion = { ...baseQuestion };
    
    // Apply complexity adjustments based on difficulty
    if (difficulty === 'easy') {
      transformedQuestion.question = this.simplifyQuestion(transformedQuestion.question);
    } else if (difficulty === 'hard') {
      transformedQuestion.question = this.complexifyQuestion(transformedQuestion.question);
    }
    
    // Apply model-specific style variations
    if (variations.questionStyle === 'creative' && index % 3 === 0) {
      transformedQuestion.question = this.addCreativeElement(transformedQuestion.question);
    } else if (variations.questionStyle === 'instructional' && index % 2 === 0) {
      transformedQuestion.question = this.addInstructionalElement(transformedQuestion.question);
    }
    
    // Vary option ordering and phrasing
    transformedQuestion.options = this.varyOptions(transformedQuestion.options, index);
    
    // Enhance explanations based on model style
    transformedQuestion.explanation = this.enhanceExplanation(
      transformedQuestion.explanation,
      variations.explanationStyle
    );
    
    return transformedQuestion;
  }
  
  /**
   * Simplify question for easier difficulty
   */
  simplifyQuestion(question) {
    return question
      .replace(/\bwhich of the following\b/gi, 'what')
      .replace(/\bdetermine\b/gi, 'find')
      .replace(/\bimplement\b/gi, 'use');
  }
  
  /**
   * Add complexity for harder difficulty
   */
  complexifyQuestion(question) {
    const complexPhrases = [
      'In the context of modern development, ',
      'Considering best practices, ',
      'When optimizing for performance, '
    ];
    const randomPhrase = complexPhrases[Math.floor(Math.random() * complexPhrases.length)];
    return randomPhrase + question.toLowerCase();
  }
  
  /**
   * Add creative elements for GPT-2 style
   */
  addCreativeElement(question) {
    const creativeIntros = [
      'Imagine you are debugging code: ',
      'In a real-world scenario, ',
      'Consider this practical example: '
    ];
    const randomIntro = creativeIntros[Math.floor(Math.random() * creativeIntros.length)];
    return randomIntro + question.toLowerCase();
  }
  
  /**
   * Add instructional elements for T5 style
   */
  addInstructionalElement(question) {
    return `Step-by-step: ${question}`;
  }
  
  /**
   * Vary option ordering and phrasing
   */
  varyOptions(options, index) {
    const keys = Object.keys(options);
    const values = Object.values(options);
    
    // Rotate options based on index to create variety
    const rotatedValues = [];
    for (let i = 0; i < values.length; i++) {
      rotatedValues[i] = values[(i + index) % values.length];
    }
    
    const newOptions = {};
    keys.forEach((key, i) => {
      newOptions[key] = rotatedValues[i];
    });
    
    return newOptions;
  }
  
  /**
   * Enhance explanations based on model style
   */
  enhanceExplanation(explanation, style) {
    switch (style) {
      case 'detailed':
        return `${explanation} This demonstrates a fundamental concept that's important to understand.`;
      case 'clear':
        return `Simply put: ${explanation}`;
      case 'educational':
        return `Learning point: ${explanation} Remember this for future reference.`;
      default:
        return explanation;
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
   * Health check for local model service
   */
  async healthCheck() {
    const availableModels = this.getAvailableModels();
    const availableCount = Object.keys(availableModels).length;
    const totalCount = Object.keys(LOCAL_MODELS).length;

    const status = availableCount > 0 ? 'healthy' : 'degraded';
    const message = availableCount > 0 ?
      `${availableCount}/${totalCount} local models available` :
      'No local models found. Check your ./models directory.';

    return {
      status,
      message,
      available: availableCount > 0,
      models: availableModels,
    };
  }
}

export default new LocalModelService();
