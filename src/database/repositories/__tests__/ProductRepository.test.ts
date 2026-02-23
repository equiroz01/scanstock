import { ProductRepository } from '../ProductRepository';
import { getDatabase } from '@/database/database';
import { deletePhoto } from '@/services/photos/photoStorage';
import type { Product } from '@/types/product';

// Mock dependencies
jest.mock('@/database/database');
jest.mock('@/services/photos/photoStorage');

describe('ProductRepository', () => {
  let mockDb: any;
  let mockProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock database
    mockDb = {
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    // Sample product data
    mockProduct = {
      name: 'Test Product',
      barcode: '1234567890',
      price: 9.99,
      stock: 10,
      photoPath: null,
    };

    // We'll configure getFirstAsync per-test when needed
  });

  describe('create', () => {
    it('should add a new product successfully', async () => {
      // Mock getFirstAsync to return created product
      mockDb.getFirstAsync.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM products WHERE id = ?')) {
          return Promise.resolve({
            id: params[0],
            name: mockProduct.name,
            barcode: mockProduct.barcode,
            price: mockProduct.price,
            stock: mockProduct.stock,
            photo_path: mockProduct.photoPath,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          });
        }
        return Promise.resolve(null);
      });

      const product = await ProductRepository.create(mockProduct);

      expect(product).toMatchObject({
        name: mockProduct.name,
        barcode: mockProduct.barcode,
        price: mockProduct.price,
        stock: mockProduct.stock,
        photoPath: mockProduct.photoPath,
      });
      expect(product.id).toBeDefined();
      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.any(Array)
      );
    });

    it('should add product with photo path', async () => {
      const productWithPhoto = {
        ...mockProduct,
        photoPath: 'file:///photos/test.jpg',
      };

      // Mock getFirstAsync to return product with photo
      mockDb.getFirstAsync.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM products WHERE id = ?')) {
          return Promise.resolve({
            id: params[0],
            name: productWithPhoto.name,
            barcode: productWithPhoto.barcode,
            price: productWithPhoto.price,
            stock: productWithPhoto.stock,
            photo_path: productWithPhoto.photoPath,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          });
        }
        return Promise.resolve(null);
      });

      const product = await ProductRepository.create(productWithPhoto);

      expect(product.photoPath).toBe(productWithPhoto.photoPath);
    });

    it('should handle null barcode', async () => {
      const productWithoutBarcode = {
        ...mockProduct,
        barcode: null,
      };

      // Mock getFirstAsync to return product without barcode
      mockDb.getFirstAsync.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM products WHERE id = ?')) {
          return Promise.resolve({
            id: params[0],
            name: productWithoutBarcode.name,
            barcode: null,
            price: productWithoutBarcode.price,
            stock: productWithoutBarcode.stock,
            photo_path: productWithoutBarcode.photoPath,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          });
        }
        return Promise.resolve(null);
      });

      const product = await ProductRepository.create(productWithoutBarcode);

      expect(product.barcode).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return product when found', async () => {
      const mockDbProduct = {
        id: '123',
        name: 'Test Product',
        barcode: '1234567890',
        price: 9.99,
        stock: 10,
        photo_path: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };
      mockDb.getFirstAsync.mockResolvedValueOnce(mockDbProduct);

      const product = await ProductRepository.getById('123');

      expect(product).toMatchObject({
        id: '123',
        name: 'Test Product',
        barcode: '1234567890',
        price: 9.99,
        stock: 10,
        photoPath: null,
      });
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE id = ?',
        ['123']
      );
    });

    it('should return null when product not found', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const product = await ProductRepository.getById('nonexistent');

      expect(product).toBeNull();
    });

    it('should map photo_path to photoPath', async () => {
      const mockDbProduct = {
        id: '123',
        name: 'Test Product',
        barcode: '1234567890',
        price: 9.99,
        stock: 10,
        photo_path: 'file:///photos/test.jpg',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };
      mockDb.getFirstAsync.mockResolvedValueOnce(mockDbProduct);

      const product = await ProductRepository.getById('123');

      expect(product?.photoPath).toBe('file:///photos/test.jpg');
    });
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockDbProducts = [
        {
          id: '1',
          name: 'Product 1',
          barcode: '111',
          price: 10,
          stock: 5,
          photo_path: null,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Product 2',
          barcode: '222',
          price: 20,
          stock: 15,
          photo_path: null,
          created_at: '2024-01-02T00:00:00.000Z',
          updated_at: '2024-01-02T00:00:00.000Z',
        },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(mockDbProducts);

      const products = await ProductRepository.getAll();

      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Product 1');
      expect(products[1].name).toBe('Product 2');
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM products ORDER BY updated_at DESC'
      );
    });

    it('should return empty array when no products', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const products = await ProductRepository.getAll();

      expect(products).toEqual([]);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      // Mock getFirstAsync to return updated product
      mockDb.getFirstAsync.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM products WHERE id = ?')) {
          return Promise.resolve({
            id: params[0],
            name: 'Updated Product',
            barcode: '1234567890',
            price: 19.99,
            stock: 20,
            photo_path: null,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          });
        }
        return Promise.resolve(null);
      });
    });

    it('should update product successfully', async () => {
      const updates = {
        name: 'Updated Product',
        price: 19.99,
        stock: 20,
      };

      await ProductRepository.update('123', updates);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products'),
        expect.arrayContaining(['Updated Product', 19.99, 20])
      );
    });

    it('should only update provided fields', async () => {
      const updates = {
        stock: 5,
      };

      await ProductRepository.update('123', updates);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('stock = ?'),
        expect.arrayContaining([5])
      );
    });

    it('should update photoPath', async () => {
      const updates = {
        photoPath: 'file:///new-photo.jpg',
      };

      await ProductRepository.update('123', updates);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('photo_path = ?'),
        expect.arrayContaining(['file:///new-photo.jpg'])
      );
    });
  });

  describe('delete', () => {
    it('should delete product without photo', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: '123',
        name: 'Test',
        barcode: null,
        price: 10,
        stock: 5,
        photo_path: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await ProductRepository.delete('123');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id = ?',
        ['123']
      );
      expect(deletePhoto).not.toHaveBeenCalled();
    });

    it('should delete product with photo and clean up photo file', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: '123',
        name: 'Test',
        barcode: null,
        price: 10,
        stock: 5,
        photo_path: 'file:///photo.jpg',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await ProductRepository.delete('123');

      expect(deletePhoto).toHaveBeenCalledWith('file:///photo.jpg');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id = ?',
        ['123']
      );
    });
  });

  describe('getByBarcode', () => {
    it('should find product by barcode', async () => {
      const mockDbProduct = {
        id: '123',
        name: 'Test Product',
        barcode: '1234567890',
        price: 9.99,
        stock: 10,
        photo_path: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };
      mockDb.getFirstAsync.mockResolvedValueOnce(mockDbProduct);

      const product = await ProductRepository.getByBarcode('1234567890');

      expect(product).toMatchObject({
        barcode: '1234567890',
        name: 'Test Product',
      });
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE barcode = ?',
        ['1234567890']
      );
    });

    it('should return null when barcode not found', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const product = await ProductRepository.getByBarcode('nonexistent');

      expect(product).toBeNull();
    });
  });

  describe('search', () => {
    it('should search products by name', async () => {
      const mockResults = [
        {
          id: '1',
          name: 'Apple',
          barcode: '111',
          price: 5,
          stock: 10,
          photo_path: null,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Pineapple',
          barcode: '222',
          price: 8,
          stock: 5,
          photo_path: null,
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(mockResults);

      const products = await ProductRepository.search('apple');

      expect(products).toHaveLength(2);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE name LIKE ? OR barcode LIKE ?'),
        ['%apple%', '%apple%']
      );
    });

    it('should return empty array when no matches', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const products = await ProductRepository.search('nonexistent');

      expect(products).toEqual([]);
    });
  });

  describe('updateStock', () => {
    beforeEach(() => {
      // Mock getFirstAsync to return product after stock update
      mockDb.getFirstAsync.mockImplementation((sql: string, params: any[]) => {
        if (sql.includes('SELECT * FROM products WHERE id = ?')) {
          return Promise.resolve({
            id: params[0],
            name: 'Test Product',
            barcode: '1234567890',
            price: 9.99,
            stock: 15,
            photo_path: null,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          });
        }
        return Promise.resolve(null);
      });
    });

    it('should update stock quantity by delta', async () => {
      const result = await ProductRepository.updateStock('123', 5);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE products SET stock = MAX(0, stock + ?), updated_at = ? WHERE id = ?',
        [5, expect.any(String), '123']
      );
      expect(result).toBeDefined();
    });

    it('should handle negative delta', async () => {
      const result = await ProductRepository.updateStock('123', -3);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'UPDATE products SET stock = MAX(0, stock + ?), updated_at = ? WHERE id = ?',
        [-3, expect.any(String), '123']
      );
      expect(result).toBeDefined();
    });
  });
});
