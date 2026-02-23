import { TextInput, View, Text, Pressable, Animated } from 'react-native';
import { forwardRef, useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      label,
      error,
      hint,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      autoFocus,
      multiline,
      numberOfLines = 1,
      editable = true,
      icon,
      rightIcon,
      onRightIconPress,
      prefix,
      suffix,
      variant = 'default',
      size = 'md',
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(focusAnimation, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFocused, focusAnimation]);

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg',
    };

    const variantStyles = {
      default: `bg-white border ${
        error
          ? 'border-error-500'
          : isFocused
            ? 'border-primary-500'
            : 'border-dark-200'
      }`,
      filled: `bg-dark-100 border ${
        error
          ? 'border-error-500'
          : isFocused
            ? 'border-primary-500'
            : 'border-transparent'
      }`,
      outlined: `bg-transparent border-2 ${
        error
          ? 'border-error-500'
          : isFocused
            ? 'border-primary-500'
            : 'border-dark-200'
      }`,
    };

    const borderColor = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? '#ef4444' : '#d4d6da', error ? '#ef4444' : '#30638e'],
    });

    return (
      <View className="w-full">
        {label && (
          <View className="flex-row items-center mb-2">
            <Text className={`text-sm font-semibold ${error ? 'text-error-600' : 'text-dark-700'}`}>
              {label}
            </Text>
          </View>
        )}

        <Animated.View
          style={[
            variant === 'default' && {
              borderColor,
              borderWidth: 1,
              borderRadius: 12,
            },
            isFocused && {
              shadowColor: '#30638e',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            },
          ]}
        >
          <View
            className={`
              flex-row items-center rounded-xl overflow-hidden
              ${variant !== 'default' ? variantStyles[variant] : ''}
              ${!editable ? 'opacity-60' : ''}
            `}
          >
            {icon && (
              <View className="pl-4">
                <Ionicons
                  name={icon}
                  size={20}
                  color={isFocused ? '#30638e' : '#9299a3'}
                />
              </View>
            )}

            {prefix && (
              <Text className="pl-4 text-dark-500 text-base font-medium">
                {prefix}
              </Text>
            )}

            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#94a3b8"
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoFocus={autoFocus}
              multiline={multiline}
              numberOfLines={numberOfLines}
              editable={editable}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                flex-1 text-dark-900
                ${sizeStyles[size]}
                ${icon ? 'pl-2' : ''}
                ${prefix ? 'pl-1' : ''}
                ${rightIcon || suffix ? 'pr-2' : ''}
                ${multiline ? 'min-h-[100px]' : ''}
                ${variant === 'default' ? 'bg-white' : ''}
              `}
              style={[
                multiline && { textAlignVertical: 'top' },
              ]}
            />

            {suffix && (
              <Text className="pr-4 text-dark-500 text-base">
                {suffix}
              </Text>
            )}

            {rightIcon && (
              <Pressable
                onPress={onRightIconPress}
                className="pr-4"
                disabled={!onRightIconPress}
              >
                <Ionicons
                  name={rightIcon}
                  size={20}
                  color={isFocused ? '#30638e' : '#9299a3'}
                />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {(error || hint) && (
          <View className="flex-row items-center mt-1.5 px-1">
            {error && (
              <>
                <Ionicons name="alert-circle" size={14} color="#dc2626" />
                <Text className="text-error-600 text-sm ml-1">{error}</Text>
              </>
            )}
            {!error && hint && (
              <Text className="text-dark-400 text-sm">{hint}</Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// Specialized inputs
interface CurrencyInputProps extends Omit<InputProps, 'keyboardType' | 'prefix'> {
  currency?: string;
}

export function CurrencyInput({ currency = '$', ...props }: CurrencyInputProps) {
  return (
    <Input
      {...props}
      prefix={currency}
      keyboardType="decimal-pad"
    />
  );
}

interface NumberInputProps extends Omit<InputProps, 'keyboardType'> {
  min?: number;
  max?: number;
}

export function NumberInput({ min, max, onChangeText, ...props }: NumberInputProps) {
  const handleChange = (text: string) => {
    const num = parseInt(text) || 0;
    if (min !== undefined && num < min) return;
    if (max !== undefined && num > max) return;
    onChangeText(text.replace(/[^0-9]/g, ''));
  };

  return (
    <Input
      {...props}
      onChangeText={handleChange}
      keyboardType="numeric"
    />
  );
}
