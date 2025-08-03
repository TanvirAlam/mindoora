import authService from './auth/authService';

const SERVER_BASE_URL = 'http://127.0.0.1:8080/api/v1';

export interface TrophyData {
  name: string;
  description: string;
  trophyRank: 'bronze' | 'silver' | 'gold' | 'platinum';
  imageSrc?: string;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  trophyRank: 'bronze' | 'silver' | 'gold' | 'platinum';
  imageSrc: string;
  imageUrl: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

class TrophyService {
  // Create a new trophy
  async createTrophy(trophyData: TrophyData, imageFile: any): Promise<Trophy> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('name', trophyData.name);
      formData.append('description', trophyData.description);
      formData.append('trophyRank', trophyData.trophyRank);
      
      // Handle React Native file upload format
      if (imageFile.uri) {
        formData.append('image', {
          uri: imageFile.uri,
          type: imageFile.type || 'image/png',
          name: imageFile.name || 'trophy_image.png',
        } as any);
      } else {
        // For web/other platforms
        formData.append('image', imageFile);
      }

      console.log('📤 Uploading trophy data:', {
        name: trophyData.name,
        description: trophyData.description,
        trophyRank: trophyData.trophyRank,
        imageUri: imageFile.uri || 'blob',
        imageType: imageFile.type,
        imageName: imageFile.name
      });

      const response = await fetch(`${SERVER_BASE_URL}/trophies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          // Don't set Content-Type header, let FormData set it
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to create trophy');
      }

      const result = await response.json();
      return result.trophy;
    } catch (error) {
      console.error('❌ Create Trophy Error:', error);
      throw error;
    }
  }

  // Get user's trophies
  async getUserTrophies(limit: number = 10, offset: number = 0): Promise<Trophy[]> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${SERVER_BASE_URL}/trophies?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch trophies');
      }

      const result = await response.json();
      return result.trophies;
    } catch (error) {
      console.error('❌ Get Trophies Error:', error);
      throw error;
    }
  }

  // Update a trophy
  async updateTrophy(trophyId: string, trophyData: Partial<TrophyData>): Promise<Trophy> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${SERVER_BASE_URL}/trophies/${trophyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trophyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update trophy');
      }

      const result = await response.json();
      return result.trophy;
    } catch (error) {
      console.error('❌ Update Trophy Error:', error);
      throw error;
    }
  }

  // Delete a trophy
  async deleteTrophy(trophyId: string): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${SERVER_BASE_URL}/trophies/${trophyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete trophy');
      }
    } catch (error) {
      console.error('❌ Delete Trophy Error:', error);
      throw error;
    }
  }

  // Get a single trophy by ID
  async getTrophyById(trophyId: string): Promise<Trophy> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${SERVER_BASE_URL}/trophies/${trophyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch trophy');
      }

      const result = await response.json();
      return result.trophy;
    } catch (error) {
      console.error('❌ Get Trophy Error:', error);
      throw error;
    }
  }
}

export default new TrophyService();
