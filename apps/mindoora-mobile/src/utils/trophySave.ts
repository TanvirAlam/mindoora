import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface SaveTrophyOptions {
  viewRef: React.RefObject<any>;
  userId: string;
  trophyName?: string;
  trophyTitle?: string;
  description?: string;
}

export const saveTrophyAsImage = async ({
  viewRef,
  userId,
  trophyName = 'trophy',
  trophyTitle = 'My Trophy',
  description = '',
}: SaveTrophyOptions): Promise<string | null> => {
  try {
    if (!viewRef.current) {
      throw new Error('View reference is not available');
    }

    // Capture the view as tmpfile (better for copying to project)
    const tempUri = await captureRef(viewRef.current, {
      format: 'png',
      quality: 1.0,
      result: 'tmpfile',
    });

    const timestamp = Date.now();
    const fileName = `${trophyName}_${userId}_${timestamp}.png`;
    const metadataFileName = `${trophyName}_${userId}_${timestamp}.json`;

    // Define the project assets directory path (relative to project root)
    const projectAssetsDir = './assets/users/trophies/';
    const projectImagePath = `${projectAssetsDir}${fileName}`;
    const projectMetadataPath = `${projectAssetsDir}${metadataFileName}`;

    // Create metadata object
    const metadata = {
      id: `trophy_${timestamp}`,
      userId,
      title: trophyTitle,
      description,
      imagePath: projectImagePath,
      createdAt: new Date().toISOString(),
      fileName,
    };

    // Copy the temporary file to our project assets directory
    const finalImagePath = FileSystem.documentDirectory + `../../../assets/users/trophies/${fileName}`;
    const finalMetadataPath = FileSystem.documentDirectory + `../../../assets/users/trophies/${metadataFileName}`;
    
    try {
      // Create directory structure if it doesn't exist
      const assetsDir = FileSystem.documentDirectory + '../../../assets/users/trophies/';
      const dirInfo = await FileSystem.getInfoAsync(assetsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(assetsDir, { intermediates: true });
      }

      // Copy the image file to project directory
      await FileSystem.copyAsync({
        from: tempUri,
        to: finalImagePath,
      });

      // Save metadata to project directory
      await FileSystem.writeAsStringAsync(finalMetadataPath, JSON.stringify(metadata, null, 2));

      console.log(`✅ Trophy saved to project directory: ${finalImagePath}`);
      console.log(`✅ Trophy metadata saved to project directory: ${finalMetadataPath}`);
      console.log(`📁 Saved in: ./assets/users/trophies/`);
      
      return finalImagePath;
    } catch (projectError) {
      console.warn('Failed to save to project directory, falling back to app directory:', projectError);
      
      // Fallback: save to app documents directory
      const fallbackDir = `${FileSystem.documentDirectory}assets/users/trophies/`;
      const fallbackImagePath = `${fallbackDir}${fileName}`;
      const fallbackMetadataPath = `${fallbackDir}${metadataFileName}`;
      
      const dirInfo = await FileSystem.getInfoAsync(fallbackDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(fallbackDir, { intermediates: true });
      }
      
      await FileSystem.copyAsync({
        from: tempUri,
        to: fallbackImagePath,
      });
      
      await FileSystem.writeAsStringAsync(fallbackMetadataPath, JSON.stringify(metadata, null, 2));
      
      console.log(`Trophy saved to app directory: ${fallbackImagePath}`);
      console.log(`Trophy metadata saved to app directory: ${fallbackMetadataPath}`);
      
      return fallbackImagePath;
    }
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
