import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import Colors from '../constants/colors';
import { ClassicTrophy, SilverTrophy, CrystalTrophy } from './TrophyTemplates';

interface ShapeSelectorProps {
  onShapeSelect: (shapeType: 'circle' | 'rectangle' | 'trophy-cup' | 'star' | 'classic-trophy' | 'silver-trophy' | 'crystal-trophy') => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ onShapeSelect }) => {
  const shapes = [
    {
      type: 'circle' as const,
      name: 'Circle',
      icon: (
        <Svg width={40} height={40}>
          <Circle cx={20} cy={20} r={15} fill={Colors.gray[400]} stroke={Colors.gray[600]} strokeWidth={1} />
        </Svg>
      ),
    },
    {
      type: 'rectangle' as const,
      name: 'Rectangle',
      icon: (
        <Svg width={40} height={40}>
          <Rect x={5} y={10} width={30} height={20} fill={Colors.gray[400]} stroke={Colors.gray[600]} strokeWidth={1} rx={2} />
        </Svg>
      ),
    },
    {
      type: 'trophy-cup' as const,
      name: 'Trophy',
      icon: (
        <Svg width={40} height={40}>
          <Path
            d="M 8 12 
               Q 6 14 8 16
               L 8 22
               Q 8 24 10 24
               L 30 24
               Q 32 24 32 22
               L 32 16
               Q 34 14 32 12
               L 32 8
               Q 32 6 30 6
               L 10 6
               Q 8 6 8 8
               Z
               M 14 26
               L 26 26
               L 25 30
               L 15 30
               Z"
            fill={Colors.gray[400]}
            stroke={Colors.gray[600]}
            strokeWidth={1}
          />
        </Svg>
      ),
    },
    {
      type: 'star' as const,
      name: 'Star',
      icon: (
        <Svg width={40} height={40}>
          <Path
            d="M 20 5
               L 24 15
               L 35 15
               L 26 22
               L 30 32
               L 20 25
               L 10 32
               L 14 22
               L 5 15
               L 16 15
               Z"
            fill={Colors.gray[400]}
            stroke={Colors.gray[600]}
            strokeWidth={1}
          />
        </Svg>
      ),
    },
    {
      type: 'classic-trophy' as const,
      name: 'Classic Trophy',
      icon: (
        <ClassicTrophy width={40} height={40} material={{ type: 'gold', color: '#FFD700' }} gradientId="icon-classic-trophy" strokeWidth={1} />
      ),
    },
    {
      type: 'silver-trophy' as const,
      name: 'Silver Trophy',
      icon: (
        <SilverTrophy width={40} height={40} material={{ type: 'silver', color: '#C0C0C0' }} gradientId="icon-silver-trophy" strokeWidth={1} />
      ),
    },
    {
      type: 'crystal-trophy' as const,
      name: 'Crystal Trophy',
      icon: (
        <CrystalTrophy width={40} height={40} material={{ type: 'crystal', color: '#E0E6FF' }} gradientId="icon-crystal-trophy" strokeWidth={1} />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Shape</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.shapesContainer}>
          {shapes.map((shape) => (
            <TouchableOpacity
              key={shape.type}
              style={styles.shapeButton}
              onPress={() => onShapeSelect(shape.type)}
            >
              <View style={styles.iconContainer}>
                {shape.icon}
              </View>
              <Text style={styles.shapeLabel}>{shape.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  scrollView: {
    flexGrow: 0,
  },
  shapesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  shapeButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    minWidth: 70,
  },
  iconContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  shapeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default ShapeSelector;
