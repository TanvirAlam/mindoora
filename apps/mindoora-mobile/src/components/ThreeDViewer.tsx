import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

interface TrophyConfig {
  cupHeight: number;
  cupWidth: number;
  baseHeight: number;
  baseWidth: number;
  handleSize: number;
  color: string;
  material: 'gold' | 'silver' | 'bronze' | 'crystal';
  engraving: string;
}

const ThreeDViewer: React.FC = () => {
  const [trophyConfig, setTrophyConfig] = useState<TrophyConfig>({
    cupHeight: 120,
    cupWidth: 100,
    baseHeight: 40,
    baseWidth: 140,
    handleSize: 20,
    color: '#FFD700',
    material: 'gold',
    engraving: 'CHAMPION'
  });

  const [selectedTab, setSelectedTab] = useState<'design' | 'material' | 'text'>('design');

  const materialColors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    crystal: '#E6F3FF'
  };

  const materialGradients = {
    gold: ['#FFD700', '#FFA500', '#FF8C00'],
    silver: ['#E5E5E5', '#C0C0C0', '#A9A9A9'],
    bronze: ['#CD853F', '#CD7F32', '#B8860B'],
    crystal: ['#F0F8FF', '#E6F3FF', '#B0E0E6']
  };

  const updateConfig = (key: keyof TrophyConfig, value: any) => {
    setTrophyConfig(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'material' ? { color: materialColors[value as keyof typeof materialColors] } : {})
    }));
  };

  const renderTrophy = () => {
    const gradient = materialGradients[trophyConfig.material];
    
    return (
      <View style={styles.trophyContainer}>
        {/* Trophy Handles */}
        <View style={[
          styles.handle,
          styles.leftHandle,
          {
            width: trophyConfig.handleSize,
            height: trophyConfig.handleSize,
            backgroundColor: gradient[1],
            top: 50,
            left: -trophyConfig.handleSize / 2
          }
        ]} />
        <View style={[
          styles.handle,
          styles.rightHandle,
          {
            width: trophyConfig.handleSize,
            height: trophyConfig.handleSize,
            backgroundColor: gradient[1],
            top: 50,
            right: -trophyConfig.handleSize / 2
          }
        ]} />
        
        {/* Trophy Cup */}
        <View style={[
          styles.trophyCup,
          {
            width: trophyConfig.cupWidth,
            height: trophyConfig.cupHeight,
            backgroundColor: gradient[0],
            borderColor: gradient[2],
          }
        ]}>
          {trophyConfig.engraving && (
            <Text style={[
              styles.engraving,
              { color: trophyConfig.material === 'crystal' ? '#000' : '#FFF' }
            ]}>
              {trophyConfig.engraving}
            </Text>
          )}
        </View>
        
        {/* Trophy Base */}
        <View style={[
          styles.trophyBase,
          {
            width: trophyConfig.baseWidth,
            height: trophyConfig.baseHeight,
            backgroundColor: gradient[1],
            borderColor: gradient[2],
          }
        ]} />
      </View>
    );
  };

  const renderControls = () => {
    switch (selectedTab) {
      case 'design':
        return (
          <View style={styles.controlsContent}>
            <Text style={styles.controlLabel}>Cup Height: {trophyConfig.cupHeight}px</Text>
            <Slider
              style={styles.slider}
              minimumValue={80}
              maximumValue={200}
              value={trophyConfig.cupHeight}
              onValueChange={(value) => updateConfig('cupHeight', Math.round(value))}
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#DDD"
              thumbStyle={{ backgroundColor: '#FFD700' }}
            />
            
            <Text style={styles.controlLabel}>Cup Width: {trophyConfig.cupWidth}px</Text>
            <Slider
              style={styles.slider}
              minimumValue={60}
              maximumValue={150}
              value={trophyConfig.cupWidth}
              onValueChange={(value) => updateConfig('cupWidth', Math.round(value))}
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#DDD"
            />
            
            <Text style={styles.controlLabel}>Base Width: {trophyConfig.baseWidth}px</Text>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={200}
              value={trophyConfig.baseWidth}
              onValueChange={(value) => updateConfig('baseWidth', Math.round(value))}
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#DDD"
            />
            
            <Text style={styles.controlLabel}>Handle Size: {trophyConfig.handleSize}px</Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={40}
              value={trophyConfig.handleSize}
              onValueChange={(value) => updateConfig('handleSize', Math.round(value))}
              minimumTrackTintColor="#FFD700"
              maximumTrackTintColor="#DDD"
            />
          </View>
        );
      
      case 'material':
        return (
          <View style={styles.controlsContent}>
            <Text style={styles.controlLabel}>Trophy Material</Text>
            <View style={styles.materialButtons}>
              {Object.entries(materialColors).map(([material, color]) => (
                <TouchableOpacity
                  key={material}
                  style={[
                    styles.materialButton,
                    { backgroundColor: color },
                    trophyConfig.material === material && styles.selectedMaterial
                  ]}
                  onPress={() => updateConfig('material', material)}
                >
                  <Text style={[
                    styles.materialButtonText,
                    { color: material === 'crystal' ? '#000' : '#FFF' }
                  ]}>
                    {material.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'text':
        return (
          <View style={styles.controlsContent}>
            <Text style={styles.controlLabel}>Trophy Engraving</Text>
            <View style={styles.engravingOptions}>
              {['CHAMPION', 'WINNER', '1ST PLACE', 'VICTORY', 'EXCELLENCE', 'CUSTOM'].map((text) => (
                <TouchableOpacity
                  key={text}
                  style={[
                    styles.engravingButton,
                    trophyConfig.engraving === text && styles.selectedEngraving
                  ]}
                  onPress={() => updateConfig('engraving', text)}
                >
                  <Text style={styles.engravingButtonText}>{text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Trophy Display */}
      <View style={styles.trophyDisplay}>
        {renderTrophy()}
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[{ key: 'design', label: 'Design' }, { key: 'material', label: 'Material' }, { key: 'text', label: 'Text' }].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        {renderControls()}
      </View>
    </ScrollView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  trophyDisplay: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trophyContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  trophyCup: {
    borderRadius: 15,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  trophyBase: {
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  handle: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#000',
  },
  leftHandle: {
    transform: [{ rotate: '45deg' }],
  },
  rightHandle: {
    transform: [{ rotate: '-45deg' }],
  },
  engraving: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
  },
  controlsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsContent: {
    gap: 20,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  materialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  materialButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMaterial: {
    borderColor: '#000',
    borderWidth: 3,
  },
  materialButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  engravingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  engravingButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedEngraving: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  engravingButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

export default ThreeDViewer;

