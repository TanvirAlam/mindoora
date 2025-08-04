import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Dimensions, Text, TouchableOpacity, Alert, Image, TextInput, Modal } from 'react-native';
import { saveTrophyAsImage } from '../utils/trophySave';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TrophyShape, TrophyDesign, TROPHY_MATERIALS } from '../types/trophy';
import DraggableShape from './DraggableShape';
import MaterialSelector from './MaterialSelector';
import ShapeSelector from './ShapeSelector';
import Colors from '../constants/colors';
import trophyService, { TrophyData } from '../services/trophyService';
import { captureRef } from 'react-native-view-shot';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 40;
const CANVAS_HEIGHT = screenHeight * 0.35;

const TrophyBuilder: React.FC = () => {
  const [trophyDesign, setTrophyDesign] = useState<TrophyDesign>({
    id: 'trophy-1',
    name: 'My Trophy',
    shapes: [
      {
        id: 'shape-1',
        type: 'trophy-cup',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        width: 100,
        height: 120,
        rotation: 0,
        scale: 1,
        material: TROPHY_MATERIALS.gold,
        zIndex: 1,
      },
    ],
    texts: [],
    background: {
      color: Colors.background.secondary,
    },
    dimensions: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    },
  });

  const [selectedShapeId, setSelectedShapeId] = useState<string | null>('shape-1');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('gold');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [trophyTitle, setTrophyTitle] = useState<string>('');
  const [trophyDescription, setTrophyDescription] = useState<string>('');
  const [selectedTrophyRank, setSelectedTrophyRank] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('gold');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canvasRef = useRef(null);
  const userId = 'user_123'; // Example user ID

  const updateShape = useCallback((id: string, updates: Partial<TrophyShape>) => {
    setTrophyDesign(prev => ({
      ...prev,
      shapes: prev.shapes.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    }));
  }, []);

  const handleSavePress = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!trophyTitle.trim()) {
      Alert.alert('Error', 'Please enter a trophy name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Capture the trophy canvas as an image
      const imageUri = await captureRef(canvasRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Prepare trophy data
      const trophyData: TrophyData = {
        name: trophyTitle.trim(),
        description: trophyDescription.trim(),
        trophyRank: selectedTrophyRank,
      };

      // Prepare image file object
      const imageFile = {
        uri: imageUri,
        type: 'image/png',
        name: `${trophyTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`,
      };

      // Save to trophy service (database)
      await trophyService.createTrophy(trophyData, imageFile);
      
      // Also save locally
      await saveTrophyAsImage({
        viewRef: canvasRef,
        userId,
        trophyName: trophyTitle.toLowerCase().replace(/\s+/g, '_'),
        trophyTitle: trophyTitle.trim(),
        description: trophyDescription.trim(),
      });
      
      // Reset form and close modal
      setShowSaveModal(false);
      setTrophyTitle('');
      setTrophyDescription('');
      setSelectedTrophyRank('gold');
      
      Alert.alert('Success!', 'Trophy created and saved successfully!');
    } catch (error) {
      console.error('Error saving trophy:', error);
      Alert.alert('Error', 'Failed to save trophy. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [trophyTitle, trophyDescription, selectedTrophyRank]);

  const handleCancelSave = useCallback(() => {
    setShowSaveModal(false);
    setTrophyTitle('');
    setTrophyDescription('');
  }, []);

  const selectShape = useCallback((id: string) => {
    setSelectedShapeId(id);
    const shape = trophyDesign.shapes.find(s => s.id === id);
    if (shape) {
      setSelectedMaterial(shape.material.type);
    }
  }, [trophyDesign.shapes]);

  const addShape = useCallback((shapeType: 'circle' | 'rectangle' | 'trophy-cup' | 'star' | 'classic-trophy' | 'silver-trophy' | 'crystal-trophy') => {
    const getShapeDimensions = (type: typeof shapeType) => {
      switch (type) {
        case 'circle':
          return { width: 80, height: 80 };
        case 'trophy-cup':
        case 'classic-trophy':
        case 'silver-trophy':
        case 'crystal-trophy':
          return { width: 120, height: 150 };
        case 'star':
          return { width: 100, height: 100 };
        default:
          return { width: 100, height: 100 };
      }
    };

    const dimensions = getShapeDimensions(shapeType);
    const newShape: TrophyShape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      width: dimensions.width,
      height: dimensions.height,
      rotation: 0,
      scale: 1,
      material: TROPHY_MATERIALS[selectedMaterial],
      zIndex: trophyDesign.shapes.length + 1,
    };

    setTrophyDesign(prev => ({
      ...prev,
      shapes: [...prev.shapes, newShape],
    }));
    setSelectedShapeId(newShape.id);
  }, [selectedMaterial, trophyDesign.shapes.length]);

  const updateSelectedShapeMaterial = useCallback((materialKey: string) => {
    setSelectedMaterial(materialKey);
    if (selectedShapeId) {
      updateShape(selectedShapeId, {
        material: TROPHY_MATERIALS[materialKey],
      });
    }
  }, [selectedShapeId, updateShape]);

  const deleteSelectedShape = useCallback(() => {
    if (selectedShapeId && trophyDesign.shapes.length > 1) {
      Alert.alert(
        'Delete Shape',
        'Are you sure you want to delete this shape?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setTrophyDesign(prev => ({
                ...prev,
                shapes: prev.shapes.filter(shape => shape.id !== selectedShapeId),
              }));
              setSelectedShapeId(null);
            },
          },
        ]
      );
    }
  }, [selectedShapeId, trophyDesign.shapes.length]);

  const duplicateSelectedShape = useCallback(() => {
    if (selectedShapeId) {
      const selectedShape = trophyDesign.shapes.find(s => s.id === selectedShapeId);
      if (selectedShape) {
        const newShape: TrophyShape = {
          ...selectedShape,
          id: `shape-${Date.now()}`,
          x: selectedShape.x + 20,
          y: selectedShape.y + 20,
          zIndex: trophyDesign.shapes.length + 1,
        };
        setTrophyDesign(prev => ({
          ...prev,
          shapes: [...prev.shapes, newShape],
        }));
        setSelectedShapeId(newShape.id);
      }
    }
  }, [selectedShapeId, trophyDesign.shapes]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.trophyContainer}>
              <Image 
                source={require('../../assets/trophies/champion.png')} 
                style={styles.headerTrophy}
                resizeMode="contain"
              />
            </View>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/mindoora.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Trophy Builder</Text>
            </View>
            <View style={styles.trophyContainer}>
              <Image 
                source={require('../../assets/trophies/hall-of-fame.png')} 
                style={styles.headerTrophy}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <View ref={canvasRef} style={[styles.canvas, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}>
            {trophyDesign.shapes
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((shape) => (
                <DraggableShape
                  key={shape.id}
                  shape={shape}
                  onUpdate={updateShape}
                  onSelect={selectShape}
                  isSelected={selectedShapeId === shape.id}
                  canvasWidth={CANVAS_WIDTH}
                  canvasHeight={CANVAS_HEIGHT}
                />
              ))}
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
            <Text style={styles.saveText}>SAVE</Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <ScrollView style={styles.controlsContainer} showsVerticalScrollIndicator={false}>
          <ShapeSelector onShapeSelect={addShape} />
          
          {selectedShapeId && (
            <MaterialSelector
              selectedMaterial={selectedMaterial}
              onMaterialSelect={updateSelectedShapeMaterial}
            />
          )}
          
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to use:</Text>
            <Text style={styles.instructionText}>• Tap shapes to select them</Text>
            <Text style={styles.instructionText}>• Drag to move shapes around</Text>
            <Text style={styles.instructionText}>• Pinch to resize shapes</Text>
            <Text style={styles.instructionText}>• Rotate with two fingers</Text>
            <Text style={styles.instructionText}>• Add new shapes from the toolbar</Text>
            <Text style={styles.instructionText}>• Change materials when a shape is selected</Text>
          </View>
        </ScrollView>

        {/* Save Modal */}
        <Modal
          visible={showSaveModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelSave}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleCancelSave}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>Add Trophy Details</Text>
              
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={trophyTitle}
                  onChangeText={setTrophyTitle}
                  placeholder="Trophy Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  maxLength={50}
                />
                
                <TextInput
                  style={styles.descriptionInput}
                  value={trophyDescription}
                  onChangeText={setTrophyDescription}
                  placeholder="Description"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  multiline={true}
                  numberOfLines={3}
                  maxLength={200}
                />
                
                {/* Trophy Rank Selection */}
                <View style={styles.rankContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rankButton,
                      selectedTrophyRank === 'bronze' && styles.rankButtonSelected
                    ]}
                    onPress={() => setSelectedTrophyRank('bronze')}
                  >
                    <Text style={[
                      styles.rankButtonText,
                      selectedTrophyRank === 'bronze' && styles.rankButtonTextSelected
                    ]}>BRONZE</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.rankButton,
                      selectedTrophyRank === 'silver' && styles.rankButtonSelected
                    ]}
                    onPress={() => setSelectedTrophyRank('silver')}
                  >
                    <Text style={[
                      styles.rankButtonText,
                      selectedTrophyRank === 'silver' && styles.rankButtonTextSelected
                    ]}>SILVER</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.rankButton,
                      selectedTrophyRank === 'gold' && styles.rankButtonSelected
                    ]}
                    onPress={() => setSelectedTrophyRank('gold')}
                  >
                    <Text style={[
                      styles.rankButtonText,
                      selectedTrophyRank === 'gold' && styles.rankButtonTextSelected
                    ]}>GOLD</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.rankButton,
                      selectedTrophyRank === 'platinum' && styles.rankButtonSelected
                    ]}
                    onPress={() => setSelectedTrophyRank('platinum')}
                  >
                    <Text style={[
                      styles.rankButtonText,
                      selectedTrophyRank === 'platinum' && styles.rankButtonTextSelected
                    ]}>PLATINUM</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.subtitleText}>Master of all knowledge domains</Text>
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </Text>
              </TouchableOpacity>
              
              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButtonNew}
                onPress={handleCancelSave}
              >
                <Text style={styles.cancelButtonNewText}>Cancel</Text>
              </TouchableOpacity>
              
              {/* Bottom Action Buttons */}
              <View style={styles.bottomActions}>
                <Text style={styles.bottomActionText}>📁 Upload PNG</Text>
                <Text style={styles.bottomActionText}>🏆 Create Trophy</Text>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  trophyContainer: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTrophy: {
    width: 60,
    height: 72,
  },
  logo: {
    width: 125,
    height: 45,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  canvasContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.background.secondary,
  },
  canvas: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  instructionsContainer: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(40, 44, 72, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    height: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  rankButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  rankButtonSelected: {
    backgroundColor: '#F4D03F',
    borderColor: '#F4D03F',
  },
  rankButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rankButtonTextSelected: {
    color: '#000',
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonNew: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonNewText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  bottomActionText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TrophyBuilder;
