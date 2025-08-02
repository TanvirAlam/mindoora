import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialProgressTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
  pulseScale: Animated.Value;
}

const RadialProgressTimer: React.FC<RadialProgressTimerProps> = ({ 
  timeLeft, 
  totalTime, 
  size = 100, 
  strokeWidth = 8,
  pulseScale 
}) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress (inverted so it goes clockwise from top)
  const progress = timeLeft / totalTime;
  
  useEffect(() => {
    // Animate to current progress
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Create animated stroke dash offset
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Determine colors based on time left
  const getProgressColor = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 50) return '#16a085'; // Teal - safe
    if (percentage > 20) return '#f39c12'; // Orange - warning  
    return '#e74c3c'; // Red - urgent
  };

  const getGradientColors = () => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 50) {
      return { start: '#1abc9c', end: '#16a085' }; // Teal gradient
    }
    if (percentage > 20) {
      return { start: '#f1c40f', end: '#f39c12' }; // Orange gradient
    }
    return { start: '#e74c3c', end: '#c0392b' }; // Red gradient
  };

  const gradientColors = getGradientColors();
  const progressColor = getProgressColor();

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.timerContainer,
          { transform: [{ scale: pulseScale }] }
        ]}
      >
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            {/* Gradient definition */}
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors.start} stopOpacity="1" />
              <Stop offset="100%" stopColor={gradientColors.end} stopOpacity="1" />
            </LinearGradient>
            
            {/* Glow gradient */}
            <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors.start} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={gradientColors.end} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={gradientColors.start} stopOpacity="0.2" />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Glow effect circle (slightly larger) */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius + 2}
            stroke="url(#glowGradient)"
            strokeWidth={strokeWidth + 4}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity={0.3}
          />
          
          {/* Main progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Inner glow circle for extra effect */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth}
            stroke={progressColor}
            strokeWidth={1}
            fill="none"
            opacity={0.2}
          />
        </Svg>
        
        {/* Timer text */}
        <View style={styles.timerTextContainer}>
          <Text style={[
            styles.timerText,
            { 
              color: progressColor,
              textShadowColor: progressColor,
            }
          ]}>
            {timeLeft}
          </Text>
        </View>
      </Animated.View>
      
      {/* Pulsing dots around the timer for extra visual flair */}
      {timeLeft <= 10 && (
        <View style={styles.pulsingDots}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pulsingDot,
                {
                  backgroundColor: progressColor,
                  transform: [
                    { 
                      rotate: `${i * 45}deg` 
                    },
                    { 
                      translateY: -size / 2 - 20 
                    },
                    { 
                      scale: pulseScale 
                    }
                  ],
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowOpacity: 0.5,
    textShadowRadius: 8,
  },
  pulsingDots: {
    position: 'absolute',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: 'currentColor',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default RadialProgressTimer;
