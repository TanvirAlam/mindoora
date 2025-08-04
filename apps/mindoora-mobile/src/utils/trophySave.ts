import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface SaveTrophyOptions {
  viewRef: React.RefObject<any>;
  userId: string;
  trophyName?: string;
}

export const saveTrophyAsImage = async ({
  viewRef,
  userId,
  trophyName = 'trophy',
}: SaveTrophyOptions): Promise<string | null> => {
  try {
    if (!viewRef.current) {
      throw new Error('View reference is not available');
    }

    // Capture the view as base64 image
    const uri = await captureRef(viewRef.current, {
      format: 'png',
      quality: 1.0,
      result: 'base64',
    });

    // Create the file path
    const assetsDir = `${FileSystem.documentDirectory}assets/users/`;
    const fileName = `trophy_${userId}.png`;
    const filePath = `${assetsDir}${fileName}`;

    // Ensure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(assetsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(assetsDir, { intermediates: true });
    }

    // Convert base64 to file and save
    await FileSystem.writeAsStringAsync(filePath, uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log(`Trophy saved successfully at: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error saving trophy:', error);
    Alert.alert(
      'Save Error',
      'Failed to save trophy. Please try again.',
      [{ text: 'OK' }]
    );
    return null;
  }
};

export const getTrophyImagePath = (userId: string): string => {
  const assetsDir = `${FileSystem.documentDirectory}assets/users/`;
  return `${assetsDir}trophy_${userId}.png`;
};

export const deleteTrophyImage = async (userId: string): Promise<boolean> => {
  try {
    const filePath = getTrophyImagePath(userId);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      console.log(`Trophy image deleted: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting trophy image:', error);
    return false;
  }
};

export const checkTrophyImageExists = async (userId: string): Promise<boolean> => {
  try {
    const filePath = getTrophyImagePath(userId);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking trophy image:', error);
    return false;
  }
};
