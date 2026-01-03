import { Platform } from 'react-native';

/**
 * IAP Product IDs
 *
 * IMPORTANT: These must match exactly with App Store Connect / Google Play Console
 * Format convention: com.scanstock.app.{product_name}
 */

export const IAP_PRODUCTS = {
  PRO_LOCAL: Platform.select({
    ios: 'com.scanstock.app.pro_local',
    android: 'com.scanstock.app.pro_local',
    default: 'com.scanstock.app.pro_local',
  }),
  PRO_CLOUD_MONTHLY: Platform.select({
    ios: 'com.scanstock.app.pro_cloud_monthly',
    android: 'com.scanstock.app.pro_cloud_monthly',
    default: 'com.scanstock.app.pro_cloud_monthly',
  }),
  PRO_CLOUD_YEARLY: Platform.select({
    ios: 'com.scanstock.app.pro_cloud_yearly',
    android: 'com.scanstock.app.pro_cloud_yearly',
    default: 'com.scanstock.app.pro_cloud_yearly',
  }),
} as const;

/**
 * All product IDs as array for initialization
 */
export const ALL_PRODUCT_IDS = Object.values(IAP_PRODUCTS);

/**
 * Subscription product IDs
 */
export const SUBSCRIPTION_IDS = [
  IAP_PRODUCTS.PRO_CLOUD_MONTHLY,
  IAP_PRODUCTS.PRO_CLOUD_YEARLY,
];

/**
 * One-time purchase product IDs
 */
export const CONSUMABLE_IDS = [IAP_PRODUCTS.PRO_LOCAL];

/**
 * Map product ID to plan type
 */
export function getProductIdForPlan(plan: 'pro_local' | 'pro_cloud'): string {
  if (plan === 'pro_local') {
    return IAP_PRODUCTS.PRO_LOCAL;
  }
  // Default to monthly for cloud
  return IAP_PRODUCTS.PRO_CLOUD_MONTHLY;
}

/**
 * Map product ID to plan type
 */
export function getPlanTypeFromProductId(productId: string): 'pro_local' | 'pro_cloud' | null {
  if (productId === IAP_PRODUCTS.PRO_LOCAL) {
    return 'pro_local';
  }
  if (
    productId === IAP_PRODUCTS.PRO_CLOUD_MONTHLY ||
    productId === IAP_PRODUCTS.PRO_CLOUD_YEARLY
  ) {
    return 'pro_cloud';
  }
  return null;
}
