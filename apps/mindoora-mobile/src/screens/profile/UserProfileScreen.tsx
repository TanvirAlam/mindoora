import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/auth/authService';
import TrophyCase from '../../components/TrophyCase'; // Import the new component

interface UserProfileScreenProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onBack, onProfileUpdate }) => {
  const user = authService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Demo User');
  const [email, setEmail] = useState(user?.email || 'demo@example.com');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('Passionate learner and quiz enthusiast!');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  
  const handleSaveProfile = () => {
    const updatedProfile = {
      name,
      email,
      phone,
      bio,
      location,
      website,
      socialLinks: {
        twitter,
        linkedIn,
        github,
        instagram,
      },
    };

    console.log('Updated profile:', updatedProfile);

    // Here you would update the profile to your backend
    // For now, we simulate the update with a delay
    setTimeout(() => {
      Alert.alert('Success', 'Profile updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            setIsEditing(false);
            if (onProfileUpdate) {
              onProfileUpdate(updatedProfile);
            }
          }
        }
      ]);
    }, 1000);
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Open Camera') },
        { text: 'Gallery', onPress: () => console.log('Open Gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
            <Image 
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarOverlayText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Tap to change avatar</Text>
        </View>

        {/* Trophy Case */}
        <TrophyCase />
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.totalScore || 1250}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.trophies?.length || 8}</Text>
            <Text style={styles.statLabel}>Trophies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.inputField}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.inputField, !isEditing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.inputField}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.inputField, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.inputField}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>Website</Text>
          <TextInput
            style={styles.inputField}
            value={website}
            onChangeText={setWebsite}
            placeholder="Enter your website URL"
            autoCapitalize="none"
            editable={isEditing}
          />
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          
          <Text style={styles.inputLabel}>🐦 Twitter</Text>
          <TextInput
            style={styles.inputField}
            value={twitter}
            onChangeText={setTwitter}
            placeholder="@username"
            autoCapitalize="none"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>💼 LinkedIn</Text>
          <TextInput
            style={styles.inputField}
            value={linkedIn}
            onChangeText={setLinkedIn}
            placeholder="LinkedIn profile URL"
            autoCapitalize="none"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>🐙 GitHub</Text>
          <TextInput
            style={styles.inputField}
            value={github}
            onChangeText={setGithub}
            placeholder="GitHub username"
            autoCapitalize="none"
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>📸 Instagram</Text>
          <TextInput
            style={styles.inputField}
            value={instagram}
            onChangeText={setInstagram}
            placeholder="@username"
            autoCapitalize="none"
            editable={isEditing}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editingButtons}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>💾 Save Changes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Additional Space */}
        <View style={styles.bottomSpacing} />
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
    color: '#2196F3',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF9800',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF9800',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlayText: {
    fontSize: 14,
  },
  avatarLabel: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  editButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  editingButtons: {
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default UserProfileScreen;

