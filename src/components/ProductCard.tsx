import { View, Text, Image, Pressable, Animated } from 'react-native';
import { useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { normalizeText } from '@/utils/search';
import { StockBadge } from './ui/Badge';
import { useI18n } from '@/i18n';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
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

function getRelativeTime(dateStr: string, t: ReturnType<typeof useI18n>['t']): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return t.time.justNow;
  if (diffMin < 60) return `${diffMin}${t.time.minutesAgo}`;
  if (diffHour < 24) return `${diffHour}${t.time.hoursAgo}`;
  return date.toLocaleDateString();
}

export function ProductCard({ product, onPress, searchQuery }: ProductCardProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { t } = useI18n();

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleValue]);

  const isOutOfStock = product.stock === 0;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], marginBottom: 8 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`bg-white ${isOutOfStock ? 'opacity-75' : ''}`}
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#edf0f2',
          paddingVertical: 12,
          paddingHorizontal: 16,
          shadowColor: '#1a2433',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          {/* Product Image - 56x56 */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              overflow: 'hidden',
              marginRight: 12,
              backgroundColor: isOutOfStock ? '#d4d6da' : '#f0f4f8',
            }}
          >
            {product.photoPath ? (
              <Image
                source={{ uri: product.photoPath }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons
                  name="cube-outline"
                  size={22}
                  color={isOutOfStock ? '#9299a3' : '#30638e'}
                />
              </View>
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1 mr-3">
            <HighlightedText
              text={product.name}
              query={searchQuery}
              className="text-dark-900 text-base font-semibold"
            />
            <Text className="text-primary-600 text-sm font-medium mt-0.5">
              {formatCurrency(product.price)}
            </Text>
            <Text className="text-dark-300 text-xs mt-0.5">
              {getRelativeTime(product.updatedAt, t)}
            </Text>
          </View>

          {/* Stock Badge */}
          <StockBadge stock={product.stock} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
