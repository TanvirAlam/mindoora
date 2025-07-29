# Emach AI Service

A dedicated AI microservice for the Mindoora quiz platform that handles question generation, content analysis, and machine learning operations. This service is designed to be completely separate from the main application, allowing for independent scaling and optimization.

## 🚀 Features

- **Question Generation**: Generate quiz questions from any topic using multiple AI providers
- **Content Analysis**: Analyze text content for difficulty level and suggested question types  
- **Multi-Provider Support**: OpenAI, Hugging Face, and Google AI with automatic fallback
- **Intelligent Caching**: Redis + in-memory caching for optimal performance
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Health Monitoring**: Comprehensive health checks and metrics
- **Security**: API key authentication, CORS, and security headers
- **Logging**: Structured logging with multiple levels and outputs

## 🏗️ Architecture

```
emach-ai/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── package.json         # Dependencies and scripts
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 📋 API Endpoints

### Question Generation

#### `POST /api/questions/generate`
Generate quiz questions based on a topic/prompt.

**Request Body:**
```json
{
  "prompt": "JavaScript fundamentals",
  "count": 5,
  "difficulty": "medium",
  "questionTypes": ["multiple-choice"],
  "provider": "openai",
  "useCache": true
}
```

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
        "topic": "JavaScript"
      }
    ],
    "metadata": {
      "generated_at": "2024-01-15T10:30:00.000Z",
      "count": 5,
      "provider": "openai"
    }
  }
}
```

### Content Analysis

#### `POST /api/questions/analyze`
Analyze text content for difficulty and suggested question types.

**Request Body:**
```json
{
  "text": "JavaScript is a programming language...",
  "provider": "openai"
}
```

### Health & Monitoring

#### `GET /health`
Service health check with detailed metrics.

#### `GET /api/questions/providers`
Get available AI providers and their status.

#### `GET /api/questions/stats`
Get service statistics including cache performance.

#### `DELETE /api/questions/cache`
Clear the question cache.

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

### Required Settings
```bash
# Choose your AI provider
OPENAI_API_KEY=your_openai_api_key_here
# OR
HUGGINGFACE_API_KEY=your_huggingface_api_key_here  
# OR
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### Optional Settings
```bash
# Server
PORT=3001
NODE_ENV=development

# Cache (Redis optional)
REDIS_URL=redis://localhost:6379

# Security
ENABLE_API_KEY_AUTH=false
API_SECRET_KEY=your_secret_key

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# AI Configuration
DEFAULT_AI_PROVIDER=openai
MAX_QUESTIONS_PER_REQUEST=10
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Test the service:**
   ```bash
   curl -X POST http://localhost:3001/api/questions/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Python basics", "count": 3}'
   ```

## 🔧 Available Scripts

- `pnpm start` - Start production server
- `pnpm dev` - Start development server with auto-reload
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues

## 🤖 AI Providers

### OpenAI (Recommended)
- **Model**: GPT-3.5-turbo
- **Pros**: High-quality questions, fast response times
- **Setup**: Get API key from OpenAI

### Hugging Face
- **Model**: Various text generation models
- **Pros**: Free tier available, many model options
- **Setup**: Get API key from Hugging Face

### Google AI (Gemini)
- **Model**: Gemini Pro
- **Pros**: Fast and accurate, good for various topics
- **Setup**: Get API key from Google AI Studio

## 📊 Caching Strategy

The service uses a two-tier caching system:

1. **Redis Cache** (Primary)
   - Shared across multiple instances
   - Persistent across restarts
   - Configurable TTL

2. **Memory Cache** (Fallback)
   - Fast local cache
   - Used when Redis unavailable
   - Automatic cleanup

Cache keys include prompt hash, provider, difficulty, and question count to ensure accurate cache hits.

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin protection
- **Rate Limiting**: Prevents abuse
- **API Key Auth**: Optional authentication layer
- **Input Validation**: Joi schema validation
- **Request Logging**: Detailed audit trail

## 📈 Monitoring & Logging

### Health Checks
- Basic: `GET /` - Service status
- Detailed: `GET /health` - Full system metrics

### Metrics Available
- Response times
- Cache hit/miss ratios
- Provider success rates
- Memory usage
- Request counts

### Logging
- Structured JSON logs in production
- Colorized console logs in development
- Multiple log levels (error, warn, info, debug)
- Request/response logging with unique IDs

## 🚀 Production Deployment

1. **Environment Setup:**
   ```bash
   NODE_ENV=production
   LOG_LEVEL=info
   ```

2. **Dependencies:**
   ```bash
   pnpm install --production
   ```

3. **Process Management:**
   ```bash
   # Using PM2
   pm2 start src/server.js --name emach-ai
   
   # Using Docker
   docker build -t emach-ai .
   docker run -p 3001:3001 emach-ai
   ```

4. **Reverse Proxy (nginx):**
   ```nginx
   location /ai/ {
     proxy_pass http://localhost:3001/;
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
   }
   ```

## 🔄 Integration with Main App

### From React Native (Mobile)
```javascript
const generateQuestions = async (prompt) => {
  const response = await fetch('http://your-ai-service.com/api/questions/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key', // if auth enabled
    },
    body: JSON.stringify({
      prompt,
      count: 5,
      difficulty: 'medium'
    })
  });
  
  return response.json();
};
```

### From Node.js Backend
```javascript
import axios from 'axios';

const aiService = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'X-API-Key': process.env.AI_SERVICE_API_KEY,
  },
});

const questions = await aiService.post('/questions/generate', {
  prompt: 'React hooks',
  count: 10
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Provider Initialization Failed**
   - Check API keys in `.env`
   - Verify network connectivity
   - Check provider service status

2. **Redis Connection Failed**
   - Service will fallback to memory cache
   - Check Redis server status
   - Verify connection string

3. **Rate Limit Exceeded**
   - Adjust `RATE_LIMIT_MAX_REQUESTS`
   - Implement request queuing
   - Use caching to reduce requests

4. **Out of Memory**
   - Reduce cache TTL
   - Limit concurrent requests
   - Monitor memory usage

### Debug Mode
```bash
LOG_LEVEL=debug pnpm dev
```

## 📝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use conventional commit messages
5. Ensure all linting passes

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for Mindoora Quiz Platform** 🧠✨
