import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ProductRepository } from '@/database/repositories/ProductRepository';
import { getDatabase, closeDatabase } from '@/database/database';
import { DATABASE_NAME } from '@/database/schema';

interface BackupManifest {
  version: string;
  appVersion: string;
  createdAt: string;
  productCount: number;
}

export async function exportBackup(): Promise<void> {
  const backupDir = `${FileSystem.cacheDirectory}backup/`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `scanstock-backup-${timestamp}.json`;
  const backupPath = `${backupDir}${backupFileName}`;

  // Ensure backup directory exists
  await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });

  // Get all products
  const products = await ProductRepository.getAll();

  // Create manifest
  const manifest: BackupManifest = {
    version: '1.0',
    appVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    productCount: products.length,
  };

  // Create backup data
  const backupData = {
    manifest,
    products,
  };

  // Write backup file
  await FileSystem.writeAsStringAsync(
    backupPath,
    JSON.stringify(backupData, null, 2)
  );

  // Share the file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(backupPath, {
      mimeType: 'application/json',
      dialogTitle: 'Save ScanStock Backup',
      UTI: 'public.json',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }

  // Clean up
  await FileSystem.deleteAsync(backupDir, { idempotent: true });
}

export async function importBackup(): Promise<void> {
  // Pick a file
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    throw new Error('No file selected');
  }

  const fileUri = result.assets[0].uri;

  // Read and parse the file
  const content = await FileSystem.readAsStringAsync(fileUri);
  const backupData = JSON.parse(content);

  // Validate backup structure
  if (!backupData.manifest || !backupData.products) {
    throw new Error('Invalid backup file format');
  }

  if (backupData.manifest.version !== '1.0') {
    throw new Error('Unsupported backup version');
  }

  // Close current database connection
  await closeDatabase();

  // Delete existing database
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
  await FileSystem.deleteAsync(dbPath, { idempotent: true });

  // Get fresh database connection (will reinitialize)
  const db = await getDatabase();

  // Import products
  for (const product of backupData.products) {
    await db.runAsync(
      `INSERT INTO products (id, name, barcode, price, stock, photo_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.barcode,
        product.price,
        product.stock,
        product.photoPath,
        product.createdAt,
        product.updatedAt,
      ]
    );
  }

  // Clean up cache
  await FileSystem.deleteAsync(fileUri, { idempotent: true });
}
