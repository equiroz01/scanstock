import { useRef, useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function AnimatedListItem({
  children,
  index,
  delay = 50,
  duration = 300,
  style,
}: AnimatedListItemProps) {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const itemDelay = Math.min(index * delay, 500); // Cap max delay at 500ms

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

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Fade in only animation (simpler, for headers etc)
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 300,
  style,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, duration, opacity]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
}

// Slide in from side animation
interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function SlideInView({
  children,
  direction = 'left',
  delay = 0,
  duration = 300,
  style,
}: SlideInViewProps) {
  const translateX = useRef(new Animated.Value(direction === 'left' ? -50 : 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [direction, delay, duration, translateX, opacity]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateX }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Scale bounce animation
interface ScaleBounceViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export function ScaleBounceView({
  children,
  delay = 0,
  style,
}: ScaleBounceViewProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, scale, opacity]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}
