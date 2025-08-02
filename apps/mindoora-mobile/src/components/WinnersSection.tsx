import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import TrophyPicker from './TrophyPicker';
import { getDefaultTrophies, getTrophyById } from '../utils/trophies';

interface WinnersSectionProps {
  gameId: string;
  onWinnersUpdate?: (winners: GameWinners) => void;
  editable?: boolean;
}

export interface GameWinners {
  firstPlace?: string;
  secondPlace?: string;
  thirdPlace?: string;
}

const WinnersSection: React.FC<WinnersSectionProps> = ({
  gameId,
  onWinnersUpdate,
  editable = true
}) => {
  const [winners, setWinners] = useState<GameWinners>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize with default trophies
    const defaultTrophies = getDefaultTrophies();
    const initialWinners = {
      firstPlace: defaultTrophies.first?.id,
      secondPlace: defaultTrophies.second?.id,
      thirdPlace: defaultTrophies.third?.id
    };
    setWinners(initialWinners);
  }, []);

  const handleTrophySelect = (place: keyof GameWinners, trophyId: string) => {
    const updatedWinners = { ...winners, [place]: trophyId };
    setWinners(updatedWinners);
    setHasChanges(true);
    
    if (onWinnersUpdate) {
      onWinnersUpdate(updatedWinners);
    }
  };

  const handleSaveWinners = () => {
    // TODO: Implement API call to save winners to backend
    Alert.alert(
      'Winners Saved',
      'Trophy assignments have been saved successfully!',
      [{ text: 'OK' }]
    );
    setHasChanges(false);
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Reset to Default',
      'This will reset trophies to default Gold, Silver, Bronze. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultTrophies = getDefaultTrophies();
            const defaultWinners = {
              firstPlace: defaultTrophies.first?.id,
              secondPlace: defaultTrophies.second?.id,
              thirdPlace: defaultTrophies.third?.id
            };
            setWinners(defaultWinners);
            setHasChanges(true);
            
            if (onWinnersUpdate) {
              onWinnersUpdate(defaultWinners);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.headerTitle}>🏆 Winners & Trophies</Text>
        <Text style={[styles.expandIcon, isExpanded && styles.expandedIcon]}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* Collapsed Trophy Preview */}
      {!isExpanded && (
        <View style={styles.collapsedPreview}>
          <View style={styles.trophyPreviewContainer}>
            {/* 1st Place Trophy */}
            <View style={styles.trophyPreviewItem}>
              <Text style={styles.trophyPreviewPlace}>🥇</Text>
              {winners.firstPlace && getTrophyById(winners.firstPlace) && (
                <Image 
                  source={getTrophyById(winners.firstPlace)!.image} 
                  style={styles.trophyPreviewImage} 
                />
              )}
              <Text style={styles.trophyPreviewName}>
                {winners.firstPlace && getTrophyById(winners.firstPlace)?.name || 'Not Set'}
              </Text>
            </View>

            {/* 2nd Place Trophy */}
            <View style={styles.trophyPreviewItem}>
              <Text style={styles.trophyPreviewPlace}>🥈</Text>
              {winners.secondPlace && getTrophyById(winners.secondPlace) && (
                <Image 
                  source={getTrophyById(winners.secondPlace)!.image} 
                  style={styles.trophyPreviewImage} 
                />
              )}
              <Text style={styles.trophyPreviewName}>
                {winners.secondPlace && getTrophyById(winners.secondPlace)?.name || 'Not Set'}
              </Text>
            </View>

            {/* 3rd Place Trophy */}
            <View style={styles.trophyPreviewItem}>
              <Text style={styles.trophyPreviewPlace}>🥉</Text>
              {winners.thirdPlace && getTrophyById(winners.thirdPlace) && (
                <Image 
                  source={getTrophyById(winners.thirdPlace)!.image} 
                  style={styles.trophyPreviewImage} 
                />
              )}
              <Text style={styles.trophyPreviewName}>
                {winners.thirdPlace && getTrophyById(winners.thirdPlace)?.name || 'Not Set'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.tapToEditHint}>Tap to customize trophies</Text>
        </View>
      )}

      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.description}>
            Define what trophies winners will receive for 1st, 2nd, and 3rd place
          </Text>

          {/* First Place */}
          <View style={styles.placeContainer}>
            <View style={styles.placeHeader}>
              <Text style={styles.placeTitle}>🥇 1st Place</Text>
              <Text style={styles.placeSubtitle}>Gold Winner</Text>
            </View>
            <TrophyPicker
              selectedTrophyId={winners.firstPlace}
              onTrophySelect={(trophyId) => handleTrophySelect('firstPlace', trophyId)}
              placeholder="Select 1st Place Trophy"
              title="Choose 1st Place Trophy"
            />
          </View>

          {/* Second Place */}
          <View style={styles.placeContainer}>
            <View style={styles.placeHeader}>
              <Text style={styles.placeTitle}>🥈 2nd Place</Text>
              <Text style={styles.placeSubtitle}>Silver Winner</Text>
            </View>
            <TrophyPicker
              selectedTrophyId={winners.secondPlace}
              onTrophySelect={(trophyId) => handleTrophySelect('secondPlace', trophyId)}
              placeholder="Select 2nd Place Trophy"
              title="Choose 2nd Place Trophy"
            />
          </View>

          {/* Third Place */}
          <View style={styles.placeContainer}>
            <View style={styles.placeHeader}>
              <Text style={styles.placeTitle}>🥉 3rd Place</Text>
              <Text style={styles.placeSubtitle}>Bronze Winner</Text>
            </View>
            <TrophyPicker
              selectedTrophyId={winners.thirdPlace}
              onTrophySelect={(trophyId) => handleTrophySelect('thirdPlace', trophyId)}
              placeholder="Select 3rd Place Trophy"
              title="Choose 3rd Place Trophy"
            />
          </View>

          {editable && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToDefault}
              >
                <Text style={styles.resetButtonText}>Reset to Default</Text>
              </TouchableOpacity>

              {hasChanges && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveWinners}
                >
                  <Text style={styles.saveButtonText}>Save Winners</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ These trophies will be automatically awarded to the top 3 players when the game ends.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  expandedIcon: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  placeContainer: {
    marginBottom: 20,
  },
  placeHeader: {
    marginBottom: 8,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  placeSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
  // Collapsed preview styles
  collapsedPreview: {
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  trophyPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyPreviewItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  trophyPreviewPlace: {
    fontSize: 24,
    marginBottom: 8,
  },
  trophyPreviewImage: {
    width: 40,
    height: 40,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  trophyPreviewName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 12,
  },
  tapToEditHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WinnersSection;
