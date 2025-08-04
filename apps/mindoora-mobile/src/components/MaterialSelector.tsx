import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TROPHY_MATERIALS, TrophyMaterial } from '../types/trophy';
import Colors from '../constants/colors';

interface MaterialSelectorProps {
  selectedMaterial: string;
  onMaterialSelect: (materialKey: string) => void;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialSelect,
}) => {
  const renderMaterialSwatch = (key: string, material: TrophyMaterial) => {
    const isSelected = selectedMaterial === key;
    const gradientId = `material-gradient-${key}`;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.materialSwatch,
          isSelected && styles.selectedSwatch,
        ]}
        onPress={() => onMaterialSelect(key)}
      >
        <View style={styles.swatchContainer}>
          <Svg width={60} height={40} style={styles.swatchSvg}>
            <Defs>
              {material.gradient && (
                <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  {material.gradient.colors.map((color, index) => (
                    <Stop
                      key={index}
                      offset={`${material.gradient!.locations[index] * 100}%`}
                      stopColor={color}
                    />
                  ))}
                </LinearGradient>
              )}
            </Defs>
            <Rect
              x={2}
              y={2}
              width={56}
              height={36}
              fill={material.gradient ? `url(#${gradientId})` : material.color}
              stroke={isSelected ? Colors.primary : Colors.gray[300]}
              strokeWidth={isSelected ? 3 : 1}
              rx={4}
            />
          </Svg>
        </View>
        <Text style={[
          styles.materialLabel,
          isSelected && styles.selectedLabel,
        ]}>
          {key.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trophy Material</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.materialsContainer}>
          {Object.entries(TROPHY_MATERIALS).map(([key, material]) =>
            renderMaterialSwatch(key, material)
          )}
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
  materialsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  materialSwatch: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  selectedSwatch: {
    backgroundColor: Colors.primaryLight,
  },
  swatchContainer: {
    marginBottom: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  swatchSvg: {
    borderRadius: 6,
  },
  materialLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default MaterialSelector;
