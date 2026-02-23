import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';
import { ProductRepository } from '@/database/repositories/ProductRepository';
import { getDatabase, closeDatabase } from '@/database/database';
import { DATABASE_NAME, initializeDatabase } from '@/database/schema';
import { getAllPhotos } from '@/services/photos/photoStorage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface BackupManifest {
  version: string;
  appVersion: string;
  createdAt: string;
  deviceInfo: {
    platform: string;
    osVersion: string;
  };
  productCount: number;
  photoCount: number;
  totalSize: number;
}

/**
 * Create complete backup with photos as ZIP file
 */
export async function createBackupZip(): Promise<void> {
  const zip = new JSZip();

  // Get all products
  const products = await ProductRepository.getAll();

  // Get all photos
  const allPhotos = await getAllPhotos();
  const usedPhotos = products
    .filter(p => p.photoPath)
    .map(p => p.photoPath as string);

  let totalSize = 0;

  // Add products data as JSON
  const productsJson = JSON.stringify(products, null, 2);
  zip.file('products.json', productsJson);
  totalSize += productsJson.length;

  // Add photos
  const photosFolder = zip.folder('photos');
  if (photosFolder) {
    for (const photoPath of usedPhotos) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(photoPath);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          const base64 = await FileSystem.readAsStringAsync(photoPath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const filename = photoPath.split('/').pop() || 'photo.jpg';
          photosFolder.file(filename, base64, { base64: true });
          totalSize += fileInfo.size || 0;
        }
      } catch (error) {
        console.warn('Failed to add photo to backup:', photoPath, error);
      }
    }
  }

  // Create manifest
  const manifest: BackupManifest = {
    version: '1.0',
    appVersion: Constants.expoConfig?.version || '1.0.0',
    createdAt: new Date().toISOString(),
    deviceInfo: {
      platform: Platform.OS ?? 'unknown',
      osVersion: String(Platform.Version ?? 'unknown'),
    },
    productCount: products.length,
    photoCount: usedPhotos.length,
    totalSize,
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Generate ZIP
  const zipBase64 = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Save to cache
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `scanstock-backup-${timestamp}.zip`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, zipBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Share the file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/zip',
      dialogTitle: 'Save ScanStock Backup',
      UTI: 'public.zip-archive',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }

  // Clean up
  await FileSystem.deleteAsync(filePath, { idempotent: true });
}

/**
 * Restore backup from ZIP file
 */
export async function restoreBackupZip(): Promise<BackupManifest> {
  // Pick ZIP file
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/zip',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('No file selected');
  }

  const fileUri = result.assets[0].uri;

  // Read ZIP file
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const zip = await JSZip.loadAsync(base64, { base64: true });

  // Read and validate manifest
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('Invalid backup: manifest.json not found');
  }

  const manifestContent = await manifestFile.async('string');
  const manifest: BackupManifest = JSON.parse(manifestContent);

  if (manifest.version !== '1.0') {
    throw new Error(`Unsupported backup version: ${manifest.version}`);
  }

  // Read products
  const productsFile = zip.file('products.json');
  if (!productsFile) {
    throw new Error('Invalid backup: products.json not found');
  }

  const productsContent = await productsFile.async('string');
  const products = JSON.parse(productsContent);

  // Close current database
  await closeDatabase();

  // Delete existing database
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
  await FileSystem.deleteAsync(dbPath, { idempotent: true });

  // Delete all existing photos
  const photosDir = `${FileSystem.documentDirectory}photos/`;
  await FileSystem.deleteAsync(photosDir, { idempotent: true });
  await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });

  // Get fresh database (will reinitialize)
  const db = await getDatabase();

  // Restore photos first
  const photosFolder = zip.folder('photos');
  const photoPathMapping: { [oldPath: string]: string } = {};

  if (photosFolder) {
    const photoFiles = Object.keys(zip.files).filter(name =>
      name.startsWith('photos/')
    );

    for (const photoFileName of photoFiles) {
      const file = zip.file(photoFileName);
      if (file && !file.dir) {
        const base64 = await file.async('base64');
        const filename = photoFileName.split('/').pop();
        if (filename) {
          const newPath = `${photosDir}${filename}`;
          await FileSystem.writeAsStringAsync(newPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Map old path to new path (in case paths changed)
          const oldPath = products.find((p: any) =>
            p.photoPath?.endsWith(filename)
          )?.photoPath;
          if (oldPath) {
            photoPathMapping[oldPath] = newPath;
          }
        }
      }
    }
  }

  // Restore products
  for (const product of products) {
    // Update photo path if it exists in mapping
    let photoPath = product.photoPath;
    if (photoPath && photoPathMapping[photoPath]) {
      photoPath = photoPathMapping[photoPath];
    } else if (photoPath) {
      // Update to new photos directory structure
      const filename = photoPath.split('/').pop();
      photoPath = `${photosDir}${filename}`;
    }

    await db.runAsync(
      `INSERT INTO products (id, name, barcode, price, stock, photo_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.barcode,
        product.price,
        product.stock,
        photoPath,
        product.createdAt,
        product.updatedAt,
      ]
    );
  }

  // Clean up
  await FileSystem.deleteAsync(fileUri, { idempotent: true });

  return manifest;
}

/**
 * Get backup info without restoring
 */
export async function getBackupInfo(): Promise<BackupManifest | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/zip',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const fileUri = result.assets[0].uri;

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = await JSZip.loadAsync(base64, { base64: true });

    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid backup file');
    }

    const manifestContent = await manifestFile.async('string');
    const manifest: BackupManifest = JSON.parse(manifestContent);

    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    return manifest;
  } catch (error) {
    console.error('Failed to read backup info:', error);
    return null;
  }
}
