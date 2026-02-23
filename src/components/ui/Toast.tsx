import { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const toastConfig: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; bgColor: string; iconColor: string }> = {
  success: { icon: 'checkmark-circle', bgColor: 'bg-success-600', iconColor: '#dcfce7' },
  error: { icon: 'close-circle', bgColor: 'bg-error-600', iconColor: '#fee2e2' },
  warning: { icon: 'warning', bgColor: 'bg-warning-600', iconColor: '#fef3c7' },
  info: { icon: 'information-circle', bgColor: 'bg-primary-600', iconColor: '#e0e7ff' },
};

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  action
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const config = toastConfig[type];

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <View className={`${config.bgColor} rounded-2xl px-4 py-3 flex-row items-center shadow-elevated`}>
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
        <Text className="flex-1 text-white font-medium ml-3 text-base">
          {message}
        </Text>
        {action && (
          <Pressable
            onPress={() => {
              action.onPress();
              hideToast();
            }}
            className="ml-2 px-3 py-1 bg-white/20 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">{action.label}</Text>
          </Pressable>
        )}
        <Pressable onPress={hideToast} className="ml-2 p-1">
          <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>
    </Animated.View>
  );
}
