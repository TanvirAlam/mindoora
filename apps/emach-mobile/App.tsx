import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/auth/LoginScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import JoinGameScreen from './src/screens/game/JoinGameScreen';
import authService from './src/services/auth/authService';
import { User } from './src/types';

type Screen = 'login' | 'home' | 'joinGame';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

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

  const handleJoinGame = (gameCode: string) => {
    console.log('Game joined with code:', gameCode);
    // Here you can add logic to actually join the game
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
          />
        );
      case 'joinGame':
        return (
          <JoinGameScreen 
            onBack={() => setCurrentScreen('home')}
            onJoinGame={handleJoinGame}
          />
        );
      default:
        return (
          <HomeScreen 
            onLogout={() => setUser(null)}
            onNavigateToJoinGame={() => setCurrentScreen('joinGame')}
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
