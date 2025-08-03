import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native'
import TrophyModal from './TrophyModal'

interface Trophy {
  id: string
  name: string
  image: any
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface FeaturedTrophiesProps {
  onViewAll?: () => void
}

// Move allTrophies outside component to prevent recreating on every render
const allTrophies: Trophy[] = [
  {
    id: '1',
    name: 'Brainiac Expert',
    image: require('../../../../packages/assets/trophies/brainiac-expert.png'),
    rarity: 'platinum'
  },
  { id: '2', name: 'Champion', image: require('../../../../packages/assets/trophies/champion.png'), rarity: 'gold' },
  {
    id: '3',
    name: 'Quiz Master Gold',
    image: require('../../../../packages/assets/trophies/quiz-master-gold.png'),
    rarity: 'gold'
  },
  {
    id: '4',
    name: 'Math Genius',
    image: require('../../../../packages/assets/trophies/math-genius.png'),
    rarity: 'silver'
  },
  {
    id: '5',
    name: 'Streak King',
    image: require('../../../../packages/assets/trophies/streak-king.png'),
    rarity: 'silver'
  },
  {
    id: '6',
    name: 'Science Nerd',
    image: require('../../../../packages/assets/trophies/science-nerd.png'),
    rarity: 'bronze'
  },
  { id: '7', name: 'Creator', image: require('../../../../packages/assets/trophies/creator.png'), rarity: 'gold' },
  {
    id: '8',
    name: 'Influencer',
    image: require('../../../../packages/assets/trophies/Influencer.png'),
    rarity: 'platinum'
  }
]

const FeaturedTrophies: React.FC<FeaturedTrophiesProps> = ({ onViewAll }) => {
  const [featuredTrophies, setFeaturedTrophies] = useState<Trophy[]>([])
  const [showTrophyModal, setShowTrophyModal] = useState(false)
  const usedTrophyIdsRef = useRef<Set<string>>(new Set())
  const fadeAnims = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]).current
  const scaleAnims = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]).current
  const rotateAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current
  const bounceAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current

  // Get a random trophy that's not currently displayed
  const getRandomUnusedTrophy = useCallback(() => {
    const currentIds = new Set(featuredTrophies.map((t) => t.id))
    const availableTrophies = allTrophies.filter((trophy) => !usedTrophyIdsRef.current.has(trophy.id))
    
    if (availableTrophies.length === 0) {
      // If all trophies are used, reset and use any trophy except current ones
      const resetAvailable = allTrophies.filter((trophy) => !currentIds.has(trophy.id))
      return resetAvailable[Math.floor(Math.random() * resetAvailable.length)]
    }
    return availableTrophies[Math.floor(Math.random() * availableTrophies.length)]
  }, [featuredTrophies])

  // Create exciting trophy change animation
  const changeOneTrophy = useCallback(() => {
    if (featuredTrophies.length === 0) return

    const randomIndex = Math.floor(Math.random() * 3) // Random position (0, 1, or 2)
    const newTrophy = getRandomUnusedTrophy()

    if (!newTrophy) return

    // Start dramatic exit animation sequence
    Animated.parallel([
      // Scale down and fade out
      Animated.timing(scaleAnims[randomIndex], {
        toValue: 0.3,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnims[randomIndex], {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }),
      // Spin while exiting
      Animated.timing(rotateAnims[randomIndex], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start(() => {
      // Reset rotation for new trophy
      rotateAnims[randomIndex].setValue(0)

      // Update the trophy at the random index
      setFeaturedTrophies((prev) => {
        const newTrophies = [...prev]
        const oldTrophy = newTrophies[randomIndex]
        newTrophies[randomIndex] = newTrophy

        // Update used trophies ref
        usedTrophyIdsRef.current.delete(oldTrophy.id) // Remove old trophy
        usedTrophyIdsRef.current.add(newTrophy.id) // Add new trophy

        return newTrophies
      })

      // Dramatic entrance animation sequence
      Animated.sequence([
        // Quick bounce and fade in
        Animated.parallel([
          Animated.spring(scaleAnims[randomIndex], {
            toValue: 1.2,
            tension: 100,
            friction: 3,
            useNativeDriver: true
          }),
          Animated.timing(fadeAnims[randomIndex], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ]),
        // Settle back to normal size with bounce
        Animated.spring(scaleAnims[randomIndex], {
          toValue: 1,
          tension: 120,
          friction: 4,
          useNativeDriver: true
        })
      ]).start(() => {
        // Add celebration bounce
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnims[randomIndex], {
              toValue: -5,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.timing(bounceAnims[randomIndex], {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
            })
          ]),
          { iterations: 2 }
        ).start()
      })
    })
  }, [featuredTrophies, getRandomUnusedTrophy, scaleAnims, fadeAnims, rotateAnims, bounceAnims])

  useEffect(() => {
    // Initialize with 3 random trophies only once
    const shuffled = [...allTrophies].sort(() => 0.5 - Math.random())
    const initial = shuffled.slice(0, 3)
    setFeaturedTrophies(initial)
    usedTrophyIdsRef.current = new Set(initial.map((t) => t.id))

    // Add constant subtle floating animation to all trophies
    const startFloatingAnimations = () => {
      ;[0, 1, 2].forEach((index) => {
        const delay = index * 500 // Stagger the animations
        setTimeout(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(bounceAnims[index], {
                toValue: -3,
                duration: 2000 + index * 200, // Different speeds
                useNativeDriver: true
              }),
              Animated.timing(bounceAnims[index], {
                toValue: 0,
                duration: 2000 + index * 200,
                useNativeDriver: true
              })
            ])
          ).start()
        }, delay)
      })
    }

    startFloatingAnimations() // Start floating animations
    
    // Set interval to 1 minute (60000ms)
    const interval = setInterval(changeOneTrophy, 60000) // 1 minute interval

    return () => clearInterval(interval) // Cleanup on unmount
  }, []) // Empty dependency array - only run once

  // Separate effect for the changeOneTrophy function when dependencies change
  useEffect(() => {
    // This effect doesn't need to do anything, just ensures changeOneTrophy is updated
  }, [changeOneTrophy])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'platinum':
        return '#E5E4E2'
      case 'gold':
        return '#FFD700'
      case 'silver':
        return '#C0C0C0'
      case 'bronze':
        return '#CD7F32'
      default:
        return '#FFD700'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'platinum':
        return '#FFFFFF'
      case 'gold':
        return '#FFD700'
      case 'silver':
        return '#E6E6FA'
      case 'bronze':
        return '#DEB887'
      default:
        return '#FFD700'
    }
  }

  const TrophyItem = ({ item }: { item: Trophy }) => {
    const shimmerAnimation = useRef(new Animated.Value(0)).current
    const scaleAnimation = useRef(new Animated.Value(1)).current

    useEffect(() => {
      // Slower shimmer for featured trophies
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true
          })
        ])
      )
      shimmerLoop.start()
      return () => shimmerLoop.stop()
    }, [])

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]).start()
    }

    const shimmerTranslateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 80]
    })

    const shimmerOpacity = shimmerAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.9, 0]
    })

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.trophyContainer,
            {
              transform: [{ scale: scaleAnimation }],
              shadowColor: getRarityGlow(item.rarity),
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 12
            }
          ]}
        >
          <View
            style={[
              styles.trophyFrame,
              {
                borderColor: getRarityColor(item.rarity),
                backgroundColor: `${getRarityColor(item.rarity)}20`
              }
            ]}
          >
            <Image source={item.image} style={styles.trophyImage} />

            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerTranslateX }],
                  opacity: shimmerOpacity
                }
              ]}
            />

            {/* Rarity star indicator */}
            <View style={[styles.rarityIndicator, { backgroundColor: getRarityColor(item.rarity) }]}>
              <Text style={styles.rarityIcon}>⭐</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    )
  }

  if (featuredTrophies.length === 0) {
    return null // Don't show the section if no trophies
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Featured Trophies</Text>
          <TouchableOpacity 
            onPress={() => setShowTrophyModal(true)} 
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.trophyRow}>
        {featuredTrophies.map((item, index) => {
          const rotateInterpolate = rotateAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
          })

          return (
            <Animated.View
              key={item.id}
              style={{
                opacity: fadeAnims[index],
                flex: 1,
                transform: [
                  { scale: scaleAnims[index] },
                  { rotate: rotateInterpolate },
                  { translateY: bounceAnims[index] }
                ]
              }}
            >
              <TrophyItem item={item} />
            </Animated.View>
          )
        })}
      </View>
    </View>
    
    {/* Trophy Modal */}
    <TrophyModal 
      visible={showTrophyModal} 
      onClose={() => setShowTrophyModal(false)} 
    />
  </>
  )
}

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
      height: 3
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 15
  },
  viewAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600'
  },
  trophyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  trophyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5
  },
  trophyFrame: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  trophyImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain'
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 25,
    transform: [{ skewX: '-15deg' }]
  },
  rarityIndicator: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  rarityIcon: {
    fontSize: 10
  }
})

export default FeaturedTrophies
