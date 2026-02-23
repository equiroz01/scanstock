import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductStore } from '@/stores/useProductStore';
import { ProductRepository } from '@/database/repositories/ProductRepository';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StockBadge } from '@/components/ui/Badge';
import { QRModal } from '@/components/QRModal';
import { formatCurrency } from '@/utils/currency';
import { savePhoto, deletePhoto } from '@/services/photos/photoStorage';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import type { Product } from '@/types/product';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateProduct, updateStock, deleteProduct } = useProductStore();
  const toast = useToast();
  const { t } = useI18n();

  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Animations
  const stockScale = useRef(new Animated.Value(1)).current;
  const incrementScale = useRef(new Animated.Value(1)).current;
  const decrementScale = useRef(new Animated.Value(1)).current;
  const photoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    try {
      const p = await ProductRepository.getById(id);
      if (p) {
        setProduct(p);
        setName(p.name);
        setBarcode(p.barcode || '');
        setPrice(p.price.toString());
        setStock(p.stock.toString());
        setPhotoUri(p.photoPath);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.products.failedLoad);
    } finally {
      setIsLoading(false);
    }
  };

  const animateButton = (animValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animValue, { toValue: 0.85, duration: 50, useNativeDriver: true }),
      Animated.spring(animValue, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  const animateStock = () => {
    Animated.sequence([
      Animated.timing(stockScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.spring(stockScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.products.permissionRequired, t.products.cameraPermissionNeeded);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(t.products.changePhoto, '', [
      { text: t.products.takePhoto, onPress: takePhoto },
      { text: t.products.choosePhoto, onPress: pickImage },
      { text: t.products.removePhoto, style: 'destructive', onPress: () => setPhotoUri(null) },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  const handlePriceChange = (text: string) => {
    // Solo permitir números y un punto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');

    if (parts.length > 2) {
      setPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setPrice(cleaned);
    }
  };

  const handleStockTextChange = (text: string) => {
    // Solo permitir números positivos
    const cleaned = text.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned) || 0;
    setStock(Math.max(0, num).toString());
  };

  const handleSave = async () => {
    if (!id || !name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t.common.error, t.products.productNameRequired);
      return;
    }

    setIsSaving(true);
    try {
      let permanentPhotoPath: string | null = photoUri;

      if (photoUri !== product?.photoPath) {
        if (product?.photoPath) {
          await deletePhoto(product.photoPath);
        }

        if (photoUri && !photoUri.startsWith('file://')) {
          permanentPhotoPath = await savePhoto(photoUri);
        } else if (photoUri && photoUri.startsWith('file://')) {
          permanentPhotoPath = photoUri;
        }
      }

      const updated = await updateProduct(id, {
        name: name.trim(),
        barcode: barcode.trim() || null,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        photoPath: permanentPhotoPath,
      });
      setProduct(updated);
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(t.products.updatedSuccessfully);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(t.products.failedUpdate);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.products.deleteProduct,
      t.products.deleteConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const productName = product?.name || 'Product';
            try {
              await deleteProduct(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              toast.success(`"${productName}" ${t.products.deleted}`);
              router.back();
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              toast.error(t.errors.failedDelete);
            }
          },
        },
      ]
    );
  };

  const handleStockChange = async (delta: number) => {
    if (!id || !product) return;
    if (product.stock + delta < 0) return;

    animateButton(delta > 0 ? incrementScale : decrementScale);
    animateStock();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await updateStock(id, delta);
    loadProduct();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-50 items-center justify-center">
        <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mb-4">
          <Ionicons name="cube-outline" size={32} color="#30638e" />
        </View>
        <Text className="text-dark-500">{t.products.loadingProduct}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-dark-50 items-center justify-center">
        <View className="w-16 h-16 rounded-2xl bg-error-100 items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
        </View>
        <Text className="text-dark-900 font-semibold mb-2">{t.products.productNotFound}</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-600 font-medium">{t.products.goBack}</Text>
        </Pressable>
      </View>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <View className="flex-1" style={{ backgroundColor: '#f5f6fa' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="bg-white border-b border-dark-100"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-dark-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="#475569" />
            </Pressable>
            <Text className="text-lg font-bold text-dark-900">
              {isEditing ? t.products.editProduct : t.products.productDetails}
            </Text>
            {!isEditing ? (
              <Pressable
                onPress={() => setIsEditing(true)}
                className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center"
              >
                <Ionicons name="create-outline" size={22} color="#30638e" />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setIsEditing(false);
                  // Reset form
                  setName(product.name);
                  setBarcode(product.barcode || '');
                  setPrice(product.price.toString());
                  setStock(product.stock.toString());
                  setPhotoUri(product.photoPath);
                }}
                className="px-3 py-2"
              >
                <Text className="text-primary-600 font-semibold">{t.common.cancel}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo */}
          <View className="items-center mb-6">
            <Animated.View style={{ transform: [{ scale: photoScale }] }}>
              <Pressable
                onPress={isEditing ? showImageOptions : undefined}
                className="w-40 h-40 rounded-3xl overflow-hidden"
                style={{
                  shadowColor: '#30638e',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                {(isEditing ? photoUri : product.photoPath) ? (
                  <View className="w-full h-full">
                    <Image
                      source={{ uri: isEditing ? photoUri! : product.photoPath! }}
                      className="w-full h-full"
                    />
                    {isEditing && (
                      <View className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center">
                        <Ionicons name="camera" size={16} color="#30638e" />
                      </View>
                    )}
                  </View>
                ) : (
                  <LinearGradient
                    colors={isEditing ? ['#f1f5f9', '#e2e8f0'] : ['#ede9fe', '#ddd6fe']}
                    className="w-full h-full items-center justify-center"
                  >
                    <Ionicons
                      name={isEditing ? 'camera-outline' : 'cube-outline'}
                      size={48}
                      color={isEditing ? '#9299a3' : '#30638e'}
                    />
                    {isEditing && (
                      <Text className="text-dark-400 text-sm font-medium mt-2">{t.products.addPhoto}</Text>
                    )}
                  </LinearGradient>
                )}
              </Pressable>
            </Animated.View>
          </View>

          {isEditing ? (
            /* Edit Form */
            <>
              <View className="bg-white rounded-2xl p-4 mb-4 border border-dark-200">
                <Text className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4">
                  {t.products.productInformation}
                </Text>
                <View className="gap-4">
                  <Input
                    label={t.products.productName}
                    value={name}
                    onChangeText={setName}
                    placeholder={t.products.enterProductName}
                    icon="cube-outline"
                  />
                  <Input
                    label={t.products.barcode}
                    value={barcode}
                    onChangeText={setBarcode}
                    placeholder={t.products.barcode}
                    autoCapitalize="none"
                    icon="barcode-outline"
                  />
                </View>
              </View>

              <View className="bg-white rounded-2xl p-4 mb-4 border border-dark-200">
                <Text className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4">
                  {t.products.pricingStock}
                </Text>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Input
                      label={t.products.price}
                      value={price}
                      onChangeText={handlePriceChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      prefix="$"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t.products.stock}
                      value={stock}
                      onChangeText={handleStockTextChange}
                      placeholder="0"
                      keyboardType="numeric"
                      suffix={t.badges.units}
                    />
                  </View>
                </View>
              </View>

              {/* Delete Button */}
              <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center py-4"
              >
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
                <Text className="text-error-600 font-medium ml-2">{t.products.deleteProduct}</Text>
              </Pressable>
            </>
          ) : (
            /* View Mode */
            <>
              {/* Name & Price Card */}
              <View className="bg-white rounded-2xl p-5 mb-4 border border-dark-200 items-center">
                <Text className="text-2xl font-bold text-dark-900 text-center">
                  {product.name}
                </Text>
                {product.barcode && (
                  <View className="flex-row items-center mt-2 bg-dark-100 rounded-lg px-3 py-1.5">
                    <Ionicons name="barcode-outline" size={16} color="#64748b" />
                    <Text className="text-dark-500 text-sm ml-1.5 font-mono">
                      {product.barcode}
                    </Text>
                  </View>
                )}
                <Text className="text-3xl font-bold text-primary-600 mt-4">
                  {formatCurrency(product.price)}
                </Text>
              </View>

              {/* Stock Control Card */}
              <View className="bg-white rounded-2xl p-5 mb-4 border border-dark-200">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                    {t.products.stockLevel}
                  </Text>
                  <StockBadge stock={product.stock} />
                </View>

                <View className="flex-row items-center justify-center">
                  <Animated.View style={{ transform: [{ scale: decrementScale }] }}>
                    <Pressable
                      onPress={() => handleStockChange(-1)}
                      disabled={product.stock === 0}
                      className={`w-16 h-16 rounded-2xl items-center justify-center ${
                        product.stock === 0 ? 'bg-dark-100' : 'bg-dark-200'
                      }`}
                      style={({ pressed }) => [pressed && product.stock > 0 && { opacity: 0.8 }]}
                    >
                      <Ionicons
                        name="remove"
                        size={32}
                        color={product.stock === 0 ? '#cbd5e1' : '#475569'}
                      />
                    </Pressable>
                  </Animated.View>

                  <Animated.View
                    className="mx-8"
                    style={{ transform: [{ scale: stockScale }] }}
                  >
                    <Text
                      className={`text-5xl font-bold ${
                        isOutOfStock
                          ? 'text-error-600'
                          : isLowStock
                            ? 'text-warning-600'
                            : 'text-dark-900'
                      }`}
                    >
                      {product.stock}
                    </Text>
                  </Animated.View>

                  <Animated.View style={{ transform: [{ scale: incrementScale }] }}>
                    <Pressable
                      onPress={() => handleStockChange(1)}
                      className="w-16 h-16 rounded-2xl items-center justify-center overflow-hidden"
                      style={{
                        shadowColor: '#5fad41',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                    >
                      <LinearGradient
                        colors={['#7bc45c', '#5fad41', '#4a9432']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-full h-full items-center justify-center"
                      >
                        <Ionicons name="add" size={32} color="white" />
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                </View>

                {/* Quick adjust buttons */}
                <View className="flex-row justify-center mt-4 gap-2">
                  {[-5, -1, 1, 5].map((delta) => (
                    <Pressable
                      key={delta}
                      onPress={() => {
                        if (product.stock + delta >= 0) {
                          animateStock();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          updateStock(id!, delta);
                          loadProduct();
                        }
                      }}
                      disabled={product.stock + delta < 0}
                      className={`px-4 py-2 rounded-xl ${
                        product.stock + delta < 0
                          ? 'bg-dark-100'
                          : delta > 0
                            ? 'bg-success-100'
                            : 'bg-error-100'
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          product.stock + delta < 0
                            ? 'text-dark-400'
                            : delta > 0
                              ? 'text-success-700'
                              : 'text-error-700'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Stats */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 bg-white rounded-2xl p-4 border border-dark-200">
                  <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mb-2">
                    <Ionicons name="wallet-outline" size={20} color="#30638e" />
                  </View>
                  <Text className="text-dark-500 text-sm">{t.products.totalValue}</Text>
                  <Text className="text-dark-900 text-lg font-bold">
                    {formatCurrency(product.price * product.stock)}
                  </Text>
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4 border border-dark-200">
                  <View className="w-10 h-10 rounded-xl bg-accent-100 items-center justify-center mb-2">
                    <Ionicons name="time-outline" size={20} color="#2d936c" />
                  </View>
                  <Text className="text-dark-500 text-sm">{t.products.lastUpdated}</Text>
                  <Text className="text-dark-900 text-lg font-bold">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="bg-white rounded-2xl p-4 border border-dark-200">
                <Pressable
                  onPress={() => setShowQRModal(true)}
                  className="flex-row items-center py-3"
                >
                  <View className="w-10 h-10 rounded-xl bg-accent-100 items-center justify-center">
                    <Ionicons name="qr-code-outline" size={20} color="#2d936c" />
                  </View>
                  <Text className="flex-1 text-dark-900 font-medium ml-3">{t.products.viewQRCode}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </Pressable>

                <View className="h-px bg-dark-100 ml-[52px]" />

                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="flex-row items-center py-3"
                >
                  <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center">
                    <Ionicons name="create-outline" size={20} color="#30638e" />
                  </View>
                  <Text className="flex-1 text-dark-900 font-medium ml-3">{t.products.editProduct}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </Pressable>

                <View className="h-px bg-dark-100 ml-[52px]" />

                <Pressable
                  onPress={handleDelete}
                  className="flex-row items-center py-3"
                >
                  <View className="w-10 h-10 rounded-xl bg-error-100 items-center justify-center">
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </View>
                  <Text className="flex-1 text-error-600 font-medium ml-3">{t.products.deleteProduct}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>

        {/* Save Button (Edit Mode) */}
        {isEditing && (
          <View
            className="bg-white border-t border-dark-100 px-4 py-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Button
              title={t.products.saveChanges}
              onPress={handleSave}
              loading={isSaving}
              fullWidth
              size="lg"
              icon="checkmark-circle"
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* QR Modal */}
      <QRModal
        visible={showQRModal}
        product={product}
        onClose={() => setShowQRModal(false)}
      />
    </View>
  );
}
