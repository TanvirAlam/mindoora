import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/auth/authService';
import invitationService from '../../services/invitationService';
import gameService from '../../services/gameService';
import { Colors } from '../../constants/colors';
import WinnersSection from '../../components/WinnersSection';
import GameLobbyScreen from './GameLobbyScreen';
import GameRoomScreen from './GameRoomScreen';
import Spinner from '../../components/ui/Spinner';

interface MyGamesScreenProps {
  onBack: () => void;
  onNavigateToAddQuestions?: (gameData: GameData) => void;
}

interface GameData {
  id: string;
  title: string;
  questionCount: number; // Fixed: API uses questionCount, not questionsCount
  questionsCount?: number; // Keep for backward compatibility
  isReady: boolean;
  maxQuestions: number;
  remainingQuestions: number;
  createdAt?: string;
  language?: string;
  nPlayer?: number;
}

interface Question {
  id: string;
  question: string;
  options: string; // JSON string with A, B, C, D keys
  answer: number; // 0-based index of correct answer
  timeLimit?: number;
  qSource?: string;
  qPoints?: number;
  createdAt?: string;
}

const MyGamesScreen: React.FC<MyGamesScreenProps> = ({ onBack, onNavigateToAddQuestions }) => {
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingGameTitle, setDeletingGameTitle] = useState('');
  
  // Questions modal state
  const [isQuestionsModalVisible, setIsQuestionsModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
// Invitation modal state
  const [isInvitationModalVisible, setIsInvitationModalVisible] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [invitationStatus, setInvitationStatus] = useState<'pending' | 'accepted' | 'rejected' | 'none'>('none');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  
  // Track invitation status for each game
  const [gameInvitationStatuses, setGameInvitationStatuses] = useState<Record<string, {
    invitations: Array<{
      id: string;
      status: 'pending' | 'accepted' | 'rejected';
      recipientEmail: string;
      sentAt: string;
    }>;
    totalSent: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
  }>>({});

  // Game room state
  const [isGameRoomVisible, setIsGameRoomVisible] = useState(false);
  const [gameToPlay, setGameToPlay] = useState<GameData | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  
  // Game lobby state
  const [isGameLobbyVisible, setIsGameLobbyVisible] = useState(false);
  const [lobbyGameId, setLobbyGameId] = useState<string | null>(null);
  const [lobbyInviteCode, setLobbyInviteCode] = useState<string | null>(null);
  
  // Animation for central play button
  const scaleValue = useRef(new Animated.Value(1)).current;

  const fetchMyGames = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User is not authenticated. Please sign in first.');
      }
      
      const response = await fetch('http://localhost:8080/api/games/my-games', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch games';
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          errorMessage = response.statusText || `HTTP ${response.status} error`;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2));
      console.log('Games data:', result.data?.games);
      
      // Log each game's data structure
      if (result.data?.games) {
        result.data.games.forEach((game, index) => {
          console.log(`Game ${index}:`, JSON.stringify(game, null, 2));
        });
      }
      
      setGames(result.data?.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      Alert.alert('Error', error.message || 'Failed to load your games. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyGames();
    setRefreshing(false);
  };

  const handlePlayGame = (game: GameData) => {
    if (!game.isReady) {
      Alert.alert(
        'Game Not Ready',
        `This game needs ${game.remainingQuestions} more questions before it can be played.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate to game room
    setGameToPlay(game);
    setIsGameRoomVisible(true);
  };

  const handleGameRoomBack = () => {
    setIsGameRoomVisible(false);
    setGameToPlay(null);
  };

  const handleDeleteGame = (game: GameData) => {
    Alert.alert(
      'Delete Game',
      `Are you sure you want to delete "${game.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteGame(game) }
      ]
    );
  };

  const handleEditGame = (game: GameData) => {
    // Always navigate to CreateGameScreen for editing, regardless of question count
    if (onNavigateToAddQuestions) {
      onNavigateToAddQuestions(game);
    } else {
      // Fallback if callback not provided
      Alert.alert(
        'Edit Game',
        `Navigation to edit "${game.title}" is not available.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleInviteGame = (game: GameData) => {
    Alert.alert(
      'Invite Players',
      `Invite friends to join "${game.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
text: 'Send Code', 
onPress: () => handleSendCode(game),
        }
      ]
    );
  };

  const handleCreateRoom = async (game: GameData) => {
    if (!game.isReady) {
      Alert.alert(
        'Game Not Ready',
        `This game needs ${game.remainingQuestions} more questions before you can create a room.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('Creating game room for game:', game.id);
      const gameRoom = await gameService.createGameRoom(game.id);

      if (!gameRoom || !gameRoom.inviteCode) {
        throw new Error('Failed to create game room or receive an invite code.');
      }
      
      const fullInviteCode = gameRoom.inviteCode.toString();
      const displayCode = fullInviteCode; // Use the full code directly since it's already 4 digits
      console.log('✅ Game Room Created. Invite code (display):', displayCode, 'Full code:', fullInviteCode);

      // Add a small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to the game lobby
      setGameRoomId(gameRoom.roomId);
      setLobbyGameId(game.id);
      setLobbyInviteCode(displayCode);
      setIsGameLobbyVisible(true);

    } catch (error) {
      console.error('❌ Error creating game room:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create game room. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const fetchGameQuestions = async (gameId: string) => {
    try {
      setIsLoadingQuestions(true);
      const currentUser = authService.getCurrentUser();
      
      console.log('Fetching questions for game ID:', gameId);
      
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User is not authenticated.');
      }
      
      // Use the correct API endpoint from the gameCreation routes
      const endpoint = `http://localhost:8080/api/games/questions?gameId=${gameId}`;
      console.log('Using API endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch questions (${response.status})`;
        
        try {
          const errorData = await response.json();
          console.log('Error response body:', errorData);
          
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.log('Could not parse error response as JSON');
          errorMessage = response.statusText || `HTTP ${response.status} error`;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Questions Response:', JSON.stringify(result, null, 2));
      
      // Based on getGameQuestionsController, the response structure is:
      // { success: true, data: { questions: [...], questionsCount: number, ... } }
      if (result.success && result.data && result.data.questions) {
        console.log('✅ Found questions in result.data.questions:', result.data.questions.length);
        
        // Log the first question to understand the structure
        if (result.data.questions.length > 0) {
          console.log('First question structure:', JSON.stringify(result.data.questions[0], null, 2));
          console.log('Options field:', result.data.questions[0].options);
          console.log('Options type:', typeof result.data.questions[0].options);
        }
        
        setGameQuestions(result.data.questions);
      } else {
        console.log('No questions found in response or unexpected structure');
        console.log('Response structure:', Object.keys(result));
        setGameQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', error.message || 'Failed to load game questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleViewGame = async (game: GameData) => {
    setSelectedGame(game);
    setIsQuestionsModalVisible(true);
    await fetchGameQuestions(game.id);
  };

const generateGameCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const [gameCode, setGameCode] = useState('');

const handleSendCode = (game: GameData) => {
    const code = generateGameCode();
    setCurrentGameId(game.id);
    setGameCode(code);
    setIsInvitationModalVisible(true);
};

const handleSendInvitation = async () => {
    if (!currentGameId || !invitationEmail || !gameCode) return;

    try {
      const response = await invitationService.sendInvitation({
        gameId: currentGameId,
        recipientEmail: invitationEmail,
        gameCode: gameCode,
      });

      if (response.success) {
        setInvitationStatus('pending');
        
        // Generate unique invitation ID
        const invitationId = `${currentGameId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Update the game invitation status with new structure
        setGameInvitationStatuses(prev => {
          const gameStatus = prev[currentGameId] || {
            invitations: [],
            totalSent: 0,
            pendingCount: 0,
            acceptedCount: 0,
            rejectedCount: 0
          };
          
          const newInvitation = {
            id: invitationId,
            status: 'pending' as const,
            recipientEmail: invitationEmail,
            sentAt: new Date().toISOString()
          };
          
          const updatedInvitations = [...gameStatus.invitations, newInvitation];
          
          return {
            ...prev,
            [currentGameId]: {
              invitations: updatedInvitations,
              totalSent: updatedInvitations.length,
              pendingCount: updatedInvitations.filter(inv => inv.status === 'pending').length,
              acceptedCount: updatedInvitations.filter(inv => inv.status === 'accepted').length,
              rejectedCount: updatedInvitations.filter(inv => inv.status === 'rejected').length
            }
          };
        });
        
        Alert.alert('Success', 'Invitation sent successfully!');
        
        // Clear the email input for next invitation
        setInvitationEmail('');
      } else {
        Alert.alert('Error', response.message || 'Failed to send invitation.');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', 'Unable to send the invitation. Please try again later.');
    }
  };

  const confirmDeleteGame = async (game: GameData) => {
    setIsDeleting(true);
    setDeletingGameTitle(game.title);
    
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User is not authenticated.');
      }
      
      const response = await fetch(`http://localhost:8080/api/games/${game.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete game';
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          errorMessage = response.statusText || `HTTP ${response.status} error`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Remove the game from local state
      setGames(prevGames => prevGames.filter(g => g.id !== game.id));
      
      Alert.alert('Success', `"${game.title}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting game:', error);
      Alert.alert('Error', error.message || 'Failed to delete game. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingGameTitle('');
    }
  };

  const handleDeleteQuestion = (questionId: string, gameId: string) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => confirmDeleteQuestion(questionId, gameId) 
        }
      ]
    );
  };

  const confirmDeleteQuestion = async (questionId: string, gameId: string) => {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User is not authenticated.');
      }
      
      console.log(`🗑️ Deleting question ${questionId} from game ${gameId}`);
      
      // Use the correct API endpoint for deleting a question
      // The backend already validates that the user owns the game containing this question
      const response = await fetch(`http://localhost:8080/api/v1/question/delete?id=${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        }
      });
      
      console.log(`Question delete response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete question';
        
        try {
          const errorData = await response.json();
          console.log('Delete question error response:', errorData);
          
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.log('Could not parse delete error response as JSON');
          errorMessage = response.statusText || `HTTP ${response.status} error`;
        }
        
        // Handle specific error cases
        if (response.status === 404) {
          errorMessage = 'Question not found or may have been already deleted';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to delete this question';
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('✅ Question deleted successfully from server');
      
      // Remove the question from local state
      setGameQuestions(prevQuestions => {
        const updatedQuestions = prevQuestions.filter(q => q.id !== questionId);
        console.log(`Updated questions list: ${updatedQuestions.length} questions remaining`);
        return updatedQuestions;
      });
      
      // Update the selected game's question count if available
      if (selectedGame) {
        const currentQuestionCount = selectedGame.questionCount || selectedGame.questionsCount || 0;
        const newQuestionCount = Math.max(0, currentQuestionCount - 1);
        const maxQuestions = selectedGame.maxQuestions || 20;
        const newRemainingQuestions = Math.max(0, maxQuestions - newQuestionCount);
        
        const updatedGame = {
          ...selectedGame,
          questionCount: newQuestionCount,
          questionsCount: newQuestionCount, // Keep both for compatibility
          remainingQuestions: newRemainingQuestions,
          isReady: newQuestionCount >= maxQuestions
        };
        
        console.log(`Updated game stats: ${newQuestionCount}/${maxQuestions} questions, ready: ${updatedGame.isReady}`);
        
        setSelectedGame(updatedGame);
        
        // Also update the main games list
        setGames(prevGames => 
          prevGames.map(game => 
            game.id === gameId ? updatedGame : game
          )
        );
      }
      
      Alert.alert('Success', 'Question has been deleted successfully.');
    } catch (error) {
      console.error('❌ Error deleting question:', error);
      console.error('Error details:', {
        questionId,
        gameId,
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', error.message || 'Failed to delete question. Please try again.');
    }
  };

  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      await fetchMyGames();
      setIsLoading(false);
    };
    
    loadGames();
  }, []);

  useEffect(() => {
    // Start the pulsing animation
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulseAnimation();
  }, [scaleValue]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGameStatusInfo = (game: GameData) => {
    if (game.isReady) {
      return {
        status: 'Ready to Play',
        color: '#4CAF50',
        icon: '🎮',
        description: 'This game has the full set of questions and is ready to be played!'
      };
    } else {
      return {
        status: 'In Progress',
        color: '#FF9800',
        icon: '⏳',
        description: `Add ${game.remainingQuestions} more questions to complete this game.`
      };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4CAF50'; // Green
      case 'medium':
        return '#FF9800'; // Orange
      case 'hard':
        return '#f44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Show Game Lobby if a game is selected to play
  if (isGameLobbyVisible && lobbyGameId && lobbyInviteCode) {
    return (
      <GameLobbyScreen
        gameId={lobbyGameId}
        inviteCode={lobbyInviteCode}
        isHost={true}
        onStartGame={() => {
          setIsGameLobbyVisible(false);
          // Find the game and include roomId from lobby
          const gameToStart = games.find(g => g.id === lobbyGameId);
          if (gameToStart && gameRoomId) {
            setGameToPlay({ ...gameToStart, roomId: gameRoomId });
            setIsGameRoomVisible(true);
          } else {
            Alert.alert('Error', 'Game room ID not available. Please try again.');
          }
        }}
        onBack={() => setIsGameLobbyVisible(false)}
      />
    );
  }

  // Show Game Room if a game is selected to play
  if (isGameRoomVisible && gameToPlay) {
    return (
      <GameRoomScreen 
        onBack={handleGameRoomBack}
        gameData={{
          id: gameToPlay.id,
          title: gameToPlay.title,
          questionCount: gameToPlay.questionCount || gameToPlay.questionsCount || 0,
          maxQuestions: gameToPlay.maxQuestions,
          roomId: gameToPlay.roomId || gameRoomId || ''
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Games</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your games...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Games</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{games.length}</Text>
            <Text style={styles.statsLabel}>Total Games</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {games.filter(game => game.isReady).length}
            </Text>
            <Text style={styles.statsLabel}>Ready to Play</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {games.reduce((total, game) => {
                // Try different possible field names
                const questionCount = Number(game.questionsCount) || 
                                    Number(game.questionCount) || 
                                    Number(game.questions_count) || 
                                    Number(game.questions?.length) || 
                                    0;
                console.log(`Game ${game.id} question count:`, questionCount, 'Raw data:', {
                  questionsCount: game.questionsCount,
                  questionCount: game.questionCount,
                  questions_count: game.questions_count,
                  questionsLength: game.questions?.length
                });
                return total + questionCount;
              }, 0)}
            </Text>
            <Text style={styles.statsLabel}>Total Questions</Text>
          </View>
        </View>

        {/* Games List */}
        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎮</Text>
            <Text style={styles.emptyStateTitle}>No Games Yet</Text>
            <Text style={styles.emptyStateText}>
              You haven't created any games yet. Start by creating your first quiz game!
            </Text>
            <TouchableOpacity style={styles.createFirstGameButton} onPress={onBack}>
              <Text style={styles.createFirstGameButtonText}>Create Your First Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Your Games ({games.length})</Text>
            
            {games.map((game, index) => {
              const statusInfo = getGameStatusInfo(game);
              
              return (
                <View key={game.id || index} style={styles.gameCard}>
                  <View style={styles.gameCardHeader}>
                    <View style={styles.gameCardTitleSection}>
                      <Text style={styles.gameCardTitle}>{game.title}</Text>
                      <Text style={styles.gameCardDate}>
                        Created {formatDate(game.createdAt)}
                      </Text>
                    </View>
                    <View style={[styles.gameStatusBadge, { backgroundColor: statusInfo.color }]}>
                      <Text style={styles.gameStatusText}>{statusInfo.icon}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.gameCardContent}>
                    <Text style={[styles.gameStatusLabel, { color: statusInfo.color }]}>
                      {statusInfo.status}
                    </Text>
                    <Text style={styles.gameStatusDescription}>
                      {statusInfo.description}
                    </Text>
                  </View>
                  
                  <View style={styles.gameCardStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {Number(game.questionsCount) || 
                         Number(game.questionCount) || 
                         Number(game.questions_count) || 
                         Number(game.questions?.length) || 0}
                      </Text>
                      <Text style={styles.statLabel}>Questions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{Number(game.maxQuestions) || 20}</Text>
                      <Text style={styles.statLabel}>Max Questions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{Number(game.nPlayer) || 1}</Text>
                      <Text style={styles.statLabel}>Players</Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${Math.min(((Number(game.questionsCount) || Number(game.questionCount) || 0) / (Number(game.maxQuestions) || 20)) * 100, 100)}%`,
                            backgroundColor: game.isReady ? '#4CAF50' : '#FF9800'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Number(game.questionsCount) || Number(game.questionCount) || 0}/{Number(game.maxQuestions) || 20} questions
                    </Text>
                  </View>
                  
                  {/* Winners Section */}
                  <WinnersSection 
                    gameId={game.id}
                    onWinnersUpdate={(winners) => {
                      console.log(`Winners updated for game ${game.id}:`, winners);
                      // TODO: Save winners to backend or local state
                    }}
                    editable={true}
                  />
                  
                  {/* Circular Radial Button Layout */}
                  <View style={styles.radialButtonsContainer}>
                    {/* Background Circle */}
                    <View style={styles.radialBackground}>
                      
                      {/* Top Button - CREATE ROOM (for ready games) or INVITE */}
                      <TouchableOpacity 
                        style={[
                          styles.radialButton, 
                          styles.topButton, 
                          game.isReady ? styles.createRoomButton : styles.inviteButton
                        ]} 
                        onPress={() => game.isReady ? handleCreateRoom(game) : handleInviteGame(game)}
                      >
                        <Text style={styles.radialButtonIcon}>
                          {game.isReady ? '🏠' : '👥'}
                        </Text>
                        {/* Invitation Count Indicator (only for invite mode) */}
                        {!game.isReady && gameInvitationStatuses[game.id]?.totalSent > 0 && (
                          <View style={[
                            styles.invitationStatusIndicator,
                            gameInvitationStatuses[game.id]?.pendingCount > 0 && styles.pendingIndicator,
                            gameInvitationStatuses[game.id]?.acceptedCount > 0 && gameInvitationStatuses[game.id]?.pendingCount === 0 && styles.acceptedIndicator,
                            gameInvitationStatuses[game.id]?.rejectedCount > 0 && gameInvitationStatuses[game.id]?.pendingCount === 0 && gameInvitationStatuses[game.id]?.acceptedCount === 0 && styles.rejectedIndicator
                          ]}>
                            <Text style={styles.invitationStatusText}>
                              {gameInvitationStatuses[game.id]?.totalSent}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      
                      {/* Right Button - DELETE */}
                      <TouchableOpacity 
                        style={[styles.radialButton, styles.rightButton, styles.deleteButton]} 
                        onPress={() => handleDeleteGame(game)}
                      >
                        <Text style={styles.radialButtonIcon}>🗑️</Text>
                      </TouchableOpacity>
                      
                      {/* Bottom Button - ADD QUESTIONS */}
                      <TouchableOpacity 
                        style={[styles.radialButton, styles.bottomButton, styles.editButton]} 
                        onPress={() => handleEditGame(game)}
                      >
                        <Text style={styles.radialButtonIcon}>➕</Text>
                      </TouchableOpacity>
                      
                      {/* Left Button - VIEW */}
                      <TouchableOpacity 
                        style={[styles.radialButton, styles.leftButton, styles.viewButton]} 
                        onPress={() => handleViewGame(game)}
                      >
                        <Text style={styles.radialButtonIcon}>👁️</Text>
                      </TouchableOpacity>
                      
                      {/* Central PLAY Button */}
                      <View style={styles.centralPlayContainer}>
                        <Animated.View 
                          style={[
                            {
                              transform: [{ scale: scaleValue }],
                            }
                          ]}
                        >
                          <TouchableOpacity 
                            style={[
                              styles.centralPlayButton, 
                              game.isReady && styles.readyCentralPlayButton,
                              !game.isReady && styles.disabledCentralPlayButton
                            ]} 
                            onPress={() => handlePlayGame(game)}
                          >
                            <Text style={styles.centralPlayIcon}>🎮</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      </View>
                      
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      
{/* Invitation Modal */}
      <Modal
        visible={isInvitationModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsInvitationModalVisible(false);
          setCurrentGameId(null);
          setInvitationEmail('');
          setInvitationStatus('none');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackButton} 
              onPress={() => {
                setIsInvitationModalVisible(false);
                setCurrentGameId(null);
                setInvitationEmail('');
                setInvitationStatus('none');
              }}
            >
              <Text style={styles.modalBackButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invite Player</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            {/* Game Code Section */}
            <View style={styles.codeSection}>
              <Text style={styles.codeSectionTitle}>🎮 Game Code</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.gameCodeText}>{gameCode}</Text>
              </View>
              <Text style={styles.codeInstructions}>
                Share this 4-digit code with players so they can join your game instantly!
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Email Invitation Section */}
            <View style={styles.emailSection}>
              <Text style={styles.emailSectionTitle}>📧 Send Email Invitation</Text>
              <Text style={styles.emailInstructions}>
                Send a personalized email invitation with the game code:
              </Text>
              <TextInput
                style={styles.input}
                value={invitationEmail}
                onChangeText={setInvitationEmail}
                placeholder="Player's Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {invitationStatus === 'pending' && (
                <Text style={styles.statusText}>✅ Email invitation sent successfully!</Text>
              )}

              <TouchableOpacity
                style={[styles.sendButton, !invitationEmail && styles.disabledButton]}
                disabled={!invitationEmail}
                onPress={handleSendInvitation}
              >
                <Text style={styles.sendButtonText}>Send Email Invitation</Text>
              </TouchableOpacity>
            </View>
              {invitationStatus === 'accepted' 
                ? 
                   <Text style={styles.statusTextAccepted}>🎉 Invitation accepted!🎉</Text> 
                : invitationStatus === 'rejected' 
                ? 
                    <Text style={styles.statusTextRejected}>❌ Invitation rejected</Text>
                : invitationStatus === 'pending' 
                ? 
                    <Text style={styles.statusTextPending}>⏳ Waiting for acceptance...</Text> 
                : null
              }
          </View>
        </SafeAreaView>
      </Modal>

      {/* Questions Modal */}
      <Modal
        visible={isQuestionsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsQuestionsModalVisible(false);
          setSelectedGame(null);
          setGameQuestions([]);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackButton} 
              onPress={() => {
                setIsQuestionsModalVisible(false);
                setSelectedGame(null);
                setGameQuestions([]);
              }}
            >
              <Text style={styles.modalBackButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedGame?.title || 'Game Questions'}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>

          {/* Modal Content */}
          {isLoadingQuestions ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.modalLoadingText}>Loading questions...</Text>
            </View>
          ) : (
            <View style={styles.modalContent}>
              {/* Game Info */}
              <View style={styles.modalGameInfo}>
                <Text style={styles.modalGameTitle}>{selectedGame?.title}</Text>
                <Text style={styles.modalGameStats}>
                  {gameQuestions.length} Questions • Created {formatDate(selectedGame?.createdAt)}
                </Text>
              </View>

              {/* Questions List */}
              {gameQuestions.length === 0 ? (
                <View style={styles.modalEmptyState}>
                  <Text style={styles.modalEmptyStateIcon}>❓</Text>
                  <Text style={styles.modalEmptyStateTitle}>No Questions Yet</Text>
                  <Text style={styles.modalEmptyStateText}>
                    This game doesn't have any questions yet. Add some questions to get started!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={gameQuestions}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.questionCard}>
                      <View style={styles.questionHeader}>
                        <Text style={styles.questionNumber}>Q{index + 1}</Text>
                        {item.category && (
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                          </View>
                        )}
                        {item.difficulty && (
                          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                            <Text style={styles.difficultyText}>{item.difficulty}</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.questionText}>{item.question}</Text>
                      
                      <View style={styles.optionsContainer}>
                        {(() => {
                          console.log('Processing options for question:', item.id);
                          console.log('Raw options:', item.options);
                          console.log('Options type:', typeof item.options);
                          console.log('Answer field:', item.answer);
                          
                          let optionsArray = [];
                          let correctAnswerIndex = item.answer;
                          
                          try {
                            // Handle different possible formats
                            if (typeof item.options === 'string') {
                              // Try to parse as JSON first
                              try {
                                const optionsObj = JSON.parse(item.options);
                                console.log('Parsed options object:', optionsObj);
                                
                                // Check if it's in {A: "...", B: "...", C: "...", D: "..."} format
                                if (optionsObj.A && optionsObj.B && optionsObj.C && optionsObj.D) {
                                  optionsArray = [optionsObj.A, optionsObj.B, optionsObj.C, optionsObj.D];
                                  console.log('Using A,B,C,D format:', optionsArray);
                                } 
                                // Check if it's an array
                                else if (Array.isArray(optionsObj)) {
                                  optionsArray = optionsObj;
                                  console.log('Using array format:', optionsArray);
                                }
                                // Check if it's a direct object with numeric keys
                                else if (optionsObj[0] !== undefined) {
                                  optionsArray = [optionsObj[0], optionsObj[1], optionsObj[2], optionsObj[3]];
                                  console.log('Using numeric keys format:', optionsArray);
                                }
                              } catch (parseError) {
                                console.log('JSON parse failed, treating as plain string:', parseError.message);
                                // If JSON parsing fails, maybe it's a comma-separated string?
                                optionsArray = item.options.split(',').map(opt => opt.trim());
                              }
                            } else if (Array.isArray(item.options)) {
                              optionsArray = item.options;
                              console.log('Options already an array:', optionsArray);
                            } else if (typeof item.options === 'object' && item.options !== null) {
                              // Direct object
                              if (item.options.A) {
                                optionsArray = [item.options.A, item.options.B, item.options.C, item.options.D];
                              } else {
                                optionsArray = Object.values(item.options);
                              }
                              console.log('Options from object:', optionsArray);
                            }
                            
                            // Filter out empty/null options
                            optionsArray = optionsArray.filter(opt => opt && opt.toString().trim().length > 0);
                            
                            if (optionsArray.length === 0) {
                              console.log('No valid options found');
                              return (
                                <View style={styles.optionItem}>
                                  <Text style={styles.optionText}>No options available</Text>
                                </View>
                              );
                            }
                            
                            console.log('Final options array:', optionsArray);
                            console.log('Correct answer index:', correctAnswerIndex);
                            
                            return optionsArray.map((option, optionIndex) => (
                              <View 
                                key={optionIndex} 
                                style={[
                                  styles.optionItem,
                                  optionIndex === correctAnswerIndex && styles.correctOption
                                ]}
                              >
                                <Text style={[
                                  styles.optionLabel,
                                  optionIndex === correctAnswerIndex && styles.correctOptionText
                                ]}>
                                  {String.fromCharCode(65 + optionIndex)}.
                                </Text>
                                <Text style={[
                                  styles.optionText,
                                  optionIndex === correctAnswerIndex && styles.correctOptionText
                                ]}>
                                  {option?.toString() || 'No option text'}
                                </Text>
                                {optionIndex === correctAnswerIndex && (
                                  <Text style={styles.correctIcon}>✓</Text>
                                )}
                              </View>
                            ));
                          } catch (error) {
                            console.log('Comprehensive error parsing options:', error);
                            console.log('Item structure:', JSON.stringify(item, null, 2));
                            return (
                              <View style={styles.optionItem}>
                                <Text style={styles.optionText}>Error loading options: {error.message}</Text>
                              </View>
                            );
                          }
                        })()}
                      </View>
                      
                      {item.createdAt && (
                        <View style={styles.questionFooter}>
                          <TouchableOpacity 
                            style={styles.deleteQuestionButton}
                            onPress={() => handleDeleteQuestion(item.id, selectedGame?.id || '')}
                          >
                            <Text style={styles.deleteQuestionButtonText}>🗑️ DELETE</Text>
                          </TouchableOpacity>
                          <Text style={styles.questionDate}>
                            Added {formatDate(item.createdAt)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Delete Spinner */}
      <Spinner 
        visible={isDeleting}
        message={`Deleting "${deletingGameTitle}"...`}
        color="#f44336"
      />
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
  headerTitle: {
    flex: 2,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
  },
  refreshButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createFirstGameButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstGameButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gamesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  gameCardTitleSection: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gameCardDate: {
    fontSize: 14,
    color: '#888',
  },
  gameStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  gameStatusText: {
    fontSize: 16,
  },
  gameCardContent: {
    marginBottom: 15,
  },
  gameStatusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameStatusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  gameCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  gameCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  gameCardSecondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  playButton: {
    backgroundColor: '#388E3C', // Dark green
  },
  readyToPlayButton: {
    backgroundColor: '#4CAF50', // Bright green for ready games
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  editButton: {
    backgroundColor: '#2196F3', // Blue
  },
  viewButton: {
    backgroundColor: '#FF9800', // Orange
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    color: '#fff',
  },
  editButtonText: {
    color: '#fff',
  },
  viewButtonText: {
    color: '#fff',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalBackButton: {
    flex: 1,
  },
  modalBackButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalTitle: {
    flex: 2,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalHeaderRight: {
    flex: 1,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalGameInfo: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  modalGameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalGameStats: {
    fontSize: 14,
    color: '#666',
  },
  modalEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  modalEmptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  modalEmptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalEmptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
  },
  difficultyBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  correctOption: {
    backgroundColor: '#4CAF50',
  },
  correctOptionText: {
    color: '#ffffff',
  },
  correctIcon: {
    marginLeft: 'auto',
    fontSize: 16,
    color: '#ffffff',
  },
  questionDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteQuestionButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteQuestionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Circular Play Button styles
  circularPlayContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  circularPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#388E3C', // Dark green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  readyCircularPlayButton: {
    backgroundColor: '#4CAF50', // Bright green for ready games
  },
  disabledCircularPlayButton: {
    backgroundColor: '#BDBDBD', // Grey for disabled
    opacity: 0.6,
  },
  circularPlayIcon: {
    fontSize: 32,
    color: '#fff',
  },
  
  // Invite Button styles
  inviteButton: {
    backgroundColor: '#9C27B0', // Purple
  },
  inviteButtonText: {
    color: '#fff',
  },
  
  // Create Room Button styles
  createRoomButton: {
    backgroundColor: '#4CAF50', // Green
  },
  
  // New Buttons Container Layout
  buttonsContainer: {
    position: 'relative',
    paddingVertical: 10,
  },
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  circularPlayContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 10,
  },
  
  // Radial Button Layout Styles
  radialButtonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    height: 260,
  },
  radialBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f8f9fa',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  radialButton: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  radialButtonIcon: {
    fontSize: 22,
    color: 'white',
  },
  
  // Radial button positions (4 buttons around the circle)
  topButton: {
    top: -10,
    left: '50%',
    transform: [{ translateX: -29 }],
  },
  rightButton: {
    right: -10,
    top: '50%',
    transform: [{ translateY: -29 }],
  },
  bottomButton: {
    bottom: -10,
    left: '50%',
    transform: [{ translateX: -29 }],
  },
  leftButton: {
    left: -10,
    top: '50%',
    transform: [{ translateY: -29 }],
  },
  
  // Central play button in radial layout
  centralPlayContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
  },
  centralPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyCentralPlayButton: {
    backgroundColor: '#4CAF50',
  },
  disabledCentralPlayButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  centralPlayIcon: {
    fontSize: 48,
    color: '#fff',
  },
  
  // Additional button styles for radial layout
  settingsButton: {
    backgroundColor: '#607D8B', // Blue grey
  },
  shareButton: {
    backgroundColor: '#4CAF50', // Green
  },
  infoButton: {
    backgroundColor: '#2196F3', // Blue
  },
  favoriteButton: {
    backgroundColor: '#FFC107', // Amber
  },
  
  // Invitation Modal Styles
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginVertical: 15,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  
  // Game Code Section Styles
  codeSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  codeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  codeContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  gameCodeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    textAlign: 'center',
  },
  codeInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Email Section Styles
  emailSection: {
    marginTop: 10,
  },
  emailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emailInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  
  // Divider Style
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  
  // Status Text Styles
  statusTextPending: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusTextAccepted: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusTextRejected: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  
  // Invitation Status Indicator Styles
  invitationStatusIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C757D', // Default grey
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pendingIndicator: {
    backgroundColor: '#FF9800', // Orange for pending
  },
  acceptedIndicator: {
    backgroundColor: '#4CAF50', // Green for accepted
  },
  rejectedIndicator: {
    backgroundColor: '#F44336', // Red for rejected
  },
  invitationStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  
});

export default MyGamesScreen;
