import { useRef, useEffect, useCallback, useState } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedProductRowProps {
  children: React.ReactNode;
  index: number;
  productId: string;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  onRemove?: (productId: string) => Promise<void>;
  pendingDelete?: string | null;
}

export function AnimatedProductRow({
  children,
  index,
  productId,
  delay = 50,
  duration = 300,
  style,
  pendingDelete,
}: AnimatedProductRowProps) {
  // Entry animations
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  // Exit animations
  const translateX = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(1)).current; // Will be used as multiplier
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  // Entry animation
  useEffect(() => {
    const itemDelay = Math.min(index * delay, 500);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay: itemDelay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: itemDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay: itemDelay,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
    ]).start();
  }, [index, delay, duration, translateY, opacity, scale]);

  // Exit animation when this product is being deleted
  useEffect(() => {
    if (pendingDelete === productId) {
      // Slide out to the left and fade
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -400,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [pendingDelete, productId, translateX, opacity, scale]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Simpler version with just delete animation
interface DeletableRowProps {
  children: React.ReactNode;
  isDeleting: boolean;
  onAnimationComplete?: () => void;
}

export function DeletableRow({
  children,
  isDeleting,
  onAnimationComplete,
}: DeletableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const heightScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDeleting) {
      Animated.sequence([
        // First: slide out with fade and scale
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -400,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [isDeleting, translateX, opacity, scale, onAnimationComplete]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [
          { translateX },
          { scale },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
