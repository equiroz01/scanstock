import { View, Text, Image, Pressable, Animated } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { normalizeText } from '@/utils/search';
import { StockBadge, NewBadge, LowStockBadge } from './ui/Badge';

// Stock Progress Bar component
const MAX_STOCK_DISPLAY = 100; // Maximum stock for full bar

interface StockProgressBarProps {
  stock: number;
  animated?: boolean;
}

export function StockProgressBar({ stock, animated = true }: StockProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((stock / MAX_STOCK_DISPLAY) * 100, 100);

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: percentage,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      widthAnim.setValue(percentage);
    }
  }, [stock, percentage, animated, widthAnim]);

  // Determine color based on stock level
  const getBarColor = () => {
    if (stock === 0) return '#dc2626'; // Red - out of stock
    if (stock <= 5) return '#d97706'; // Orange - low stock
    if (stock <= 15) return '#eab308'; // Yellow - medium-low
    return '#22c55e'; // Green - good stock
  };

  const getBackgroundColor = () => {
    if (stock === 0) return '#fecaca'; // Light red
    if (stock <= 5) return '#fed7aa'; // Light orange
    if (stock <= 15) return '#fef08a'; // Light yellow
    return '#bbf7d0'; // Light green
  };

  return (
    <View className="h-2 overflow-hidden" style={{ backgroundColor: getBackgroundColor(), borderRadius: 9999 }}>
      <Animated.View
        className="h-full"
        style={{
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
          backgroundColor: getBarColor(),
          borderRadius: 9999,
        }}
      />
    </View>
  );
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  searchQuery?: string;
}

// Component to render text with highlighted search matches
function HighlightedText({
  text,
  query,
  className,
  highlightClassName = 'bg-warning-200',
}: {
  text: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}) {
  if (!query?.trim()) {
    return <Text className={className} numberOfLines={1}>{text}</Text>;
  }

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return <Text className={className} numberOfLines={1}>{text}</Text>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <Text className={className} numberOfLines={1}>
      {before}
      <Text className={`${className} ${highlightClassName} rounded`}>{match}</Text>
      {after}
    </Text>
  );
}

export function ProductCard({ product, onPress, onIncrement, onDecrement, searchQuery }: ProductCardProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const incrementScale = useRef(new Animated.Value(1)).current;
  const decrementScale = useRef(new Animated.Value(1)).current;
  const stockScale = useRef(new Animated.Value(1)).current;
  const stockColor = useRef(new Animated.Value(0)).current;
  const lastStock = useRef(product.stock);

  // Animate stock number when it changes
  useEffect(() => {
    if (product.stock !== lastStock.current) {
      const isIncrease = product.stock > lastStock.current;
      lastStock.current = product.stock;

      // Flash color and bounce
      Animated.parallel([
        Animated.sequence([
          Animated.timing(stockColor, {
            toValue: isIncrease ? 1 : -1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(stockColor, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.spring(stockScale, {
            toValue: 1.3,
            useNativeDriver: true,
            speed: 50,
          }),
          Animated.spring(stockScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
          }),
        ]),
      ]).start();
    }
  }, [product.stock, stockColor, stockScale]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const animateButton = (animValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animValue, { toValue: 0.85, duration: 50, useNativeDriver: true }),
      Animated.spring(animValue, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  const handleIncrement = () => {
    animateButton(incrementScale);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIncrement();
  };

  const handleDecrement = () => {
    if (product.stock > 0) {
      animateButton(decrementScale);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrement();
    }
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }} className="mb-2.5">
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`
          bg-white p-4
          border border-dark-100
          ${isOutOfStock ? 'opacity-75' : ''}
        `}
        style={[{
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#1a2433',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 8,
          elevation: 2,
        }, ({ pressed }) => pressed && { opacity: 0.95 }].flat()}
      >
        <View className="flex-row">
          {/* Product Image */}
          <View className={`
            w-20 h-20 rounded-2xl overflow-hidden mr-4
            ${isOutOfStock ? 'bg-dark-200' : 'bg-dark-100'}
          `}>
            {product.photoPath ? (
              <Image
                source={{ uri: product.photoPath }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <View className="w-12 h-12 rounded-xl bg-dark-200 items-center justify-center">
                  <Ionicons
                    name="cube-outline"
                    size={24}
                    color={isOutOfStock ? '#9299a3' : '#30638e'}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1 justify-between py-0.5">
            <View>
              {/* Status Badges Row */}
              <View className="flex-row items-center gap-1.5 mb-1">
                <NewBadge createdAt={product.createdAt} />
                <LowStockBadge stock={product.stock} />
              </View>

              <HighlightedText
                text={product.name}
                query={searchQuery}
                className="text-dark-900 text-base font-semibold"
              />
              {product.barcode && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="barcode-outline" size={14} color="#94a3b8" />
                  <HighlightedText
                    text={product.barcode}
                    query={searchQuery}
                    className="text-dark-400 text-sm ml-1"
                  />
                </View>
              )}
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-primary-600 text-lg font-bold">
                {formatCurrency(product.price)}
              </Text>
              <StockBadge stock={product.stock} />
            </View>
          </View>
        </View>

        {/* Stock Controls */}
        <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-dark-100">
          <Text className="text-dark-500 text-sm mr-3">Stock:</Text>

          <Animated.View style={{ transform: [{ scale: decrementScale }] }}>
            <Pressable
              onPress={handleDecrement}
              disabled={product.stock === 0}
              className={`
                w-10 h-10 rounded-xl items-center justify-center
                ${product.stock === 0 ? 'bg-dark-100' : 'bg-dark-200 active:bg-dark-300'}
              `}
            >
              <Ionicons
                name="remove"
                size={22}
                color={product.stock === 0 ? '#cbd5e1' : '#475569'}
              />
            </Pressable>
          </Animated.View>

          <View className="mx-4 min-w-[48px] items-center">
            <Animated.Text
              style={{
                transform: [{ scale: stockScale }],
                color: stockColor.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['#dc2626', isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#1e293b', '#22c55e'],
                }),
              }}
              className="text-xl font-bold"
            >
              {product.stock}
            </Animated.Text>
          </View>

          <Animated.View style={{ transform: [{ scale: incrementScale }] }}>
            <Pressable
              onPress={handleIncrement}
              className="w-10 h-10 rounded-xl bg-primary-600 items-center justify-center active:bg-primary-700"
            >
              <Ionicons name="add" size={22} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Compact product card for lists
interface ProductCardCompactProps {
  product: Product;
  onPress: () => void;
}

export function ProductCardCompact({ product, onPress }: ProductCardCompactProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleValue, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true }).start()}
        className="bg-white p-3 border border-dark-200 flex-row items-center"
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <View className="w-12 h-12 rounded-xl bg-dark-100 overflow-hidden mr-3">
          {product.photoPath ? (
            <Image source={{ uri: product.photoPath }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="cube-outline" size={20} color="#30638e" />
            </View>
          )}
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-dark-900 font-medium" numberOfLines={1}>{product.name}</Text>
          <Text className="text-primary-600 font-semibold">{formatCurrency(product.price)}</Text>
          <View className="mt-1.5">
            <StockProgressBar stock={product.stock} animated={false} />
          </View>
        </View>
        <View className="items-end">
          <StockBadge stock={product.stock} />
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={{ marginLeft: 8 }} />
      </Pressable>
    </Animated.View>
  );
}
