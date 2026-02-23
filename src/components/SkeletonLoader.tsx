import { View, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

// Shimmer skeleton with gradient animation
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <View
      className={`bg-dark-200 overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SCREEN_WIDTH, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

// Skeleton with fade pulse (simpler, for smaller elements)
export function SkeletonPulse({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-dark-200 ${className}`}
      style={{
        width,
        height,
        borderRadius,
        opacity,
      }}
    />
  );
}

// Animated wrapper for staggered entry
interface AnimatedSkeletonProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
}

function AnimatedSkeleton({ children, index = 0, delay = 100 }: AnimatedSkeletonProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const itemDelay = index * delay;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: itemDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: itemDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, delay, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// Product card skeleton - compact row layout matching GoStock design
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <AnimatedSkeleton index={index} delay={80}>
      <View className="bg-white rounded-2xl py-3 px-4 mb-2 border border-dark-100">
        <View className="flex-row items-center">
          {/* Image placeholder - 56x56 */}
          <Skeleton width={56} height={56} borderRadius={12} />

          {/* Content */}
          <View className="flex-1 ml-3 mr-3">
            {/* Name */}
            <Skeleton width="70%" height={16} borderRadius={4} />
            {/* Price */}
            <View className="mt-1.5">
              <Skeleton width={60} height={14} borderRadius={4} />
            </View>
            {/* Timestamp */}
            <View className="mt-1">
              <SkeletonPulse width={50} height={12} borderRadius={4} />
            </View>
          </View>

          {/* Stock badge */}
          <SkeletonPulse width={56} height={24} borderRadius={12} />
        </View>
      </View>
    </AnimatedSkeleton>
  );
}

// Stats card skeleton - single card for the 3-up row
export function StatsCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <AnimatedSkeleton index={index} delay={60}>
      <View
        className="flex-1 bg-white rounded-2xl items-center py-4 px-2"
        style={{ borderWidth: 1, borderColor: '#edf0f2' }}
      >
        {/* Icon */}
        <SkeletonPulse width={44} height={44} borderRadius={12} />
        {/* Value */}
        <View className="mt-2.5">
          <SkeletonPulse width={36} height={24} borderRadius={4} />
        </View>
        {/* Label */}
        <View className="mt-1">
          <SkeletonPulse width={56} height={12} borderRadius={4} />
        </View>
      </View>
    </AnimatedSkeleton>
  );
}

// Health card skeleton
export function HealthCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <AnimatedSkeleton index={index} delay={60}>
      <View className="rounded-2xl p-4 min-h-[100px] bg-dark-300 overflow-hidden">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <SkeletonPulse width="40%" height={12} borderRadius={4} />
            <View className="mt-1">
              <SkeletonPulse width="60%" height={20} borderRadius={4} />
            </View>
            <View className="mt-1">
              <SkeletonPulse width="45%" height={12} borderRadius={4} />
            </View>
          </View>
          {/* Progress ring */}
          <SkeletonPulse width={48} height={48} borderRadius={24} />
        </View>
      </View>
    </AnimatedSkeleton>
  );
}

// Full inventory loading skeleton - 3 stat cards in a row + compact product rows
export function InventoryLoadingSkeleton() {
  return (
    <View>
      {/* 3 Stats cards in a single row */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <StatsCardSkeleton index={0} />
        </View>
        <View className="flex-1">
          <StatsCardSkeleton index={1} />
        </View>
        <View className="flex-1">
          <StatsCardSkeleton index={2} />
        </View>
      </View>

      {/* Section header skeleton */}
      <View className="flex-row items-center justify-between mb-3">
        <SkeletonPulse width={130} height={18} borderRadius={4} />
        <SkeletonPulse width={56} height={14} borderRadius={4} />
      </View>

      {/* Compact product card rows */}
      <ProductCardSkeleton index={3} />
      <ProductCardSkeleton index={4} />
      <ProductCardSkeleton index={5} />
      <ProductCardSkeleton index={6} />
    </View>
  );
}

// Search results skeleton (simpler, fewer items)
export function SearchResultsSkeleton() {
  return (
    <View>
      {/* Results count */}
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonPulse width={120} height={14} borderRadius={4} />
        <SkeletonPulse width={40} height={14} borderRadius={4} />
      </View>

      {/* Product cards */}
      <ProductCardSkeleton index={0} />
      <ProductCardSkeleton index={1} />
    </View>
  );
}

// Single product detail skeleton
export function ProductDetailSkeleton() {
  return (
    <View className="p-4">
      {/* Image */}
      <AnimatedSkeleton index={0}>
        <View className="items-center mb-6">
          <Skeleton width={200} height={200} borderRadius={24} />
        </View>
      </AnimatedSkeleton>

      {/* Name and badges */}
      <AnimatedSkeleton index={1}>
        <View className="mb-4">
          <View className="flex-row gap-2 mb-2">
            <SkeletonPulse width={48} height={20} borderRadius={10} />
            <SkeletonPulse width={72} height={20} borderRadius={10} />
          </View>
          <Skeleton width="80%" height={28} borderRadius={6} />
        </View>
      </AnimatedSkeleton>

      {/* Price */}
      <AnimatedSkeleton index={2}>
        <View className="mb-4">
          <SkeletonPulse width={40} height={14} borderRadius={4} />
          <View className="mt-1">
            <Skeleton width={100} height={32} borderRadius={6} />
          </View>
        </View>
      </AnimatedSkeleton>

      {/* Stock */}
      <AnimatedSkeleton index={3}>
        <View className="bg-white rounded-2xl p-4 border border-dark-200">
          <View className="flex-row items-center justify-between mb-3">
            <SkeletonPulse width={60} height={16} borderRadius={4} />
            <SkeletonPulse width={80} height={28} borderRadius={14} />
          </View>
          <Skeleton width="100%" height={8} borderRadius={4} />
        </View>
      </AnimatedSkeleton>

      {/* Barcode */}
      <AnimatedSkeleton index={4}>
        <View className="mt-4 bg-white rounded-2xl p-4 border border-dark-200">
          <SkeletonPulse width={60} height={14} borderRadius={4} />
          <View className="mt-2">
            <Skeleton width="70%" height={18} borderRadius={4} />
          </View>
        </View>
      </AnimatedSkeleton>
    </View>
  );
}
