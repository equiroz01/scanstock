import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type { Product } from '@/types/product';

// QR data format for ScanStock
export interface ScanStockQRData {
  app: 'scanstock';
  v: number;
  barcode: string | null;
  name: string;
  price: number;
}

/**
 * Generate QR data string from product
 */
export function generateQRData(product: Product): string {
  const data: ScanStockQRData = {
    app: 'scanstock',
    v: 1,
    barcode: product.barcode,
    name: product.name,
    price: product.price,
  };
  return JSON.stringify(data);
}

/**
 * Parse QR data and check if it's a ScanStock QR
 */
export function parseScanStockQR(data: string): ScanStockQRData | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.app === 'scanstock' && parsed.v) {
      return parsed as ScanStockQRData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if scanned data is a ScanStock QR code
 */
export function isScanStockQR(data: string): boolean {
  return parseScanStockQR(data) !== null;
}

/**
 * Save QR code image to device gallery
 */
export async function saveQRToGallery(base64Image: string, productName: string): Promise<boolean> {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Create filename
    const filename = `scanstock_${productName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Save base64 to file
    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Save to media library
    await MediaLibrary.saveToLibraryAsync(fileUri);

    // Clean up cache file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    return true;
  } catch (error) {
    console.error('Error saving QR to gallery:', error);
    return false;
  }
}

/**
 * Share QR code image
 */
export async function shareQR(base64Image: string, productName: string): Promise<boolean> {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Create filename
    const filename = `scanstock_${productName.replace(/[^a-z0-9]/gi, '_')}.png`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Save base64 to file
    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share
    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/png',
      dialogTitle: `Share QR Code - ${productName}`,
    });

    // Clean up cache file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    return true;
  } catch (error) {
    console.error('Error sharing QR:', error);
    return false;
  }
}
