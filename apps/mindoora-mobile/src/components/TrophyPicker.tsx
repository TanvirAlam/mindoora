import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Trophy, trophies, getTrophyById } from '../utils/trophies';

interface TrophyPickerProps {
  selectedTrophyId?: string;
  onTrophySelect: (trophyId: string) => void;
  placeholder?: string;
  title?: string;
}

const { width } = Dimensions.get('window');

const TrophyPicker: React.FC<TrophyPickerProps> = ({
  selectedTrophyId,
  onTrophySelect,
  placeholder = 'Select Trophy',
  title = 'Choose Trophy'
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedTrophy = selectedTrophyId ? getTrophyById(selectedTrophyId) : null;

  const handleTrophySelect = (trophy: Trophy) => {
    onTrophySelect(trophy.id);
    setIsModalVisible(false);
  };

  const renderTrophyItem = ({ item }: { item: Trophy }) => (
    <TouchableOpacity
      style={styles.trophyItem}
      onPress={() => handleTrophySelect(item)}
    >
      <Image source={item.image} style={styles.trophyImage} />
      <View style={styles.trophyInfo}>
        <Text style={styles.trophyName}>{item.name}</Text>
        {item.category && (
          <Text style={styles.trophyCategory}>{item.category}</Text>
        )}
      </View>
      {selectedTrophyId === item.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.dropdownContent}>
          {selectedTrophy ? (
            <>
              <Image source={selectedTrophy.image} style={styles.selectedTrophyImage} />
              <Text style={styles.selectedTrophyName}>{selectedTrophy.name}</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <FlatList
            data={trophies}
            keyExtractor={(item) => item.id}
            renderItem={renderTrophyItem}
            numColumns={2}
            contentContainerStyle={styles.trophyList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedTrophyImage: {
    width: 32,
    height: 32,
    marginRight: 8,
    resizeMode: 'contain',
  },
  selectedTrophyName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 60, // Same width as cancel button to center title
  },
  trophyList: {
    padding: 16,
  },
  trophyItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 120,
    position: 'relative',
  },
  trophyImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  trophyInfo: {
    alignItems: 'center',
    flex: 1,
  },
  trophyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  trophyCategory: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TrophyPicker;
