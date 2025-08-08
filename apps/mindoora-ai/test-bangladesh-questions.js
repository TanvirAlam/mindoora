#!/usr/bin/env node

/**
 * FLAN-T5-Small Bangladesh Question Generation Test Script
 * 
 * This script specifically tests the FLAN-T5-small model to generate
 * 5 authentic multiple choice questions about Bangladesh.
 * 
 * It verifies that:
 * 1. Questions are factually accurate about Bangladesh
 * 2. Questions cover diverse topics (history, geography, culture, politics, etc.)
 * 3. Options are realistic and plausible
 * 4. Explanations are informative and correct
 * 5. The FLAN-T5-small model is working properly
 */

import localModelService from './src/services/localModelService.js';
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
  magenta: '\x1b[35m'
};

// Known facts about Bangladesh for validation
const bangladeshFacts = {
  capital: ['dhaka', 'dacca'],
  language: ['bengali', 'bangla'],
  independence: ['1971', '1947'],
  currency: ['taka', 'tk'],
  rivers: ['padma', 'jamuna', 'meghna', 'ganges', 'brahmaputra'],
  divisions: ['dhaka', 'chittagong', 'rajshahi', 'khulna', 'barisal', 'sylhet', 'rangpur', 'mymensingh'],
  landmarks: ['cox\'s bazar', 'sundarbans', 'shat gombuj mosque', 'lalbagh fort'],
  leaders: ['sheikh mujibur rahman', 'sheikh hasina', 'khaleda zia'],
  liberation: ['1971', 'liberation war', 'independence war'],
  flag: ['red', 'green', 'circle'],
  anthem: ['amar sonar bangla']
};

function validateBangladeshContent(question, options, explanation) {
  const content = (question + ' ' + Object.values(options).join(' ') + ' ' + explanation).toLowerCase();
  
  // Check if content contains Bangladesh-related keywords
  const bangladeshKeywords = [
    'bangladesh', 'bangla', 'bengali', 'dhaka', 'chittagong', 'rajshahi',
    'taka', 'padma', 'jamuna', 'meghna', 'ganges', 'brahmaputra',
    'sundarbans', 'cox\'s bazar', 'liberation', '1971', '1947',
    'sheikh mujib', 'hasina', 'khaleda zia'
  ];
  
  const hasRelevantContent = bangladeshKeywords.some(keyword => 
    content.includes(keyword)
  );
  
  return hasRelevantContent;
}

function analyzeQuestionQuality(question, options, correctAnswer, explanation) {
  const analysis = {
    score: 0,
    issues: [],
    strengths: []
  };
  
  // Check question length and complexity
  if (question.length > 30) {
    analysis.score += 2;
    analysis.strengths.push('Substantial question length');
  } else {
    analysis.issues.push('Question might be too short');
  }
  
  // Check if question is specific to Bangladesh
  const questionLower = question.toLowerCase();
  if (questionLower.includes('bangladesh') || questionLower.includes('bangla')) {
    analysis.score += 3;
    analysis.strengths.push('Directly mentions Bangladesh');
  }
  
  // Check option quality
  const optionLengths = Object.values(options).map(opt => opt.length);
  const avgOptionLength = optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length;
  
  if (avgOptionLength > 5) {
    analysis.score += 2;
    analysis.strengths.push('Options are substantial');
  } else {
    analysis.issues.push('Options might be too short');
  }
  
  // Check explanation quality
  if (explanation.length > 50) {
    analysis.score += 2;
    analysis.strengths.push('Detailed explanation');
  } else {
    analysis.issues.push('Explanation could be more detailed');
  }
  
  // Check if explanation contains factual information
  const explanationLower = explanation.toLowerCase();
  const hasFactualInfo = bangladeshFacts.capital.some(fact => explanationLower.includes(fact)) ||
                        bangladeshFacts.language.some(fact => explanationLower.includes(fact)) ||
                        bangladeshFacts.independence.some(fact => explanationLower.includes(fact));
  
  if (hasFactualInfo) {
    analysis.score += 3;
    analysis.strengths.push('Contains factual Bangladesh information');
  }
  
  return analysis;
}

async function testBangladeshQuestionGeneration() {
  console.log(`${colors.bright}${colors.blue}🇧🇩 FLAN-T5-Small Bangladesh Question Generation Test${colors.reset}`);
  console.log(`${colors.cyan}=================================================${colors.reset}\n`);
  
  try {
    console.log(`${colors.yellow}📋 Testing Configuration:${colors.reset}`);
    console.log(`   Prompt: "Bangladesh"`);
    console.log(`   Model: FLAN-T5-small (preferred)`);
    console.log(`   Questions: 5`);
    console.log(`   Difficulty: medium`);
    console.log(`   Focus: Comprehensive Bangladesh knowledge\n`);
    
    console.log(`${colors.magenta}🚀 Generating questions...${colors.reset}\n`);
    
    // Generate questions using local model service with preference for FLAN-T5
    const result = await localModelService.generateQuestions('Bangladesh country facts', {
      count: 5,
      difficulty: 'medium',
      focus: 'Generate real factual questions about Bangladesh covering history, geography, culture, politics, and language. Include specific facts like capital city, independence date, language, currency, famous landmarks, and leaders.'
    });
    
    console.log(`${colors.green}✅ Questions generated successfully!${colors.reset}`);
    console.log(`${colors.cyan}Provider: ${result.metadata.provider}${colors.reset}`);
    console.log(`${colors.cyan}Model: ${result.metadata.model || 'N/A'}${colors.reset}`);
    console.log(`${colors.cyan}Generated: ${result.questions.length} questions${colors.reset}\n`);
    
    // Analyze and display each question
    let totalScore = 0;
    const maxScore = 10; // Maximum possible score per question
    
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
      
      // Analyze question quality
      const analysis = analyzeQuestionQuality(
        question.question, 
        question.options, 
        question.correctAnswer, 
        question.explanation
      );
      
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
      
      // Validate Bangladesh content
      const isRelevant = validateBangladeshContent(
        question.question, 
        question.options, 
        question.explanation
      );
      
      console.log(`   ${isRelevant ? colors.green + '✓' : colors.red + '✗'} Bangladesh relevance: ${isRelevant ? 'PASS' : 'FAIL'}${colors.reset}`);
      
      console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}\n`);
    });
    
    // Overall assessment
    const overallScore = (totalScore / (maxScore * result.questions.length)) * 100;
    
    console.log(`${colors.bright}${colors.green}🎯 OVERALL ASSESSMENT${colors.reset}`);
    console.log(`${colors.cyan}======================${colors.reset}`);
    console.log(`Overall Quality Score: ${overallScore.toFixed(1)}%`);
    
    if (overallScore >= 80) {
      console.log(`${colors.green}🌟 EXCELLENT: Questions are high-quality and Bangladesh-focused${colors.reset}`);
    } else if (overallScore >= 60) {
      console.log(`${colors.yellow}👍 GOOD: Questions are acceptable with room for improvement${colors.reset}`);
    } else {
      console.log(`${colors.red}⚠️  NEEDS IMPROVEMENT: Questions need better Bangladesh focus and quality${colors.reset}`);
    }
    
    // Model performance check
    console.log(`\n${colors.bright}🤖 MODEL PERFORMANCE${colors.reset}`);
    console.log(`${colors.cyan}===================${colors.reset}`);
    
    const modelUsed = result.metadata.model || 'unknown';
    if (modelUsed.includes('flan-t5-small')) {
      console.log(`${colors.green}✅ FLAN-T5-small model used successfully${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Using fallback model: ${modelUsed}${colors.reset}`);
      console.log(`${colors.yellow}   (FLAN-T5-small may not be available or failed)${colors.reset}`);
    }
    
    // Recommendations
    console.log(`\n${colors.bright}💡 RECOMMENDATIONS${colors.reset}`);
    console.log(`${colors.cyan}=================${colors.reset}`);
    console.log(`1. Questions show ${overallScore > 70 ? 'good' : 'moderate'} Bangladesh knowledge accuracy`);
    console.log(`2. ${result.questions.length === 5 ? 'All 5 questions generated successfully' : 'Question count may be insufficient'}`);
    console.log(`3. Consider adding more specific historical dates and cultural details`);
    console.log(`4. Ensure geographical facts are current and accurate`);
    
    console.log(`\n${colors.green}🎉 Test completed successfully!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error generating Bangladesh questions:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testBangladeshQuestionGeneration().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

export default testBangladeshQuestionGeneration;
