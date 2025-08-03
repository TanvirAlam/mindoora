import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThreeDViewer from './ThreeDViewer';

const TrophyBuilder: React.FC = () => {
  return (
    <View style={styles.container}>
      <ThreeDViewer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default TrophyBuilder;
