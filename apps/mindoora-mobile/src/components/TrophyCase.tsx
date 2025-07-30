import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Platform
} from 'react-native';

interface Trophy {
  id: string;
  name: string;
  image: any;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  description: string;
  unlockedDate?: string;
}

const TrophyCase = () => {
  // Mock trophy data with actual trophy images from the assets (exactly 4 trophies)
  const userTrophies: Trophy[] = [
    { 
      id: '1', 
      name: 'Brainiac Expert', 
      image: require('../../../../packages/assets/trophies/brainiac-expert.png'),
      rarity: 'platinum',
      description: 'Master of knowledge and wisdom',
      unlockedDate: '2024-01-15'
    },
    { 
      id: '2', 
      name: 'Champion', 
      image: require('../../../../packages/assets/trophies/champion.png'),
      rarity: 'gold',
      description: 'Victory in competitive play',
      unlockedDate: '2024-01-20'
    },
    { 
      id: '3', 
      name: 'Quiz Master Gold', 
      image: require('../../../../packages/assets/trophies/quiz-master-gold.png'),
      rarity: 'gold',
      description: 'Expert quiz creator and player',
      unlockedDate: '2024-01-25'
    },
    { 
      id: '4', 
      name: 'Math Genius', 
      image: require('../../../../packages/assets/trophies/math-genius.png'),
      rarity: 'silver',
      description: 'Mathematics mastery',
      unlockedDate: '2024-02-01'
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#FFD700';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'platinum': return '#FFFFFF';
      case 'gold': return '#FFD700';
      case 'silver': return '#E6E6FA';
      case 'bronze': return '#DEB887';
      default: return '#FFD700';
    }
  };

  const TrophyItem = ({ item }: { item: Trophy }) => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;
    const scaleAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      // Shimmer effect animation
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerLoop.start();
      return () => shimmerLoop.stop();
    }, []);

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const shimmerTranslateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 100],
    });

    const shimmerOpacity = shimmerAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 0],
    });

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View 
          style={[
            styles.trophyContainer,
            {
              transform: [{ scale: scaleAnimation }],
              shadowColor: getRarityGlow(item.rarity),
              shadowOpacity: 0.6,
              shadowRadius: 8,
              elevation: 10,
            }
          ]}
        >
          <View style={[
            styles.trophyFrame,
            { 
              borderColor: getRarityColor(item.rarity),
              backgroundColor: `${getRarityColor(item.rarity)}15`,
            }
          ]}>
            <Image source={item.image} style={styles.trophyImage} />
            
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerTranslateX }],
                  opacity: shimmerOpacity,
                }
              ]}
            />
            
            {/* Rarity indicator */}
            <View style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(item.rarity) }
            ]}>
              <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.trophyName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.trophyDescription} numberOfLines={1}>{item.description}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Trophy Case</Text>
        <Text style={styles.subtitle}>{userTrophies.length} trophies earned</Text>
      </View>
      
      <FlatList
        data={userTrophies}
        renderItem={({ item }) => <TrophyItem item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trophyList}
      />
      
      {userTrophies.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>🎯 Start playing to earn trophies!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  trophyList: {
    paddingVertical: 10,
  },
  trophyContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 120,
  },
  trophyFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  trophyImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: 30,
    transform: [{ skewX: '-20deg' }],
  },
  rarityBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  trophyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 14,
  },
  trophyDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default TrophyCase;

