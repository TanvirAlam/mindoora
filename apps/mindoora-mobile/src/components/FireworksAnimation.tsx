import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  initialX: number;
  initialY: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
  trail: Particle[];
}

interface FireworksAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const FireworksAnimation: React.FC<FireworksAnimationProps> = ({ isVisible, onComplete }) => {
  const [fireworks, setFireworks] = useState<Particle[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFD93D',
    '#FF8C42', '#6BCF7F', '#4D96FF', '#9B59B6',
    '#F39C12', '#E74C3C', '#1ABC9C', '#3498DB'
  ];

  const createParticle = (
    startX: number, 
    startY: number, 
    velocityX: number, 
    velocityY: number,
    color: string,
    gravity: number = 0.3
  ): Particle => {
    const id = `particle-${particleIdRef.current++}`;
    return {
      id,
      x: new Animated.Value(startX),
      y: new Animated.Value(startY),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(Math.random() * 0.5 + 0.5),
      color,
      initialX: startX,
      initialY: startY,
      velocityX,
      velocityY,
      gravity,
      trail: []
    };
  };

  const createExplosion = (centerX: number, centerY: number) => {
    const particles: Particle[] = [];
    const particleCount = 25 + Math.random() * 15; // 25-40 particles
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Create main explosion particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      // Vary colors slightly
      const colorVariation = Math.random() * 0.3;
      const particleColor = i % 3 === 0 ? 
        colors[Math.floor(Math.random() * colors.length)] : baseColor;
      
      particles.push(createParticle(
        centerX, 
        centerY, 
        velocityX, 
        velocityY, 
        particleColor,
        Math.random() * 0.2 + 0.15
      ));
    }
    
    // Create sparkle particles
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      particles.push(createParticle(
        centerX + (Math.random() - 0.5) * 20, 
        centerY + (Math.random() - 0.5) * 20, 
        velocityX, 
        velocityY, 
        '#FFD700', // Gold sparkles
        Math.random() * 0.1 + 0.05
      ));
    }
    
    return particles;
  };

  const animateParticle = (particle: Particle): Animated.CompositeAnimation => {
    // Physics simulation
    const duration = 2000 + Math.random() * 1000;
    const finalX = particle.initialX + (particle.velocityX * duration / 16);
    const finalY = particle.initialY + (particle.velocityY * duration / 16) + (particle.gravity * duration * duration / 32 / 16);
    
    return Animated.parallel([
      // Position animation with physics
      Animated.timing(particle.x, {
        toValue: finalX,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.y, {
        toValue: finalY,
        duration: duration,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.sequence([
        Animated.delay(duration * 0.3),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: duration * 0.7,
          useNativeDriver: true,
        })
      ]),
      // Scale animation for twinkling effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: particle.scale._value * 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: particle.scale._value,
            duration: 200,
            useNativeDriver: true,
          })
        ]),
        { iterations: 8 }
      )
    ]);
  };

  const launchFireworks = () => {
    console.log('🎆 Launching realistic fireworks!');
    const allParticles: Particle[] = [];
    const animations: Animated.CompositeAnimation[] = [];
    
    // Create multiple explosions at different positions and times
    const explosions = [
      { x: width * 0.25, y: height * 0.3, delay: 0 },
      { x: width * 0.75, y: height * 0.25, delay: 300 },
      { x: width * 0.5, y: height * 0.35, delay: 600 },
      { x: width * 0.15, y: height * 0.4, delay: 900 },
      { x: width * 0.85, y: height * 0.35, delay: 1200 },
      { x: width * 0.6, y: height * 0.2, delay: 1500 },
    ];
    
    explosions.forEach(({ x, y, delay }) => {
      setTimeout(() => {
        const explosionParticles = createExplosion(x, y);
        allParticles.push(...explosionParticles);
        
        // Update state to trigger re-render
        setFireworks(prev => [...prev, ...explosionParticles]);
        
        // Start animations for these particles
        const explosionAnimations = explosionParticles.map(particle => 
          animateParticle(particle)
        );
        
        Animated.parallel(explosionAnimations).start();
      }, delay);
    });
    
    // Clean up after all animations complete
    setTimeout(() => {
      setFireworks([]);
      onComplete?.();
      console.log('🎆 Fireworks completed!');
    }, 4000);
  };

  useEffect(() => {
    if (isVisible) {
      launchFireworks();
    } else {
      setFireworks([]);
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
      {fireworks.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          {/* Glow effect */}
          <View style={[
            styles.glow,
            { backgroundColor: particle.color }
          ]} />
        </Animated.View>
      ))}
      
      {/* Additional sparkle overlay */}
      {fireworks.length > 0 && (
        <View style={styles.sparkleOverlay}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Animated.View
              key={`sparkle-${i}`}
              style={[
                styles.sparkle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height * 0.6,
                  opacity: Math.random() * 0.8 + 0.2,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  glow: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -3,
    left: -3,
    opacity: 0.3,
    shadowColor: 'currentColor',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default FireworksAnimation;
