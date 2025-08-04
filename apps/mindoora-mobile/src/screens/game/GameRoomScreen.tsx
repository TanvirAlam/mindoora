import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import authService from '../../services/auth/authService';
import { Colors } from '../../constants/colors';
import FireworksAnimation from '../../components/FireworksAnimation';
import RainAnimation from '../../components/RainAnimation';
import RadialProgressTimer from '../../components/RadialProgressTimer';
import LeaderboardAnimation from '../../components/LeaderboardAnimation';

const { width } = Dimensions.get('window');

interface GameRoomScreenProps {
  onBack: () => void;
  gameData: {
    id: string;
    title: string;
    questionCount: number;
    maxQuestions: number;
  };
}

interface Question {
  id: string;
  question: string;
  options: string | object | undefined; // JSON string, object with A, B, C, D keys, or undefined
  answer: number; // 0-based index of correct answer
  timeLimit?: number;
  qPoints?: number;
}

interface GameState {
  currentQuestionIndex: number;
  score: number;
  timeLeft: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isAnswered: boolean;
  gameFinished: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

const QUESTION_TIME_LIMIT = 30; // 30 seconds per question
const POINTS_PER_CORRECT_ANSWER = 1;

const GameRoomScreen: React.FC<GameRoomScreenProps> = ({ onBack, gameData }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    timeLeft: QUESTION_TIME_LIMIT,
    selectedAnswer: null,
    showFeedback: false,
    isAnswered: false,
    gameFinished: false,
    correctAnswers: 0,
    totalQuestions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showWrongAnimation, setShowWrongAnimation] = useState(false);

  // Animation values
  const timerProgress = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const feedbackScale = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGameQuestions = async () => {
    try {
      setIsLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User is not authenticated.');
      }
      
      const response = await fetch(`http://localhost:8080/api/games/questions?gameId=${gameData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.questions) {
        console.log('🎯 Questions fetched successfully:', result.data.questions.length);
        
        // Log the structure of the first few questions for debugging
        result.data.questions.slice(0, 3).forEach((question, index) => {
          console.log(`Question ${index + 1} structure:`, {
            id: question.id,
            question: question.question?.substring(0, 50) + '...',
            options: question.options,
            optionsType: typeof question.options,
            answer: question.answer,
            fullQuestion: JSON.stringify(question, null, 2)
          });
        });
        
        setQuestions(result.data.questions);
        setGameState(prev => ({
          ...prev,
          totalQuestions: result.data.questions.length
        }));
      } else {
        throw new Error('No questions found for this game');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load game questions. Please try again.');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          // Time's up - auto-submit with no answer
          handleTimeUp();
          return { ...prev, timeLeft: 0 };
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    // Animate timer progress
    Animated.timing(timerProgress, {
      toValue: 0,
      duration: QUESTION_TIME_LIMIT * 1000,
      useNativeDriver: false,
    }).start();
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerProgress.stopAnimation();
  };

  const resetTimer = () => {
    stopTimer();
    setGameState(prev => ({ ...prev, timeLeft: QUESTION_TIME_LIMIT }));
    timerProgress.setValue(1);
  };

  const handleTimeUp = () => {
    if (!gameState.isAnswered) {
      setGameState(prev => ({ ...prev, isAnswered: true, showFeedback: true }));
      showFeedbackAnimation();
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (gameState.isAnswered || gameState.showFeedback) return;

    const currentQuestion = questions[gameState.currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.answer;
    
    stopTimer();
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: optionIndex,
      isAnswered: true,
      showFeedback: true,
      score: isCorrect ? prev.score + POINTS_PER_CORRECT_ANSWER : prev.score,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));

    // Show animations for answers
    if (isCorrect) {
      console.log('🎆 Triggering fireworks for correct answer!');
      setShowFireworks(true);
    } else {
      console.log('💧 Triggering rain animation for wrong answer');
      setShowWrongAnimation(true);
    }

    showFeedbackAnimation();
    
    // Move to next question after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const showFeedbackAnimation = () => {
    Animated.sequence([
      Animated.spring(feedbackScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(pulseScale, {
        toValue: 1.1,
        useNativeDriver: true,
      }),
      Animated.spring(pulseScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1;
    
    // Hide all animations
    setShowFireworks(false);
    setShowWrongAnimation(false);
    
    if (nextIndex >= questions.length) {
      // Game finished
      setGameState(prev => ({ ...prev, gameFinished: true }));
      return;
    }

    // Reset for next question
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      selectedAnswer: null,
      showFeedback: false,
      isAnswered: false,
      timeLeft: QUESTION_TIME_LIMIT,
    }));
    
    feedbackScale.setValue(0);
    resetTimer();
    startTimer();
  };

  const startGame = () => {
    setIsGameStarted(true);
    startTimer();
  };

  const restartGame = () => {
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      timeLeft: QUESTION_TIME_LIMIT,
      selectedAnswer: null,
      showFeedback: false,
      isAnswered: false,
      gameFinished: false,
      correctAnswers: 0,
      totalQuestions: questions.length,
    });
    setIsGameStarted(false);
    setShowFireworks(false);
    setShowWrongAnimation(false);
    feedbackScale.setValue(0);
    resetTimer();
  };

  const parseOptions = (optionsData: string | object | undefined): string[] => {
    if (!optionsData) {
      return [];
    }
    
    // If it's already an object
    if (typeof optionsData === 'object' && optionsData !== null) {
      const optionsObj = optionsData as any;
      if (optionsObj.A && optionsObj.B && optionsObj.C && optionsObj.D) {
        return [optionsObj.A, optionsObj.B, optionsObj.C, optionsObj.D];
      }
      if (Array.isArray(optionsObj)) {
        return optionsObj;
      }
      return Object.values(optionsObj).filter(opt => opt && typeof opt === 'string');
    }
    
    // If it's a string, try to parse it
    if (typeof optionsData === 'string') {
      try {
        const optionsObj = JSON.parse(optionsData);
        if (optionsObj.A && optionsObj.B && optionsObj.C && optionsObj.D) {
          return [optionsObj.A, optionsObj.B, optionsObj.C, optionsObj.D];
        }
        if (Array.isArray(optionsObj)) {
          return optionsObj;
        }
        return Object.values(optionsObj).filter(opt => opt && typeof opt === 'string');
      } catch {
        // If JSON parsing fails, try splitting by comma
        return optionsData.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
      }
    }
    
    return [];
  };

  const getScorePercentage = () => {
    return gameState.totalQuestions > 0 
      ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)
      : 0;
  };

  const getPerformanceMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "🎉 Outstanding! You're a quiz master!";
    if (percentage >= 80) return "🌟 Excellent! Great knowledge!";
    if (percentage >= 70) return "👍 Good job! Well done!";
    if (percentage >= 60) return "👌 Not bad! Keep practicing!";
    return "💪 Keep learning! You'll do better next time!";
  };

  useEffect(() => {
    fetchGameQuestions();
    
    return () => {
      stopTimer();
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Game...</Text>
          <Text style={styles.gameTitle}>{gameData.title}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>No Questions Found</Text>
          <Text style={styles.errorText}>This game doesn't have any questions to play.</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back to Games</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game Finished Screen
  if (gameState.gameFinished) {
    const currentUser = authService.getCurrentUser();
    const leaderboardEntries = [
      {
        id: currentUser?.id || '1',
        name: currentUser?.name || 'You',
        avatar: currentUser?.avatar || 'https://via.placeholder.com/50',
        score: gameState.score,
        correctAnswers: gameState.correctAnswers,
        totalQuestions: gameState.totalQuestions,
      },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" />
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedIcon}>🎯</Text>
          <Text style={styles.finishedTitle}>Game Complete!</Text>
          <Text style={styles.performanceMessage}>{getPerformanceMessage()}</Text>
          
          {/* Leaderboard Animation */}
          <LeaderboardAnimation entries={leaderboardEntries} />
          
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Final Score:</Text>
              <Text style={styles.finalScore}>{gameState.score} points</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Correct Answers:</Text>
              <Text style={styles.scoreValue}>{gameState.correctAnswers}/{gameState.totalQuestions}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Accuracy:</Text>
              <Text style={styles.scoreValue}>{getScorePercentage()}%</Text>
            </View>
          </View>

          <View style={styles.finishedActions}>
            <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
              <Text style={styles.restartButtonText}>🔄 Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back to Games</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Pre-Game Screen
  if (!isGameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" />
        <View style={styles.preGameContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{gameData.title}</Text>
            <Text style={styles.gameSubtitle}>Get Ready to Play!</Text>
            
            <View style={styles.gameStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{questions.length}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{QUESTION_TIME_LIMIT}s</Text>
                <Text style={styles.statLabel}>Per Question</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{POINTS_PER_CORRECT_ANSWER}</Text>
                <Text style={styles.statLabel}>Point Each</Text>
              </View>
            </View>

            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>📋 Game Rules</Text>
              <Text style={styles.ruleText}>• Answer each question within {QUESTION_TIME_LIMIT} seconds</Text>
              <Text style={styles.ruleText}>• Earn {POINTS_PER_CORRECT_ANSWER} point for each correct answer</Text>
              <Text style={styles.ruleText}>• No points for wrong or missed answers</Text>
              <Text style={styles.ruleText}>• Try to get the highest score possible!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startGameButton} onPress={startGame}>
            <Text style={styles.startGameButtonText}>🎮 Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game Playing Screen
  const currentQuestion = questions[gameState.currentQuestionIndex];
  
  // Debug logging for current question
  console.log(`🎮 Current Question ${gameState.currentQuestionIndex + 1}:`, {
    question: currentQuestion.question?.substring(0, 50) + '...',
    rawOptions: currentQuestion.options,
    optionsType: typeof currentQuestion.options,
    answer: currentQuestion.answer
  });
  
  const options = parseOptions(currentQuestion.options);
  
  console.log(`🎯 Parsed options for question ${gameState.currentQuestionIndex + 1}:`, options);
  console.log(`🔍 Options object structure:`, JSON.stringify(currentQuestion.options, null, 2));
  
  const progressPercentage = ((gameState.currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onBack}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.questionCounter}>
            {gameState.currentQuestionIndex + 1} / {questions.length}
          </Text>
          <Text style={styles.currentScore}>Score: {gameState.score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <RadialProgressTimer
          timeLeft={gameState.timeLeft}
          totalTime={QUESTION_TIME_LIMIT}
          size={100}
          strokeWidth={8}
          pulseScale={pulseScale}
        />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options ? (
          <View style={styles.optionsListContainer}>
            {(() => {
              // Handle both object and string formats
              let optionsData = {};
              
              if (typeof currentQuestion.options === 'object') {
                optionsData = currentQuestion.options as any;
              } else if (typeof currentQuestion.options === 'string') {
                try {
                  optionsData = JSON.parse(currentQuestion.options);
                } catch {
                  // If parsing fails, create a fallback structure
                  return (
                    <View style={styles.noOptionsContainer}>
                      <Text style={styles.noOptionsText}>Unable to parse options</Text>
                      <TouchableOpacity 
                        style={styles.skipButton} 
                        onPress={() => nextQuestion()}
                      >
                        <Text style={styles.skipButtonText}>Skip Question</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }
              }
              
              // Get the options entries and sort them by key (A, B, C, D)
              const optionEntries = Object.entries(optionsData).sort(([a], [b]) => a.localeCompare(b));
              
              if (optionEntries.length === 0) {
                return (
                  <View style={styles.noOptionsContainer}>
                    <Text style={styles.noOptionsText}>No options available</Text>
                    <TouchableOpacity 
                      style={styles.skipButton} 
                      onPress={() => nextQuestion()}
                    >
                      <Text style={styles.skipButtonText}>Skip Question</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              
              return optionEntries.map(([key, value], index) => {
                const isSelected = gameState.selectedAnswer === index;
                const isCorrect = index === currentQuestion.answer;
                const showResult = gameState.showFeedback;
                
                let optionStyle = [styles.optionRadioButton];
                let textStyle = [styles.optionRadioText];
                let labelStyle = [styles.optionRadioLabel];
                
                if (showResult) {
                  if (isCorrect) {
                    optionStyle.push(styles.correctOptionRadio);
                    textStyle.push(styles.correctOptionRadioText);
                    labelStyle.push(styles.correctOptionRadioLabel);
                  } else if (isSelected && !isCorrect) {
                    optionStyle.push(styles.incorrectOptionRadio);
                    textStyle.push(styles.incorrectOptionRadioText);
                    labelStyle.push(styles.incorrectOptionRadioLabel);
                  }
                } else if (isSelected) {
                  optionStyle.push(styles.selectedOptionRadio);
                  textStyle.push(styles.selectedOptionRadioText);
                  labelStyle.push(styles.selectedOptionRadioLabel);
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={optionStyle}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={gameState.isAnswered}
                  >
                    <View style={styles.radioButtonContainer}>
                      <View style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected,
                        showResult && isCorrect && styles.radioButtonCorrect,
                        showResult && isSelected && !isCorrect && styles.radioButtonIncorrect
                      ]}>
                        {isSelected && (
                          <View style={[
                            styles.radioButtonInner,
                            showResult && isCorrect && styles.radioButtonInnerCorrect,
                            showResult && !isCorrect && styles.radioButtonInnerIncorrect
                          ]} />
                        )}
                      </View>
                      <Text style={labelStyle}>{key}</Text>
                    </View>
                    <Text style={textStyle}>{String(value)}</Text>
                    {showResult && isCorrect && (
                      <Text style={styles.correctIcon}>✓</Text>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <Text style={styles.incorrectIcon}>✗</Text>
                    )}
                  </TouchableOpacity>
                );
              });
            })()
            }
          </View>
        ) : (
          <View style={styles.noOptionsContainer}>
            <Text style={styles.noOptionsText}>No options available for this question</Text>
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={() => nextQuestion()}
            >
              <Text style={styles.skipButtonText}>Skip Question</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Fireworks Animation for Correct Answers */}
      <FireworksAnimation 
        isVisible={showFireworks} 
        onComplete={() => setShowFireworks(false)}
      />
      
      {/* Rain Animation for Wrong Answers */}
      <RainAnimation 
        isVisible={showWrongAnimation} 
        onComplete={() => setShowWrongAnimation(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 18,
    color: '#16a085',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  preGameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gameInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameSubtitle: {
    fontSize: 20,
    color: '#16a085',
    marginBottom: 40,
    textAlign: 'center',
  },
  gameStats: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a085',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  rulesContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  ruleText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  startGameButton: {
    backgroundColor: '#16a085',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 40,
  },
  startGameButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  questionCounter: {
    fontSize: 16,
    color: '#16a085',
    fontWeight: 'bold',
  },
  currentScore: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16a085',
    borderRadius: 3,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#16a085',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a085',
  },
  timerTextUrgent: {
    color: '#e74c3c',
  },
  timerProgress: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#16a085',
    borderRadius: 2,
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  questionText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#16a085',
    backgroundColor: '#1a2332',
  },
  correctOption: {
    backgroundColor: '#27ae60',
    borderColor: '#2ecc71',
  },
  incorrectOption: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a085',
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#16a085',
  },
  correctOptionText: {
    color: '#fff',
  },
  incorrectOptionText: {
    color: '#fff',
  },
  correctIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  incorrectIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -50 }],
    width: 150,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16a085',
  },
  feedbackIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  finishedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  performanceMessage: {
    fontSize: 18,
    color: '#16a085',
    textAlign: 'center',
    marginBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    marginBottom: 40,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  finalScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a085',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  finishedActions: {
    width: '100%',
  },
  restartButton: {
    backgroundColor: '#16a085',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#333',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  noOptionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noOptionsText: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  skipButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  optionsListContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  optionRadioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionRadio: {
    borderColor: '#16a085',
    backgroundColor: '#1a2332',
  },
  correctOptionRadio: {
    backgroundColor: '#27ae60',
    borderColor: '#2ecc71',
  },
  incorrectOptionRadio: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#16a085',
  },
  radioButtonCorrect: {
    borderColor: '#2ecc71',
  },
  radioButtonIncorrect: {
    borderColor: '#e74c3c',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a085',
  },
  radioButtonInnerCorrect: {
    backgroundColor: '#2ecc71',
  },
  radioButtonInnerIncorrect: {
    backgroundColor: '#e74c3c',
  },
  optionRadioLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a085',
    minWidth: 20,
  },
  selectedOptionRadioLabel: {
    color: '#16a085',
  },
  correctOptionRadioLabel: {
    color: '#fff',
  },
  incorrectOptionRadioLabel: {
    color: '#fff',
  },
  optionRadioText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionRadioText: {
    color: '#16a085',
  },
  correctOptionRadioText: {
    color: '#fff',
  },
  incorrectOptionRadioText: {
    color: '#fff',
  },
});

export default GameRoomScreen;
