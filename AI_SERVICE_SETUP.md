# AI Service Setup Instructions

## Problem
The mobile app is showing the error: `this.hf.textToText is not a function`

## Solution

I've fixed the Hugging Face API method calls and added better error handling. Here's what you need to do:

### 1. Set up Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token (read access is sufficient)
5. Copy the token

### 2. Configure the AI Service

1. Navigate to the AI service directory:
   ```bash
   cd apps/mindoora-ai
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your Hugging Face API key:
   ```
   HUGGINGFACE_API_KEY=your_actual_token_here
   ```

### 3. Start the AI Service

```bash
cd apps/mindoora-ai
pnpm install
pnpm dev
```

The service will run on `http://localhost:3001`

### 4. Test the Setup

You can test the service by running the test script:
```bash
cd apps/mindoora-ai
node test-service.js
```

### 5. What's Fixed

1. **Fixed API Method**: Changed `textToText()` to `textGeneration()` which is the correct method in the current Hugging Face library
2. **Better Error Handling**: Added fallback demo questions when AI service is unavailable
3. **Configuration**: Set Hugging Face as the default provider since it's free and reliable

### 6. Mobile App Fallback

If the AI service is still unavailable, the mobile app will now automatically generate demo questions instead of crashing. Users will see a message indicating these are sample questions.

### 7. Alternative: Use Demo Mode

If you don't want to set up the AI service right now, the mobile app has a "Use Demo Mode" option that provides sample questions for testing.

## Notes

- The Hugging Face free tier has rate limits but should be sufficient for development
- If you want to use OpenAI instead, set `DEFAULT_AI_PROVIDER=openai` in your `.env` file and add your OpenAI API key
- The local model service now uses the standard `textGeneration` method for both T5 and GPT models
