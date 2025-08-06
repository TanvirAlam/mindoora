import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import gameService from '../../services/gameService';
import PlayerAvatar from '../../components/PlayerAvatar';
import { GamePlayer } from '../../services/gameService';

interface GameLobbyScreenProps {
  gameId: string;
  inviteCode: string;
  isHost: boolean;
  onStartGame: () => void;
  onBack: () => void;
}

const GameLobbyScreen: React.FC<GameLobbyScreenProps> = ({ gameId, inviteCode, isHost, onStartGame, onBack }) => {
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);

  const fetchLobbyStatus = useCallback(async () => {
    try {
      const roomDetails = await gameService.getPlayersByInviteCode(inviteCode);
      if (roomDetails && roomDetails.players) {
        setPlayers(roomDetails.players);
        
        // Store the room ID for starting the game
        if (roomDetails.room && roomDetails.room.id) {
          setRoomId(roomDetails.room.id);
        }
      }
    } catch (error) {
      console.error('Error fetching lobby status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inviteCode]);

  useEffect(() => {
    fetchLobbyStatus();
    const interval = setInterval(fetchLobbyStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchLobbyStatus]);

  const handleStartGame = async () => {
    if (!roomId) {
      Alert.alert('Error', 'Room ID not available. Please try again.');
      return;
    }
    
    try {
      console.log('🎮 Starting game with roomId:', roomId);
      const result = await gameService.startGame(roomId);
      console.log('🎮 Game started successfully:', result);
      onStartGame();
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', error.message || 'Failed to start the game. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Lobby</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inviteCodeContainer}>
          <Text style={styles.inviteCodeLabel}>Invite Code</Text>
          <Text style={styles.inviteCode}>{inviteCode}</Text>
        </View>
        <View style={styles.playersContainer}>
          <Text style={styles.playersLabel}>Players ({players.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {players.map((player) => (
              <PlayerAvatar key={player.id} player={player} />
            ))}
          </ScrollView>
        </View>
        {isHost && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inviteCodeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  inviteCodeLabel: {
    fontSize: 18,
    color: '#666',
  },
  inviteCode: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  playersContainer: {
    marginBottom: 30,
  },
  playersLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameLobbyScreen;

