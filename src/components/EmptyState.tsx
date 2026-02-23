import { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'cube-outline', title, description, actionLabel, onAction }: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Subtle bounce for icon after entrance
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: -8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounce, {
          toValue: 0,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, scaleAnim, iconBounce]);

  return (
    <Animated.View
      className="flex-1 items-center justify-center px-10 py-20"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: iconBounce }],
        }}
      >
        <LinearGradient
          colors={['#e8eef4', '#dae3ed']}
          className="w-24 h-24 rounded-full items-center justify-center mb-5"
        >
          <Ionicons name={icon} size={48} color="#6e8faa" />
        </LinearGradient>
      </Animated.View>
      <Text className="text-dark-900 text-xl font-bold text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-dark-500 text-base text-center leading-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-6 overflow-hidden rounded-xl"
          style={{
            shadowColor: '#30638e',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={['#4a90b8', '#30638e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 py-3 flex-row items-center"
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">{actionLabel}</Text>
          </LinearGradient>
        </Pressable>
      )}
    </Animated.View>
  );
}
