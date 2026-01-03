import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Vibration, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useProductStore } from '@/stores/useProductStore';

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanAnimation] = useState(new Animated.Value(0));
  const getProductByBarcode = useProductStore(state => state.getProductByBarcode);

  // Scan line animation
  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnimation.setValue(0);
    }
  }, [scanned, scanAnimation]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Haptic feedback
    Vibration.vibrate(100);

    try {
      const existingProduct = await getProductByBarcode(data);

      // Small delay for better UX
      setTimeout(() => {
        if (existingProduct) {
          router.push(`/product/${existingProduct.id}`);
        } else {
          router.push({
            pathname: '/product/new',
            params: { barcode: data },
          });
        }
      }, 300);
    } catch (error) {
      Alert.alert('Error', 'Failed to process barcode');
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-dark-900 items-center justify-center">
        <Text className="text-white">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-dark-50 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-dark-100 items-center justify-center mb-4">
          <Ionicons name="camera-outline" size={40} color="#94a3b8" />
        </View>
        <Text className="text-dark-900 text-xl font-semibold text-center mb-2">
          Camera Permission Required
        </Text>
        <Text className="text-dark-500 text-base text-center mb-6">
          ScanStock needs camera access to scan barcodes
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-900">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code128',
            'code39',
            'code93',
            'codabar',
            'itf14',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View className="flex-1 items-center justify-center">
        {/* Scan Frame */}
        <View className="w-72 h-48 border-2 border-white/30 rounded-2xl overflow-hidden">
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl" />

          {/* Animated scan line */}
          {!scanned && (
            <Animated.View
              className="absolute left-0 right-0 h-0.5 bg-primary-500"
              style={{
                transform: [{
                  translateY: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 192], // height of frame
                  }),
                }],
                opacity: scanAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              }}
            />
          )}

          {/* Success indicator */}
          {scanned && (
            <View className="absolute inset-0 bg-green-500/20 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-green-500 items-center justify-center">
                <Ionicons name="checkmark" size={40} color="white" />
              </View>
            </View>
          )}
        </View>

        {/* Instructions */}
        <Text className="text-white text-base mt-6 text-center px-8">
          {scanned ? 'Barcode scanned successfully!' : 'Point camera at a barcode to scan'}
        </Text>
      </View>

      {/* Scan Again Button (when scanned) */}
      {scanned && (
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <Button
            title="Scan Again"
            onPress={() => setScanned(false)}
            variant="primary"
          />
        </View>
      )}
    </View>
  );
}
