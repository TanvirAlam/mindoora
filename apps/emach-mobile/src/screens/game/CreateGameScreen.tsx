import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface CreateGameScreenProps {
  onBack: () => void;
  onGameCreated?: (gameData: any) => void;
}

interface QuestionSet {
  question: string;
  options: string[];
  correctAnswer: number;
}

const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ onBack, onGameCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionSet[]>([]);
  const [gameTitle, setGameTitle] = useState('');

  const handleGenerateQuestions = async () => {
    if (!prompt.trim()) {
      Alert.alert('Invalid Input', 'Please enter a topic or prompt to generate questions.');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating questions for prompt:', prompt);
      
      // Simulate API call to generate questions
      // In production, you would call your AI service here
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated questions
      const mockQuestions: QuestionSet[] = [
        {
          question: `What is the main concept related to "${prompt}"?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0
        },
        {
          question: `Which of the following best describes "${prompt}"?`,
          options: ['Description A', 'Description B', 'Description C', 'Description D'],
          correctAnswer: 1
        },
        {
          question: `What is a key characteristic of "${prompt}"?`,
          options: ['Characteristic A', 'Characteristic B', 'Characteristic C', 'Characteristic D'],
          correctAnswer: 2
        },
        {
          question: `How does "${prompt}" relate to its field?`,
          options: ['Relation A', 'Relation B', 'Relation C', 'Relation D'],
          correctAnswer: 3
        },
        {
          question: `What is an important application of "${prompt}"?`,
          options: ['Application A', 'Application B', 'Application C', 'Application D'],
          correctAnswer: 0
        }
      ];
      
      setGeneratedQuestions(mockQuestions);
      setGameTitle(`Quiz: ${prompt}`);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Error', 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateGame = async () => {
    if (!gameTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your game.');
      return;
    }

    try {
      const gameData = {
        title: gameTitle,
        prompt: prompt,
        questions: generatedQuestions,
        createdAt: new Date().toISOString(),
      };

      console.log('Creating game:', gameData);
      
      // Here you would save the game to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onGameCreated) {
        onGameCreated(gameData);
      } else {
        Alert.alert('Success', 'Game created successfully!', [
          { text: 'OK', onPress: onBack }
        ]);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game. Please try again.');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setPrompt('');
            setGeneratedQuestions([]);
            setGameTitle('');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image 
            source={require('../../../assets/mindoora.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.gameIcon}>
            <Image 
              source={require('../../../assets/mindoora-short.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </Text>
          <Text style={styles.title}>Create Game</Text>
          <Text style={styles.subtitle}>Enter a topic to generate quiz questions</Text>
        </View>

        {/* Prompt Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Enter Topic or Prompt</Text>
          
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="e.g., JavaScript programming, World History, Biology..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isGenerating}
          />
          
          <Text style={styles.inputHint}>
            Be specific for better questions. You can mention difficulty level or focus areas.
          </Text>
        </View>

        {/* Generate Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              prompt.trim() ? styles.generateButtonEnabled : styles.generateButtonDisabled,
              isGenerating && styles.generateButtonLoading
            ]}
            onPress={handleGenerateQuestions}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateButtonText}>Generating Questions...</Text>
              </View>
            ) : (
              <Text style={[
                styles.generateButtonText,
                prompt.trim() ? styles.generateButtonTextEnabled : styles.generateButtonTextDisabled
              ]}>
                Generate 5 Questions
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Generated Questions Section */}
        {generatedQuestions.length > 0 && (
          <View style={styles.questionsSection}>
            <Text style={styles.sectionTitle}>Generated Questions</Text>
            
            {/* Game Title Input */}
            <View style={styles.gameTitleSection}>
              <Text style={styles.inputLabel}>Game Title</Text>
              <TextInput
                style={styles.titleInput}
                value={gameTitle}
                onChangeText={setGameTitle}
                placeholder="Enter game title..."
                placeholderTextColor="#999"
              />
            </View>

            {/* Questions Preview */}
            {generatedQuestions.map((question, index) => (
              <View key={index} style={styles.questionCard}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                <Text style={styles.questionText}>{question.question}</Text>
                
                <View style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => (
                    <View
                      key={optionIndex}
                      style={[
                        styles.optionItem,
                        optionIndex === question.correctAnswer && styles.correctOption
                      ]}
                    >
                      <Text style={[
                        styles.optionText,
                        optionIndex === question.correctAnswer && styles.correctOptionText
                      ]}>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </Text>
                      {optionIndex === question.correctAnswer && (
                        <Text style={styles.correctIndicator}>✓</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.createGameButton}
                onPress={handleCreateGame}
              >
                <Text style={styles.createGameButtonText}>Create Game</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it Works</Text>
            <Text style={styles.infoText}>
              1. Enter a topic or detailed prompt{'\n'}
              2. Tap "Generate 5 Questions" to create quiz{'\n'}
              3. Review the generated questions{'\n'}
              4. Give your game a title{'\n'}
              5. Tap "Create Game" to save
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    paddingVertical: 30,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  gameIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  promptInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputHint: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  generateButton: {
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  generateButtonEnabled: {
    backgroundColor: '#4CAF50',
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonLoading: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  generateButtonTextEnabled: {
    color: '#fff',
  },
  generateButtonTextDisabled: {
    color: '#999',
  },
  questionsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameTitleSection: {
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  correctOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  correctOptionText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  correctIndicator: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 20,
    gap: 15,
  },
  createGameButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  createGameButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CreateGameScreen;
