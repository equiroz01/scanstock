import { View, Text } from 'react-native';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { generateQRData } from '@/services/qr/qrGenerator';
import type { Product } from '@/types/product';

interface ProductQRProps {
  product: Product;
  size?: number;
  backgroundColor?: string;
  color?: string;
  showLabel?: boolean;
}

export interface ProductQRRef {
  toDataURL: (callback: (data: string) => void) => void;
}

export const ProductQR = forwardRef<ProductQRRef, ProductQRProps>(
  ({ product, size = 200, backgroundColor = '#FFFFFF', color = '#000000', showLabel = false }, ref) => {
    const qrRef = useRef<any>(null);
    const qrData = generateQRData(product);

    useImperativeHandle(ref, () => ({
      toDataURL: (callback: (data: string) => void) => {
        if (qrRef.current) {
          qrRef.current.toDataURL(callback);
        }
      },
    }));

    return (
      <View className="items-center">
        <View
          className="rounded-2xl overflow-hidden"
          style={{
            padding: 16,
            backgroundColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <QRCode
            value={qrData}
            size={size}
            color={color}
            backgroundColor={backgroundColor}
            getRef={(c) => (qrRef.current = c)}
          />
        </View>
        {showLabel && (
          <View className="mt-4 items-center">
            <Text className="text-dark-900 font-bold text-lg text-center" numberOfLines={2}>
              {product.name}
            </Text>
            {product.barcode && (
              <Text className="text-dark-500 text-sm font-mono mt-1">{product.barcode}</Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

ProductQR.displayName = 'ProductQR';
