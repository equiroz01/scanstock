import { View, Text, Pressable, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatCurrency } from '@/utils/currency';

interface InventoryStatsProps {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  onFilterPress?: (filter: 'all' | 'low' | 'out') => void;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  delay?: number;
  onPress?: () => void;
}

function StatCard({ label, value, icon, delay = 0, onPress }: StatCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, [delay, opacityAnim, scaleAnim]);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(pressScale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const content = (
    <View
      className="flex-1 bg-white rounded-2xl items-center py-4 px-2"
      style={{
        borderWidth: 1,
        borderColor: '#edf0f2',
      }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mb-2.5"
        style={{ backgroundColor: '#f0f4f8' }}
      >
        <Ionicons name={icon} size={22} color="#4a90b8" />
      </View>
      <Text className="text-2xl font-bold text-dark-900 mb-0.5">
        {value}
      </Text>
      <Text className="text-xs text-dark-400 text-center" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { scale: pressScale }],
      }}
    >
      {onPress ? (
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </Animated.View>
  );
}

export function InventoryStats({
  totalProducts,
  lowStock,
  outOfStock,
  onFilterPress,
}: InventoryStatsProps) {
  const containerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(containerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [containerAnim]);

  if (totalProducts === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{ opacity: containerAnim }}
      className="mb-4"
    >
      <View className="flex-row gap-3">
        <StatCard
          label="Out of stock"
          value={outOfStock}
          icon="archive-outline"
          delay={0}
          onPress={onFilterPress ? () => onFilterPress('out') : undefined}
        />
        <StatCard
          label="Low stock"
          value={lowStock}
          icon="alert-circle-outline"
          delay={50}
          onPress={onFilterPress ? () => onFilterPress('low') : undefined}
        />
        <StatCard
          label="Total items"
          value={totalProducts}
          icon="grid-outline"
          delay={100}
        />
      </View>
    </Animated.View>
  );
}

// Compact version for inline display
export function InventoryStatsCompact({
  totalProducts,
  totalStock,
  totalValue,
}: {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
}) {
  return (
    <View className="flex-row items-center justify-between bg-dark-100 rounded-xl px-4 py-3">
      <View className="items-center">
        <Text className="text-dark-400 text-xs">Products</Text>
        <Text className="text-dark-900 font-bold">{totalProducts}</Text>
      </View>
      <View className="w-px h-8 bg-dark-200" />
      <View className="items-center">
        <Text className="text-dark-400 text-xs">Stock</Text>
        <Text className="text-dark-900 font-bold">{totalStock.toLocaleString()}</Text>
      </View>
      <View className="w-px h-8 bg-dark-200" />
      <View className="items-center">
        <Text className="text-dark-400 text-xs">Value</Text>
        <Text className="text-primary-600 font-bold">{formatCurrency(totalValue)}</Text>
      </View>
    </View>
  );
}
