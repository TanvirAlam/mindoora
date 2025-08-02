import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/auth/authService';
import { Colors } from '../../constants/colors';

interface MyGamesScreenProps {
  onBack: () => void;
}

interface GameData {
  id: string;
  title: string;
  questionsCount: number;
  isReady: boolean;
  maxQuestions: number;
  remainingQuestions: number;
  createdAt?: string;
  language?: string;
  nPlayer?: number;
}

const MyGamesScreen: React.FC<MyGamesScreenProps> = ({ onBack }) => {
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    
    // TODO: Navigate to game play screen
    Alert.alert('Play Game', `Starting game: ${game.title}`);
  };

  const handleDeleteGame = (game: GameData) => {
    Alert.alert(
      'Delete Game',
      `Are you sure you want to delete "${game.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => confirmDeleteGame(game)
        }
      ]
    );
  };

  const confirmDeleteGame = async (game: GameData) => {
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
              {games.reduce((total, game) => total + game.questionsCount, 0)}
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
                      <Text style={styles.statNumber}>{game.questionsCount}</Text>
                      <Text style={styles.statLabel}>Questions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{game.maxQuestions}</Text>
                      <Text style={styles.statLabel}>Max Questions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{game.nPlayer || 1}</Text>
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
                            width: `${Math.min((game.questionsCount / game.maxQuestions) * 100, 100)}%`,
                            backgroundColor: game.isReady ? '#4CAF50' : '#FF9800'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {game.questionsCount}/{game.maxQuestions} questions
                    </Text>
                  </View>
                  
                  {/* Action Buttons */}
                  <View style={styles.gameCardActions}>
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        styles.playButton, 
                        game.isReady && styles.readyToPlayButton,
                        !game.isReady && styles.disabledButton
                      ]} 
                      onPress={() => handlePlayGame(game)}
                    >
                      <Text style={[styles.actionButtonText, styles.playButtonText]}>🎮 PLAY</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]} 
                      onPress={() => handleDeleteGame(game)}
                    >
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ DELETE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default MyGamesScreen;
