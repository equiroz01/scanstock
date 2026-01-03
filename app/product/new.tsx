import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProductStore } from '@/stores/useProductStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { savePhoto } from '@/services/photos/photoStorage';

export default function NewProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ barcode?: string }>();
  const addProduct = useProductStore(state => state.addProduct);

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(params.barcode || '');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  useEffect(() => {
    if (params.barcode) {
      setBarcode(params.barcode);
    }
  }, [params.barcode]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }

    const priceNum = parseFloat(price);
    if (price && (isNaN(priceNum) || priceNum < 0)) {
      newErrors.price = 'Invalid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Save photo to permanent storage if exists
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
      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save product'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-50" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-dark-100">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#475569" />
          </Pressable>
          <Text className="text-lg font-semibold text-dark-900">New Product</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo */}
          <View className="items-center mb-6">
            <Pressable
              onPress={showImageOptions}
              className="w-32 h-32 rounded-2xl bg-dark-100 items-center justify-center overflow-hidden border-2 border-dashed border-dark-300"
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera-outline" size={32} color="#94a3b8" />
                  <Text className="text-dark-400 text-sm mt-2">Add Photo</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Input
              label="Product Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
              error={errors.name}
              autoFocus
            />

            <Input
              label="Barcode"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Scan or enter barcode"
              autoCapitalize="none"
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Input
                  label="Price"
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  error={errors.price}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Stock"
                  value={stock}
                  onChangeText={setStock}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="p-4 bg-white border-t border-dark-100">
          <Button
            title="Save Product"
            onPress={handleSave}
            loading={isLoading}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
