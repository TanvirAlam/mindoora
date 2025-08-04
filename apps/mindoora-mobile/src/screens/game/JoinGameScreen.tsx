import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import gameService from '../../services/gameService';
import authService from '../../services/auth/authService';

interface JoinGameScreenProps {
  onBack: () => void;
  onJoinGame?: (gameData: {
    gameCode: string;
    roomId: string;
    playerId: string;
    gameId: string;
    playerName: string;
  }) => void;
}

const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ onBack, onJoinGame }) => {
  const [gameCode, setGameCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...gameCode];
    newCode[index] = value.toUpperCase();
    setGameCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !gameCode[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoinGame = async () => {
    const code = gameCode.join('');
    
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a complete 6-digit game code.');
      return;
    }

    // Get current user info for the player name
    const currentUser = authService.getCurrentUser();
    const playerName = currentUser?.name || 'Anonymous Player';

    setIsLoading(true);
    
    try {
      console.log('🎮 Joining game with code:', code);
      
      const response = await gameService.joinGame({
        inviteCode: code,
        name: playerName
      });
      
      if (response.success && response.data) {
        console.log('🎮 Successfully joined game:', response.data);
        
        const gameData = {
          gameCode: code,
          roomId: response.data.player.roomId,
          playerId: response.data.player.id,
          gameId: response.data.gameId,
          playerName: response.data.player.name
        };
        
        if (onJoinGame) {
          onJoinGame(gameData);
        } else {
          Alert.alert(
            'Success! 🎉', 
            `You've joined the game as ${response.data.player.name}!\n\n${response.data.player.isApproved ? 'You can start playing now.' : 'Waiting for host approval...'}`,
            [
              { 
                text: 'OK', 
                onPress: () => {
                  // You could navigate to game lobby here
                  console.log('Navigate to game lobby with:', gameData);
                }
              }
            ]
          );
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to join game.');
      }
    } catch (error) {
      console.error('🎮 Error joining game:', error);
      
      let errorMessage = 'Failed to join game. Please try again.';
      
      if (error.message.includes('not found')) {
        errorMessage = 'Game room not found. Please check your code and try again.';
      } else if (error.message.includes('full')) {
        errorMessage = 'This game room is full. Please try another game.';
      } else if (error.message.includes('connect')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      Alert.alert('Unable to Join Game', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCode = () => {
    setGameCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isCodeComplete = gameCode.every(digit => digit !== '');

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

      {/* Content */}
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.gameIcon}>
            <Image 
              source={require('../../../assets/mindoora-short.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </Text>
          <Text style={styles.title}>Join Game</Text>
          <Text style={styles.subtitle}>Enter the 6-digit game code to join</Text>
        </View>

        {/* Code Input Section */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Game Code</Text>
          
          <View style={styles.codeInputContainer}>
            {gameCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => inputRefs.current[index] = ref}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="default"
                maxLength={1}
                textAlign="center"
                autoCapitalize="characters"
                selectTextOnFocus
              />
            ))}
          </View>
          
          <Text style={styles.codeHint}>
            Ask the host for the game code
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              isCodeComplete ? styles.joinButtonEnabled : styles.joinButtonDisabled,
              isLoading && styles.joinButtonLoading
            ]}
            onPress={handleJoinGame}
            disabled={!isCodeComplete || isLoading}
          >
            <Text style={[
              styles.joinButtonText,
              isCodeComplete ? styles.joinButtonTextEnabled : styles.joinButtonTextDisabled
            ]}>
              {isLoading ? 'Joining...' : 'Join Game'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCode}
          >
            <Text style={styles.clearButtonText}>Clear Code</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How to Join</Text>
            <Text style={styles.infoText}>
              1. Get the 6-digit code from your host{'\n'}
              2. Enter the code above{'\n'}
              3. Tap "Join Game" to connect
            </Text>
          </View>
        </View>
      </View>
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
    color: '#2196F3',
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
    paddingTop: 20,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
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
  codeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  codeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#fff',
  },
  codeInputFilled: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  codeHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  joinButton: {
    paddingVertical: 15,
    borderRadius: 25,
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
  joinButtonEnabled: {
    backgroundColor: '#2196F3',
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonLoading: {
    opacity: 0.7,
  },
  joinButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  joinButtonTextEnabled: {
    color: '#fff',
  },
  joinButtonTextDisabled: {
    color: '#999',
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

export default JoinGameScreen;
