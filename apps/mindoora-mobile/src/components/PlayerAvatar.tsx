import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface PlayerAvatarProps {
  player: {
    name: string;
    imgUrl?: string;
  };
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={player.imgUrl ? { uri: player.imgUrl } : require('../../assets/icon.png')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{player.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  name: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PlayerAvatar;

