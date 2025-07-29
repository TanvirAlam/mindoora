import { Alert } from 'react-native';
import { User } from '../../types';

// Demo authentication service for Expo Go development
// In production, replace with proper Firebase authentication

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Initialize with no user
    setTimeout(() => {
      this.notifyListeners(this.currentUser);
    }, 100);
  }

  // Demo Google Sign-In
  async signInWithGoogle(): Promise<User | null> {
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create demo user
      const demoUser: User = {
        id: 'demo-google-user-' + Date.now(),
        name: 'Demo User (Google)',
        email: 'demo@google.com',
        avatar: undefined,
        provider: 'google',
        trophies: [],
        totalScore: 150,
      };
      
      this.currentUser = demoUser;
      this.notifyListeners(demoUser);
      return demoUser;
    } catch (error) {
      console.error('Demo Google Sign-In Error:', error);
      throw error;
    }
  }

  // Demo Facebook Sign-In
  async signInWithFacebook(): Promise<User | null> {
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create demo user
      const demoUser: User = {
        id: 'demo-facebook-user-' + Date.now(),
        name: 'Demo User (Facebook)',
        email: 'demo@facebook.com',
        avatar: undefined,
        provider: 'facebook',
        trophies: [],
        totalScore: 200,
      };
      
      this.currentUser = demoUser;
      this.notifyListeners(demoUser);
      return demoUser;
    } catch (error) {
      console.error('Demo Facebook Sign-In Error:', error);
      throw error;
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      this.currentUser = null;
      this.notifyListeners(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
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
