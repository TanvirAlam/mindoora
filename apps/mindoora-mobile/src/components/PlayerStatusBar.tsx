import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface PlayerStatus {
  id: string;
  name: string;
  imgUrl?: string;
  isAnswered: boolean;
  answerTime?: number; // Time taken to answer in seconds
  score: number;
  isOnline: boolean;
}

interface PlayerStatusBarProps {
  players: PlayerStatus[];
  currentUserId: string;
  maxTime: number; // Maximum time allowed for question
}

const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({ 
  players, 
  currentUserId, 
  maxTime 
}) => {
  const formatTime = (timeInSeconds: number) => {
    return `${timeInSeconds}s`;
  };

  const getStatusColor = (player: PlayerStatus) => {
    if (!player.isOnline) return '#999'; // Gray for offline
    if (player.isAnswered) return '#4CAF50'; // Green for answered
    return '#FF9800'; // Orange for still thinking
  };

  const getStatusIcon = (player: PlayerStatus) => {
    if (!player.isOnline) return '⚫'; // Offline
    if (player.isAnswered) return '✅'; // Answered
    return '⏳'; // Still thinking
  };

  // Filter out current user from the list
  const otherPlayers = players.filter(player => player.id !== currentUserId);

  if (otherPlayers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPlayersText}>Playing solo</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Other Players ({otherPlayers.length})</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.playersScroll}
      >
        {otherPlayers.map((player) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(player) }]}>
              <Text style={styles.statusIcon}>{getStatusIcon(player)}</Text>
            </View>
            
            <Text style={styles.playerName} numberOfLines={1}>
              {player.name}
            </Text>
            
            <View style={styles.playerStats}>
              <Text style={styles.scoreText}>
                {player.score} pts
              </Text>
              {player.isAnswered && player.answerTime !== undefined && (
                <Text style={styles.timeText}>
                  {formatTime(player.answerTime)}
                </Text>
              )}
              {!player.isAnswered && player.isOnline && (
                <Text style={styles.thinkingText}>...</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noPlayersText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  playersScroll: {
    flexDirection: 'row',
  },
  playerCard: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 60,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIcon: {
    fontSize: 12,
    color: 'white',
  },
  playerName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    maxWidth: 60,
    marginBottom: 2,
  },
  playerStats: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  timeText: {
    fontSize: 9,
    color: '#666',
    marginTop: 1,
  },
  thinkingText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 1,
  },
});

export default PlayerStatusBar;
