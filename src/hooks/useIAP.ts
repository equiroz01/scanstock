import { useState, useEffect, useCallback } from 'react';
import { usePlanStore } from '@/stores/usePlanStore';
import { IAP_PRODUCTS, getPlanTypeFromProductId } from '@/constants/iap';
import type { PlanType } from '@/types/settings';

interface MockProduct {
  id: string;
  title: string;
  description: string;
  displayPrice: string;
}

interface UseIAPReturn {
  products: MockProduct[];
  subscriptions: MockProduct[];
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | null;
  purchase: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  getProductById: (productId: string) => MockProduct | null;
}

// Mock products for development/Expo Go
const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: IAP_PRODUCTS.PRO_LOCAL,
    title: 'Pro Local',
    description: 'Backup and export features',
    displayPrice: '$1.99',
  },
];

const MOCK_SUBSCRIPTIONS: MockProduct[] = [
  {
    id: IAP_PRODUCTS.PRO_CLOUD_MONTHLY,
    title: 'Pro Cloud Monthly',
    description: 'Cloud backup and sync',
    displayPrice: '$0.99/month',
  },
  {
    id: IAP_PRODUCTS.PRO_CLOUD_YEARLY,
    title: 'Pro Cloud Yearly',
    description: 'Cloud backup and sync (save 17%)',
    displayPrice: '$9.99/year',
  },
];

export function useIAP(): UseIAPReturn {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [subscriptions, setSubscriptions] = useState<MockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setPlan } = usePlanStore();

  // Initialize with mock products
  useEffect(() => {
    const initIAP = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setProducts(MOCK_PRODUCTS);
        setSubscriptions(MOCK_SUBSCRIPTIONS);
      } catch (err) {
        console.error('Failed to initialize IAP:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    initIAP();
  }, []);

  /**
   * Purchase a product (mock implementation)
   */
  const purchase = useCallback(
    async (productId: string) => {
      try {
        setIsPurchasing(true);
        setError(null);

        // Simulate purchase delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update plan based on product ID
        const planType = getPlanTypeFromProductId(productId);
        if (planType) {
          setPlan(planType);
          console.log(`Mock purchase successful: ${planType}`);
        }
      } catch (err) {
        console.error('Purchase failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete purchase');
      } finally {
        setIsPurchasing(false);
      }
    },
    [setPlan]
  );

  /**
   * Restore previous purchases (mock implementation)
   */
  const restorePurchases = useCallback(async () => {
    try {
      setIsRestoring(true);
      setError(null);

      // Simulate restore delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In mock mode, we don't have real purchases to restore
      console.log('Mock restore complete - no purchases found');
    } catch (err) {
      console.error('Failed to restore purchases:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  }, []);

  /**
   * Get product by ID
   */
  const getProductById = useCallback(
    (productId: string): MockProduct | null => {
      const product = products.find(p => p.id === productId);
      if (product) return product;

      const subscription = subscriptions.find(s => s.id === productId);
      if (subscription) return subscription;

      return null;
    },
    [products, subscriptions]
  );

  return {
    products,
    subscriptions,
    isLoading,
    isPurchasing,
    isRestoring,
    error,
    purchase,
    restorePurchases,
    getProductById,
  };
}
