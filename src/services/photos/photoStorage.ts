import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

/**
 * Initialize photos directory
 */
export async function initializePhotoStorage(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

/**
 * Save photo to permanent storage
 * @param sourceUri - Temporary URI from image picker/camera
 * @returns Permanent file path
 */
export async function savePhoto(sourceUri: string): Promise<string> {
  await initializePhotoStorage();

  const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const destPath = `${PHOTOS_DIR}${filename}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destPath,
  });

  return destPath;
}

/**
 * Delete photo from storage
 * @param photoPath - Full path to photo
 */
export async function deletePhoto(photoPath: string | null): Promise<void> {
  if (!photoPath) return;

  try {
    const fileInfo = await FileSystem.getInfoAsync(photoPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(photoPath, { idempotent: true });
    }
  } catch (error) {
    console.warn('Failed to delete photo:', error);
  }
}

/**
 * Check if photo exists
 * @param photoPath - Full path to photo
 */
export async function photoExists(photoPath: string | null): Promise<boolean> {
  if (!photoPath) return false;

  try {
    const fileInfo = await FileSystem.getInfoAsync(photoPath);
    return fileInfo.exists;
  } catch {
    return false;
  }
}

/**
 * Get all photos in storage
 */
export async function getAllPhotos(): Promise<string[]> {
  await initializePhotoStorage();

  try {
    const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
    return files.map(file => `${PHOTOS_DIR}${file}`);
  } catch {
    return [];
  }
}

/**
 * Clean up orphaned photos (photos not in database)
 * @param usedPhotoPaths - Array of photo paths currently in use
 */
export async function cleanupOrphanedPhotos(usedPhotoPaths: string[]): Promise<number> {
  const allPhotos = await getAllPhotos();
  const usedSet = new Set(usedPhotoPaths);

  let deletedCount = 0;
  for (const photoPath of allPhotos) {
    if (!usedSet.has(photoPath)) {
      await deletePhoto(photoPath);
      deletedCount++;
    }
  }

  return deletedCount;
}
