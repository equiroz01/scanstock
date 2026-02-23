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
    bgColor: '#1a2433',
    bgPressedColor: '#0d1520',
    textColor: '#ffffff',
    iconColor: '#ffffff',
    loaderColor: '#ffffff',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  secondary: {
    bgColor: '#f5f6fa',
    bgPressedColor: '#e8e9eb',
    textColor: '#1a2433',
    iconColor: '#1a2433',
    loaderColor: '#1a2433',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  danger: {
    bgColor: '#dc2626',
    bgPressedColor: '#b91c1c',
    textColor: '#ffffff',
    iconColor: '#ffffff',
    loaderColor: '#ffffff',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  ghost: {
    bgColor: 'transparent',
    bgPressedColor: '#f5f6fa',
    textColor: '#1a2433',
    iconColor: '#1a2433',
    loaderColor: '#1a2433',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  outline: {
    bgColor: 'transparent',
    bgPressedColor: '#f5f6fa',
    textColor: '#1a2433',
    iconColor: '#1a2433',
    loaderColor: '#1a2433',
    borderWidth: 1.5,
    borderColor: '#d4d6da',
  },
  success: {
    bgColor: '#16a34a',
    bgPressedColor: '#15803d',
    textColor: '#ffffff',
    iconColor: '#ffffff',
    loaderColor: '#ffffff',
    borderWidth: 0,
    borderColor: 'transparent',
  },
};

const sizeConfig = {
  sm: { ph: 12, pv: 8, fontSize: 14, iconSize: 16, gap: 6 },
  md: { ph: 20, pv: 12, fontSize: 16, iconSize: 18, gap: 8 },
  lg: { ph: 24, pv: 16, fontSize: 17, iconSize: 20, gap: 10 },
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
          style={({ pressed }) => ({
            borderRadius: 14,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            paddingHorizontal: sizeStyle.ph,
            paddingVertical: sizeStyle.pv,
            backgroundColor: pressed && !disabled && !loading ? config.bgPressedColor : config.bgColor,
            borderWidth: config.borderWidth,
            borderColor: config.borderColor,
            opacity: disabled && !loading ? 0.4 : loading ? 0.75 : 1,
            width: fullWidth ? '100%' : undefined,
          })}
        >
          {iconPosition === 'left' && iconElement && (
            <View style={{ marginRight: sizeStyle.gap }}>{iconElement}</View>
          )}
          <Text style={{ fontWeight: '600', color: config.textColor, fontSize: sizeStyle.fontSize }}>
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
  sm: { wh: 32, iconSize: 16 },
  md: { wh: 40, iconSize: 20 },
  lg: { wh: 48, iconSize: 24 },
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
        style={({ pressed }) => ({
          width: sizeStyle.wh,
          height: sizeStyle.wh,
          borderRadius: 12,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          backgroundColor: pressed && !disabled ? config.bgPressedColor : config.bgColor,
          opacity: disabled ? 0.4 : 1,
        })}
      >
        <Ionicons name={icon} size={sizeStyle.iconSize} color={config.iconColor} />
      </Pressable>
    </Animated.View>
  );
}
