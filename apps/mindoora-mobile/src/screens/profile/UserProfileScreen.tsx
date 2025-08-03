import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import authService from '../../services/auth/authService';
import profileService from '../../services/profile/profileService';
import TrophyCase from '../../components/TrophyCase'; // Import the new component

interface UserProfileScreenProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onBack, onProfileUpdate }) => {
  const user = authService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState(null);
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
  const [avatar, setAvatar] = useState(user?.avatar || 'https://via.placeholder.com/100');
  
  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await profileService.getProfile();
      if (profile) {
        setProfileData(profile);
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setBio(profile.bio);
        setLocation(profile.location);
        setWebsite(profile.website);
        setTwitter(profile.socialMedia.twitter);
        setLinkedIn(profile.socialMedia.linkedin);
        setInstagram(profile.socialMedia.instagram);
        setAvatar(profile.avatar);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      const profileUpdateData = {
        name,
        bio,
        location,
        website,
        twitter,
        instagram,
        linkedin: linkedIn
      };

      // Validate profile data
      const validation = profileService.validateProfileData(profileUpdateData);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      const updatedProfile = await profileService.updateProfile(profileUpdateData);
      
      if (updatedProfile) {
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
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos.');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your camera.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setIsUploadingAvatar(true);
      
      // For now, we'll use the local image URI directly
      // In a real app, you would upload to a server/cloud storage first
      const success = await profileService.updateAvatar(imageUri);
      
      if (success) {
        setAvatar(imageUri);
        Alert.alert('Success', 'Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImageFromGallery },
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
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer} disabled={isUploadingAvatar}>
            <Image 
              source={{ uri: avatar }}
              style={styles.avatar}
            />
            {isUploadingAvatar && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FF9800" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarOverlayText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>
            {isUploadingAvatar ? 'Uploading...' : 'Tap to change avatar'}
          </Text>
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
              style={[styles.editButton, isLoading && styles.buttonDisabled]} 
              onPress={() => setIsEditing(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.editingButtons}>
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.buttonDisabled]} 
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>💾 Save Changes</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsEditing(false)}
                disabled={isLoading}
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default UserProfileScreen;

