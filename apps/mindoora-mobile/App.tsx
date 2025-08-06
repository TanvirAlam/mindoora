import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/auth/LoginScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import JoinGameScreen from './src/screens/game/JoinGameScreen';
import CreateGameScreen from './src/screens/game/CreateGameScreen';
import GameRoomScreen from './src/screens/game/GameRoomScreen';
import UserProfileScreen from './src/screens/profile/UserProfileScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import authService from './src/services/auth/authService';
import { User } from './src/types';

type Screen = 'login' | 'home' | 'joinGame' | 'createGame' | 'gameRoom' | 'gameStarted' | 'userProfile' | 'settings';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameData, setGameData] = useState<{
    gameCode: string;
    roomId: string;
    playerId: string;
    gameId: string;
    playerName: string;
    gameStarted?: boolean;
  } | null>(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = authService.onAuthStateChange((authenticatedUser) => {
      setUser(authenticatedUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <StatusBar style="auto" />
      </View>
    );
  }

  const handleJoinGame = (joinedGameData: {
    gameCode: string;
    roomId: string;
    playerId: string;
    gameId: string;
    playerName: string;
    gameStarted?: boolean;
  }) => {
    console.log('Game joined with data:', joinedGameData);
    console.log('Game started flag:', joinedGameData.gameStarted);
    
    // Store the game data and navigate to the game room
    setGameData(joinedGameData);
    
    // Always navigate to gameRoom - the GameRoomScreen will handle whether the game has started
    // This allows the second player to participate in an ongoing game
    console.log('🎮 Navigating to game room - game started:', joinedGameData.gameStarted);
    setCurrentScreen('gameRoom');
  };

  const handleGameCreated = (gameData: any) => {
    console.log('Game created:', gameData);
    // Here you can add logic to handle the created game
    // For now, just go back to home
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    if (!user) {
      return <LoginScreen onLoginSuccess={() => {}} />;
    }

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onLogout={() => setUser(null)}
            onNavigateToJoinGame={() => setCurrentScreen('joinGame')}
            onNavigateToCreateGame={() => setCurrentScreen('createGame')}
            onNavigateToUserProfile={() => setCurrentScreen('userProfile')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
          />
        );
      case 'joinGame':
        return (
          <JoinGameScreen 
            onBack={() => setCurrentScreen('home')}
            onJoinGame={handleJoinGame}
          />
        );
      case 'createGame':
        return (
          <CreateGameScreen 
            onBack={() => setCurrentScreen('home')}
            onGameCreated={handleGameCreated}
          />
        );
      case 'gameRoom':
        if (!gameData) {
          setCurrentScreen('home');
          return null;
        }
        return (
          <GameRoomScreen 
            onBack={() => {
              setCurrentScreen('home');
              setGameData(null);
            }}
            gameData={{
              id: gameData.gameId,
              title: `Game ${gameData.gameCode}`, // Use game code as title since we don't have the actual title
              questionCount: 0, // Will be loaded by GameRoomScreen
              maxQuestions: 20, // Default value
              roomId: gameData.roomId,
              inviteCode: gameData.gameCode,
              gameStarted: gameData.gameStarted
            }}
          />
        );
      case 'userProfile':
        return (
          <UserProfileScreen 
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'gameStarted':
        return (
          <SafeAreaView style={gameStartedStyles.container}>
            <View style={gameStartedStyles.content}>
              <Text style={gameStartedStyles.title}>🎮 Game Started!</Text>
              <Text style={gameStartedStyles.message}>
                The host has started the multiplayer game.
              </Text>
              <Text style={gameStartedStyles.subMessage}>
                Game Code: {gameData?.gameCode || 'Unknown'}
              </Text>
              <Text style={gameStartedStyles.note}>
                In a real multiplayer scenario, this screen would show the actual game interface for the joined player.
              </Text>
              <TouchableOpacity 
                style={gameStartedStyles.backButton}
                onPress={() => {
                  setCurrentScreen('home');
                  setGameData(null);
                }}
              >
                <Text style={gameStartedStyles.backButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
      default:
        return (
          <HomeScreen 
            onLogout={() => setUser(null)}
            onNavigateToJoinGame={() => setCurrentScreen('joinGame')}
            onNavigateToCreateGame={() => setCurrentScreen('createGame')}
            onNavigateToUserProfile={() => setCurrentScreen('userProfile')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
          />
        );
    }
  };

  // Show appropriate screen based on authentication state
  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

const gameStartedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  subMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
