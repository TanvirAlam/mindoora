import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TrophyShape, TrophyDesign, TROPHY_MATERIALS } from '../types/trophy';
import DraggableShape from './DraggableShape';
import MaterialSelector from './MaterialSelector';
import ShapeSelector from './ShapeSelector';
import Colors from '../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 40;
const CANVAS_HEIGHT = screenHeight * 0.5;

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

  const updateShape = useCallback((id: string, updates: Partial<TrophyShape>) => {
    setTrophyDesign(prev => ({
      ...prev,
      shapes: prev.shapes.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    }));
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
          <Text style={styles.title}>3D Trophy Builder</Text>
          <View style={styles.actionButtons}>
            {selectedShapeId && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={duplicateSelectedShape}>
                  <Text style={styles.actionButtonText}>Duplicate</Text>
                </TouchableOpacity>
                {trophyDesign.shapes.length > 1 && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={deleteSelectedShape}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <View style={[styles.canvas, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: Colors.white,
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
});

export default TrophyBuilder;
