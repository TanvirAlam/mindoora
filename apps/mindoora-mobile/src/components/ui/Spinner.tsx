import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';

interface SpinnerProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  backgroundColor?: string;
  overlayOpacity?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  visible,
  message = 'Loading...',
  size = 'large',
  color = '#4CAF50',
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
  overlayOpacity = 0.5
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
    >
      <View style={[styles.overlay, { backgroundColor }]}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size={size} color={color} />
          {message && (
            <Text style={[styles.message, { color }]}>{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Spinner;
