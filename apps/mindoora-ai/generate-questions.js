#!/usr/bin/env node

/**
 * Universal Question Generation Script
 * 
 * This script generates 5 multiple choice questions for any given prompt
 * using the FLAN-T5-small model when available, with fallbacks.
 * 
 * Usage:
 *   node generate-questions.js "your prompt here"
 *   node generate-questions.js Bangladesh
 *   node generate-questions.js "machine learning"
 *   node generate-questions.js "JavaScript programming"
 */

import aiProviderService from './src/services/aiProviderService.js';
import localModelService from './src/services/localModelService.js';
import enhancedTemplateService from './src/services/enhancedTemplateService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function displayUsage() {
  console.log(`${colors.bright}${colors.blue}📚 Universal Question Generator${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}\n`);
  console.log(`${colors.yellow}Usage:${colors.reset}`);
  console.log(`  node generate-questions.js "your prompt here"`);
  console.log(`  node generate-questions.js Bangladesh`);
  console.log(`  node generate-questions.js "machine learning"`);
  console.log(`  node generate-questions.js "JavaScript programming"\n`);
  console.log(`${colors.yellow}Examples:${colors.reset}`);
  console.log(`  node generate-questions.js "Python programming"`);
  console.log(`  node generate-questions.js "World War 2"`);
  console.log(`  node generate-questions.js "Artificial Intelligence"`);
  console.log(`  node generate-questions.js "Climate Change"`);
  console.log(`  node generate-questions.js "Shakespeare"`);
}

function analyzeQuestionQuality(question, prompt) {
  const analysis = {
    score: 0,
    strengths: [],
    issues: []
  };
  
  const questionLower = question.question.toLowerCase();
  const promptLower = prompt.toLowerCase();
  const explanationLower = question.explanation.toLowerCase();
  
  // Check question relevance to prompt
  const promptWords = promptLower.split(/\s+/).filter(word => word.length > 2);
  const hasRelevantWords = promptWords.some(word => 
    questionLower.includes(word) || explanationLower.includes(word)
  );
  
  if (hasRelevantWords) {
    analysis.score += 25;
    analysis.strengths.push('Relevant to prompt');
  } else {
    analysis.issues.push('May not be directly related to prompt');
  }
  
  // Check question quality
  if (question.question.length > 30) {
    analysis.score += 15;
    analysis.strengths.push('Substantial question');
  } else {
    analysis.issues.push('Question could be more detailed');
  }
  
  // Check options quality
  const options = Object.values(question.options);
  const avgOptionLength = options.reduce((sum, opt) => sum + opt.length, 0) / options.length;
  
  if (avgOptionLength > 5) {
    analysis.score += 15;
    analysis.strengths.push('Well-formed options');
  } else {
    analysis.issues.push('Options could be more detailed');
  }
  
  // Check explanation quality
  if (question.explanation.length > 50) {
    analysis.score += 20;
    analysis.strengths.push('Detailed explanation');
  } else {
    analysis.issues.push('Explanation could be more comprehensive');
  }
  
  // Check for educational value
  const hasEducationalTerms = explanationLower.includes('because') || 
                             explanationLower.includes('important') ||
                             explanationLower.includes('principle') ||
                             explanationLower.includes('concept') ||
                             explanationLower.includes('theory');
  
  if (hasEducationalTerms) {
    analysis.score += 25;
    analysis.strengths.push('Educational content');
  }
  
  return analysis;
}

function detectGenericTemplate(question) {
  const questionText = question.question.toLowerCase();
  const genericPatterns = [
    'key principle of',
    'implement .* in production',
    'approach a and approach b',
    'fundamental concept in',
    'what is important when studying'
  ];
  
  return genericPatterns.some(pattern => 
    questionText.match(new RegExp(pattern))
  );
}

async function generateQuestionsForPrompt(prompt) {
  console.log(`${colors.bright}${colors.blue}🎯 Question Generator for: "${prompt}"${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(50 + prompt.length)}${colors.reset}\n`);
  
  console.log(`${colors.yellow}📋 Configuration:${colors.reset}`);
  console.log(`   Prompt: "${prompt}"`);
  console.log(`   Questions: 5`);
  console.log(`   Difficulty: medium`);
  console.log(`   Model Preference: FLAN-T5-small → GPT-2 → Templates\n`);
  
  console.log(`${colors.magenta}🚀 Generating questions...${colors.reset}\n`);
  
  let result;
  let method = '';
  
  try {
    // Try AI Provider Service first (includes FLAN-T5 attempts)
    result = await aiProviderService.generateQuestions(prompt, {
      count: 5,
      difficulty: 'medium'
    });
    method = 'AI Provider Service';
  } catch (error) {
    console.log(`${colors.yellow}⚠️  AI Provider failed, trying Local Model Service...${colors.reset}\n`);
    
    try {
      // Try Local Model Service
      result = await localModelService.generateQuestions(prompt, {
        count: 5,
        difficulty: 'medium'
      });
      method = 'Local Model Service';
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Local models failed, using Enhanced Templates...${colors.reset}\n`);
      
      // Fallback to enhanced templates if available for the topic
      const templateTopics = ['Bangladesh', 'History', 'Science', 'Mathematics'];
      const matchingTopic = templateTopics.find(topic => 
        prompt.toLowerCase().includes(topic.toLowerCase())
      );
      
      if (matchingTopic) {
        const questions = [];
        for (let i = 1; i <= 5; i++) {
          const question = enhancedTemplateService.getQuestion(matchingTopic, `${matchingTopic.toLowerCase()}-${i}`, 'medium');
          questions.push(question);
        }
        result = {
          questions,
          metadata: { provider: 'enhanced-template', model: 'template-service' }
        };
        method = 'Enhanced Template Service';
      } else {
        throw new Error('No suitable question generation method available');
      }
    }
  }
  
  console.log(`${colors.green}✅ Questions generated successfully!${colors.reset}`);
  console.log(`${colors.cyan}Method: ${method}${colors.reset}`);
  console.log(`${colors.cyan}Provider: ${result.metadata.provider}${colors.reset}`);
  console.log(`${colors.cyan}Model: ${result.metadata.model || 'N/A'}${colors.reset}`);
  console.log(`${colors.cyan}Generated: ${result.questions.length} questions${colors.reset}\n`);
  
  // Display and analyze each question
  let totalScore = 0;
  const maxScore = 100;
  let realQuestions = 0;
  
  result.questions.forEach((question, index) => {
    const qNum = index + 1;
    
    console.log(`${colors.bright}${colors.blue}━━━ Question ${qNum} ━━━${colors.reset}`);
    console.log(`${colors.bright}Q${qNum}: ${question.question}${colors.reset}`);
    console.log();
    
    // Display options
    ['A', 'B', 'C', 'D'].forEach(letter => {
      const isCorrect = letter === question.correctAnswer;
      const marker = isCorrect ? `${colors.green}✓` : ' ';
      console.log(`${marker} ${colors.cyan}${letter}:${colors.reset} ${question.options[letter]}`);
    });
    
    console.log();
    console.log(`${colors.yellow}💡 Correct Answer: ${question.correctAnswer}${colors.reset}`);
    console.log(`${colors.magenta}📝 Explanation: ${question.explanation}${colors.reset}`);
    
    // Check if this is a generic template
    const isGeneric = detectGenericTemplate(question);
    
    if (isGeneric) {
      console.log(`\n${colors.red}⚠️  WARNING: This appears to be a generic template, not a real factual question${colors.reset}`);
    } else {
      realQuestions++;
    }
    
    // Analyze question quality
    const analysis = analyzeQuestionQuality(question, prompt);
    totalScore += analysis.score;
    
    console.log(`\n${colors.bright}📊 Quality Analysis:${colors.reset}`);
    console.log(`   Score: ${analysis.score}/${maxScore}`);
    
    if (analysis.strengths.length > 0) {
      console.log(`   ${colors.green}Strengths:${colors.reset}`);
      analysis.strengths.forEach(strength => {
        console.log(`   ✓ ${strength}`);
      });
    }
    
    if (analysis.issues.length > 0) {
      console.log(`   ${colors.yellow}Areas for improvement:${colors.reset}`);
      analysis.issues.forEach(issue => {
        console.log(`   ⚠ ${issue}`);
      });
    }
    
    console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}\n`);
  });
  
  // Overall assessment
  const averageScore = totalScore / result.questions.length;
  const realQuestionPercent = (realQuestions / result.questions.length) * 100;
  
  console.log(`${colors.bright}${colors.green}🎯 OVERALL ASSESSMENT${colors.reset}`);
  console.log(`${colors.cyan}======================${colors.reset}`);
  console.log(`Overall Quality Score: ${averageScore.toFixed(1)}%`);
  console.log(`Real Questions: ${realQuestions}/${result.questions.length} (${realQuestionPercent.toFixed(1)}%)`);
  
  if (averageScore >= 80 && realQuestionPercent >= 80) {
    console.log(`${colors.green}🌟 EXCELLENT: High-quality, relevant questions generated${colors.reset}`);
  } else if (averageScore >= 60 && realQuestionPercent >= 60) {
    console.log(`${colors.yellow}👍 GOOD: Acceptable quality with room for improvement${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  NEEDS IMPROVEMENT: Consider using enhanced templates or improving AI models${colors.reset}`);
  }
  
  // Model performance summary
  console.log(`\n${colors.bright}🤖 MODEL PERFORMANCE${colors.reset}`);
  console.log(`${colors.cyan}===================${colors.reset}`);
  
  const modelUsed = result.metadata.model || 'unknown';
  if (modelUsed.includes('flan-t5-small')) {
    console.log(`${colors.green}✅ FLAN-T5-small model used successfully${colors.reset}`);
  } else if (modelUsed.includes('gpt2')) {
    console.log(`${colors.yellow}📝 Using GPT-2 fallback model${colors.reset}`);
  } else if (modelUsed.includes('template')) {
    console.log(`${colors.blue}📚 Using template service for guaranteed factual content${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Using fallback model: ${modelUsed}${colors.reset}`);
  }
  
  console.log(`\n${colors.green}🎉 Question generation completed successfully!${colors.reset}`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2];
  
  if (!prompt) {
    displayUsage();
    process.exit(1);
  }
  
  generateQuestionsForPrompt(prompt).catch(error => {
    console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

export default generateQuestionsForPrompt;
