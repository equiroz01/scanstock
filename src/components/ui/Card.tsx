import { View, Pressable, Text, Animated } from 'react-native';
import { useRef, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-white border border-dark-100',
  elevated: 'bg-white shadow-md border border-dark-100',
  outlined: 'bg-transparent border-2 border-dark-300',
  filled: 'bg-dark-50 border border-dark-100',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const baseStyles = `${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={baseStyles}
          style={({ pressed }) => ({
            borderRadius: 16,
            overflow: 'hidden' as const,
            shadowColor: '#1a2433',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
            opacity: pressed ? 0.95 : 1,
          })}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View
      className={baseStyles}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1a2433',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

// Section card with title
interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
}

export function SectionCard({ title, subtitle, children, action, variant = 'default' }: SectionCardProps) {
  return (
    <Card variant={variant} padding="none">
      {(title || action) && (
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View className="flex-1">
            {title && <Text className="text-lg font-bold text-dark-900">{title}</Text>}
            {subtitle && <Text className="text-sm text-dark-500 mt-0.5">{subtitle}</Text>}
          </View>
          {action}
        </View>
      )}
      <View className="px-4 pb-4">{children}</View>
    </Card>
  );
}

// Stat card for dashboard
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
}

const colorStyles = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', iconBg: 'bg-primary-100' },
  success: { bg: 'bg-success-50', text: 'text-success-600', iconBg: 'bg-success-100' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-600', iconBg: 'bg-warning-100' },
  error: { bg: 'bg-error-50', text: 'text-error-600', iconBg: 'bg-error-100' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', iconBg: 'bg-accent-100' },
};

export function StatCard({ label, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colorStyle = colorStyles[color];

  return (
    <Card variant="default" padding="md">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm text-dark-500 mb-1">{label}</Text>
          <Text className="text-2xl font-bold text-dark-900">{value}</Text>
          {trend && (
            <View className="flex-row items-center mt-1">
              <Text className={trend.isPositive ? 'text-success-600' : 'text-error-600'}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Text>
            </View>
          )}
        </View>
        {icon && (
          <View className={`${colorStyle.iconBg} p-2 rounded-xl`}>
            {icon}
          </View>
        )}
      </View>
    </Card>
  );
}

