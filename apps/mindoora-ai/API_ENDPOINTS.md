# Mindoora AI Service - API Endpoints

Base URL: `http://localhost:3001` (default)

## 🚀 Available Endpoints

### General Health & Info

#### `GET /`
Basic service status check
```bash
curl http://localhost:3001/
```

**Response:**
```json
{
  "success": true,
  "message": "Emach AI Service is running",
  "version": "1.0.0",
  "timestamp": "2025-07-30T14:01:49.000Z",
  "environment": "development"
}
```

#### `GET /health`
Detailed health check with system metrics
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-07-30T14:01:49.000Z",
    "uptime": 123.45,
    "environment": "development",
    "memory": {
      "rss": 45678912,
      "heapTotal": 18825216,
      "heapUsed": 12345678
    },
    "cache": {
      "hits": 150,
      "misses": 25,
      "keys": 45
    }
  }
}
```

---

## 🤖 Question Generation Endpoints

### Primary Question Generation (T5 Model)

#### `POST /api/questions/generate`
Generate quiz questions using the T5BaseQuestionGeneration model (now default)

**Request:**
```bash
curl -X POST http://localhost:3001/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "JavaScript programming",
    "count": 3,
    "difficulty": "medium",
    "questionTypes": ["multiple-choice"],
    "provider": "t5",
    "useCache": true
  }'
```

**Parameters:**
- `prompt` (string, required): Topic or content to generate questions about
- `count` (number, optional): Number of questions (1-5, default: 5)
- `difficulty` (string, optional): "easy", "medium", "hard", or "mixed" (default: "medium")
- `questionTypes` (array, optional): ["multiple-choice", "true-false", "fill-blank", "short-answer"] (default: ["multiple-choice"])
- `provider` (string, optional): "t5", "googleai", "openai", "huggingface" (default: "t5")
- `useCache` (boolean, optional): Whether to use caching (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What is a closure in JavaScript?",
        "options": {
          "A": "A function that returns another function",
          "B": "A function that has access to outer scope variables",
          "C": "A way to create private variables",
          "D": "All of the above"
        },
        "correctAnswer": "D",
        "explanation": "A closure gives you access to an outer function's scope from an inner function...",
        "difficulty": "medium",
        "topic": "JavaScript programming",
        "context": null,
        "source": "T5BaseQuestionGeneration"
      }
    ],
    "metadata": {
      "generated_at": "2025-07-30T14:01:49.000Z",
      "count": 3,
      "provider": "huggingface-t5",
      "model": "Avinash250325/T5BaseQuestionGeneration",
      "duration": "2500ms",
      "difficulty": "medium",
      "questionType": "multiple choice question"
    }
  },
  "metadata": {
    "requestId": "req_123456789",
    "timestamp": "2025-07-30T14:01:49.000Z",
    "provider": "t5"
  }
}
```

### Content Analysis

#### `POST /api/questions/analyze`
Analyze text content for difficulty level and suggested question types

**Request:**
```bash
curl -X POST http://localhost:3001/api/questions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "JavaScript is a programming language that enables interactive web pages...",
    "provider": "googleai"
  }'
```

**Parameters:**
- `text` (string, required): Text content to analyze (10-5000 characters)
- `provider` (string, optional): AI provider to use for analysis

---

## 🔧 Provider & Service Management

#### `GET /api/questions/providers`
Get available AI providers and their configuration

**Request:**
```bash
curl http://localhost:3001/api/questions/providers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": ["openai", "huggingface", "googleai"],
    "default": "t5",
    "fallback": "googleai"
  }
}
```

#### `GET /api/questions/health`
Health check for all AI providers

**Request:**
```bash
curl http://localhost:3001/api/questions/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "providers": {
      "openai": { "status": "healthy" },
      "huggingface": { "status": "healthy" },
      "googleai": { "status": "healthy" },
      "t5": {
        "status": "healthy",
        "message": "T5 Question Generation service operational",
        "available": true,
        "model": "Avinash250325/T5BaseQuestionGeneration"
      }
    }
  }
}
```

#### `GET /api/questions/stats`
Get service statistics and performance metrics

**Request:**
```bash
curl http://localhost:3001/api/questions/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cache": {
      "hits": 150,
      "misses": 25,
      "hitRate": 0.857,
      "keys": 45
    },
    "config": {
      "maxQuestionsPerRequest": 5,
      "defaultProvider": "t5",
      "cacheTTL": 3600
    },
    "uptime": 123.45,
    "memoryUsage": {
      "rss": 45678912,
      "heapTotal": 18825216,
      "heapUsed": 12345678
    }
  }
}
```

#### `DELETE /api/questions/cache`
Clear the question cache

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/questions/cache
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

---

## 🏠 Local Model Endpoints (Alternative Models)

#### `POST /api/local/generate`
Generate questions using free Hugging Face models (fallback option)

**Request:**
```bash
curl -X POST http://localhost:3001/api/local/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Machine learning basics",
    "model": "gpt2",
    "count": 3,
    "difficulty": "easy",
    "focusArea": "supervised learning"
  }'
```

**Parameters:**
- `prompt` (string, required): Topic to generate questions about
- `model` (string, optional): Model name (default: "gpt2")
- `count` (number, optional): Number of questions (default: 3)
- `difficulty` (string, optional): Difficulty level (default: "medium")
- `focusArea` (string, optional): Specific area to focus on

#### `POST /api/local/test`
Test a specific model with a sample prompt

**Request:**
```bash
curl -X POST http://localhost:3001/api/local/test \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt2"
  }'
```

#### `GET /api/local/models`
Get list of available local models

**Request:**
```bash
curl http://localhost:3001/api/local/models
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gpt2": {
      "name": "gpt2",
      "description": "Classic GPT-2 model, good for general text generation",
      "size": "~500MB",
      "recommended": true,
      "type": "text-generation"
    },
    "microsoft/DialoGPT-medium": {
      "name": "microsoft/DialoGPT-medium",
      "description": "Microsoft DialoGPT medium model, good for conversational text",
      "size": "~1GB",
      "recommended": true,
      "type": "text-generation"
    }
  }
}
```

#### `GET /api/local/models/:modelName`
Get information about a specific model

**Request:**
```bash
curl http://localhost:3001/api/local/models/gpt2
```

#### `GET /api/local/health`
Health check for local model service

**Request:**
```bash
curl http://localhost:3001/api/local/health
```

#### `GET /api/local/quick-test`
Quick test endpoint for development (uses random topic)

**Request:**
```bash
curl http://localhost:3001/api/local/quick-test
```

---

## 🔐 Authentication

If API key authentication is enabled (`ENABLE_API_KEY_AUTH=true`), include the API key in all requests:

```bash
curl -X POST http://localhost:3001/api/questions/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"prompt": "Python basics", "count": 3}'
```

---

## 📋 Provider Options

### Available Providers:

1. **t5** (Default) - Avinash250325/T5BaseQuestionGeneration
   - Fine-tuned specifically for question generation
   - Best quality and most realistic questions
   - Requires Hugging Face API key

2. **googleai** (Fallback) - Gemini 1.5 Flash
   - High-quality general AI model
   - Fast and reliable
   - Requires Google AI API key

3. **openai** - GPT-3.5-turbo
   - High-quality questions
   - Requires OpenAI API key

4. **huggingface** - DialoGPT Large
   - Alternative option
   - Requires Hugging Face API key

### Fallback Chain:
- Primary: T5 → Google AI → Local models (mock questions)

---

## 🚀 Quick Start Examples

### Generate 3 JavaScript questions:
```bash
curl -X POST http://localhost:3001/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "JavaScript fundamentals", "count": 3}'
```

### Generate hard Python questions:
```bash
curl -X POST http://localhost:3001/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Python advanced concepts", "count": 5, "difficulty": "hard"}'
```

### Check service health:
```bash
curl http://localhost:3001/health
```

### Test the T5 model specifically:
```bash
node test-t5.js
```

---

## ⚠️ Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Validation error",
  "details": ["Prompt must be at least 5 characters long"],
  "message": "Request validation failed"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid API key)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (AI providers down)

---

The service is now configured to use the specialized T5BaseQuestionGeneration model as the primary provider, which should generate much more realistic and authentic quiz questions!
