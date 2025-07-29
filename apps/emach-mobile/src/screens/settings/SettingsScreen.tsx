import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  // Game Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [allowHints, setAllowHints] = useState(false);
  const [autoNextQuestion, setAutoNextQuestion] = useState(true);
  const [difficultySetting, setDifficultySetting] = useState('Medium');

  // Multiplayer Settings State
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [showPlayerNames, setShowPlayerNames] = useState(true);
  const [enableChat, setEnableChat] = useState(true);
  const [shareScores, setShareScores] = useState(true);

  const difficultyLevels = ['Easy', 'Medium', 'Hard', 'Mixed'];

  const handleDifficultyChange = () => {
    const currentIndex = difficultyLevels.indexOf(difficultySetting);
    const nextIndex = (currentIndex + 1) % difficultyLevels.length;
    setDifficultySetting(difficultyLevels[nextIndex]);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSoundEnabled(true);
            setVibrationEnabled(true);
            setShowCorrectAnswers(true);
            setAllowHints(false);
            setAutoNextQuestion(true);
            setDifficultySetting('Medium');
            setAllowSpectators(true);
            setShowPlayerNames(true);
            setEnableChat(true);
            setShareScores(true);
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    type = 'switch' 
  }: {
    title: string;
    description: string;
    value: boolean | string;
    onToggle: () => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: '#ccc', true: '#4A90E2' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <TouchableOpacity style={styles.difficultyButton} onPress={onToggle}>
          <Text style={styles.difficultyText}>{value as string}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Game Experience Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Image 
              source={require('../../../assets/mindoora-short.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            Game Experience
           </Text>
          
          <SettingItem
            title="Sound Effects"
            description="Play sounds for correct/incorrect answers"
            value={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
          />
          
          <SettingItem
            title="Vibration Feedback"
            description="Vibrate on interactions and results"
            value={vibrationEnabled}
            onToggle={() => setVibrationEnabled(!vibrationEnabled)}
          />
          
          <SettingItem
            title="Show Correct Answers"
            description="Display correct answers after each question"
            value={showCorrectAnswers}
            onToggle={() => setShowCorrectAnswers(!showCorrectAnswers)}
          />
          
          <SettingItem
            title="Allow Hints"
            description="Enable hint system during gameplay"
            value={allowHints}
            onToggle={() => setAllowHints(!allowHints)}
          />
          
          <SettingItem
            title="Auto Next Question"
            description="Automatically proceed to next question"
            value={autoNextQuestion}
            onToggle={() => setAutoNextQuestion(!autoNextQuestion)}
          />
          
          <SettingItem
            title="Difficulty Level"
            description="Default difficulty for created games"
            value={difficultySetting}
            onToggle={handleDifficultyChange}
            type="button"
          />
        </View>

        {/* Multiplayer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Multiplayer Settings</Text>
          
          <SettingItem
            title="Allow Spectators"
            description="Let others watch without participating"
            value={allowSpectators}
            onToggle={() => setAllowSpectators(!allowSpectators)}
          />
          
          <SettingItem
            title="Show Player Names"
            description="Display names during gameplay"
            value={showPlayerNames}
            onToggle={() => setShowPlayerNames(!showPlayerNames)}
          />
          
          <SettingItem
            title="Enable Chat"
            description="Allow messaging during games"
            value={enableChat}
            onToggle={() => setEnableChat(!enableChat)}
          />
          
          <SettingItem
            title="Share Scores"
            description="Show scores to all players"
            value={shareScores}
            onToggle={() => setShareScores(!shareScores)}
          />
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleResetSettings}>
            <Text style={styles.actionButtonText}>Reset to Default Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Clear Game History
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>App Version: 1.0.0</Text>
            <Text style={styles.infoText}>Build: 202501</Text>
            <Text style={styles.infoDescription}>
              Mindoora Quiz - Bringing people together through interactive learning
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
    justifyContent: 'space-between',
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
    padding: 5,
  },
  backText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  difficultyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#4A90E2',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FF5722',
    marginTop: 0,
  },
  secondaryButtonText: {
    color: '#fff',
  },
  infoItem: {
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoDescription: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 20,
  },
  headerLogo: {
    width: 60,
    height: 20,
  },
});

export default SettingsScreen;
