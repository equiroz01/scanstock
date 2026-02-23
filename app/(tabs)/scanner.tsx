import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { useProductStore } from '@/stores/useProductStore';
import { useI18n } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_FRAME_SIZE = SCREEN_WIDTH * 0.75;

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

      // Pulse animation for corners
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnimation.setValue(0);
      pulseAnimation.setValue(1);
    }
  }, [scanned, scanAnimation, pulseAnimation]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Timeout after 30 seconds without scan
  useEffect(() => {
    if (!scanned && permission?.granted) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setShowTimeout(true);
      }, 30000); // 30 seconds

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [scanned, permission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLastScannedCode(data);

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Success animation
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();

    try {
      const existingProduct = await getProductByBarcode(data);

      setTimeout(() => {
        if (existingProduct) {
          router.push(`/product/${existingProduct.id}`);
        } else {
          router.push({
            pathname: '/product/new',
            params: { barcode: data, fromScanner: 'true' },
          });
        }
      }, 600);
    } catch (error) {
      setScanned(false);
      successScale.setValue(0);
    }
  };

  const handleScanAgain = () => {
    successScale.setValue(0);
    setScanned(false);
    setLastScannedCode(null);
    setShowTimeout(false);
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-dark-900 items-center justify-center">
        <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
          <Ionicons name="camera-outline" size={24} color="white" />
        </View>
        <Text className="text-white mt-4">{t.scanner.initializingCamera}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={['#4a90b8', '#30638e', '#003d5b', '#002a3f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center px-8"
        >
          {/* Decorative circles */}
          <View
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          />
          <View
            className="absolute top-40 -left-10 w-40 h-40 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          />
          <View
            className="absolute -bottom-16 right-10 w-48 h-48 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          />

          <View
            className="w-28 h-28 rounded-3xl items-center justify-center mb-8"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name="camera" size={44} color="white" />
            </View>
          </View>

          <Text className="text-white text-3xl font-bold text-center mb-3">
            {t.scanner.cameraAccess}
          </Text>
          <Text
            className="text-base text-center mb-10 leading-6 px-4"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            {t.scanner.cameraAccessDescription}
          </Text>

          <Pressable
            onPress={requestPermission}
            className="overflow-hidden rounded-2xl"
            style={{
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              className="px-8 py-4 flex-row items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name="camera" size={22} color="white" />
              <Text className="text-white font-bold text-lg ml-3">{t.scanner.allowCameraAccess}</Text>
            </View>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-900">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
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

      {/* Dark overlay with cutout */}
      <View style={StyleSheet.absoluteFillObject}>
        <View className="flex-1 bg-black/50" />
        <View className="flex-row">
          <View className="bg-black/50" style={{ width: (SCREEN_WIDTH - SCAN_FRAME_SIZE) / 2 }} />
          <View style={{ width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE * 0.6 }} />
          <View className="bg-black/50" style={{ width: (SCREEN_WIDTH - SCAN_FRAME_SIZE) / 2 }} />
        </View>
        <View className="flex-1 bg-black/50" />
      </View>

      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          accessibilityLabel="Close scanner"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>

        <View className="flex-row items-center bg-black/30 rounded-full px-4 py-2">
          <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
          <Text className="text-white font-medium">{t.scanner.cameraActive}</Text>
        </View>

        <Pressable
          onPress={() => setFlashOn(!flashOn)}
          className={`w-10 h-10 rounded-full items-center justify-center ${flashOn ? 'bg-warning-500' : 'bg-black/30'}`}
          accessibilityLabel={flashOn ? 'Turn off flash' : 'Turn on flash'}
          accessibilityRole="button"
        >
          <Ionicons name={flashOn ? 'flash' : 'flash-outline'} size={22} color="white" />
        </Pressable>
      </View>

      {/* Scan Frame */}
      <View className="flex-1 items-center justify-center">
        <View
          className="relative"
          style={{ width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE * 0.6 }}
        >
          {/* Corner decorations */}
          <Animated.View
            className="absolute -top-1 -left-1 w-12 h-12"
            style={{ transform: [{ scale: pulseAnimation }] }}
          >
            <View className="absolute top-0 left-0 w-full h-1 bg-primary-400 rounded-full" />
            <View className="absolute top-0 left-0 w-1 h-full bg-primary-400 rounded-full" />
          </Animated.View>

          <Animated.View
            className="absolute -top-1 -right-1 w-12 h-12"
            style={{ transform: [{ scale: pulseAnimation }] }}
          >
            <View className="absolute top-0 right-0 w-full h-1 bg-primary-400 rounded-full" />
            <View className="absolute top-0 right-0 w-1 h-full bg-primary-400 rounded-full" />
          </Animated.View>

          <Animated.View
            className="absolute -bottom-1 -left-1 w-12 h-12"
            style={{ transform: [{ scale: pulseAnimation }] }}
          >
            <View className="absolute bottom-0 left-0 w-full h-1 bg-primary-400 rounded-full" />
            <View className="absolute bottom-0 left-0 w-1 h-full bg-primary-400 rounded-full" />
          </Animated.View>

          <Animated.View
            className="absolute -bottom-1 -right-1 w-12 h-12"
            style={{ transform: [{ scale: pulseAnimation }] }}
          >
            <View className="absolute bottom-0 right-0 w-full h-1 bg-primary-400 rounded-full" />
            <View className="absolute bottom-0 right-0 w-1 h-full bg-primary-400 rounded-full" />
          </Animated.View>

          {/* Animated scan line */}
          {!scanned && (
            <Animated.View
              className="absolute left-2 right-2"
              style={{
                transform: [{
                  translateY: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCAN_FRAME_SIZE * 0.6 - 4],
                  }),
                }],
              }}
            >
              <LinearGradient
                colors={['transparent', '#5fad41', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 3, borderRadius: 2 }}
              />
            </Animated.View>
          )}

          {/* Success overlay */}
          {scanned && (
            <Animated.View
              className="absolute inset-0 items-center justify-center"
              style={{
                transform: [{ scale: successScale }],
                opacity: successScale,
              }}
            >
              <View className="w-20 h-20 rounded-full bg-success-500 items-center justify-center shadow-lg">
                <Ionicons name="checkmark" size={48} color="white" />
              </View>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Bottom section */}
      <View
        className="absolute bottom-0 left-0 right-0 items-center px-6"
        style={{ paddingBottom: insets.bottom + 100 }}
      >
        {scanned && lastScannedCode ? (
          <View className="items-center">
            <View className="bg-white/10 rounded-2xl px-6 py-4 mb-4">
              <Text className="text-white/60 text-sm text-center mb-1">{t.scanner.scannedCode}</Text>
              <Text className="text-white text-xl font-mono font-bold text-center">
                {lastScannedCode}
              </Text>
            </View>
            <Button
              title={t.scanner.scanAnother}
              onPress={handleScanAgain}
              variant="secondary"
              icon="scan-outline"
              size="lg"
            />
          </View>
        ) : (
          <View className="items-center">
            <View className="bg-white/10 rounded-2xl px-6 py-4 mb-4">
              <Text className="text-white text-base text-center">
                {t.scanner.pointCamera}
              </Text>
            </View>
            {showTimeout && (
              <View className="bg-warning-500/90 rounded-xl px-4 py-3 mb-3 max-w-xs">
                <View className="flex-row items-start">
                  <Ionicons name="bulb" size={20} color="white" />
                  <View className="flex-1 ml-2">
                    <Text className="text-white font-semibold text-sm mb-1">{t.common.tip}</Text>
                    <Text className="text-white text-xs leading-5">
                      {t.scanner.scanTip}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <Pressable
              onPress={() => router.push('/product/new')}
              className="flex-row items-center"
            >
              <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text className="text-white/70 ml-2">{t.scanner.addManually}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
