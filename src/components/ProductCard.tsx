import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { Card } from './ui/Card';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({ product, onPress, onIncrement, onDecrement }: ProductCardProps) {
  const stockColor = product.stock === 0
    ? 'text-red-600'
    : product.stock <= 5
      ? 'text-amber-600'
      : 'text-green-600';

  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row">
        {/* Product Image */}
        <View className="w-16 h-16 rounded-xl bg-dark-100 overflow-hidden mr-3">
          {product.photoPath ? (
            <Image
              source={{ uri: product.photoPath }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="cube-outline" size={28} color="#94a3b8" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="flex-1 justify-center">
          <Text className="text-dark-900 text-base font-semibold" numberOfLines={1}>
            {product.name}
          </Text>
          {product.barcode && (
            <Text className="text-dark-400 text-sm" numberOfLines={1}>
              {product.barcode}
            </Text>
          )}
          <Text className="text-primary-600 text-base font-semibold mt-0.5">
            {formatCurrency(product.price)}
          </Text>
        </View>

        {/* Stock Controls */}
        <View className="items-center justify-center">
          <View className="flex-row items-center">
            <Pressable
              onPress={onDecrement}
              className="w-8 h-8 rounded-lg bg-dark-100 items-center justify-center active:bg-dark-200"
            >
              <Ionicons name="remove" size={20} color="#475569" />
            </Pressable>

            <Text className={`mx-3 text-lg font-bold min-w-[32px] text-center ${stockColor}`}>
              {product.stock}
            </Text>

            <Pressable
              onPress={onIncrement}
              className="w-8 h-8 rounded-lg bg-primary-600 items-center justify-center active:bg-primary-700"
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </Card>
  );
}
