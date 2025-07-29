import { Alert } from 'react-native';
import { User } from '../../types';

// Authentication service that integrates with the server
// For iOS Simulator, use 127.0.0.1 instead of localhost
// For Android Emulator, use 10.0.2.2 instead of localhost
// For physical device, use your machine's IP address
const SERVER_BASE_URL = 'http://127.0.0.1:8080/api/v1';

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private hasLoggedInThisSession: boolean = false; // Track if user has logged in this session

  constructor() {
    // Initialize with no user
    setTimeout(() => {
      this.notifyListeners(this.currentUser);
    }, 100);
  }

  // Google Sign-In with server integration
  async signInWithGoogle(): Promise<User | null> {
    try {
      console.log('🔍 Starting Google Sign-In process...');
      
      // Check if user is already logged in this session
      if (this.hasLoggedInThisSession && this.currentUser) {
        console.log('👤 User already logged in this session, skipping server call');
        return this.currentUser;
      }
      
      // For demo purposes, simulate Google OAuth response
      // In production, you would get this from actual Google OAuth flow
      const googleUserData = {
        name: 'Demo User (Google)',
        email: 'demo.user@gmail.com',
        image: 'https://via.placeholder.com/150',
        provider: 'google',
        providerId: 'google_' + Date.now(),
        verified: true
      };
      
      console.log('📤 Sending OAuth login request to server...');
      
      // Call server OAuth endpoint
      const response = await fetch(`${SERVER_BASE_URL}/auth/oauth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleUserData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate with server');
      }
      
      const serverResponse = await response.json();
      console.log('✅ OAuth login successful:', serverResponse.message);
      
      // Transform server response to mobile User type
      // Note: serverResponse contains both Register and User data
      // We need to use the Register.id for database operations (foreign keys)
      const user: User = {
        id: serverResponse.id, // This is Register.id (needed for foreign key constraints)
        name: serverResponse.name,
        email: serverResponse.email,
        avatar: serverResponse.image,
        provider: 'google',
        trophies: [], // These would come from your user profile endpoint
        totalScore: 0, // These would come from your user profile endpoint
        accessToken: serverResponse.accessToken,
      };
      
      this.currentUser = user;
      this.hasLoggedInThisSession = true; // Mark that user has logged in this session
      this.notifyListeners(user);
      return user;
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in with Google');
    }
  }

  // Facebook Sign-In with server integration
  async signInWithFacebook(): Promise<User | null> {
    try {
      console.log('🔍 Starting Facebook Sign-In process...');
      
      // Check if user is already logged in this session
      if (this.hasLoggedInThisSession && this.currentUser) {
        console.log('👤 User already logged in this session, skipping server call');
        return this.currentUser;
      }
      
      // For demo purposes, simulate Facebook OAuth response
      // In production, you would get this from actual Facebook OAuth flow
      const facebookUserData = {
        name: 'Demo User (Facebook)',
        email: 'demo.user@facebook.com',
        image: 'https://via.placeholder.com/150',
        provider: 'facebook',
        providerId: 'facebook_' + Date.now(),
        verified: true
      };
      
      console.log('📤 Sending OAuth login request to server...');
      
      // Call server OAuth endpoint
      const response = await fetch(`${SERVER_BASE_URL}/auth/oauth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facebookUserData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate with server');
      }
      
      const serverResponse = await response.json();
      console.log('✅ OAuth login successful:', serverResponse.message);
      
      // Transform server response to mobile User type
      const user: User = {
        id: serverResponse.id,
        name: serverResponse.name,
        email: serverResponse.email,
        avatar: serverResponse.image,
        provider: 'facebook',
        trophies: [], // These would come from your user profile endpoint
        totalScore: 0, // These would come from your user profile endpoint
        accessToken: serverResponse.accessToken,
      };
      
      this.currentUser = user;
      this.hasLoggedInThisSession = true; // Mark that user has logged in this session
      this.notifyListeners(user);
      return user;
    } catch (error) {
      console.error('❌ Facebook Sign-In Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sign in with Facebook');
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      if (!this.hasLoggedInThisSession || !this.currentUser) {
        console.log('⚠️ No active session, skipping server logout call');
        this.currentUser = null;
        this.hasLoggedInThisSession = false;
        this.notifyListeners(null);
        return;
      }
      
      console.log('🔄 Logging out user on server...');
      console.log('📤 Sending logout request with provider:', this.currentUser.provider);
      
      // Send logout request with the original login provider
      const response = await fetch(`${SERVER_BASE_URL}/auth/oauth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentUser?.accessToken}`,
        },
        body: JSON.stringify({ 
          userId: this.currentUser?.id,
          provider: this.currentUser?.provider // Send the original provider (google/facebook)
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Logout request failed, but continuing with local logout');
      } else {
        console.log('✅ User logged out on server');
      }
      
      // Always clear local session regardless of server response
      this.currentUser = null;
      this.hasLoggedInThisSession = false;
      this.notifyListeners(null);
    } catch (error) {
      console.error('❌ Sign Out Error:', error);
      // Still clear local session even if server call fails
      this.currentUser = null;
      this.hasLoggedInThisSession = false;
      this.notifyListeners(null);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Add auth state listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(user: User | null): void {
    this.authStateListeners.forEach(listener => listener(user));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export default new AuthService();
