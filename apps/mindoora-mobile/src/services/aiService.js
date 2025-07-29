/**
 * AI Service Client for Mindoora Mobile App
 * Communicates with the mindoora-ai microservice
 */

const AI_SERVICE_BASE_URL = 'http://localhost:3001'; // Change this to your deployed URL in production

class AIService {
  constructor() {
    this.baseURL = AI_SERVICE_BASE_URL;
    this.timeout = 30000; // 30 seconds timeout
  }

  /**
   * Make HTTP request to AI service
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if you enable authentication
        // 'X-API-Key': 'your-api-key-here',
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      console.log(`[AIService] Making request to: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[AIService] Response received:`, data.success ? 'Success' : 'Failed');
      
      return data;
    } catch (error) {
      console.error(`[AIService] Request failed:`, error.message);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - AI service is taking too long to respond');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('Cannot connect to AI service. Make sure the service is running on port 3001.');
      }
      
      throw error;
    }
  }

  /**
   * Generate quiz questions using AI
   */
  async generateQuestions(prompt, options = {}) {
    const {
      count = 5,
      difficulty = 'medium',
      model = 'flan-t5-small',
      focusArea = '',
    } = options;

    try {
      const response = await this.makeRequest('/api/local/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          count,
          difficulty,
          model,
          focusArea,
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate questions');
      }

      return {
        questions: response.data.questions || [],
        metadata: response.data.metadata || {
          generated_at: new Date().toISOString(),
          count: 0,
          provider: 'unknown',
        },
      };
    } catch (error) {
      console.error('[AIService] Generate questions failed:', error);
      throw error;
    }
  }

  /**
   * Get available AI models
   */
  async getAvailableModels() {
    try {
      const response = await this.makeRequest('/api/local/models');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get models');
      }

      return response.data.models || {};
    } catch (error) {
      console.error('[AIService] Get models failed:', error);
      throw error;
    }
  }

  /**
   * Test AI service connectivity
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('/api/local/quick-test');
      
      return {
        success: response.success,
        message: response.message || 'Connection test completed',
        data: response.data,
      };
    } catch (error) {
      console.error('[AIService] Connection test failed:', error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  /**
   * Check AI service health
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('/health');
      
      return {
        healthy: response.success,
        data: response.data,
      };
    } catch (error) {
      console.error('[AIService] Health check failed:', error);
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze content difficulty and suggest question types
   */
  async analyzeContent(text) {
    try {
      const response = await this.makeRequest('/api/questions/analyze', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to analyze content');
      }

      return response.data;
    } catch (error) {
      console.error('[AIService] Content analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get service statistics
   */
  async getStats() {
    try {
      const response = await this.makeRequest('/api/questions/stats');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get stats');
      }

      return response.data;
    } catch (error) {
      console.error('[AIService] Get stats failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AIService();
