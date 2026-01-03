import { Pressable, Text, ActivityIndicator } from 'react-native';
import { forwardRef } from 'react';

interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<typeof Pressable, ButtonProps>(
  ({ onPress, title, variant = 'primary', size = 'md', disabled, loading, fullWidth }, ref) => {
    const baseStyles = 'rounded-xl items-center justify-center flex-row';

    const variantStyles = {
      primary: 'bg-primary-600 active:bg-primary-700',
      secondary: 'bg-dark-200 active:bg-dark-300',
      danger: 'bg-red-600 active:bg-red-700',
      ghost: 'bg-transparent active:bg-dark-100',
    };

    const textVariantStyles = {
      primary: 'text-white',
      secondary: 'text-dark-900',
      danger: 'text-white',
      ghost: 'text-primary-600',
    };

    const sizeStyles = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    };

    const textSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const disabledStyles = disabled ? 'opacity-50' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles}`}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? 'white' : '#4f46e5'}
            style={{ marginRight: 8 }}
          />
        )}
        <Text className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}>
          {title}
        </Text>
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
