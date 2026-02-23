import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportToCSV } from '../exportCSV';
import { ProductRepository } from '@/database/repositories/ProductRepository';

// Mock dependencies
jest.mock('expo-file-system/legacy');
jest.mock('expo-sharing');
jest.mock('@/database/repositories/ProductRepository');

describe('exportCSV', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      barcode: '111',
      price: 10.5,
      stock: 5,
      photoPath: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Product "Special"',
      barcode: null,
      price: 20.99,
      stock: 10,
      photoPath: 'file:///photo.jpg',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // cacheDirectory is mocked to 'file:///mock/cache/' in jest.setup.js
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (ProductRepository.getAll as jest.Mock).mockResolvedValue(mockProducts);
  });

  it('should export products to CSV format', async () => {
    await exportToCSV();

    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('.csv'),
      expect.stringContaining('ID,Name,Barcode,Price,Stock')
    );
  });

  it('should include all product data in CSV', async () => {
    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    expect(csvContent).toContain('Product 1');
    expect(csvContent).toContain('111');
    expect(csvContent).toContain('10.50');
    expect(csvContent).toContain('5');
  });

  it('should escape double quotes in product names', async () => {
    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    // "Product "Special"" should become "Product ""Special"""
    expect(csvContent).toContain('"Product ""Special"""');
  });

  it('should handle null barcode as empty string', async () => {
    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    const lines = csvContent.split('\n');
    const product2Line = lines[2]; // Header + Product 1 + Product 2

    expect(product2Line).toContain(',,'); // Empty barcode between commas
  });

  it('should format prices with 2 decimal places', async () => {
    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    expect(csvContent).toContain('10.50');
    expect(csvContent).toContain('20.99');
  });

  it('should save file to cache directory with timestamp', async () => {
    await exportToCSV();

    const filePath = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][0];

    expect(filePath).toContain('file:///mock/cache/');
    expect(filePath).toContain('scanstock-products-');
    expect(filePath).toMatch(/\.csv$/);
  });

  it('should share the CSV file', async () => {
    await exportToCSV();

    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.stringContaining('.csv'),
      expect.objectContaining({
        mimeType: 'text/csv',
        dialogTitle: 'Export Products CSV',
        UTI: 'public.comma-separated-values-text',
      })
    );
  });

  it('should cleanup temporary file after sharing', async () => {
    await exportToCSV();

    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      expect.stringContaining('.csv'),
      { idempotent: true }
    );
  });

  it('should throw error if sharing is not available', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

    await expect(exportToCSV()).rejects.toThrow(
      'Sharing is not available on this device'
    );
  });

  it('should handle empty product list', async () => {
    (ProductRepository.getAll as jest.Mock).mockResolvedValue([]);

    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    // Should have header only
    const lines = csvContent.split('\n');
    expect(lines[0]).toBe('ID,Name,Barcode,Price,Stock,Created At,Updated At');
    expect(lines.length).toBe(1);
  });

  it('should create valid CSV structure', async () => {
    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    const lines = csvContent.split('\n');

    // Check header
    expect(lines[0]).toBe('ID,Name,Barcode,Price,Stock,Created At,Updated At');

    // Check data rows have correct number of columns
    const product1Cols = lines[1].match(/,/g)?.length;
    const product2Cols = lines[2].match(/,/g)?.length;

    expect(product1Cols).toBe(6); // 7 columns = 6 commas
    expect(product2Cols).toBe(6);
  });

  it('should include timestamps in export', async () => {
    await exportToCSV();

    const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock
      .calls[0][1];

    expect(csvContent).toContain('2024-01-01T00:00:00.000Z');
    expect(csvContent).toContain('2024-01-02T00:00:00.000Z');
  });
});
