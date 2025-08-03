import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/auth/authService';
import { GoogleIcon, FacebookIcon } from '../../components/ui/Icons';
import Colors from '../../constants/colors';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      
      const user = await authService.signInWithGoogle();
      
      if (user) {
        onLoginSuccess();
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('facebook');
      
      const user = await authService.signInWithFacebook();
      
      if (user) {
        onLoginSuccess();
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Failed to sign in with Facebook. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ImageBackground
        source={require('../../../assets/mindoora-bg-1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark overlay for better text readability */}
        <View style={styles.overlay} />
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/mindoora.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tagline}>Helping Children Learn and Grow</Text>
            <Text style={styles.subtitle}>
              Join the fun! Play quiz games with friends and family
            </Text>
          </View>

          {/* Login Section */}
          <View style={styles.loginSection}>
            {/* Login Buttons Row */}
            <View style={styles.buttonRow}>
              {/* Google Login Button */}
              <TouchableOpacity
                style={[styles.iconButton, styles.googleButton]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                {loadingProvider === 'google' ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <GoogleIcon size={24} />
                )}
              </TouchableOpacity>

              {/* Facebook Login Button */}
              <TouchableOpacity
                style={[styles.iconButton, styles.facebookButton]}
                onPress={handleFacebookLogin}
                disabled={isLoading}
              >
                {loadingProvider === 'facebook' ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <FacebookIcon size={24} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
            <Text style={styles.copyrightText}>
              © 2025 Mindoora. All rights reserved.
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Light dark overlay for readability
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // White transparent background
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 0,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Glossy effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Glass morphism effect
    backdropFilter: 'blur(10px)',
  },
  logo: {
    width: 280,
    height: 120,
    marginBottom: 0, // Remove bottom margin since container handles spacing
    tintColor: undefined, // Keep original colors
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#F0F0F0',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginSection: {
    marginHorizontal: 20,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 25,
  },
  iconButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  googleButton: {
    backgroundColor: Colors.primary,
  },
  facebookButton: {
    backgroundColor: Colors.primaryDark,
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  copyrightText: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
});

export default LoginScreen;
