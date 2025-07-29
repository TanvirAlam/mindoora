import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
}

export const GoogleIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.7 }]}>G</Text>
  </View>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <View style={[styles.iconContainer, { width: size, height: size, backgroundColor: '#fff' }]}>
    <Text style={[styles.iconText, { fontSize: size * 0.7, color: '#1877F2' }]}>f</Text>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
