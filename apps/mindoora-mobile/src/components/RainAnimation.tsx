import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

interface RainDrop {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  initialX: number;
  speed: number;
}

interface RainAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const RainAnimation: React.FC<RainAnimationProps> = ({ isVisible, onComplete }) => {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const dropIdRef = useRef(0);

  const colors = [
    '#E74C3C', '#C0392B', '#A93226', '#922B21', 
    '#7B241C', '#641E16', '#FF6B6B', '#DC143C',
    '#B22222', '#8B0000', '#CD5C5C', '#F08080'
  ];

  const createRainDrop = (startX: number): RainDrop => {
    const id = `raindrop-${dropIdRef.current++}`;
    return {
      id,
      x: new Animated.Value(startX),
      y: new Animated.Value(-20),
      opacity: new Animated.Value(Math.random() * 0.7 + 0.3),
      scale: new Animated.Value(Math.random() * 0.4 + 0.6),
      color: colors[Math.floor(Math.random() * colors.length)],
      initialX: startX,
      speed: Math.random() * 2000 + 1500, // 1.5-3.5 seconds to fall
    };
  };

  const animateRainDrop = (drop: RainDrop): Animated.CompositeAnimation => {
    return Animated.parallel([
      // Falling animation
      Animated.timing(drop.y, {
        toValue: height + 50,
        duration: drop.speed,
        useNativeDriver: true,
      }),
      // Slight horizontal drift
      Animated.timing(drop.x, {
        toValue: drop.initialX + (Math.random() - 0.5) * 30,
        duration: drop.speed,
        useNativeDriver: true,
      }),
      // Fade out near the bottom
      Animated.sequence([
        Animated.delay(drop.speed * 0.7),
        Animated.timing(drop.opacity, {
          toValue: 0,
          duration: drop.speed * 0.3,
          useNativeDriver: true,
        })
      ]),
      // Subtle scale variation
      Animated.loop(
        Animated.sequence([
          Animated.timing(drop.scale, {
            toValue: drop.scale._value * 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(drop.scale, {
            toValue: drop.scale._value,
            duration: 300,
            useNativeDriver: true,
          })
        ]),
        { iterations: Math.floor(drop.speed / 600) }
      )
    ]);
  };

  const startRain = () => {
    console.log('💧 Starting rain animation for wrong answer');
    const allDrops: RainDrop[] = [];
    
    // Create waves of rain drops
    const createWave = (waveDelay: number, dropCount: number) => {
      setTimeout(() => {
        const waveDrops: RainDrop[] = [];
        
        for (let i = 0; i < dropCount; i++) {
          const dropDelay = i * 100; // Stagger drops within wave
          setTimeout(() => {
            const startX = Math.random() * width;
            const drop = createRainDrop(startX);
            waveDrops.push(drop);
            
            setRainDrops(prev => [...prev, drop]);
            animateRainDrop(drop).start();
          }, dropDelay);
        }
      }, waveDelay);
    };

    // Create 5 waves of rain
    createWave(0, 20);      // Wave 1: 20 drops immediately
    createWave(300, 25);    // Wave 2: 25 drops after 300ms
    createWave(600, 30);    // Wave 3: 30 drops after 600ms
    createWave(900, 25);    // Wave 4: 25 drops after 900ms
    createWave(1200, 20);   // Wave 5: 20 drops after 1200ms

    // Create some larger "heavy drops"
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const heavyDrop = createRainDrop(Math.random() * width);
          heavyDrop.scale = new Animated.Value(Math.random() * 0.6 + 1.0); // Larger
          heavyDrop.opacity = new Animated.Value(Math.random() * 0.4 + 0.6); // More opaque
          heavyDrop.speed = Math.random() * 1000 + 2000; // Slower fall
          heavyDrop.color = '#E74C3C'; // Consistent red color
          
          setRainDrops(prev => [...prev, heavyDrop]);
          animateRainDrop(heavyDrop).start();
        }, i * 200);
      }
    }, 400);

    // Clean up after animation completes
    setTimeout(() => {
      setRainDrops([]);
      onComplete?.();
      console.log('💧 Rain animation completed');
    }, 4000);
  };

  useEffect(() => {
    if (isVisible) {
      startRain();
    } else {
      setRainDrops([]);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {rainDrops.map((drop) => (
        <Animated.View
          key={drop.id}
          style={[
            styles.rainDrop,
            {
              backgroundColor: drop.color,
              transform: [
                { translateX: drop.x },
                { translateY: drop.y },
                { scale: drop.scale },
              ],
              opacity: drop.opacity,
            },
          ]}
        >
          {/* Add a subtle glow effect */}
          <View style={[
            styles.dropGlow,
            { backgroundColor: drop.color }
          ]} />
        </Animated.View>
      ))}
      
      {/* Add some atmospheric effects */}
      {rainDrops.length > 0 && (
        <>
          {/* Dark overlay for mood */}
          <Animated.View style={[
            styles.darkOverlay,
            { opacity: Math.min(rainDrops.length / 50, 0.3) }
          ]} />
          
          {/* Subtle lightning effect */}
          <View style={styles.lightningContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Animated.View
                key={`lightning-${i}`}
                style={[
                  styles.lightning,
                  {
                    left: Math.random() * width,
                    top: Math.random() * height * 0.3,
                    opacity: Math.random() * 0.1 + 0.05,
                  }
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  rainDrop: {
    position: 'absolute',
    width: 4,
    height: 12,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  dropGlow: {
    position: 'absolute',
    width: 8,
    height: 16,
    borderRadius: 4,
    top: -2,
    left: -2,
    opacity: 0.2,
    shadowColor: 'currentColor',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    pointerEvents: 'none',
  },
  lightningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  lightning: {
    position: 'absolute',
    width: 2,
    height: 40,
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
});

export default RainAnimation;
