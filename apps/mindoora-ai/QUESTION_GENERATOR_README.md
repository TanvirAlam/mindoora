# Question Generator Scripts

This repository contains scripts to generate multiple choice questions using FLAN-T5-small and other AI models.

## Available Scripts

### 1. `generate-questions.js` - Universal Question Generator

**Purpose**: Generate 5 multiple choice questions for any given prompt using the best available AI model (FLAN-T5-small preferred).

**Usage**:
```bash
node generate-questions.js "your prompt here"
```

**Examples**:
```bash
# Bangladesh questions (uses real factual templates)
node generate-questions.js "Bangladesh"

# Programming questions
node generate-questions.js "Python programming"
node generate-questions.js "JavaScript functions"
node generate-questions.js "React hooks"

# Science topics
node generate-questions.js "Climate change"
node generate-questions.js "Quantum physics"

# History topics
node generate-questions.js "World War 2"
node generate-questions.js "Ancient Egypt"

# General topics
node generate-questions.js "Shakespeare"
node generate-questions.js "Machine learning"
```

**Features**:
- ✅ **Model Priority**: FLAN-T5-small → GPT-2 → Enhanced Templates
- ✅ **Quality Analysis**: Each question gets scored for educational value
- ✅ **Real Question Detection**: Identifies generic templates vs factual content
- ✅ **Comprehensive Output**: Shows questions, answers, explanations, and analysis
- ✅ **Smart Fallbacks**: Falls back to factual templates when AI models fail

### 2. `test-real-bangladesh-questions.js` - Bangladesh-Specific Tester

**Purpose**: Generate guaranteed real, factual questions about Bangladesh.

**Usage**:
```bash
node test-real-bangladesh-questions.js
```

**Features**:
- ✅ **100% Factual Content**: Uses curated Bangladesh question database
- ✅ **Fact Validation**: Verifies historical accuracy against known facts
- ✅ **Comprehensive Coverage**: History, Geography, Culture, Politics
- ✅ **Model Comparison**: Tests both AI models and template service

### 3. `test-bangladesh-questions.js` - FLAN-T5 Focus Test

**Purpose**: Test FLAN-T5-small model specifically with Bangladesh prompts.

**Usage**:
```bash
node test-bangladesh-questions.js
```

## Model Performance Summary

### FLAN-T5-small Model
- **Status**: ⚠️ Available but not properly loading
- **Issue**: @xenova/transformers library import failures
- **Fallback**: Uses intelligent question generation templates
- **Recommendation**: Add HUGGINGFACE_API_KEY for better performance

### Enhanced Template Service
- **Status**: ✅ Fully functional
- **Quality**: 100% factual content
- **Coverage**: Bangladesh, History, Science, Mathematics
- **Best for**: Guaranteed accurate educational questions

### AI Provider Chain
- **Primary**: FLAN-T5-small (when working)
- **Secondary**: GPT-2 (local fallback)
- **Tertiary**: Enhanced templates (guaranteed quality)

## Real vs Generic Questions

### ✅ Real Questions (Good Examples)
```
Q: What is the capital city of Bangladesh?
A: Dhaka
Explanation: Dhaka is the capital and largest city of Bangladesh...

Q: When did Bangladesh gain independence?  
A: 1971
Explanation: Bangladesh gained independence from Pakistan on March 26, 1971...
```

### ⚠️ Generic Templates (To Avoid)
```
Q: What is a key principle of Bangladesh?
Q: What is important when studying Python programming?
Q: What is a fundamental concept in machine learning?
```

## Quality Metrics

The script analyzes each question on:
- **Relevance** (25 points): Related to the prompt
- **Question Quality** (15 points): Substantial and well-formed
- **Options Quality** (15 points): Meaningful multiple choices
- **Explanation Quality** (20 points): Detailed and informative
- **Educational Value** (25 points): Contains learning concepts

**Total Score**: 100 points per question

## Getting Started

1. **Make scripts executable**:
```bash
chmod +x generate-questions.js
chmod +x test-real-bangladesh-questions.js
chmod +x test-bangladesh-questions.js
```

2. **Generate questions for any topic**:
```bash
node generate-questions.js "your favorite topic"
```

3. **Test with Bangladesh** (guaranteed real questions):
```bash
node generate-questions.js "Bangladesh"
```

## Model Setup (Optional)

To improve FLAN-T5 performance, add to your `.env` file:
```bash
HUGGINGFACE_API_KEY=your_api_key_here
```

Get your API key from: https://huggingface.co/settings/tokens

## Output Format

Each question includes:
- **Question Text**: The multiple choice question
- **Options A-D**: Four possible answers
- **Correct Answer**: The right choice (A, B, C, or D)
- **Explanation**: Detailed explanation of why the answer is correct
- **Quality Analysis**: Scoring and feedback
- **Generic Detection**: Warning if the question appears to be a template

## Best Practices

1. **Use specific prompts**: "Python list operations" instead of just "Python"
2. **Check for real questions**: Look for the generic template warnings
3. **Verify factual accuracy**: Especially important for historical/geographic topics
4. **Use Bangladesh prompt**: For guaranteed factual content examples

## Troubleshooting

**Issue**: Getting generic template questions
**Solution**: Try prompts that match enhanced template topics (Bangladesh, History, Science, Mathematics)

**Issue**: FLAN-T5 not loading
**Solution**: Check model files in `models/` directory and add HUGGINGFACE_API_KEY

**Issue**: All models failing  
**Solution**: Enhanced template service will provide fallback questions for supported topics

## Next Steps

1. **Expand Template Database**: Add more topics to enhanced template service
2. **Fix FLAN-T5 Loading**: Resolve @xenova/transformers import issues
3. **Add Fact Checking**: Implement automatic factual verification
4. **Model Fine-tuning**: Train models on educational question datasets

---

**🎯 Ready to generate questions? Start with:**
```bash
node generate-questions.js "Bangladesh"
```
