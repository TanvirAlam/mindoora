import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/auth/authService';

interface HomeScreenProps {
  onLogout: () => void;
  onNavigateToJoinGame?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, onNavigateToJoinGame }) => {
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const gameOptions = [
    {
      id: 1,
      title: 'Create Game',
      description: 'Start a new quiz game',
      icon: '🎮',
      color: '#4CAF50',
    },
    {
      id: 2,
      title: 'Join Game',
      description: 'Enter a game code',
      icon: '🚀',
      color: '#2196F3',
    },
    {
      id: 3,
      title: 'My Profile',
      description: 'View trophies & stats',
      icon: '👤',
      color: '#FF9800',
    },
    {
      id: 4,
      title: 'Settings',
      description: 'App preferences',
      icon: '⚙️',
      color: '#9C27B0',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../../assets/mindoora-short.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.name || 'Player'}</Text>
          <Text style={styles.subText}>Ready to learn and have fun?</Text>
        </View>

        {/* Game Options */}
        <View style={styles.gameOptions}>
          {gameOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.gameOption, { backgroundColor: option.color }]}
              onPress={() => {
                // Handle navigation to different screens
                if (option.title === 'Join Game' && onNavigateToJoinGame) {
                  onNavigateToJoinGame();
                } else {
                  console.log(`Navigate to ${option.title}`);
                }
              }}
            >
              <Text style={styles.gameOptionIcon}>{option.icon}</Text>
              <View style={styles.gameOptionText}>
                <Text style={styles.gameOptionTitle}>{option.title}</Text>
                <Text style={styles.gameOptionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.totalScore || 0}</Text>
              <Text style={styles.statLabel}>Total Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.trophies?.length || 0}</Text>
              <Text style={styles.statLabel}>Trophies</Text>
            </View>
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
    justifyContent: 'space-between',
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
  headerLeft: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FF5722',
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#888',
  },
  gameOptions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gameOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
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
  gameOptionIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  gameOptionText: {
    flex: 1,
  },
  gameOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  gameOptionDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
