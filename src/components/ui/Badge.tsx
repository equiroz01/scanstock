import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/i18n';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'pro' | 'accent';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; iconColor: string; borderColor?: string }> = {
  default: { bg: '#d4d6da', text: 'text-dark-700', iconColor: '#454c58', borderColor: '#9299a3' },
  success: { bg: '#daf3e8', text: 'text-success-700', iconColor: '#1f6249', borderColor: '#86d3b6' },
  warning: { bg: '#fef3c7', text: 'text-warning-700', iconColor: '#b45309', borderColor: '#fcd34d' },
  error: { bg: '#fee2e2', text: 'text-error-700', iconColor: '#b91c1c', borderColor: '#fca5a5' },
  info: { bg: '#dae6ef', text: 'text-primary-700', iconColor: '#234a6d', borderColor: '#8bb3cc' },
  pro: { bg: '#f59e0b', text: 'text-white', iconColor: '#ffffff' },
  accent: { bg: '#e2f2da', text: 'text-accent-700', iconColor: '#3d7a2a', borderColor: '#9ed485' },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string; iconSize: number; paddingH: number; paddingV: number }> = {
  sm: { container: '', text: 'text-xxs font-medium', iconSize: 10, paddingH: 10, paddingV: 4 },
  md: { container: '', text: 'text-xs font-semibold', iconSize: 12, paddingH: 12, paddingV: 6 },
  lg: { container: '', text: 'text-sm font-semibold', iconSize: 14, paddingH: 16, paddingV: 8 },
};

export function Badge({ label, variant = 'default', size = 'md', icon, pulse }: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: variantStyle.bg,
        borderRadius: 100,
        overflow: 'hidden',
        paddingHorizontal: sizeStyle.paddingH,
        paddingVertical: sizeStyle.paddingV,
        borderWidth: variantStyle.borderColor ? 1 : 0,
        borderColor: variantStyle.borderColor,
      }}
    >
      {pulse && (
        <View className="w-2 h-2 bg-current mr-1.5 animate-pulse" style={{ borderRadius: 9999 }} />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyle.iconSize}
          color={variantStyle.iconColor}
          style={{ marginRight: 4 }}
        />
      )}
      <Text className={`${sizeStyle.text} ${variantStyle.text}`}>
        {label}
      </Text>
    </View>
  );
}

// Stock level badge helper
export function StockBadge({ stock }: { stock: number }) {
  const { t } = useI18n();

  if (stock === 0) {
    return <Badge label={t.badges.outOfStock} variant="error" size="sm" icon="alert-circle" />;
  }
  if (stock <= 5) {
    return <Badge label={`${stock} ${t.badges.units}`} variant="warning" size="sm" icon="warning" />;
  }
  return <Badge label={`${stock} ${t.badges.units}`} variant="success" size="sm" />;
}

// PRO badge
export function ProBadge({ size = 'sm' }: { size?: BadgeSize }) {
  const { t } = useI18n();
  return <Badge label={t.badges.pro} variant="pro" size={size} icon="star" />;
}

// New product badge - shows for products created within the last N days
export function NewBadge({ createdAt, daysThreshold = 3 }: { createdAt: string; daysThreshold?: number }) {
  const { t } = useI18n();
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays > daysThreshold) return null;

  return <Badge label={t.badges.new} variant="info" size="sm" icon="sparkles" />;
}

// Low stock warning badge with animation hint
export function LowStockBadge({ stock, threshold = 5 }: { stock: number; threshold?: number }) {
  const { t } = useI18n();

  if (stock === 0) {
    return <Badge label={t.badges.outOfStock} variant="error" size="sm" icon="alert-circle" pulse />;
  }
  if (stock <= threshold) {
    return <Badge label={t.badges.lowStock} variant="warning" size="sm" icon="trending-down" />;
  }
  return null;
}
