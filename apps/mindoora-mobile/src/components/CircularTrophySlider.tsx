import React, { useRef, useState, useEffect } from 'react';
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
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import trophyService from '../services/trophyService';

interface Trophy {
  id: string;
  name: string;
  image: any;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  description: string;
  backgroundGradient: string[];
  isCustom?: boolean; // Flag to identify uploaded trophies
  imagePath?: string; // Store the file path for deletion
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
  const [allTrophiesState, setAllTrophiesState] = useState<Trophy[]>(allTrophies);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrophyName, setNewTrophyName] = useState('');
  const [newTrophyDescription, setNewTrophyDescription] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('gold');
const [userTrophies, setUserTrophies] = useState<Trophy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tempImageData, setTempImageData] = useState<{
    blob: Blob | null;
    uri: string | null;
  }>({ blob: null, uri: null });
  useEffect(() => {
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const fetchTrophies = async () => {
      try {
        const backendTrophies = await trophyService.getUserTrophies();
        console.log('✅ Backend trophies:', backendTrophies);
        
        // Convert backend trophies to the format expected by the component
        const convertedTrophies = backendTrophies.map((trophy: any) => ({
          id: trophy.id,
          name: trophy.name,
          image: { uri: `http://127.0.0.1:8080${trophy.imageUrl}` },
          rarity: trophy.trophyRank,
          description: trophy.description || 'Custom trophy',
          backgroundGradient: ['#a8edea', '#fed6e3'],
          isCustom: true,
          imagePath: trophy.imageUrl,
          serverTrophyId: trophy.id, // Store server trophy ID for deletion
        }));
        
        // Combine static trophies with backend trophies
        setAllTrophiesState([...allTrophies, ...convertedTrophies]);
        console.log('✅ Trophies loaded successfully');
      } catch (error) {
        console.error('❌ Failed to fetch trophies:', error);
        // Fall back to static trophies only
        setAllTrophiesState(allTrophies);
      }
    };

    fetchTrophies();
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
    const inputRange = allTrophiesState.map((_, i) => i * ITEM_SIZE);
    const outputRange = allTrophiesState.map(trophy => trophy.backgroundGradient[0]);
    
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

  const deleteCustomTrophy = async (trophy: Trophy) => {
    Alert.alert(
      'Delete Trophy',
      'Are you sure you want to delete this custom trophy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Check if this is a server trophy (has serverTrophyId) or local trophy
              const hasServerTrophyId = (trophy as any).serverTrophyId;
              
              if (hasServerTrophyId) {
                // This is a server trophy - delete via API
                console.log('🗑️ Deleting server trophy:', (trophy as any).serverTrophyId);
                await trophyService.deleteTrophy((trophy as any).serverTrophyId);
                console.log('✅ Server trophy deleted successfully');
              } else {
                // This is a local trophy - delete the image file from storage
                if (trophy.imagePath && trophy.imagePath.startsWith(FileSystem.documentDirectory || '')) {
                  console.log('🗑️ Deleting local file:', trophy.imagePath);
                  await FileSystem.deleteAsync(trophy.imagePath);
                  console.log('✅ Local file deleted successfully');
                }
              }
              
              // Remove trophy from state
              const updatedTrophies = allTrophiesState.filter(t => t.id !== trophy.id);
              setAllTrophiesState(updatedTrophies);
              
              // If the deleted trophy was active, navigate to the first trophy
              if (activeIndex >= updatedTrophies.length) {
                setActiveIndex(Math.max(0, updatedTrophies.length - 1));
              }
              
              Alert.alert('Success', 'Trophy deleted successfully!');
            } catch (error) {
              console.error('❌ Failed to delete trophy:', error);
              Alert.alert('Error', `Failed to delete the trophy: ${error.message || 'Please try again.'}`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const pickImageAndUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const imageUri = result.assets[0].uri;
        const fileName = imageUri.split('/').pop();
        const userName = 'user_name'; // Placeholder for username
        const destinationUri = `${FileSystem.documentDirectory}assets/users/${userName}/${fileName}`;

        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}assets/users/${userName}`, { intermediates: true });

        // Copy image to destination
        await FileSystem.copyAsync({ from: imageUri, to: destinationUri });

        const uploadImage = await FileSystem.readAsStringAsync(destinationUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create FormData for the API request
        const formData = new FormData();
        formData.append('image_file_b64', uploadImage);
        formData.append('size', 'auto');

        // Use remove.bg API for background removal
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Image processing failed: ${response.status}`);
        }

        // Get the processed image as base64
        const processedImageBlob = await response.blob();
        const reader = new FileReader();
        
        const base64Result = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            // Remove the data URL prefix to get just the base64 string
            const base64String = base64Data.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(processedImageBlob);
        });

        const processedImageUri = `${FileSystem.documentDirectory}assets/users/${userName}/processed_${fileName}`;
        await FileSystem.writeAsStringAsync(processedImageUri, base64Result as string, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const newTrophy: Trophy = {
          id: String(allTrophiesState.length + 1),
          name: 'Custom Trophy',
          image: { uri: processedImageUri },
          rarity: 'bronze',
          description: 'Custom uploaded image',
          backgroundGradient: ['#a8edea', '#fed6e3'],
          isCustom: true,
          imagePath: processedImageUri,
        };

        setAllTrophiesState([...allTrophiesState, newTrophy]);
        
        // Store image data for later use in form submission
        setTempImageData({
          blob: processedImageBlob,
          uri: processedImageUri
        });
        
        // Show form to input additional details
        setNewTrophyName('');
        setNewTrophyDescription('');
        setShowForm(true);
      } catch (error) {
        console.error('Failed to upload image', error);
        Alert.alert('Error', 'An error occurred while uploading the image.');
      }
    }
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
                shadowColor: getRarityGlow(allTrophiesState[activeIndex]?.rarity || 'gold'),
              },
            ]}
          >
            <Image 
              source={allTrophiesState[activeIndex]?.image} 
              style={styles.mainTrophyImage} 
            />
          </View>
          
          {/* Trophy Info */}
          <View style={styles.mainTrophyInfo}>
            <Text style={styles.mainTrophyName}>
{allTrophiesState[activeIndex]?.isCustom && `Custom Trophy: `}{allTrophiesState[activeIndex]?.name}
            </Text>
            <Text style={styles.mainTrophyDescription}>
              {allTrophiesState[activeIndex]?.description}
            </Text>
            <View style={[styles.mainRarityBadge, { backgroundColor: getRarityColor(allTrophiesState[activeIndex]?.rarity || 'gold') }]}>
              <Text style={styles.mainRarityText}>
                {allTrophiesState[activeIndex]?.rarity?.toUpperCase()}
              </Text>
            </View>
            
            {/* Custom Trophy Buttons */}
            <View style={styles.customTrophyButtons}>
              {/* Show Delete button only for custom trophies */}
              {allTrophiesState[activeIndex]?.isCustom ? (
                <TouchableOpacity 
                  style={[styles.customButton, styles.deleteButton]} 
                  onPress={() => deleteCustomTrophy(allTrophiesState[activeIndex])}
                >
                  <View style={styles.buttonIcon}>
                    <Text style={styles.buttonIconText}>🗑️</Text>
                  </View>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.customButton} onPress={pickImageAndUpload}>
                    <View style={styles.buttonIcon}>
                      <Text style={styles.buttonIconText}>📁</Text>
                    </View>
                    <Text style={styles.buttonText}>Upload PNG</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.customButton} onPress={() => console.log('Create trophy')}>
                    <View style={styles.buttonIcon}>
                      <Text style={styles.buttonIconText}>🎨</Text>
                    </View>
                    <Text style={styles.buttonText}>Create Trophy</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

{/* Form to add trophy details */}
      {showForm && (
        	<Modal transparent={true} animationType="slide">
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Add Trophy Details</Text>

              <TextInput
                style={styles.input}
                placeholder="Trophy Name"
                placeholderTextColor="#cccccc"
                value={newTrophyName}
                onChangeText={setNewTrophyName}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#cccccc"
                value={newTrophyDescription}
                onChangeText={setNewTrophyDescription}
              />

              <View style={styles.rarityPicker}>
                {['bronze', 'silver', 'gold', 'platinum'].map((r) => (
                  <TouchableOpacity key={r} onPress={() => setSelectedRarity(r)} style={[styles.rarityOption, selectedRarity === r && styles.selectedRarityOption]}>
                    <Text style={[styles.rarityText, selectedRarity === r && styles.selectedRarityText]}>{r.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={async () => {
                  if (!newTrophyName || !newTrophyDescription) {
                    Alert.alert('Error', 'Please fill all fields.');
                    return;
                  }
                  // Close form and reset fields
                  // Here we would call the API to save the trophy
                  // For now, let's update the existing trophy that was created during image upload
                  const currentTrophy = allTrophiesState[allTrophiesState.length - 1];
                  if (currentTrophy && currentTrophy.isCustom) {
                    const updatedTrophy = {
                      ...currentTrophy,
                      name: newTrophyName,
                      description: newTrophyDescription,
                      rarity: selectedRarity,
                    };
                    
                    const updatedTrophies = [...allTrophiesState];
                    updatedTrophies[updatedTrophies.length - 1] = updatedTrophy;
                    setAllTrophiesState(updatedTrophies);

                    // Save to database
                    if (tempImageData.blob && tempImageData.uri) {
                      try {
                        // Create a proper image file object from the processed image
                        const imageFile = {
                          uri: tempImageData.uri,
                          type: 'image/png',
                          name: `${newTrophyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`
                        } as any;
                        
                        await trophyService.createTrophy({
                          name: newTrophyName,
                          description: newTrophyDescription,
                          trophyRank: selectedRarity,
                          imageSrc: tempImageData.uri
                        }, imageFile);
                        console.log('✅ Trophy saved to database successfully');
                      } catch (error) {
                        console.error('❌ Failed to save trophy to database:', error);
                        Alert.alert('Warning', 'Trophy created locally but failed to save to server. Please check your internet connection.');
                      }
                    }
                  }
                  
                  setShowForm(false);
                  Alert.alert('Success', 'Trophy created successfully with your custom details!');
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowForm(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
      )}

      
{/* Bottom Circular Trophy Selector */}
      <View style={styles.bottomTrophySelector}>
        <FlatList
          data={allTrophiesState}
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
              { width: `${((activeIndex + 1) / allTrophiesState.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {activeIndex + 1} / {allTrophiesState.length}
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
    paddingBottom: 280,
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
  // Custom Trophy Buttons
  customTrophyButtons: {
    flexDirection: 'row',
    marginTop: 25,
    gap: 15,
    justifyContent: 'center',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconText: {
    fontSize: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  // Form styles
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  rarityPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
  },
  rarityOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRarityOption: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedRarityText: {
    color: '#FFD700',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.3)',
    borderColor: '#ff5252',
  },
});

export default CircularTrophySlider;
