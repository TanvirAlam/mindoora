import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface CallIndicatorAnimationProps {
  size?: number;
  color?: string;
  isActive?: boolean;
  waveCount?: number;
  children?: React.ReactNode;
}

const CallIndicatorAnimation: React.FC<CallIndicatorAnimationProps> = ({
  size = 70,
  color = '#4CAF50',
  isActive = true,
  waveCount = 3,
  children
}) => {
  // Create animated values for each wave
  const waveAnimations = useRef(
    Array.from({ length: waveCount }, () => new Animated.Value(0))
  ).current;

  const opacityAnimations = useRef(
    Array.from({ length: waveCount }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (!isActive) {
      // Stop all animations and reset
      waveAnimations.forEach(anim => anim.stopAnimation());
      opacityAnimations.forEach(anim => anim.stopAnimation());
      return;
    }

    // Create staggered wave animations
    const createWaveAnimation = () => {
      const animations = waveAnimations.map((waveAnim, index) => {
        return Animated.sequence([
          // Delay each wave
          Animated.delay(index * 600), // 600ms delay between waves
          Animated.parallel([
            // Scale animation (wave expansion)
            Animated.timing(waveAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            // Opacity animation (fade out)
            Animated.timing(opacityAnimations[index], {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ]);
      });

      return Animated.parallel(animations);
    };

    // Create repeating animation
    const startAnimation = () => {
      // Reset all values
      waveAnimations.forEach(anim => anim.setValue(0));
      opacityAnimations.forEach(anim => anim.setValue(1));
      
      // Start the wave animation
      createWaveAnimation().start(() => {
        if (isActive) {
          startAnimation(); // Loop the animation
        }
      });
    };

    startAnimation();

    return () => {
      waveAnimations.forEach(anim => anim.stopAnimation());
      opacityAnimations.forEach(anim => anim.stopAnimation());
    };
  }, [isActive, waveAnimations, opacityAnimations]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Render wave rings */}
      {isActive && waveAnimations.map((waveAnim, index) => {
        const scale = waveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.2], // Reduced scale to fit within container
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.wave,
              {
                width: size * 0.8, // Slightly smaller initial size
                height: size * 0.8,
                borderRadius: (size * 0.8) / 2,
                borderColor: color,
                transform: [{ scale }],
                opacity: opacityAnimations[index],
              },
            ]}
          />
        );
      })}
      
      {/* Central button content */}
      <View style={[styles.centralButton, { width: size, height: size, borderRadius: size / 2 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden', // Ensure waves don't exceed container bounds
  },
  wave: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    zIndex: 1, // Ensure waves are behind the button
  },
  centralButton: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure button is above waves
    position: 'relative', // Establish stacking context
  },
});

export default CallIndicatorAnimation;
