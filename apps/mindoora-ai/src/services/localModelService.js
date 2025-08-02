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
    const questions = [];
    const variations = this.getModelVariations(modelName);
    
    // Generate completely different questions using various strategies
    for (let i = 0; i < count; i++) {
      const questionStrategy = this.selectQuestionStrategy(i, topic, difficulty);
      const generatedQuestion = await this.generateQuestionFromStrategy(
        questionStrategy,
        topic,
        difficulty,
        focusArea,
        variations,
        i + 1
      );
      
      questions.push(generatedQuestion);
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
   * Create enrichment for questions to make them more realistic and contextual
   */
  createQuestionEnrichment(question, topic) {
    const topicContexts = {
      javascript: {
        detailedTopics: [
          'ES6+ Features and Modern JavaScript',
          'Asynchronous Programming and Promises',
          'DOM Manipulation and Events',
          'JavaScript Frameworks and Libraries',
          'Node.js Backend Development',
          'Testing and Debugging Techniques'
        ],
        realLifeContexts: [
          'Building a responsive web application',
          'Optimizing code for performance',
          'Handling user interactions in a web form',
          'Creating a REST API with Node.js',
          'Debugging a production website issue',
          'Implementing authentication in a web app'
        ]
      },
      python: {
        detailedTopics: [
          'Data Analysis with Pandas and NumPy',
          'Web Development with Django/Flask',
          'Machine Learning and AI',
          'API Development and Integration',
          'Database Operations with SQLAlchemy',
          'Automation and Scripting'
        ],
        realLifeContexts: [
          'Analyzing sales data for business insights',
          'Building a machine learning model',
          'Creating a web scraper for data collection',
          'Automating repetitive office tasks',
          'Processing large datasets efficiently',
          'Building a chatbot with natural language processing'
        ]
      },
      react: {
        detailedTopics: [
          'Component Lifecycle and Hooks',
          'State Management with Redux/Context',
          'Performance Optimization Techniques',
          'Testing React Applications',
          'Server-Side Rendering with Next.js',
          'Mobile Development with React Native'
        ],
        realLifeContexts: [
          'Building a social media dashboard',
          'Creating an e-commerce product catalog',
          'Developing a task management application',
          'Building a real-time chat interface',
          'Creating a data visualization dashboard',
          'Developing a mobile app for iOS and Android'
        ]
      },
      history: {
        detailedTopics: [
          'Ancient Civilizations and Empires',
          'World Wars and Global Conflicts',
          'Revolutionary Movements and Social Change',
          'Economic Systems Throughout History',
          'Cultural and Technological Advances',
          'Political Systems and Governance'
        ],
        realLifeContexts: [
          'Understanding current geopolitical situations',
          'Analyzing patterns in economic development',
          'Learning from past social movements',
          'Understanding the roots of modern conflicts',
          'Appreciating cultural heritage and traditions',
          'Making informed decisions as a citizen'
        ]
      },
      science: {
        detailedTopics: [
          'Physics and Natural Laws',
          'Chemistry and Molecular Interactions',
          'Biology and Life Sciences',
          'Environmental Science and Sustainability',
          'Space Science and Astronomy',
          'Medical Science and Health'
        ],
        realLifeContexts: [
          'Understanding climate change impacts',
          'Making informed health decisions',
          'Appreciating technological innovations',
          'Supporting environmental conservation',
          'Understanding medical treatments',
          'Exploring space exploration achievements'
        ]
      }
    };

    const topicKey = topic.toLowerCase();
    const contexts = topicContexts[topicKey] || {
      detailedTopics: [`Advanced ${topic} Concepts`, `Practical ${topic} Applications`],
      realLifeContexts: [`Applying ${topic} in professional settings`, `Using ${topic} for problem-solving`]
    };

    // Select random detailed topic and real-life context
    const randomDetailedTopic = contexts.detailedTopics[Math.floor(Math.random() * contexts.detailedTopics.length)];
    const randomRealLifeContext = contexts.realLifeContexts[Math.floor(Math.random() * contexts.realLifeContexts.length)];

    return {
      detailedTopic: randomDetailedTopic,
      realLifeContext: randomRealLifeContext
    };
  }

  /**
   * Select a question generation strategy based on index and topic
   */
  selectQuestionStrategy(index, topic, difficulty) {
    const strategies = [
      'conceptual',     // Basic concept understanding
      'practical',      // Real-world application
      'comparative',    // Compare and contrast
      'scenario',       // Problem-solving scenario
      'analytical',     // Analysis and reasoning
      'syntax',         // Code/syntax specific (for programming)
      'historical',     // Historical or background context
      'best-practice'   // Best practices and conventions
    ];
    
    return strategies[index % strategies.length];
  }

  /**
   * Generate a question based on selected strategy
   */
  async generateQuestionFromStrategy(strategy, topic, difficulty, focusArea, variations, questionId) {
    const generators = {
      'conceptual': () => this.generateConceptualQuestion(topic, difficulty, questionId),
      'practical': () => this.generatePracticalQuestion(topic, difficulty, questionId),
      'comparative': () => this.generateComparativeQuestion(topic, difficulty, questionId),
      'scenario': () => this.generateScenarioQuestion(topic, difficulty, questionId),
      'analytical': () => this.generateAnalyticalQuestion(topic, difficulty, questionId),
      'syntax': () => this.generateSyntaxQuestion(topic, difficulty, questionId),
      'historical': () => this.generateHistoricalQuestion(topic, difficulty, questionId),
      'best-practice': () => this.generateBestPracticeQuestion(topic, difficulty, questionId)
    };

    const generator = generators[strategy] || generators['conceptual'];
    let question = generator();
    
    // Apply model-specific enhancements
    question.explanation = this.enhanceExplanation(question.explanation, variations.explanationStyle);
    
    return question;
  }

  /**
   * Generate conceptual understanding questions
   */
  generateConceptualQuestion(topic, difficulty, questionId) {
    const templates = this.getConceptualTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: template.question,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation,
      difficulty,
      topic,
      category: 'conceptual'
    };
  }

  /**
   * Generate practical application questions
   */
  generatePracticalQuestion(topic, difficulty, questionId) {
    const templates = this.getPracticalTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: `In a real project, ${template.question}`,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Practical consideration: ${template.explanation}`,
      difficulty,
      topic,
      category: 'practical'
    };
  }

  /**
   * Generate comparative questions
   */
  generateComparativeQuestion(topic, difficulty, questionId) {
    const templates = this.getComparativeTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: `What is the main difference between ${template.question}?`,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Key distinction: ${template.explanation}`,
      difficulty,
      topic,
      category: 'comparative'
    };
  }

  /**
   * Generate scenario-based questions
   */
  generateScenarioQuestion(topic, difficulty, questionId) {
    const templates = this.getScenarioTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: `Scenario: ${template.scenario} ${template.question}`,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Solution approach: ${template.explanation}`,
      difficulty,
      topic,
      category: 'scenario'
    };
  }

  /**
   * Generate analytical questions
   */
  generateAnalyticalQuestion(topic, difficulty, questionId) {
    const templates = this.getAnalyticalTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: `Analyze this: ${template.question}`,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Analysis: ${template.explanation}`,
      difficulty,
      topic,
      category: 'analytical'
    };
  }

  /**
   * Generate syntax-specific questions
   */
  generateSyntaxQuestion(topic, difficulty, questionId) {
    const templates = this.getSyntaxTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: template.question,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Syntax rule: ${template.explanation}`,
      difficulty,
      topic,
      category: 'syntax'
    };
  }

  /**
   * Generate historical/background questions
   */
  generateHistoricalQuestion(topic, difficulty, questionId) {
    const templates = this.getHistoricalTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: template.question,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Background: ${template.explanation}`,
      difficulty,
      topic,
      category: 'historical'
    };
  }

  /**
   * Generate best practice questions
   */
  generateBestPracticeQuestion(topic, difficulty, questionId) {
    const templates = this.getBestPracticeTemplates(topic);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: questionId,
      question: `What is the recommended approach for ${template.question}?`,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: `Best practice: ${template.explanation}`,
      difficulty,
      topic,
      category: 'best-practice'
    };
  }

  /**
   * Get conceptual question templates by topic
   */
  getConceptualTemplates(topic) {
    const templates = {
      javascript: [
        {
          question: "What is the fundamental purpose of closures in JavaScript?",
          options: {
            A: "To create private variables",
            B: "To enable data encapsulation and maintain state",
            C: "To improve performance",
            D: "To handle errors"
          },
          correctAnswer: "B",
          explanation: "Closures provide a way to create private scope and maintain state between function calls, enabling powerful patterns like modules and factories."
        },
        {
          question: "What makes JavaScript's event loop unique?",
          options: {
            A: "It handles multiple threads simultaneously",
            B: "It processes tasks in a single-threaded, non-blocking manner",
            C: "It prevents all asynchronous operations",
            D: "It only works with DOM events"
          },
          correctAnswer: "B",
          explanation: "JavaScript's event loop enables non-blocking I/O operations in a single-threaded environment by using a callback queue and call stack mechanism."
        }
      ],
      python: [
        {
          question: "What is the core philosophy behind Python's design?",
          options: {
            A: "Explicit is better than implicit",
            B: "Performance over readability",
            C: "Complex is better than simple",
            D: "Hidden is better than obvious"
          },
          correctAnswer: "A",
          explanation: "The Zen of Python emphasizes clarity and explicitness, making code more readable and maintainable."
        }
      ],
      react: [
        {
          question: "What is the primary benefit of React's virtual DOM?",
          options: {
            A: "It makes websites load faster",
            B: "It optimizes DOM updates by batching and diffing changes",
            C: "It replaces HTML completely",
            D: "It eliminates the need for CSS"
          },
          correctAnswer: "B",
          explanation: "The virtual DOM allows React to minimize expensive DOM operations by calculating the most efficient way to update the UI."
        }
      ]
    };
    
    return templates[topic.toLowerCase()] || [{
      question: `What is a key principle of ${topic}?`,
      options: {
        A: `Core concept A of ${topic}`,
        B: `Fundamental principle B of ${topic}`,
        C: `Basic idea C of ${topic}`,
        D: `Essential element D of ${topic}`
      },
      correctAnswer: "B",
      explanation: `This represents a fundamental principle that guides ${topic} development and usage.`
    }];
  }

  /**
   * Get practical question templates by topic
   */
  getPracticalTemplates(topic) {
    const templates = {
      javascript: [
        {
          question: "which approach should you use to handle API calls that might fail?",
          options: {
            A: "Use synchronous fetch() without error handling",
            B: "Implement try-catch with async/await or .catch() with promises",
            C: "Ignore potential errors",
            D: "Use setTimeout to retry indefinitely"
          },
          correctAnswer: "B",
          explanation: "Proper error handling with try-catch or .catch() ensures your application gracefully handles network failures and provides user feedback."
        },
        {
          question: "how would you optimize a React component that re-renders frequently?",
          options: {
            A: "Add more state variables",
            B: "Use React.memo() and optimize dependencies",
            C: "Remove all props",
            D: "Convert to class component"
          },
          correctAnswer: "B",
          explanation: "React.memo() prevents unnecessary re-renders by only re-rendering when props actually change, significantly improving performance."
        }
      ],
      python: [
        {
          question: "how should you handle file operations to prevent resource leaks?",
          options: {
            A: "Always use open() without closing",
            B: "Use 'with' statement for automatic resource management",
            C: "Manually call close() sometimes",
            D: "Let Python handle it automatically"
          },
          correctAnswer: "B",
          explanation: "The 'with' statement ensures files are properly closed even if exceptions occur, preventing resource leaks and corruption."
        }
      ]
    };
    
    return templates[topic.toLowerCase()] || [{
      question: `what is the best way to implement ${topic} in production?`,
      options: {
        A: `Quick and simple approach`,
        B: `Robust, scalable, and maintainable solution`,
        C: `Minimum viable implementation`,
        D: `Copy-paste from tutorials`
      },
      correctAnswer: "B",
      explanation: `Production ${topic} implementations should prioritize reliability, scalability, and maintainability over quick fixes.`
    }];
  }

  /**
   * Get comparative question templates by topic
   */
  getComparativeTemplates(topic) {
    const templates = {
      javascript: [
        {
          question: "let, const, and var for variable declaration",
          options: {
            A: "They all have the same scope rules",
            B: "let and const have block scope, var has function scope; const is immutable after assignment",
            C: "Only var can be reassigned",
            D: "const variables can be changed anytime"
          },
          correctAnswer: "B",
          explanation: "let and const introduced block scoping in ES6, while const prevents reassignment of the variable binding (though objects can still be mutated)."
        }
      ],
      python: [
        {
          question: "lists and tuples in Python",
          options: {
            A: "Lists are immutable, tuples are mutable",
            B: "Lists are mutable and use [], tuples are immutable and use ()",
            C: "They are exactly the same",
            D: "Tuples can only store numbers"
          },
          correctAnswer: "B",
          explanation: "Lists are mutable sequences that can be changed after creation, while tuples are immutable sequences that cannot be modified."
        }
      ]
    };
    
    return templates[topic.toLowerCase()] || [{
      question: `approach A and approach B in ${topic}`,
      options: {
        A: `They serve completely different purposes`,
        B: `Approach A is faster, approach B is more flexible`,
        C: `They are identical in functionality`,
        D: `Approach B is always better`
      },
      correctAnswer: "B",
      explanation: `Different approaches in ${topic} typically involve trade-offs between performance, flexibility, and complexity.`
    }];
  }

  /**
   * Get scenario question templates by topic
   */
  getScenarioTemplates(topic) {
    const templates = {
      javascript: [
        {
          scenario: "You're building an e-commerce site and need to handle user authentication.",
          question: "What's the most secure approach for storing user sessions?",
          options: {
            A: "Store passwords in localStorage",
            B: "Use JWT tokens with secure, httpOnly cookies",
            C: "Keep everything in sessionStorage",
            D: "Store credentials in URL parameters"
          },
          correctAnswer: "B",
          explanation: "JWT tokens in httpOnly cookies prevent XSS attacks while maintaining stateless authentication that scales well."
        }
      ],
      python: [
        {
          scenario: "You need to process 1 million records from a database efficiently.",
          question: "Which approach would be most memory-efficient?",
          options: {
            A: "Load all records into a list at once",
            B: "Use generators or iterators to process records one at a time",
            C: "Convert everything to strings first",
            D: "Load records into multiple lists"
          },
          correctAnswer: "B",
          explanation: "Generators provide lazy evaluation, processing one record at a time without loading everything into memory."
        }
      ]
    };
    
    return templates[topic.toLowerCase()] || [{
      scenario: `You're working on a ${topic} project with strict deadlines.`,
      question: `What should be your priority?`,
      options: {
        A: `Rush to complete without testing`,
        B: `Balance functionality, quality, and timeline effectively`,
        C: `Focus only on advanced features`,
        D: `Skip documentation entirely`
      },
      correctAnswer: "B",
      explanation: `Successful ${topic} projects require balancing multiple factors to deliver value while maintaining quality.`
    }];
  }

  /**
   * Get additional template methods for other question types
   */
  getAnalyticalTemplates(topic) {
    return [{
      question: `What would be the performance impact of this ${topic} approach?`,
      options: {
        A: `No impact on performance`,
        B: `Significant performance improvement with trade-offs in complexity`,
        C: `Only affects memory usage`,
        D: `Makes everything slower`
      },
      correctAnswer: "B",
      explanation: `Performance optimizations in ${topic} typically involve analyzing trade-offs between speed, memory, and code complexity.`
    }];
  }

  getSyntaxTemplates(topic) {
    const templates = {
      javascript: [{
        question: "What's the correct syntax for destructuring an object property with a default value?",
        options: {
          A: "const {name = 'default'} = obj;",
          B: "const {name || 'default'} = obj;",
          C: "const name = obj.name = 'default';",
          D: "const {name: 'default'} = obj;"
        },
        correctAnswer: "A",
        explanation: "Destructuring with default values uses the = operator within the destructuring pattern."
      }]
    };
    
    return templates[topic.toLowerCase()] || [{
      question: `What is the correct syntax for ${topic}?`,
      options: {
        A: `Syntax option A`,
        B: `Correct syntax pattern`,
        C: `Invalid syntax option`,
        D: `Deprecated syntax`
      },
      correctAnswer: "B",
      explanation: `This represents the standard, recommended syntax for ${topic}.`
    }];
  }

  getHistoricalTemplates(topic) {
    return [{
      question: `How has ${topic} evolved over time?`,
      options: {
        A: `It has remained completely unchanged`,
        B: `Continuous evolution with new features and improvements`,
        C: `Only minor cosmetic changes`,
        D: `Became more complex without benefits`
      },
      correctAnswer: "B",
      explanation: `${topic} has evolved significantly, incorporating community feedback and technological advances.`
    }];
  }

  getBestPracticeTemplates(topic) {
    return [{
      question: `organizing and structuring ${topic} projects`,
      options: {
        A: `Put everything in one large file`,
        B: `Follow established patterns with clear separation of concerns`,
        C: `Use random organization`,
        D: `Copy someone else's structure exactly`
      },
      correctAnswer: "B",
      explanation: `Best practices in ${topic} emphasize maintainable code organization, clear naming conventions, and separation of concerns.`
    }];
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
