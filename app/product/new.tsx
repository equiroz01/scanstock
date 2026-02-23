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
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { savePhoto } from '@/services/photos/photoStorage';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';

export default function NewProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ barcode?: string; fromScanner?: string }>();
  const addProduct = useProductStore(state => state.addProduct);
  const toast = useToast();
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(params.barcode || '');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const photoScale = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.barcode) {
      setBarcode(params.barcode);
    }
    // Animate form in
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [params.barcode, formOpacity]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = name.trim() !== '' || barcode.trim() !== '' || price !== '' || stock !== '0' || photoUri !== null;
    setHasUnsavedChanges(hasChanges);
  }, [name, barcode, price, stock, photoUri]);

  const animatePhoto = () => {
    Animated.sequence([
      Animated.timing(photoScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(photoScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
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
      animatePhoto();
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
      animatePhoto();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(t.products.addPhoto, '', [
      { text: t.products.takePhoto, onPress: takePhoto },
      { text: t.products.choosePhoto, onPress: pickImage },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  const handlePriceChange = (text: string) => {
    // Solo permitir números y un punto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');

    if (parts.length > 2) {
      // Solo un punto decimal permitido
      setPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setPrice(cleaned);
    }

    // Limpiar error de precio al escribir
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: undefined }));
    }
  };

  const handleStockChange = (text: string) => {
    // Solo permitir números positivos
    const cleaned = text.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned) || 0;
    setStock(Math.max(0, num).toString());
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = t.products.productNameRequired;
    }

    const priceNum = parseFloat(price);
    if (price && (isNaN(priceNum) || priceNum < 0)) {
      newErrors.price = t.products.invalidPrice;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      let permanentPhotoPath: string | null = null;
      if (photoUri) {
        permanentPhotoPath = await savePhoto(photoUri);
      }

      await addProduct({
        name: name.trim(),
        barcode: barcode.trim() || null,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        photoPath: permanentPhotoPath,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(`"${name.trim()}" ${t.products.addedToInventory}`);

      // If we came from scanner, go back to scanner for continuous scanning
      if (params.fromScanner === 'true') {
        router.replace('/scanner');
      } else {
        router.back();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(error instanceof Error ? error.message : t.products.failedSave);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanBarcode = () => {
    router.push('/scanner');
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        t.products.unsavedChanges,
        t.products.unsavedChangesMessage,
        [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.products.discard,
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

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
              onPress={handleBack}
              className="w-10 h-10 rounded-xl bg-dark-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#475569" />
            </Pressable>
            <Text className="text-lg font-bold text-dark-900">{t.products.newProduct}</Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: formOpacity }}>
            {/* Photo Section */}
            <View className="items-center mb-8">
              <Animated.View style={{ transform: [{ scale: photoScale }] }}>
                <Pressable
                  onPress={showImageOptions}
                  className="w-36 h-36 rounded-3xl overflow-hidden"
                  style={{
                    shadowColor: '#30638e',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: photoUri ? 0.3 : 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  {photoUri ? (
                    <View className="w-full h-full">
                      <Image source={{ uri: photoUri }} className="w-full h-full" />
                      <View className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center">
                        <Ionicons name="camera" size={16} color="#30638e" />
                      </View>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#f1f5f9', '#e2e8f0']}
                      className="w-full h-full items-center justify-center"
                    >
                      <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center mb-2">
                        <Ionicons name="camera-outline" size={28} color="#94a3b8" />
                      </View>
                      <Text className="text-dark-400 text-sm font-medium">{t.products.addPhoto}</Text>
                    </LinearGradient>
                  )}
                </Pressable>
              </Animated.View>
            </View>

            {/* Form Fields */}
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
                  error={errors.name}
                  icon="cube-outline"
                  autoFocus
                />

                <View>
                  <Input
                    label={t.products.barcode}
                    value={barcode}
                    onChangeText={setBarcode}
                    placeholder={t.products.scanOrEnterBarcode}
                    autoCapitalize="none"
                    icon="barcode-outline"
                    rightIcon="scan-outline"
                    onRightIconPress={handleScanBarcode}
                  />
                </View>
              </View>
            </View>

            {/* Pricing Section */}
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
                    error={errors.price}
                    prefix="$"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={t.products.initialStock}
                    value={stock}
                    onChangeText={handleStockChange}
                    placeholder="0"
                    keyboardType="numeric"
                    suffix={t.badges.units}
                  />
                </View>
              </View>
            </View>

            {/* Quick Tips */}
            <View className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-lg bg-primary-100 items-center justify-center mr-3">
                  <Ionicons name="bulb-outline" size={18} color="#30638e" />
                </View>
                <View className="flex-1">
                  <Text className="text-primary-800 font-semibold mb-1">{t.products.quickTip}</Text>
                  <Text className="text-primary-700 text-sm leading-5">
                    {t.products.quickTipText}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Save Button */}
        <View
          className="bg-white border-t border-dark-100 px-4 py-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Button
            title={t.products.saveProduct}
            onPress={handleSave}
            loading={isLoading}
            fullWidth
            size="lg"
            icon="checkmark-circle"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
