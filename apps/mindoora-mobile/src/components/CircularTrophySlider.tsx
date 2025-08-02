import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  ImageBackground,
} from 'react-native';

interface Trophy {
  id: string;
  name: string;
  image: any;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  description: string;
  backgroundGradient: string[];
}

interface CircularTrophySliderProps {
  onClose?: () => void;
}

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = width * 0.7;
const SPACING = 10;

// All trophies with their data
const allTrophies: Trophy[] = [
  {
    id: '1',
    name: 'Brainiac Expert',
    image: require('../../../../packages/assets/trophies/brainiac-expert.png'),
    rarity: 'platinum',
    description: 'Master of all knowledge domains',
    backgroundGradient: ['#667eea', '#764ba2']
  },
  {
    id: '2',
    name: 'Champion',
    image: require('../../../../packages/assets/trophies/champion.png'),
    rarity: 'gold',
    description: 'Ultimate quiz champion',
    backgroundGradient: ['#f093fb', '#f5576c']
  },
  {
    id: '3',
    name: 'Quiz Master Gold',
    image: require('../../../../packages/assets/trophies/quiz-master-gold.png'),
    rarity: 'gold',
    description: 'Golden quiz mastery achieved',
    backgroundGradient: ['#ffecd2', '#fcb69f']
  },
  {
    id: '4',
    name: 'Math Genius',
    image: require('../../../../packages/assets/trophies/math-genius.png'),
    rarity: 'silver',
    description: 'Mathematical excellence',
    backgroundGradient: ['#a8edea', '#fed6e3']
  },
  {
    id: '5',
    name: 'Streak King',
    image: require('../../../../packages/assets/trophies/streak-king.png'),
    rarity: 'silver',
    description: 'Unstoppable winning streak',
    backgroundGradient: ['#d299c2', '#fef9d7']
  },
  {
    id: '6',
    name: 'Science Nerd',
    image: require('../../../../packages/assets/trophies/science-nerd.png'),
    rarity: 'bronze',
    description: 'Scientific knowledge master',
    backgroundGradient: ['#89f7fe', '#66a6ff']
  },
  {
    id: '7',
    name: 'Creator',
    image: require('../../../../packages/assets/trophies/creator.png'),
    rarity: 'gold',
    description: 'Quiz creation expert',
    backgroundGradient: ['#fdbb2d', '#22c1c3']
  },
  {
    id: '8',
    name: 'Influencer',
    image: require('../../../../packages/assets/trophies/Influencer.png'),
    rarity: 'platinum',
    description: 'Social media mastery',
    backgroundGradient: ['#ee9ca7', '#ffdde1']
  },
  {
    id: '9',
    name: 'Quiz Master Bronze',
    image: require('../../../../packages/assets/trophies/quiz-master-bronze.png'),
    rarity: 'bronze',
    description: 'First steps to mastery',
    backgroundGradient: ['#fbc2eb', '#a6c1ef']
  },
  {
    id: '10',
    name: 'Quiz Master Silver',
    image: require('../../../../packages/assets/trophies/quiz-master-silver.png'),
    rarity: 'silver',
    description: 'Silver level achievement',
    backgroundGradient: ['#74b9ff', '#0984e3']
  },
  {
    id: '11',
    name: 'Quiz Master Platinum',
    image: require('../../../../packages/assets/trophies/quiz-master-platinum.png'),
    rarity: 'platinum',
    description: 'Platinum excellence reached',
    backgroundGradient: ['#a29bfe', '#6c5ce7']
  },
  {
    id: '12',
    name: 'Hall of Fame',
    image: require('../../../../packages/assets/trophies/hall-of-fame.png'),
    rarity: 'platinum',
    description: 'Legendary status achieved',
    backgroundGradient: ['#fd79a8', '#fdcb6e']
  },
  {
    id: '13',
    name: 'Hollywood',
    image: require('../../../../packages/assets/trophies/hollywood.png'),
    rarity: 'gold',
    description: 'Movie knowledge expert',
    backgroundGradient: ['#6c5ce7', '#a29bfe']
  },
  {
    id: '14',
    name: 'Music Fan',
    image: require('../../../../packages/assets/trophies/music-fan.png'),
    rarity: 'silver',
    description: 'Music trivia champion',
    backgroundGradient: ['#fab1a0', '#e17055']
  },
  {
    id: '15',
    name: 'Sport Buff',
    image: require('../../../../packages/assets/trophies/sport-buff.png'),
    rarity: 'bronze',
    description: 'Sports knowledge enthusiast',
    backgroundGradient: ['#00b894', '#00cec9']
  }
];

const CircularTrophySlider: React.FC<CircularTrophySliderProps> = ({ onClose }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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
      case 'platinum': return 'rgba(229, 228, 226, 0.8)';
      case 'gold': return 'rgba(255, 215, 0, 0.8)';
      case 'silver': return 'rgba(192, 192, 192, 0.8)';
      case 'bronze': return 'rgba(205, 127, 50, 0.8)';
      default: return 'rgba(255, 215, 0, 0.8)';
    }
  };

  const getCurrentBackgroundGradient = () => {
    const inputRange = allTrophies.map((_, i) => i * ITEM_SIZE);
    const outputRange = allTrophies.map(trophy => trophy.backgroundGradient[0]);
    
    return scrollX.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  };

  const renderTrophy = ({ item, index }: { item: Trophy; index: number }) => {
    // Ensure inputRange is always monotonic
    const inputRange = [
      Math.max(0, (index - 1) * ITEM_SIZE),
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['45deg', '0deg', '-45deg'],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.trophyContainer, { width: ITEM_SIZE }]}>
        <Animated.View
          style={[
            styles.trophyCard,
            {
              transform: [
                { translateY },
                { scale },
                { rotateY },
              ],
              opacity,
            },
          ]}
        >
          {/* Trophy Image Container */}
          <View
            style={[
              styles.trophyImageContainer,
              {
                borderColor: getRarityColor(item.rarity),
                shadowColor: getRarityGlow(item.rarity),
              },
            ]}
          >
            <Image source={item.image} style={styles.trophyImage} />
            
            {/* Rarity Badge */}
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: getRarityColor(item.rarity) }
              ]}
            >
              <Text style={styles.rarityText}>
                {item.rarity.toUpperCase()}
              </Text>
            </View>

            {/* Shimmer Effect */}
            <Animated.View
              style={[
                styles.shimmer,
                {
                  opacity: opacity.interpolate({
                    inputRange: [0.6, 0.8, 1],
                    outputRange: [0, 0.5, 1],
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                },
              ]}
            />
          </View>

          {/* Trophy Info */}
          <View style={styles.trophyInfo}>
            <Text style={styles.trophyName}>{item.name}</Text>
            <Text style={styles.trophyDescription}>{item.description}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);
        setActiveIndex(index);
      }
    }
  );

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * ITEM_SIZE,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Immersive 3D Background */}
      <Animated.View
        style={[
          styles.immersiveBackground,
          {
            backgroundColor: getCurrentBackgroundGradient(),
            opacity: backgroundOpacity,
          },
        ]}
      >
        {/* 3D Floating Elements */}
        <View style={styles.floating3DElements}>
          <Animated.View style={[styles.floatingOrb, styles.orb1]} />
          <Animated.View style={[styles.floatingOrb, styles.orb2]} />
          <Animated.View style={[styles.floatingOrb, styles.orb3]} />
        </View>
      </Animated.View>

      {/* Close Button - Top Right */}
      <TouchableOpacity onPress={onClose} style={styles.closeButtonTop}>
        <View style={styles.closeButtonBg}>
          <Text style={styles.closeButtonText}>✕</Text>
        </View>
      </TouchableOpacity>

      {/* Main Trophy Display */}
      <View style={styles.mainTrophyContainer}>
        <Animated.View style={styles.centerTrophyDisplay}>
          <View
            style={[
              styles.mainTrophyFrame,
              {
                shadowColor: getRarityGlow(allTrophies[activeIndex]?.rarity || 'gold'),
              },
            ]}
          >
            <Image 
              source={allTrophies[activeIndex]?.image} 
              style={styles.mainTrophyImage} 
            />
          </View>
          
          {/* Trophy Info */}
          <View style={styles.mainTrophyInfo}>
            <Text style={styles.mainTrophyName}>
              {allTrophies[activeIndex]?.name}
            </Text>
            <Text style={styles.mainTrophyDescription}>
              {allTrophies[activeIndex]?.description}
            </Text>
            <View style={[styles.mainRarityBadge, { backgroundColor: getRarityColor(allTrophies[activeIndex]?.rarity || 'gold') }]}>
              <Text style={styles.mainRarityText}>
                {allTrophies[activeIndex]?.rarity?.toUpperCase()}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Circular Trophy Selector */}
      <View style={styles.bottomTrophySelector}>
        <FlatList
          data={allTrophies}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomTrophyList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                onPress={() => {
                  setActiveIndex(index);
                  scrollToIndex(index);
                }}
                style={styles.bottomTrophyItem}
              >
                <Animated.View
                  style={[
                    styles.bottomTrophyCircle,
                    {
                      borderColor: isActive ? getRarityColor(item.rarity) : 'rgba(255,255,255,0.3)',
                      borderWidth: isActive ? 3 : 2,
                      transform: [{ scale: isActive ? 1.2 : 1 }],
                      shadowColor: isActive ? getRarityGlow(item.rarity) : 'transparent',
                    },
                  ]}
                >
                  <Image source={item.image} style={styles.bottomTrophyIcon} />
                  {isActive && <View style={styles.activeIndicator} />}
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${((activeIndex + 1) / allTrophies.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {activeIndex + 1} / {allTrophies.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Immersive 3D Background
  immersiveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  floating3DElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  orb1: {
    width: 100,
    height: 100,
    top: '20%',
    left: '10%',
  },
  orb2: {
    width: 150,
    height: 150,
    top: '60%',
    right: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  orb3: {
    width: 80,
    height: 80,
    top: '40%',
    left: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  // Close Button
  closeButtonTop: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
  },
  closeButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Main Trophy Display
  mainTrophyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 200,
  },
  centerTrophyDisplay: {
    alignItems: 'center',
  },
  mainTrophyFrame: {
    width: 380,
    height: 380,
    borderRadius: 190,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 15 },
    elevation: 25,
    position: 'relative',
    overflow: 'hidden',
  },
mainTrophyImage: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
  },
  mainShimmer: {
    position: 'absolute',
    top: 0,
    left: -80,
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-15deg' }],
    opacity: 0.7,
  },
  mainTrophyInfo: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
  },
  mainTrophyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  mainTrophyDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  mainRarityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  mainRarityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  // Bottom Trophy Selector
  bottomTrophySelector: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 80,
  },
  bottomTrophyList: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bottomTrophyItem: {
    marginHorizontal: 8,
  },
bottomTrophyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    position: 'relative',
  },
bottomTrophyIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  activeIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ff88',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Progress Indicator
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  // Legacy styles (keeping for compatibility)
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  flatListContainer: {
    alignItems: 'center',
    paddingHorizontal: (width - ITEM_SIZE) / 2,
  },
  trophyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING,
  },
  trophyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  trophyImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  trophyImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -50,
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ skewX: '-15deg' }],
  },
  rarityBadge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  trophyInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  trophyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  trophyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicatorContainer: {
    marginHorizontal: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  counter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  counterText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});

export default CircularTrophySlider;
