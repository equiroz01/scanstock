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

const variantStyles: Record<BadgeVariant, { bg: string; textColor: string; iconColor: string; borderColor?: string }> = {
  default: { bg: '#d4d6da', textColor: '#454c58', iconColor: '#454c58', borderColor: '#9299a3' },
  success: { bg: '#daf3e8', textColor: '#1f6249', iconColor: '#1f6249', borderColor: '#86d3b6' },
  warning: { bg: '#fef3c7', textColor: '#b45309', iconColor: '#b45309', borderColor: '#fcd34d' },
  error: { bg: '#fee2e2', textColor: '#b91c1c', iconColor: '#b91c1c', borderColor: '#fca5a5' },
  info: { bg: '#dae6ef', textColor: '#234a6d', iconColor: '#234a6d', borderColor: '#8bb3cc' },
  pro: { bg: '#f59e0b', textColor: '#ffffff', iconColor: '#ffffff' },
  accent: { bg: '#e2f2da', textColor: '#3d7a2a', iconColor: '#3d7a2a', borderColor: '#9ed485' },
};

const sizeStyles: Record<BadgeSize, { fontSize: number; fontWeight: '500' | '600'; iconSize: number; paddingH: number; paddingV: number }> = {
  sm: { fontSize: 10, fontWeight: '500', iconSize: 10, paddingH: 10, paddingV: 4 },
  md: { fontSize: 12, fontWeight: '600', iconSize: 12, paddingH: 12, paddingV: 6 },
  lg: { fontSize: 14, fontWeight: '600', iconSize: 14, paddingH: 16, paddingV: 8 },
};

export function Badge({ label, variant = 'default', size = 'md', icon, pulse }: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: variantStyle.bg,
        borderRadius: 100,
        paddingHorizontal: sizeStyle.paddingH,
        paddingVertical: sizeStyle.paddingV,
        borderWidth: variantStyle.borderColor ? 1 : 0,
        borderColor: variantStyle.borderColor,
      }}
    >
      {pulse && (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: variantStyle.textColor, marginRight: 6, opacity: 0.8 }} />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyle.iconSize}
          color={variantStyle.iconColor}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={{ fontSize: sizeStyle.fontSize, fontWeight: sizeStyle.fontWeight, color: variantStyle.textColor }}>
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
