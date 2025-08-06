import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/colors';
import socketService from '../../services/socketService';

interface WaitingForHostScreenProps {
  onBack: () => void;
  inviteCode: string;
  playerName: string;
  onApproved: () => void;
  onRejected: () => void;
  // Add room and player data for WebSocket connection
  roomId: string;
  playerId: string;
}

// Animated Fist Bump Component
const AnimatedFistBump = () => {
  const pulseAnim = useState(new Animated.Value(1))[0];
  const [dotOpacity1] = useState(new Animated.Value(1));
  const [dotOpacity2] = useState(new Animated.Value(0.3));
  const [dotOpacity3] = useState(new Animated.Value(0.3));

  useEffect(() => {
    // Pulse animation for the fist
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animated dots sequence
    const dotsAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity1, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );

    pulseAnimation.start();
    dotsAnimation.start();

    return () => {
      pulseAnimation.stop();
      dotsAnimation.stop();
    };
  }, [pulseAnim, dotOpacity1, dotOpacity2, dotOpacity3]);

  return (
    <View style={styles.fistBumpContainer}>
      {/* Main Fist */}
      <Animated.View 
        style={[
          styles.fistBump, 
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Text style={styles.fistBumpEmoji}>👊</Text>
      </Animated.View>
      
      {/* Animated dots */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
        <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
        <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
      </View>
    </View>
  );
};

const WaitingForHostScreen: React.FC<WaitingForHostScreenProps> = ({
  onBack,
  inviteCode,
  playerName,
  onApproved,
  onRejected,
  roomId,
  playerId,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0.5));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Breathing animation for the waiting message
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Scale animation for the container
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();
    scaleAnimation.start();

    return () => {
      breathingAnimation.stop();
      scaleAnimation.stop();
    };
  }, [fadeAnim, scaleAnim]);

  // WebSocket connection and game start listener
  useEffect(() => {
    console.log('🎮 Setting up WebSocket connection for waiting screen');
    
    // Connect to socket if not already connected
    socketService.connect();
    
    // Join the room
    socketService.joinRoom(roomId, playerId);
    
    // Listen for game started event
    const handleGameStarted = (data: { id: string; status: string }) => {
      console.log('🎮 Game started event received:', data);
      if (data.id === roomId && data.status === 'started') {
        console.log('🎮 Game started! Transitioning to game screen...');
        onApproved(); // This will transition the user to the game
      }
    };
    
    socketService.onGameStarted(handleGameStarted);
    
    // Cleanup on unmount
    return () => {
      console.log('🎮 Cleaning up WebSocket listeners for waiting screen');
      socketService.offGameStarted();
      socketService.leaveRoom(roomId);
      // Note: We don't disconnect the socket entirely as it might be used elsewhere
    };
  }, [roomId, playerId, onApproved]);

  const handleBackPress = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave? You will need to rejoin with the code again.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: onBack }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Leave</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiting for Host</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.waitingContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          {/* Animated Fist Bump Icon */}
          <View style={styles.animationContainer}>
            <AnimatedFistBump />
          </View>

          {/* Waiting Message */}
          <Text style={styles.waitingTitle}>Almost There! 🎮</Text>
          <Text style={styles.waitingMessage}>
            You've successfully joined room <Text style={styles.codeText}>{inviteCode}</Text>
          </Text>
          
          <Text style={styles.playerName}>
            Playing as: <Text style={styles.playerNameHighlight}>{playerName}</Text>
          </Text>

          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Waiting for host to start the game...</Text>
            <Text style={styles.statusMessage}>
              You've successfully joined the game room! 
              Wait for the host to start the game and you'll begin playing together.
            </Text>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 While you wait:</Text>
            <Text style={styles.tipItem}>• Make sure your internet connection is stable</Text>
            <Text style={styles.tipItem}>• Keep this screen open</Text>
            <Text style={styles.tipItem}>• The host will be notified of your request</Text>
          </View>
        </Animated.View>

        {/* Status Indicator */}
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Connected to game room</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 2,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  waitingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
  },
  animationContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  waitingMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  codeText: {
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playerName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  playerNameHighlight: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    width: '100%',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
    lineHeight: 18,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Animated Fist Bump Styles
  fistBumpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fistBump: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fistBumpEmoji: {
    fontSize: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});

export default WaitingForHostScreen;
