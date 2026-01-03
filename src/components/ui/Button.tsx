import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { forwardRef, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

const variantConfig = {
  primary: {
    bg: 'bg-primary-600',
    bgPressed: 'bg-primary-700',
    text: 'text-white',
    iconColor: '#ffffff',
    loaderColor: '#ffffff',
  },
  secondary: {
    bg: 'bg-dark-100',
    bgPressed: 'bg-dark-200',
    text: 'text-dark-800',
    iconColor: '#1e293b',
    loaderColor: '#30638e',
  },
  danger: {
    bg: 'bg-error-600',
    bgPressed: 'bg-error-700',
    text: 'text-white',
    iconColor: '#ffffff',
    loaderColor: '#ffffff',
  },
  ghost: {
    bg: 'bg-transparent',
    bgPressed: 'bg-dark-100',
    text: 'text-primary-600',
    iconColor: '#30638e',
    loaderColor: '#30638e',
  },
  outline: {
    bg: 'bg-transparent border-2 border-primary-600',
    bgPressed: 'bg-primary-50',
    text: 'text-primary-600',
    iconColor: '#30638e',
    loaderColor: '#30638e',
  },
  success: {
    bg: 'bg-success-600',
    bgPressed: 'bg-success-700',
    text: 'text-white',
    iconColor: '#ffffff',
    loaderColor: '#ffffff',
  },
};

const sizeConfig = {
  sm: { container: 'px-3 py-2', text: 'text-sm', iconSize: 16, gap: 6 },
  md: { container: 'px-5 py-3', text: 'text-base', iconSize: 18, gap: 8 },
  lg: { container: 'px-6 py-4', text: 'text-lg', iconSize: 20, gap: 10 },
};

export const Button = forwardRef<typeof Pressable, ButtonProps>(
  ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    disabled,
    loading,
    fullWidth,
    icon,
    iconPosition = 'left',
  }, ref) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const config = variantConfig[variant];
    const sizeStyle = sizeConfig[size];

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.97,
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

    const renderIcon = () => {
      if (loading) {
        return (
          <ActivityIndicator
            size="small"
            color={config.loaderColor}
          />
        );
      }
      if (icon) {
        return (
          <Ionicons
            name={icon}
            size={sizeStyle.iconSize}
            color={config.iconColor}
          />
        );
      }
      return null;
    };

    const iconElement = renderIcon();

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }], width: fullWidth ? '100%' : undefined }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          className={`
            rounded-2xl items-center justify-center flex-row
            ${config.bg}
            ${sizeStyle.container}
            ${disabled && !loading ? 'opacity-40' : ''}
            ${loading ? 'opacity-75' : ''}
            ${fullWidth ? 'w-full' : ''}
          `}
          style={({ pressed }) => [
            pressed && !disabled && !loading && { opacity: 0.85 }
          ]}
        >
          {iconPosition === 'left' && iconElement && (
            <View style={{ marginRight: sizeStyle.gap }}>{iconElement}</View>
          )}
          <Text className={`font-semibold ${config.text} ${sizeStyle.text}`}>
            {loading ? 'Loading...' : title}
          </Text>
          {iconPosition === 'right' && iconElement && (
            <View style={{ marginLeft: sizeStyle.gap }}>{iconElement}</View>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';

// Icon-only button variant
interface IconButtonProps {
  onPress?: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const iconButtonSizes = {
  sm: { container: 'w-8 h-8', iconSize: 16 },
  md: { container: 'w-10 h-10', iconSize: 20 },
  lg: { container: 'w-12 h-12', iconSize: 24 },
};

export function IconButton({ onPress, icon, variant = 'ghost', size = 'md', disabled }: IconButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const config = variantConfig[variant];
  const sizeStyle = iconButtonSizes[size];

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={`
          rounded-xl items-center justify-center
          ${config.bg}
          ${sizeStyle.container}
          ${disabled ? 'opacity-40' : ''}
        `}
        style={({ pressed }) => [
          pressed && !disabled && { opacity: 0.7 }
        ]}
      >
        <Ionicons name={icon} size={sizeStyle.iconSize} color={config.iconColor} />
      </Pressable>
    </Animated.View>
  );
}
