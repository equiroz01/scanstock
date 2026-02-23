import * as FileSystem from 'expo-file-system/legacy';
import {
  initializePhotoStorage,
  savePhoto,
  deletePhoto,
  photoExists,
  getAllPhotos,
  cleanupOrphanedPhotos,
} from '../photoStorage';

// Mock expo-file-system
jest.mock('expo-file-system/legacy');

describe('photoStorage', () => {
  const mockDocumentDirectory = 'file:///mock/documents/';
  const mockPhotosDir = `${mockDocumentDirectory}photos/`;

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    (FileSystem.documentDirectory as any) = mockDocumentDirectory;
  });

  describe('initializePhotoStorage', () => {
    it('should create photos directory if it does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: false,
      });

      await initializePhotoStorage();

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        mockPhotosDir,
        { intermediates: true }
      );
    });

    it('should not create directory if it already exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
      });

      await initializePhotoStorage();

      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });
  });

  describe('savePhoto', () => {
    beforeEach(() => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
    });

    it('should save photo to permanent storage', async () => {
      const sourceUri = 'file:///temp/photo.jpg';
      const savedPath = await savePhoto(sourceUri);

      expect(savedPath).toContain(mockPhotosDir);
      expect(savedPath).toMatch(/\.jpg$/);
      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: sourceUri,
        to: expect.stringContaining(mockPhotosDir),
      });
    });

    it('should initialize storage before saving', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: false,
      });

      const sourceUri = 'file:///temp/photo.jpg';
      await savePhoto(sourceUri);

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
      expect(FileSystem.copyAsync).toHaveBeenCalled();
    });

    it('should generate unique filenames', async () => {
      const sourceUri = 'file:///temp/photo.jpg';

      const path1 = await savePhoto(sourceUri);
      const path2 = await savePhoto(sourceUri);

      expect(path1).not.toBe(path2);
    });

    it('should include timestamp in filename', async () => {
      const sourceUri = 'file:///temp/photo.jpg';
      const beforeTimestamp = Date.now();

      const savedPath = await savePhoto(sourceUri);

      const filename = savedPath.split('/').pop() || '';
      const timestamp = parseInt(filename.split('_')[0]);

      expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo if it exists', async () => {
      const photoPath = `${mockPhotosDir}test.jpg`;
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
      });

      await deletePhoto(photoPath);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(photoPath, {
        idempotent: true,
      });
    });

    it('should not delete if file does not exist', async () => {
      const photoPath = `${mockPhotosDir}nonexistent.jpg`;
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: false,
      });

      await deletePhoto(photoPath);

      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should handle null path gracefully', async () => {
      await deletePhoto(null);

      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const photoPath = `${mockPhotosDir}error.jpg`;
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValueOnce(
        new Error('File system error')
      );

      // Should not throw
      await expect(deletePhoto(photoPath)).resolves.toBeUndefined();
    });
  });

  describe('photoExists', () => {
    it('should return true if photo exists', async () => {
      const photoPath = `${mockPhotosDir}test.jpg`;
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
      });

      const exists = await photoExists(photoPath);

      expect(exists).toBe(true);
    });

    it('should return false if photo does not exist', async () => {
      const photoPath = `${mockPhotosDir}nonexistent.jpg`;
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: false,
      });

      const exists = await photoExists(photoPath);

      expect(exists).toBe(false);
    });

    it('should return false for null path', async () => {
      const exists = await photoExists(null);

      expect(exists).toBe(false);
      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      const photoPath = `${mockPhotosDir}error.jpg`;
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValueOnce(
        new Error('File system error')
      );

      const exists = await photoExists(photoPath);

      expect(exists).toBe(false);
    });
  });

  describe('getAllPhotos', () => {
    beforeEach(() => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
    });

    it('should return all photos in directory', async () => {
      const mockFiles = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce(
        mockFiles
      );

      const photos = await getAllPhotos();

      expect(photos).toHaveLength(3);
      expect(photos[0]).toBe(`${mockPhotosDir}photo1.jpg`);
      expect(photos[1]).toBe(`${mockPhotosDir}photo2.jpg`);
      expect(photos[2]).toBe(`${mockPhotosDir}photo3.jpg`);
    });

    it('should return empty array if directory is empty', async () => {
      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce([]);

      const photos = await getAllPhotos();

      expect(photos).toEqual([]);
    });

    it('should initialize storage before reading', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({ exists: true });
      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce([]);

      await getAllPhotos();

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      (FileSystem.readDirectoryAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Read error')
      );

      const photos = await getAllPhotos();

      expect(photos).toEqual([]);
    });
  });

  describe('cleanupOrphanedPhotos', () => {
    beforeEach(() => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
    });

    it('should delete photos not in used list', async () => {
      const allPhotos = [
        `${mockPhotosDir}photo1.jpg`,
        `${mockPhotosDir}photo2.jpg`,
        `${mockPhotosDir}photo3.jpg`,
      ];
      const usedPhotos = [
        `${mockPhotosDir}photo1.jpg`,
        `${mockPhotosDir}photo3.jpg`,
      ];

      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce(
        allPhotos.map(p => p.split('/').pop())
      );

      const deletedCount = await cleanupOrphanedPhotos(usedPhotos);

      expect(deletedCount).toBe(1);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        `${mockPhotosDir}photo2.jpg`,
        { idempotent: true }
      );
    });

    it('should not delete any photos if all are in use', async () => {
      const allPhotos = [
        `${mockPhotosDir}photo1.jpg`,
        `${mockPhotosDir}photo2.jpg`,
      ];

      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce(
        allPhotos.map(p => p.split('/').pop())
      );

      const deletedCount = await cleanupOrphanedPhotos(allPhotos);

      expect(deletedCount).toBe(0);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should delete all photos if none are in use', async () => {
      const allPhotos = [
        `${mockPhotosDir}photo1.jpg`,
        `${mockPhotosDir}photo2.jpg`,
      ];

      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce(
        allPhotos.map(p => p.split('/').pop())
      );

      const deletedCount = await cleanupOrphanedPhotos([]);

      expect(deletedCount).toBe(2);
      expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle empty directory', async () => {
      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValueOnce([]);

      const deletedCount = await cleanupOrphanedPhotos([]);

      expect(deletedCount).toBe(0);
    });
  });
});
