/**
 * Enhanced Template Service - Provides high-quality topic-specific questions
 * This service creates realistic questions for various topics including Bangladesh
 */

class EnhancedTemplateService {
  constructor() {
    this.templateMap = {
      'Bangladesh': this.generateBangladeshQuestion,
      'History': this.generateHistoryQuestion,
      'Science': this.generateScienceQuestion,
      'Mathematics': this.generateMathQuestion,
      'General Knowledge': this.generateGeneralKnowledgeQuestion
    };
  }

  getQuestion(topic, id, difficulty = 'medium', type = 'conceptual') {
    // Find the specific generator or use generic as fallback
    const generator = this.templateMap[topic] || this.generateGenericQuestion;
    
    if (generator === this.generateGenericQuestion) {
      return generator(topic, id, difficulty, type);
    }
    
    return generator.call(this, id, difficulty, type);
  }

  generateBangladeshQuestion(id, difficulty, type) {
    const questions = {
      history: [
        {
          question: "When did Bangladesh gain independence?",
          options: {
            A: "1947",
            B: "1971",
            C: "1975",
            D: "1952"
          },
          correctAnswer: "B",
          explanation: "Bangladesh gained independence from Pakistan on March 26, 1971, after a nine-month liberation war."
        },
        {
          question: "What is the capital city of Bangladesh?",
          options: {
            A: "Chittagong",
            B: "Sylhet",
            C: "Dhaka",
            D: "Rajshahi"
          },
          correctAnswer: "C",
          explanation: "Dhaka is the capital and largest city of Bangladesh, serving as the political, economic, and cultural center."
        },
        {
          question: "Which river is known as the lifeline of Bangladesh?",
          options: {
            A: "Ganges",
            B: "Padma",
            C: "Meghna",
            D: "All of the above"
          },
          correctAnswer: "D",
          explanation: "Bangladesh is formed by the delta of three major rivers: Ganges (Padma), Brahmaputra (Jamuna), and Meghna."
        }
      ],
      culture: [
        {
          question: "What is the national language of Bangladesh?",
          options: {
            A: "English",
            B: "Hindi",
            C: "Bengali (Bangla)",
            D: "Urdu"
          },
          correctAnswer: "C",
          explanation: "Bengali (Bangla) is the national and official language of Bangladesh, spoken by over 98% of the population."
        },
        {
          question: "Which festival is widely celebrated in Bangladesh to mark the Bengali New Year?",
          options: {
            A: "Pohela Boishakh",
            B: "Eid ul-Fitr",
            C: "Durga Puja",
            D: "Christmas"
          },
          correctAnswer: "A",
          explanation: "Pohela Boishakh is the traditional Bengali New Year celebration, observed on April 14th with great enthusiasm across Bangladesh."
        }
      ],
      geography: [
        {
          question: "Bangladesh is located in which geographic region?",
          options: {
            A: "Southeast Asia",
            B: "South Asia",
            C: "Central Asia",
            D: "East Asia"
          },
          correctAnswer: "B",
          explanation: "Bangladesh is located in South Asia, bordered by India, Myanmar, and the Bay of Bengal."
        },
        {
          question: "What type of climate does Bangladesh have?",
          options: {
            A: "Desert climate",
            B: "Tropical monsoon climate",
            C: "Mediterranean climate",
            D: "Continental climate"
          },
          correctAnswer: "B",
          explanation: "Bangladesh has a tropical monsoon climate characterized by hot, humid summers and mild winters with distinct wet and dry seasons."
        }
      ]
    };

    const categoryKeys = Object.keys(questions);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const categoryQuestions = questions[randomCategory];
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    
    return {
      id,
      ...question,
      difficulty,
      topic: 'Bangladesh',
      category: `bangladesh-${randomCategory}`
    };
  }

  generateHistoryQuestion(id, difficulty, type) {
    const questions = {
      ancient: [
        {
          question: "Which ancient civilization is known for building the pyramids?",
          options: {
            A: "Greeks",
            B: "Romans",
            C: "Egyptians",
            D: "Persians"
          },
          correctAnswer: "C",
          explanation: "The ancient Egyptians built the famous pyramids, including the Great Pyramid of Giza, as tombs for their pharaohs."
        },
        {
          question: "The Roman Empire was founded in which year?",
          options: {
            A: "753 BC",
            B: "27 BC",
            C: "476 AD",
            D: "1453 AD"
          },
          correctAnswer: "B",
          explanation: "The Roman Empire was established in 27 BC when Augustus became the first Roman Emperor, though Rome itself was founded in 753 BC."
        }
      ],
      modern: [
        {
          question: "World War II ended in which year?",
          options: {
            A: "1944",
            B: "1945",
            C: "1946",
            D: "1947"
          },
          correctAnswer: "B",
          explanation: "World War II ended in 1945, with Germany surrendering in May and Japan surrendering in August after the atomic bombings."
        },
        {
          question: "The Berlin Wall fell in which year?",
          options: {
            A: "1987",
            B: "1988",
            C: "1989",
            D: "1990"
          },
          correctAnswer: "C",
          explanation: "The Berlin Wall fell on November 9, 1989, marking a significant moment in the end of the Cold War and German reunification."
        }
      ]
    };

    const categoryKeys = Object.keys(questions);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const categoryQuestions = questions[randomCategory];
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    
    return {
      id,
      ...question,
      difficulty,
      topic: 'History',
      category: `history-${randomCategory}`
    };
  }

  generateScienceQuestion(id, difficulty, type) {
    const questions = {
      physics: [
        {
          question: "What is the speed of light in a vacuum?",
          options: {
            A: "300,000 km/s",
            B: "299,792,458 m/s",
            C: "186,000 miles/s",
            D: "All of the above are approximately correct"
          },
          correctAnswer: "D",
          explanation: "The speed of light in a vacuum is exactly 299,792,458 meters per second, which equals approximately 300,000 km/s or 186,000 miles/s."
        }
      ],
      chemistry: [
        {
          question: "What is the chemical symbol for gold?",
          options: {
            A: "Go",
            B: "Au",
            C: "Ag",
            D: "Gd"
          },
          correctAnswer: "B",
          explanation: "The chemical symbol for gold is Au, derived from the Latin word 'aurum' meaning gold."
        }
      ],
      biology: [
        {
          question: "How many chambers does a human heart have?",
          options: {
            A: "2",
            B: "3",
            C: "4",
            D: "5"
          },
          correctAnswer: "C",
          explanation: "The human heart has four chambers: two atria (upper chambers) and two ventricles (lower chambers)."
        }
      ]
    };

    const categoryKeys = Object.keys(questions);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const categoryQuestions = questions[randomCategory];
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    
    return {
      id,
      ...question,
      difficulty,
      topic: 'Science',
      category: `science-${randomCategory}`
    };
  }

  generateMathQuestion(id, difficulty, type) {
    const questions = {
      algebra: [
        {
          question: "What is the value of x if 2x + 5 = 15?",
          options: {
            A: "5",
            B: "10",
            C: "7",
            D: "3"
          },
          correctAnswer: "A",
          explanation: "To solve 2x + 5 = 15, subtract 5 from both sides: 2x = 10, then divide by 2: x = 5."
        }
      ],
      geometry: [
        {
          question: "What is the sum of angles in a triangle?",
          options: {
            A: "90 degrees",
            B: "180 degrees",
            C: "270 degrees",
            D: "360 degrees"
          },
          correctAnswer: "B",
          explanation: "The sum of all interior angles in any triangle is always 180 degrees."
        }
      ]
    };

    const categoryKeys = Object.keys(questions);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const categoryQuestions = questions[randomCategory];
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    
    return {
      id,
      ...question,
      difficulty,
      topic: 'Mathematics',
      category: `math-${randomCategory}`
    };
  }

  generateGeneralKnowledgeQuestion(id, difficulty, type) {
    const questions = {
      geography: [
        {
          question: "Which is the largest ocean on Earth?",
          options: {
            A: "Atlantic Ocean",
            B: "Indian Ocean",
            C: "Pacific Ocean",
            D: "Arctic Ocean"
          },
          correctAnswer: "C",
          explanation: "The Pacific Ocean is the largest and deepest ocean on Earth, covering more than 60 million square miles."
        }
      ],
      arts: [
        {
          question: "Who painted the Mona Lisa?",
          options: {
            A: "Pablo Picasso",
            B: "Vincent van Gogh",
            C: "Leonardo da Vinci",
            D: "Michelangelo"
          },
          correctAnswer: "C",
          explanation: "The Mona Lisa was painted by Italian Renaissance artist Leonardo da Vinci between 1503 and 1506."
        }
      ]
    };

    const categoryKeys = Object.keys(questions);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const categoryQuestions = questions[randomCategory];
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    
    return {
      id,
      ...question,
      difficulty,
      topic: 'General Knowledge',
      category: `general-${randomCategory}`
    };
  }

  generateGenericQuestion(topic, id, difficulty, type) {
    // Enhanced generic questions with more variety
    const questionTemplates = [
      {
        question: `What is a fundamental concept in ${topic}?`,
        options: {
          A: "Understanding basic principles",
          B: "Memorizing facts only",
          C: "Avoiding practice",
          D: "Ignoring context"
        },
        correctAnswer: "A",
        explanation: `Understanding basic principles is fundamental when studying ${topic}, as it provides the foundation for deeper learning.`
      },
      {
        question: `Which approach is most effective when learning ${topic}?`,
        options: {
          A: "Passive reading only",
          B: "Active practice and application",
          C: "Memorization without understanding",
          D: "Avoiding difficult concepts"
        },
        correctAnswer: "B",
        explanation: `Active practice and application is the most effective approach when learning ${topic}, as it reinforces understanding and builds skills.`
      },
      {
        question: `What is important when studying ${topic}?`,
        options: {
          A: "Rushing through material",
          B: "Building knowledge systematically",
          C: "Skipping fundamentals",
          D: "Working in isolation"
        },
        correctAnswer: "B",
        explanation: `Building knowledge systematically is important when studying ${topic}, ensuring a solid foundation for advanced concepts.`
      }
    ];

    const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    
    return {
      id,
      ...template,
      difficulty,
      topic,
      category: `${topic.toLowerCase()}-generic`
    };
  }
}

export default new EnhancedTemplateService();
