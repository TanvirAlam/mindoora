import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  Layout,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
  interpolateColor,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface LeaderboardAnimationProps {
  entries: LeaderboardEntry[];
}

const LeaderboardAnimation: React.FC<LeaderboardAnimationProps> = ({ entries }) => {
  const animationProgress = useSharedValue(0);
  const scoreAnimations = entries.map(() => useSharedValue(0));

  // Sort entries by score (highest first)
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  useEffect(() => {
    // Start the main animation
    animationProgress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    // Animate scores with staggered delays
    scoreAnimations.forEach((anim, index) => {
      anim.value = withDelay(
        index * 200 + 500, // Delay based on position
        withSpring(1, {
          damping: 12,
          stiffness: 100,
        })
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Your Results</Text>
      {sortedEntries.map((entry, index) => {
        const isFirst = index === 0;
        const scoreAnimation = scoreAnimations[index];

        const animatedBarStyle = useAnimatedStyle(() => {
          const width = scoreAnimation.value * (entry.score / Math.max(...sortedEntries.map(e => e.score))) * 100;
          const backgroundColor = isFirst
            ? interpolateColor(
                animationProgress.value,
                [0, 1],
                ['#16213e', '#FFD700'] // Light grey to gold
              )
            : '#16a085';

          return {
            width: `${width}%`,
            backgroundColor,
          };
        });

        const animatedScoreStyle = useAnimatedStyle(() => {
          const displayScore = Math.round(scoreAnimation.value * entry.score);
          return {
            opacity: scoreAnimation.value,
          };
        });

        return (
          <Animated.View
            key={entry.id}
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={[styles.entryContainer, isFirst && styles.firstPlace]}
          >
            <View style={styles.entryHeader}>
              <View style={styles.userInfo}>
                <Image source={{ uri: entry.avatar }} style={styles.avatar} />
                <View style={styles.userDetails}>
                  <Text style={[styles.name, isFirst && styles.firstPlaceName]}>
                    {entry.name}
                    {isFirst && ' 👑'}
                  </Text>
                  <Text style={styles.accuracy}>
                    {entry.correctAnswers}/{entry.totalQuestions} correct
                  </Text>
                </View>
              </View>
              <Animated.View style={animatedScoreStyle}>
                <Text style={[styles.score, isFirst && styles.firstPlaceScore]}>
                  {entry.score} pts
                </Text>
              </Animated.View>
            </View>
            
            <View style={styles.barContainer}>
              <Animated.View style={[styles.scoreBar, animatedBarStyle]} />
            </View>
            
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>#{index + 1}</Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  entryContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  firstPlace: {
    borderColor: '#FFD700',
    backgroundColor: '#1a1a1a',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#16a085',
  },
  userDetails: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  firstPlaceName: {
    color: '#FFD700',
  },
  accuracy: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a085',
  },
  firstPlaceScore: {
    color: '#FFD700',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  positionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#16a085',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LeaderboardAnimation;

