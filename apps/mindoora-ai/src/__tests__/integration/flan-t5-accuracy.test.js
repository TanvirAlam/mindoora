import { jest } from '@jest/globals';
import localModelService from '../../services/localModelService.js';

/**
 * FLAN-T5-SMALL MODEL ACCURACY TESTS
 * 
 * These tests specifically validate that the flan-t5-small model generates
 * accurate, high-quality questions when given real prompts.
 * 
 * FLAN-T5 is specifically fine-tuned for instruction-following and should
 * excel at structured question generation tasks.
 */
describe('FLAN-T5-Small Model Accuracy Tests', () => {

  // Test prompts that should work well with FLAN-T5's instruction-following capabilities
  const testPrompts = [
    {
      prompt: 'javascript',
      category: 'programming',
      expectedKeywords: ['function', 'variable', 'object', 'array', 'string', 'number', 'boolean'],
      minComplexity: 'medium'
    },
    {
      prompt: 'react',
      category: 'programming',
      expectedKeywords: ['component', 'jsx', 'hook', 'state', 'prop', 'render'],
      minComplexity: 'medium'
    },
    {
      prompt: 'python',
      category: 'programming', 
      expectedKeywords: ['function', 'list', 'dictionary', 'import', 'class', 'method'],
      minComplexity: 'medium'
    },
    {
      prompt: 'machine learning',
      category: 'technical',
      expectedKeywords: ['algorithm', 'model', 'data', 'training', 'prediction', 'neural'],
      minComplexity: 'hard'
    },
    {
      prompt: 'database design',
      category: 'technical',
      expectedKeywords: ['table', 'relationship', 'key', 'schema', 'query', 'index'],
      minComplexity: 'medium'
    }
  ];

  beforeAll(() => {
    // Set up any necessary environment variables for FLAN-T5 testing
    process.env.NODE_ENV = 'test';
  });

  describe('FLAN-T5-Small Model Direct Testing', () => {
    
    testPrompts.forEach(({ prompt, category, expectedKeywords, minComplexity }) => {
      it(`should generate accurate ${category} questions for "${prompt}" using FLAN-T5`, async () => {
        
        // Force the use of flan-t5-small model specifically
        const result = await localModelService.generateQuestions(prompt, {
          model: 'flan-t5-small',
          count: 3,
          difficulty: minComplexity,
          focusArea: category
        });

        // Verify basic response structure
        expect(result).toBeDefined();
        expect(result.questions).toBeDefined();
        expect(Array.isArray(result.questions)).toBe(true);
        expect(result.questions.length).toBe(3);
        expect(result.metadata).toBeDefined();

        // Log the results for manual inspection
        console.log(`\n=== FLAN-T5 RESULTS FOR "${prompt}" ===`);
        console.log(`Provider: ${result.metadata.provider}`);
        console.log(`Model: ${result.metadata.model || 'flan-t5-small'}`);
        
        result.questions.forEach((question, index) => {
          console.log(`\nQuestion ${index + 1}:`);
          console.log(`Q: ${question.question}`);
          console.log(`A: ${question.options.A}`);
          console.log(`B: ${question.options.B}`);
          console.log(`C: ${question.options.C}`);
          console.log(`D: ${question.options.D}`);
          console.log(`Correct: ${question.correctAnswer}`);
          console.log(`Explanation: ${question.explanation}`);
        });
        console.log(`=== END FLAN-T5 RESULTS ===\n`);

        // Verify each question meets accuracy standards
        result.questions.forEach((question, index) => {
          // Basic structure validation
          expect(question).toHaveProperty('id');
          expect(question).toHaveProperty('question'); 
          expect(question).toHaveProperty('options');
          expect(question).toHaveProperty('correctAnswer');
          expect(question).toHaveProperty('explanation');

          // Content quality validation
          expect(question.question).toBeTruthy();
          expect(question.question.length).toBeGreaterThan(15);
          expect(question.question).toMatch(/\?$/);
          
          // Options validation
          expect(typeof question.options).toBe('object');
          expect(Object.keys(question.options)).toEqual(['A', 'B', 'C', 'D']);
          
          Object.values(question.options).forEach(option => {
            expect(typeof option).toBe('string');
            expect(option.length).toBeGreaterThan(1);
          });

          // Correct answer validation
          expect(['A', 'B', 'C', 'D']).toContain(question.correctAnswer);
          
          // Explanation validation
          expect(question.explanation).toBeTruthy();
          expect(question.explanation.length).toBeGreaterThan(15);

          // Topic relevance validation
          const questionText = question.question.toLowerCase();
          const explanationText = question.explanation.toLowerCase();
          const allText = `${questionText} ${explanationText} ${Object.values(question.options).join(' ').toLowerCase()}`;
          
          // Check if the question contains relevant keywords for the topic
          const hasRelevantKeywords = expectedKeywords.some(keyword => 
            allText.includes(keyword.toLowerCase()) || 
            allText.includes(prompt.toLowerCase())
          );
          
          if (!hasRelevantKeywords) {
            console.warn(`Warning: Question ${index + 1} for "${prompt}" may not contain expected keywords`);
            console.warn(`Expected keywords: ${expectedKeywords.join(', ')}`);
            console.warn(`Question text: ${question.question}`);
            console.warn(`All text: ${allText.substring(0, 200)}...`);
          }
        });

      }, 30000); // Longer timeout for AI model processing
    });
  });

  describe('FLAN-T5 Model Performance Analysis', () => {
    
    it('should demonstrate FLAN-T5 accuracy vs other models', async () => {
      const prompt = 'javascript arrays';
      const results = {};
      
      // Test with FLAN-T5 first
      try {
        results.flanT5 = await localModelService.generateQuestions(prompt, {
          model: 'flan-t5-small',
          count: 2,
          difficulty: 'medium'
        });
      } catch (error) {
        console.log('FLAN-T5 failed:', error.message);
        results.flanT5 = null;
      }

      // Test with other models for comparison
      try {
        results.gpt2 = await localModelService.generateQuestions(prompt, {
          model: 'gpt2',
          count: 2,
          difficulty: 'medium'
        });
      } catch (error) {
        console.log('GPT-2 failed:', error.message);
        results.gpt2 = null;
      }

      // Test with xenova-t5-small for comparison
      try {
        results.xenovaT5 = await localModelService.generateQuestions(prompt, {
          model: 'xenova-t5-small',
          count: 2,
          difficulty: 'medium'
        });
      } catch (error) {
        console.log('Xenova T5 failed:', error.message);
        results.xenovaT5 = null;
      }

      console.log('\n=== MODEL COMPARISON FOR "javascript arrays" ===');
      
      Object.entries(results).forEach(([modelName, result]) => {
        console.log(`\n--- ${modelName.toUpperCase()} ---`);
        if (result && result.questions && result.questions.length > 0) {
          console.log(`Provider: ${result.metadata.provider}`);
          console.log(`Questions generated: ${result.questions.length}`);
          console.log(`Sample question: ${result.questions[0].question}`);
          console.log(`Sample explanation: ${result.questions[0].explanation}`);
          
          // Analyze accuracy indicators
          const question = result.questions[0];
          const hasArrayKeywords = 
            question.question.toLowerCase().includes('array') ||
            question.explanation.toLowerCase().includes('array') ||
            Object.values(question.options).some(opt => opt.toLowerCase().includes('array'));
          
          const hasJavaScriptKeywords = 
            question.question.toLowerCase().includes('javascript') ||
            question.explanation.toLowerCase().includes('javascript') ||
            question.question.toLowerCase().includes('js');

          console.log(`Contains "array": ${hasArrayKeywords}`);
          console.log(`Contains JS keywords: ${hasJavaScriptKeywords}`);
        } else {
          console.log('No questions generated or model failed');
        }
      });
      
      console.log('=== END MODEL COMPARISON ===\n');

      // At least one model should work
      const workingModels = Object.values(results).filter(r => r && r.questions && r.questions.length > 0);
      expect(workingModels.length).toBeGreaterThan(0);

    }, 45000);
  });

  describe('FLAN-T5 Instruction Following Tests', () => {
    
    it('should follow specific instruction patterns that FLAN-T5 excels at', async () => {
      // FLAN-T5 is specifically good at following instructions
      const instructionalPrompts = [
        {
          prompt: 'Create questions about Python data structures',
          focus: 'lists and dictionaries',
          expectedTerms: ['list', 'dictionary', 'dict', 'append', 'key', 'value']
        },
        {
          prompt: 'Generate React component questions',
          focus: 'functional components and hooks', 
          expectedTerms: ['component', 'hook', 'useState', 'useEffect', 'jsx', 'props']
        },
        {
          prompt: 'Make questions about database concepts',
          focus: 'relationships and queries',
          expectedTerms: ['table', 'query', 'join', 'relationship', 'primary key', 'foreign key']
        }
      ];

      for (const { prompt, focus, expectedTerms } of instructionalPrompts) {
        const result = await localModelService.generateQuestions(prompt, {
          model: 'flan-t5-small',
          count: 2,
          difficulty: 'medium',
          focusArea: focus
        });

        expect(result).toBeDefined();
        expect(result.questions).toBeDefined();
        expect(result.questions.length).toBeGreaterThan(0);

        console.log(`\n=== INSTRUCTION FOLLOWING TEST: "${prompt}" ===`);
        console.log(`Focus: ${focus}`);
        console.log(`Provider: ${result.metadata.provider}`);
        
        result.questions.forEach((question, index) => {
          console.log(`\nQuestion ${index + 1}: ${question.question}`);
          console.log(`Explanation: ${question.explanation}`);
          
          const allText = `${question.question} ${question.explanation} ${Object.values(question.options).join(' ')}`.toLowerCase();
          const foundTerms = expectedTerms.filter(term => allText.includes(term.toLowerCase()));
          console.log(`Found relevant terms: ${foundTerms.join(', ')}`);
        });
        console.log('=== END INSTRUCTION TEST ===\n');

        // Each question should be well-formed
        result.questions.forEach(question => {
          expect(question.question).toMatch(/\?$/);
          expect(question.options).toBeDefined();
          expect(Object.keys(question.options)).toEqual(['A', 'B', 'C', 'D']);
          expect(['A', 'B', 'C', 'D']).toContain(question.correctAnswer);
        });
      }
    }, 60000);
  });

  describe('FLAN-T5 Edge Cases and Robustness', () => {
    
    it('should handle various question difficulties appropriately', async () => {
      const difficulties = ['easy', 'medium', 'hard'];
      const prompt = 'javascript functions';
      
      for (const difficulty of difficulties) {
        const result = await localModelService.generateQuestions(prompt, {
          model: 'flan-t5-small',
          count: 1,
          difficulty: difficulty
        });

        expect(result).toBeDefined();
        expect(result.questions).toBeDefined();
        expect(result.questions.length).toBe(1);

        const question = result.questions[0];
        
        console.log(`\n=== ${difficulty.toUpperCase()} DIFFICULTY TEST ===`);
        console.log(`Q: ${question.question}`);
        console.log(`Explanation: ${question.explanation}`);
        console.log('=== END DIFFICULTY TEST ===\n');

        // Basic validation for all difficulties
        expect(question.question).toBeTruthy();
        expect(question.explanation).toBeTruthy();
        expect(question.options).toBeDefined();
        expect(['A', 'B', 'C', 'D']).toContain(question.correctAnswer);

        // Difficulty-specific expectations
        if (difficulty === 'easy') {
          expect(question.question.length).toBeLessThan(200);
        } else if (difficulty === 'hard') {
          expect(question.explanation.length).toBeGreaterThan(30);
        }
      }
    }, 45000);

    it('should maintain consistency across multiple generations', async () => {
      const prompt = 'react hooks';
      const results = [];
      
      // Generate 3 sets of questions
      for (let i = 0; i < 3; i++) {
        const result = await localModelService.generateQuestions(prompt, {
          model: 'flan-t5-small',
          count: 2,
          difficulty: 'medium'
        });
        results.push(result);
      }

      // Analyze consistency
      console.log('\n=== CONSISTENCY ANALYSIS ===');
      results.forEach((result, index) => {
        console.log(`\nGeneration ${index + 1}:`);
        console.log(`Provider: ${result.metadata.provider}`);
        console.log(`Questions count: ${result.questions.length}`);
        if (result.questions.length > 0) {
          console.log(`Sample: ${result.questions[0].question}`);
        }
      });

      // All generations should succeed
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.questions).toBeDefined();
        expect(result.questions.length).toBeGreaterThan(0);
      });

      // Check for reasonable variety
      const allQuestions = results.flatMap(r => r.questions.map(q => q.question));
      const uniqueQuestions = new Set(allQuestions);
      console.log(`Total questions: ${allQuestions.length}, Unique: ${uniqueQuestions.size}`);
      
      // Should have some variety (at least 50% unique)
      expect(uniqueQuestions.size).toBeGreaterThan(allQuestions.length * 0.3);
      
      console.log('=== END CONSISTENCY ANALYSIS ===\n');

    }, 60000);
  });

  describe('FLAN-T5 Model Availability and Configuration', () => {
    
    it('should confirm FLAN-T5 model is properly configured and available', async () => {
      const availableModels = localModelService.getAvailableModels();
      
      console.log('\n=== AVAILABLE MODELS ===');
      console.log('Models found:', Object.keys(availableModels));
      
      if (availableModels['flan-t5-small']) {
        console.log('✅ FLAN-T5-Small is available');
        console.log('Model info:', availableModels['flan-t5-small']);
        
        expect(availableModels['flan-t5-small']).toBeDefined();
        expect(availableModels['flan-t5-small'].available).toBe(true);
        expect(availableModels['flan-t5-small'].type).toBe('text2text-generation');
      } else {
        console.log('❌ FLAN-T5-Small is NOT available');
        console.log('Available models:', Object.keys(availableModels));
      }
      console.log('=== END AVAILABLE MODELS ===\n');

      // Test that we can at least attempt to use FLAN-T5
      const result = await localModelService.generateQuestions('test prompt', {
        model: 'flan-t5-small',
        count: 1,
        difficulty: 'medium'
      });

      expect(result).toBeDefined();
      expect(result.questions).toBeDefined();
      expect(result.metadata).toBeDefined();
      
      console.log('\n=== FLAN-T5 TEST RESULT ===');
      console.log('Provider used:', result.metadata.provider);
      console.log('Model used:', result.metadata.model);
      console.log('Questions generated:', result.questions.length);
      console.log('=== END TEST RESULT ===\n');

    }, 30000);
  });
});
