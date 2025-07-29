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
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/mindoora.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Helping Children Learn and Grow</Text>
        <Text style={styles.subtitle}>
          Join the fun! Play quiz games with friends and family
        </Text>
      </View>

      {/* Login Section */}
      <View style={styles.loginSection}>
        <Text style={styles.loginTitle}>Get Started</Text>
        
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logo: {
    width: 280,
    height: 120,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginSection: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 20,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  googleButton: {
    backgroundColor: Colors.primary,
  },
  facebookButton: {
    backgroundColor: Colors.primaryDark,
  },
  termsText: {
    fontSize: 12,
    color: Colors.text.light,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});

export default LoginScreen;
