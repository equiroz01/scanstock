import { View, Text, Modal, Pressable, Alert, Animated } from 'react-native';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ProductQR, ProductQRRef } from './ProductQR';
import { saveQRToGallery, shareQR } from '@/services/qr/qrGenerator';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/types/product';

interface QRModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export function QRModal({ visible, product, onClose }: QRModalProps) {
  const insets = useSafeAreaInsets();
  const qrRef = useRef<ProductQRRef>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSaveToGallery = async () => {
    if (!product || !qrRef.current) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    qrRef.current.toDataURL(async (data: string) => {
      const success = await saveQRToGallery(data, product.name);
      setIsSaving(false);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Saved!', 'QR code saved to your photo library');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Could not save QR code. Please check permissions.');
      }
    });
  };

  const handleShare = async () => {
    if (!product || !qrRef.current) return;

    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    qrRef.current.toDataURL(async (data: string) => {
      await shareQR(data, product.name);
      setIsSharing(false);
    });
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onShow={animateIn}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <Animated.View
          className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text className="text-lg font-bold text-dark-900">Product QR Code</Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-dark-100 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#475569" />
            </Pressable>
          </View>

          {/* QR Code */}
          <View className="px-5 py-6 items-center">
            <ProductQR ref={qrRef} product={product} size={180} />
          </View>

          {/* Product Info */}
          <View className="px-5 pb-4">
            <View className="bg-dark-50 rounded-2xl p-4">
              <Text className="text-dark-900 font-bold text-lg text-center" numberOfLines={2}>
                {product.name}
              </Text>
              <View className="flex-row justify-center items-center mt-2 gap-4">
                {product.barcode && (
                  <View className="flex-row items-center">
                    <Ionicons name="barcode-outline" size={14} color="#64748b" />
                    <Text className="text-dark-500 text-sm ml-1 font-mono">{product.barcode}</Text>
                  </View>
                )}
                <Text className="text-primary-600 font-bold">{formatCurrency(product.price)}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row px-5 pb-5 gap-3">
            <Pressable
              onPress={handleSaveToGallery}
              disabled={isSaving}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${
                isSaving ? 'bg-dark-100' : 'bg-primary-600'
              }`}
              style={({ pressed }) => [pressed && !isSaving && { opacity: 0.9 }]}
            >
              <Ionicons
                name={isSaving ? 'hourglass-outline' : 'download-outline'}
                size={20}
                color={isSaving ? '#94a3b8' : 'white'}
              />
              <Text
                className={`font-semibold ml-2 ${isSaving ? 'text-dark-400' : 'text-white'}`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShare}
              disabled={isSharing}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl border-2 ${
                isSharing ? 'border-dark-200 bg-dark-50' : 'border-primary-600'
              }`}
              style={({ pressed }) => [pressed && !isSharing && { opacity: 0.9 }]}
            >
              <Ionicons
                name={isSharing ? 'hourglass-outline' : 'share-outline'}
                size={20}
                color={isSharing ? '#94a3b8' : '#30638e'}
              />
              <Text
                className={`font-semibold ml-2 ${isSharing ? 'text-dark-400' : 'text-primary-600'}`}
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </Text>
            </Pressable>
          </View>

          {/* Hint */}
          <View className="px-5 pb-5">
            <Text className="text-dark-400 text-xs text-center">
              Scan this QR code with ScanStock to quickly add this product
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
