import { Alert } from 'react-native';
import authService from '../auth/authService';

// Profile service that integrates with the backend profile endpoints
const SERVER_BASE_URL = 'http://127.0.0.1:8080/api/v1';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  socialMedia: {
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  trophies: any[];
  totalScore: number;
  verified: boolean;
  memberSince: string;
}

interface UpdateProfileData {
  name: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

class ProfileService {
  // Get current user's profile
  async getProfile(): Promise<ProfileData | null> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Fetching user profile...');
      
      const response = await fetch(`${SERVER_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const result = await response.json();
      console.log('✅ Profile fetched successfully');
      
      return result.profile;
    } catch (error) {
      console.error('❌ Get Profile Error:', error);
      Alert.alert('Error', 'Failed to load profile information');
      return null;
    }
  }

  // Update user profile
  async updateProfile(profileData: UpdateProfileData): Promise<ProfileData | null> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Updating user profile...');
      
      const response = await fetch(`${SERVER_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated successfully');
      
      return result.profile;
    } catch (error) {
      console.error('❌ Update Profile Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
      return null;
    }
  }

  // Update user avatar
  async updateAvatar(imageUrl: string): Promise<boolean> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.accessToken) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Updating user avatar...');
      
      const response = await fetch(`${SERVER_BASE_URL}/user/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`,
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update avatar');
      }

      const result = await response.json();
      console.log('✅ Avatar updated successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Update Avatar Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update avatar');
      return false;
    }
  }

  // Validate profile data before submission
  validateProfileData(data: UpdateProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name is required
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    // Name should not be too long
    if (data.name && data.name.length > 100) {
      errors.push('Name is too long (max 100 characters)');
    }

    // Bio length validation
    if (data.bio && data.bio.length > 500) {
      errors.push('Bio is too long (max 500 characters)');
    }

    // Website URL validation (basic)
    if (data.website && data.website.trim() !== '' && !data.website.startsWith('http')) {
      errors.push('Website URL must start with http:// or https://');
    }

    // Location length validation
    if (data.location && data.location.length > 100) {
      errors.push('Location is too long (max 100 characters)');
    }

    // Social media handle validation (remove @ if present)
    if (data.twitter && data.twitter.includes('@')) {
      data.twitter = data.twitter.replace('@', '');
    }
    if (data.instagram && data.instagram.includes('@')) {
      data.instagram = data.instagram.replace('@', '');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format social media links for display
  formatSocialMediaLinks(profile: ProfileData) {
    return {
      twitter: profile.socialMedia.twitter 
        ? `https://twitter.com/${profile.socialMedia.twitter}` 
        : '',
      instagram: profile.socialMedia.instagram 
        ? `https://instagram.com/${profile.socialMedia.instagram}` 
        : '',
      linkedin: profile.socialMedia.linkedin || ''
    };
  }

  // Get profile completion percentage
  getProfileCompletionPercentage(profile: ProfileData): number {
    const fields = [
      profile.name,
      profile.bio,
      profile.location,
      profile.website,
      profile.socialMedia.twitter,
      profile.socialMedia.instagram,
      profile.socialMedia.linkedin,
      profile.avatar
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }
}

export default new ProfileService();
export type { ProfileData, UpdateProfileData };
