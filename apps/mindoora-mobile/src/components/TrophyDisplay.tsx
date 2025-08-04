import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  FadeInDown,
  BounceIn,
} from 'react-native-reanimated';
import { EarnedTrophy } from '../services/trophyEvaluator';
import trophyEvaluator from '../services/trophyEvaluator';

interface TrophyDisplayProps {
  trophies: EarnedTrophy[];
  onAnimationComplete?: () => void;
}

const TrophyDisplay: React.FC<TrophyDisplayProps> = ({ trophies, onAnimationComplete }) => {
  const newTrophies = trophies.filter(trophy => trophy.isNewlyEarned);

  if (newTrophies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.Text 
        entering={FadeInDown.delay(500).springify()}
        style={styles.title}
      >
        🎉 New Trophies Earned!
      </Animated.Text>
      
      <View style={styles.trophyGrid}>
        {newTrophies.map((trophy, index) => (
          <TrophyItem 
            key={trophy.id} 
            trophy={trophy} 
            index={index}
            onAnimationComplete={index === newTrophies.length - 1 ? onAnimationComplete : undefined}
          />
        ))}
      </View>
    </View>
  );
};

interface TrophyItemProps {
  trophy: EarnedTrophy;
  index: number;
  onAnimationComplete?: () => void;
}

const TrophyItem: React.FC<TrophyItemProps> = ({ trophy, index, onAnimationComplete }) => {
  const scale = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    // Trophy entrance animation
    scale.value = withDelay(
      index * 200,
      withSpring(1, {
        damping: 10,
        stiffness: 80,
      })
    );

    // Shimmer effect
    shimmer.value = withDelay(
      index * 200 + 500,
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
      )
    );

    // Glow effect for high-tier trophies
    if (trophy.trophyRank === 'gold' || trophy.trophyRank === 'platinum') {
      glow.value = withDelay(
        index * 200 + 1000,
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 500 })
        )
      );
    }

    // Trigger completion callback
    if (onAnimationComplete) {
      setTimeout(() => {
        onAnimationComplete();
      }, index * 200 + 2500);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = scale.value;
    const shimmerTranslateX = interpolate(shimmer.value, [0, 1], [-100, 100]);
    const glowOpacity = glow.value;

    return {
      transform: [{ scale: scaleValue }],
      shadowOpacity: glowOpacity * 0.8,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-100, 100]) }],
      opacity: shimmer.value,
    };
  });

  const rarityColor = trophyEvaluator.getTrophyColor(trophy.trophyRank);
  const glowColor = trophyEvaluator.getTrophyGlow(trophy.trophyRank);

  return (
    <Animated.View 
      style={[
        styles.trophyContainer,
        animatedStyle,
        {
          shadowColor: glowColor,
          borderColor: rarityColor,
        }
      ]}
    >
      <View style={[styles.trophyFrame, { backgroundColor: `${rarityColor}20` }]}>
        <Text style={styles.trophyIcon}>{trophy.icon}</Text>
        
        {/* Shimmer effect */}
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
        
        {/* Rarity badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>{trophy.trophyRank.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.trophyName}>{trophy.name}</Text>
      <Text style={styles.trophyDescription}>{trophy.description}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  trophyContainer: {
    alignItems: 'center',
    width: 120,
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#16213e',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
  },
  trophyFrame: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  trophyIcon: {
    fontSize: 32,
    textAlign: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ skewX: '-20deg' }],
  },
  rarityBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
  },
  rarityText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  trophyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  trophyDescription: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default TrophyDisplay;
