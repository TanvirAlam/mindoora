/**
 * AI Service for Mindoora Mobile App
 * Uses backend AI service (no external APIs or heavy models)
 */

class AIService {
  constructor() {
    this.baseURL = 'http://localhost:3001'; // Backend AI service
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Make HTTP request to backend AI service
   */
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`[AIService] Making ${method} request to ${url}`);
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[AIService] Request successful:`, data.success ? 'Success' : 'Failed');
      
      return data;
    } catch (error) {
      console.error(`[AIService] Request failed:`, error.message);
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error('Cannot connect to AI service. Make sure the backend is running on port 3001.');
      }
      
      throw error;
    }
  }

  /**
   * Generate quiz questions using backend AI service
   */
  async generateQuestions(prompt, options = {}) {
    const {
      count = 5,
      difficulty = 'medium',
    } = options;

    console.log(`[AIService] Generating ${count} questions for: "${prompt}"`);
    
    if (!prompt || prompt.length < 2) {
      throw new Error('Prompt is too short! Must be at least 2 characters.');
    }

    try {
      // Add subtle randomization to prompt for cache busting while keeping original intact
      const internalPrompt = `${prompt} [variation: ${Date.now().toString(36)}]`;
      
      // Call backend AI service with cache disabled to ensure fresh questions
      const response = await this.makeRequest('/api/questions/generate', 'POST', {
        prompt: internalPrompt,
        count,
        difficulty,
        useCache: false, // Ensure fresh questions every time
      });
      
      if (response.success && response.data && response.data.questions) {
        console.log(`[AIService] Successfully generated ${response.data.questions.length} questions`);
        return response;
      } else {
        throw new Error('Invalid response from AI service');
      }
      
    } catch (error) {
      console.error('[AIService] Generate questions failed:', error);
      
      // Fallback to demo questions if backend fails
      console.log('[AIService] Using fallback demo questions due to backend error');
      return {
        success: true,
        data: this.generateFallbackQuestions(prompt, count, difficulty)
      };
    }
  }

  /**
   * Create a structured question from AI-generated content
   */
  createQuestionFromAI(generatedText, topic, questionNumber, difficulty) {
    console.log(`[AIService] Processing AI text for question ${questionNumber}:`, generatedText);
    
    // Extract the first meaningful sentence as the question
    let questionText = generatedText.split(/[.!?\n]/)[0].trim();
    
    // If the generated text doesn't end with a question mark, make it a question
    if (!questionText.endsWith('?')) {
      if (questionText.length > 10) {
        questionText = questionText + '?';
      } else {
        questionText = `What is important about ${topic} in the following context: "${questionText}"?`;
      }
    }
    
    // Ensure minimum question length
    if (questionText.length < 10) {
      questionText = `What should you know about ${topic}?`;
    }
    
    // Create contextual options based on the topic and generated content
    const options = this.generateContextualOptions(topic, generatedText, questionNumber);
    
    // Rotate correct answers
    const correctAnswers = ['A', 'B', 'C', 'D'];
    const correctAnswer = correctAnswers[(questionNumber - 1) % 4];
    
    return {
      id: questionNumber,
      question: questionText,
      options,
      correctAnswer,
      explanation: `This question tests knowledge about ${topic}. Generated from AI: "${generatedText.substring(0, 100)}..."`,
      difficulty: difficulty,
      topic: topic,
      generated: true,
      aiText: generatedText.substring(0, 200) // Keep reference to original AI text
    };
  }
  
  /**
   * Generate contextual multiple choice options
   */
  generateContextualOptions(topic, generatedText, questionNumber) {
    // Try to extract meaningful concepts from the AI text
    const words = generatedText.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const uniqueWords = [...new Set(words)].slice(0, 8);
    
    // Create topic-specific options
    const baseOptions = {
      A: `${topic} uses ${uniqueWords[0] || 'specific'} techniques`,
      B: `${topic} involves ${uniqueWords[1] || 'important'} concepts`,
      C: `${topic} requires ${uniqueWords[2] || 'fundamental'} understanding`,
      D: `${topic} employs ${uniqueWords[3] || 'essential'} methods`
    };
    
    // Mix in some generated content if available
    if (generatedText.length > 20) {
      const fragments = generatedText.split(/[,.!?]/).filter(f => f.trim().length > 5);
      if (fragments.length > 0) {
        baseOptions.A = fragments[0]?.trim().substring(0, 50) || baseOptions.A;
      }
      if (fragments.length > 1) {
        baseOptions.B = fragments[1]?.trim().substring(0, 50) || baseOptions.B;
      }
    }
    
    return baseOptions;
  }

  /**
   * Parse generated text into a structured question (legacy method)
   */
  parseGeneratedQuestion(generatedText, topic, questionNumber) {
    return this.createQuestionFromAI(generatedText, topic, questionNumber, 'medium');
  }

  /**
   * Create a single fallback question
   */
  createFallbackQuestion(prompt, questionNumber, difficulty) {
    const questionTemplates = [
      `What is the main concept related to "${prompt}"?`,
      `Which of the following best describes "${prompt}"?`,
      `What is an important aspect of "${prompt}"?`,
      `How would you explain "${prompt}"?`,
      `What should you know about "${prompt}"?`
    ];
    
    const template = questionTemplates[(questionNumber - 1) % questionTemplates.length];
    
    return {
      id: questionNumber,
      question: template,
      options: {
        A: `First key point about ${prompt}`,
        B: `Second important aspect of ${prompt}`,
        C: `Third concept related to ${prompt}`, 
        D: `Fourth element of ${prompt}`
      },
      correctAnswer: String.fromCharCode(65 + ((questionNumber - 1) % 4)), // A, B, C, D rotation
      explanation: `This question covers fundamental concepts of ${prompt}.`,
      difficulty: difficulty,
      topic: prompt,
      generated: false
    };
  }

  /**
   * Generate fallback questions when AI service is unavailable
   */
  generateFallbackQuestions(prompt, count = 5, difficulty = 'medium') {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: i + 1,
        question: `Sample question ${i + 1} about "${prompt}"?`,
        options: {
          A: `First option related to ${prompt}`,
          B: `Second option about ${prompt}`,
          C: `Third option concerning ${prompt}`,
          D: `Fourth option regarding ${prompt}`
        },
        correctAnswer: String.fromCharCode(65 + (i % 4)), // Rotate A, B, C, D
        explanation: `This is a sample question about ${prompt}. The correct answer demonstrates key concepts.`,
        difficulty: difficulty,
        topic: prompt,
      });
    }
    
    return {
      questions,
      metadata: {
        generated_at: new Date().toISOString(),
        count: questions.length,
        provider: 'fallback',
        note: 'These are demo questions. AI service was unavailable.',
      },
    };
  }

  /**
   * Get available AI providers
   */
  async getAvailableProviders() {
    try {
      const response = await this.makeRequest('/api/questions/providers', 'GET');
      return response;
    } catch (error) {
      console.error('[AIService] Failed to get providers:', error);
      return {
        success: false,
        data: {
          providers: ['local'],
          default: 'local',
          fallback: 'local'
        }
      };
    }
  }

  /**
   * Get available AI models (legacy method for backward compatibility)
   */
  async getAvailableModels() {
    return await this.getAvailableProviders();
  }

  /**
   * Test AI service connectivity
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('/health', 'GET');
      return {
        success: true,
        message: 'Backend AI service is healthy and ready',
        data: response.data
      };
    } catch (error) {
      console.error('[AIService] Connection test failed:', error);
      return {
        success: false,
        message: 'Cannot connect to AI service. Make sure the backend is running on port 3001.',
        error: error.message,
      };
    }
  }

  /**
   * Check AI service health
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('/api/questions/health', 'GET');
      return {
        healthy: response.success,
        data: response.data
      };
    } catch (error) {
      console.error('[AIService] Health check failed:', error);
      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export default new AIService();
