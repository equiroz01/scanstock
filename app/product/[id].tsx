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
import { ProductRepository } from '@/database/repositories/ProductRepository';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';
import { savePhoto, deletePhoto } from '@/services/photos/photoStorage';
import type { Product } from '@/types/product';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateProduct, updateStock, deleteProduct } = useProductStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

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
    Alert.alert('Change Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Remove Photo', style: 'destructive', onPress: () => setPhotoUri(null) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!id || !name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }

    setIsSaving(true);
    try {
      // Handle photo changes
      let permanentPhotoPath: string | null = photoUri;

      // If photo changed and new photo is different from original
      if (photoUri !== product?.photoPath) {
        // Delete old photo if exists
        if (product?.photoPath) {
          await deletePhoto(product.photoPath);
        }

        // Save new photo if provided
        if (photoUri && !photoUri.startsWith('file://')) {
          // Photo is from image picker (temp), save it permanently
          permanentPhotoPath = await savePhoto(photoUri);
        } else if (photoUri && photoUri.startsWith('file://')) {
          // Already a permanent path, keep it
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
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteProduct(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleStockChange = async (delta: number) => {
    if (!id || !product) return;
    await updateStock(id, delta);
    loadProduct();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-50 items-center justify-center">
        <Text className="text-dark-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-dark-50 items-center justify-center">
        <Text className="text-dark-500">Product not found</Text>
      </SafeAreaView>
    );
  }

  const stockColor =
    product.stock === 0
      ? 'text-red-600'
      : product.stock <= 5
        ? 'text-amber-600'
        : 'text-green-600';

  return (
    <SafeAreaView className="flex-1 bg-dark-50" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-dark-100">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#475569" />
          </Pressable>
          <Text className="text-lg font-semibold text-dark-900">
            {isEditing ? 'Edit Product' : 'Product Details'}
          </Text>
          {!isEditing ? (
            <Pressable onPress={() => setIsEditing(true)} className="p-2 -mr-2">
              <Ionicons name="create-outline" size={24} color="#4f46e5" />
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsEditing(false)} className="p-2 -mr-2">
              <Text className="text-primary-600 font-semibold">Cancel</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo */}
          <View className="items-center mb-6">
            <Pressable
              onPress={isEditing ? showImageOptions : undefined}
              className="w-40 h-40 rounded-2xl bg-dark-100 items-center justify-center overflow-hidden"
            >
              {(isEditing ? photoUri : product.photoPath) ? (
                <Image
                  source={{ uri: isEditing ? photoUri! : product.photoPath! }}
                  className="w-full h-full"
                />
              ) : (
                <Ionicons name="cube-outline" size={48} color="#94a3b8" />
              )}
              {isEditing && (
                <View className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary-600 items-center justify-center">
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              )}
            </Pressable>
          </View>

          {isEditing ? (
            /* Edit Form */
            <View className="gap-4">
              <Input
                label="Product Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter product name"
              />
              <Input
                label="Barcode"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Barcode"
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
          ) : (
            /* View Mode */
            <View>
              {/* Name & Price */}
              <Text className="text-2xl font-bold text-dark-900 text-center">
                {product.name}
              </Text>
              {product.barcode && (
                <Text className="text-dark-400 text-center mt-1">
                  {product.barcode}
                </Text>
              )}
              <Text className="text-3xl font-bold text-primary-600 text-center mt-4">
                {formatCurrency(product.price)}
              </Text>

              {/* Stock Control */}
              <View className="bg-white rounded-2xl p-6 mt-6 items-center">
                <Text className="text-dark-500 text-sm font-medium mb-4">
                  STOCK
                </Text>
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => handleStockChange(-1)}
                    className="w-14 h-14 rounded-xl bg-dark-100 items-center justify-center active:bg-dark-200"
                  >
                    <Ionicons name="remove" size={28} color="#475569" />
                  </Pressable>
                  <Text className={`mx-8 text-4xl font-bold ${stockColor}`}>
                    {product.stock}
                  </Text>
                  <Pressable
                    onPress={() => handleStockChange(1)}
                    className="w-14 h-14 rounded-xl bg-primary-600 items-center justify-center active:bg-primary-700"
                  >
                    <Ionicons name="add" size={28} color="white" />
                  </Pressable>
                </View>
              </View>

              {/* Delete Button */}
              <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center mt-8 py-3"
              >
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
                <Text className="text-red-600 font-medium ml-2">
                  Delete Product
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Save Button (Edit Mode) */}
        {isEditing && (
          <View className="p-4 bg-white border-t border-dark-100">
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isSaving}
              fullWidth
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
