import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ProductRepository } from '@/database/repositories/ProductRepository';

export async function exportToCSV(): Promise<void> {
  const products = await ProductRepository.getAll();

  // Create CSV header
  const headers = ['ID', 'Name', 'Barcode', 'Price', 'Stock', 'Created At', 'Updated At'];

  // Create CSV rows
  const rows = products.map(product => [
    product.id,
    `"${product.name.replace(/"/g, '""')}"`,
    product.barcode || '',
    product.price.toFixed(2),
    product.stock.toString(),
    product.createdAt,
    product.updatedAt,
  ]);

  // Combine into CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `scanstock-products-${timestamp}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csvContent);

  // Share the file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Products CSV',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }

  // Clean up
  await FileSystem.deleteAsync(filePath, { idempotent: true });
}
