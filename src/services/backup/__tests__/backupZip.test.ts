import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';
import { createBackupZip, restoreBackupZip, getBackupInfo } from '../backupZip';
import { ProductRepository } from '@/database/repositories/ProductRepository';
import { getAllPhotos } from '@/services/photos/photoStorage';
import { getDatabase, closeDatabase } from '@/database/database';

// Mock dependencies
jest.mock('expo-file-system/legacy');
jest.mock('expo-sharing');
jest.mock('expo-document-picker');
jest.mock('jszip');
jest.mock('@/database/repositories/ProductRepository');
jest.mock('@/services/photos/photoStorage');
jest.mock('@/database/database');
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      version: '1.0.0',
    },
  },
}));
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: '17.0',
  select: jest.fn((options: Record<string, unknown>) => options.ios ?? options.default),
}));

describe('backupZip', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      barcode: '111',
      price: 10,
      stock: 5,
      photoPath: 'file:///photos/photo1.jpg',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Product 2',
      barcode: '222',
      price: 20,
      stock: 10,
      photoPath: null,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.cacheDirectory as any) = 'file:///cache/';
    (FileSystem.documentDirectory as any) = 'file:///documents/';
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  });

  describe('createBackupZip', () => {
    let mockZip: any;
    let mockPhotosFolder: any;

    beforeEach(() => {
      mockPhotosFolder = {
        file: jest.fn(),
      };

      mockZip = {
        file: jest.fn(),
        folder: jest.fn().mockReturnValue(mockPhotosFolder),
        generateAsync: jest.fn().mockResolvedValue('base64ZipData'),
      };

      (JSZip as unknown as jest.Mock).mockImplementation(() => mockZip);
      (ProductRepository.getAll as jest.Mock).mockResolvedValue(mockProducts);
      (getAllPhotos as jest.Mock).mockResolvedValue([
        'file:///photos/photo1.jpg',
      ]);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1024,
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        'base64PhotoData'
      );
    });

    it('should create backup with products and photos', async () => {
      await createBackupZip();

      // Verify products.json was added
      expect(mockZip.file).toHaveBeenCalledWith(
        'products.json',
        expect.stringContaining('Product 1')
      );

      // Verify photos folder was created
      expect(mockZip.folder).toHaveBeenCalledWith('photos');

      // Verify photo was added to zip
      expect(mockPhotosFolder.file).toHaveBeenCalledWith(
        'photo1.jpg',
        'base64PhotoData',
        { base64: true }
      );

      // Verify manifest was added
      expect(mockZip.file).toHaveBeenCalledWith(
        'manifest.json',
        expect.stringContaining('"version": "1.0"')
      );
    });

    it('should generate ZIP file', async () => {
      await createBackupZip();

      expect(mockZip.generateAsync).toHaveBeenCalledWith({
        type: 'base64',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
    });

    it('should save ZIP to cache directory', async () => {
      await createBackupZip();

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('scanstock-backup-'),
        'base64ZipData',
        { encoding: FileSystem.EncodingType.Base64 }
      );
    });

    it('should share the ZIP file', async () => {
      await createBackupZip();

      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('scanstock-backup-'),
        expect.objectContaining({
          mimeType: 'application/zip',
        })
      );
    });

    it('should cleanup temporary file after sharing', async () => {
      await createBackupZip();

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('scanstock-backup-'),
        { idempotent: true }
      );
    });

    it('should include correct metadata in manifest', async () => {
      await createBackupZip();

      const manifestCall = mockZip.file.mock.calls.find(
        (call: any) => call[0] === 'manifest.json'
      );
      const manifest = JSON.parse(manifestCall[1]);

      expect(manifest).toMatchObject({
        version: '1.0',
        appVersion: '1.0.0',
        productCount: 2,
        photoCount: 1,
      });
      expect(manifest.createdAt).toBeDefined();
      expect(manifest.deviceInfo).toBeDefined();
    });

    it('should handle products without photos', async () => {
      const productsWithoutPhotos = [
        {
          id: '1',
          name: 'Product 1',
          barcode: '111',
          price: 10,
          stock: 5,
          photoPath: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      (ProductRepository.getAll as jest.Mock).mockResolvedValue(
        productsWithoutPhotos
      );
      (getAllPhotos as jest.Mock).mockResolvedValue([]);

      await createBackupZip();

      // Should still create backup
      expect(mockZip.generateAsync).toHaveBeenCalled();
      expect(mockPhotosFolder.file).not.toHaveBeenCalled();
    });

    it('should throw error if sharing is not available', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      await expect(createBackupZip()).rejects.toThrow(
        'Sharing is not available on this device'
      );
    });
  });

  describe('restoreBackupZip', () => {
    let mockZip: any;

    beforeEach(() => {
      const mockProductsFile = {
        async: jest.fn().mockResolvedValue(JSON.stringify(mockProducts)),
      };

      const mockManifestFile = {
        async: jest.fn().mockResolvedValue(
          JSON.stringify({
            version: '1.0',
            appVersion: '1.0.0',
            createdAt: '2024-01-01',
            productCount: 2,
            photoCount: 1,
          })
        ),
      };

      const mockPhotoFile = {
        async: jest.fn().mockResolvedValue('base64PhotoData'),
        dir: false,
      };

      const mockPhotosFolder = {
        forEach: jest.fn((callback: (relativePath: string, file: any) => void) => {
          callback('photo1.jpg', mockPhotoFile);
        }),
      };

      mockZip = {
        file: jest.fn((name: string) => {
          if (name === 'products.json') return mockProductsFile;
          if (name === 'manifest.json') return mockManifestFile;
          if (name.startsWith('photos/')) return mockPhotoFile;
          return null;
        }),
        folder: jest.fn((name: string) => {
          if (name === 'photos') return mockPhotosFolder;
          return null;
        }),
        files: {
          'products.json': mockProductsFile,
          'manifest.json': mockManifestFile,
          'photos/photo1.jpg': mockPhotoFile,
        },
      };

      (JSZip.loadAsync as jest.Mock).mockResolvedValue(mockZip);
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///picked/backup.zip' }],
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        'zipBase64Data'
      );

      const mockDb = {
        runAsync: jest.fn().mockResolvedValue({}),
      };
      (getDatabase as jest.Mock).mockResolvedValue(mockDb);
      (closeDatabase as jest.Mock).mockResolvedValue(undefined);
    });

    it('should prompt user to pick ZIP file', async () => {
      await restoreBackupZip();

      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });
    });

    it('should throw error if no file selected', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      await expect(restoreBackupZip()).rejects.toThrow('No file selected');
    });

    it('should validate manifest exists', async () => {
      mockZip.file = jest.fn().mockReturnValue(null);

      await expect(restoreBackupZip()).rejects.toThrow(
        'Invalid backup: manifest.json not found'
      );
    });

    it('should validate backup version', async () => {
      const mockManifestFile = {
        async: jest.fn().mockResolvedValue(
          JSON.stringify({ version: '2.0' })
        ),
      };
      mockZip.file = jest.fn((name: string) =>
        name === 'manifest.json' ? mockManifestFile : null
      );

      await expect(restoreBackupZip()).rejects.toThrow(
        'Unsupported backup version: 2.0'
      );
    });

    it('should close and delete existing database', async () => {
      await restoreBackupZip();

      expect(closeDatabase).toHaveBeenCalled();
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('SQLite'),
        { idempotent: true }
      );
    });

    it('should delete existing photos directory', async () => {
      await restoreBackupZip();

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('photos/'),
        { idempotent: true }
      );
    });

    it('should restore photos from ZIP', async () => {
      await restoreBackupZip();

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('photos/photo1.jpg'),
        'base64PhotoData',
        { encoding: FileSystem.EncodingType.Base64 }
      );
    });

    it('should restore products to database', async () => {
      const mockDb = {
        runAsync: jest.fn().mockResolvedValue({}),
      };
      (getDatabase as jest.Mock).mockResolvedValue(mockDb);

      await restoreBackupZip();

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining(['1', 'Product 1'])
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining(['2', 'Product 2'])
      );
    });

    it('should return manifest after successful restore', async () => {
      const manifest = await restoreBackupZip();

      expect(manifest).toMatchObject({
        version: '1.0',
        productCount: 2,
        photoCount: 1,
      });
    });

    it('should cleanup temporary file', async () => {
      await restoreBackupZip();

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        'file:///picked/backup.zip',
        { idempotent: true }
      );
    });
  });

  describe('getBackupInfo', () => {
    let mockZip: any;

    beforeEach(() => {
      const mockManifestFile = {
        async: jest.fn().mockResolvedValue(
          JSON.stringify({
            version: '1.0',
            appVersion: '1.0.0',
            createdAt: '2024-01-01',
            productCount: 5,
            photoCount: 3,
          })
        ),
      };

      mockZip = {
        file: jest.fn((name: string) =>
          name === 'manifest.json' ? mockManifestFile : null
        ),
      };

      (JSZip.loadAsync as jest.Mock).mockResolvedValue(mockZip);
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///picked/backup.zip' }],
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        'zipBase64Data'
      );
    });

    it('should return manifest info without restoring', async () => {
      const info = await getBackupInfo();

      expect(info).toMatchObject({
        version: '1.0',
        productCount: 5,
        photoCount: 3,
      });
      expect(closeDatabase).not.toHaveBeenCalled();
      expect(getDatabase).not.toHaveBeenCalled();
    });

    it('should return null if no file selected', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const info = await getBackupInfo();

      expect(info).toBeNull();
    });

    it('should return null if manifest not found', async () => {
      mockZip.file = jest.fn().mockReturnValue(null);

      const info = await getBackupInfo();

      expect(info).toBeNull();
    });

    it('should cleanup temporary file', async () => {
      await getBackupInfo();

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        'file:///picked/backup.zip',
        { idempotent: true }
      );
    });

    it('should return null on error', async () => {
      (JSZip.loadAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid ZIP')
      );

      const info = await getBackupInfo();

      expect(info).toBeNull();
    });
  });
});
