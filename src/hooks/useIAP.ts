import { useState, useEffect, useCallback } from 'react';
import { type ProductOrSubscription, type Purchase, type PurchaseError } from 'react-native-iap';
import { IAPService } from '@/services/iap/IAPService';
import { usePlanStore } from '@/stores/usePlanStore';
import { getPlanTypeFromProductId } from '@/constants/iap';
import type { PlanType } from '@/types/settings';

interface UseIAPReturn {
  // State
  products: ProductOrSubscription[];
  subscriptions: ProductOrSubscription[];
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | null;

  // Actions
  purchase: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  getProductById: (productId: string) => ProductOrSubscription | null;
}

export function useIAP(): UseIAPReturn {
  const [products, setProducts] = useState<ProductOrSubscription[]>([]);
  const [subscriptions, setSubscriptions] = useState<ProductOrSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setPlan } = usePlanStore();

  // Initialize and load products
  useEffect(() => {
    let mounted = true;

    const initIAP = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize IAP
        await IAPService.initialize();

        if (!mounted) return;

        // Load available products
        const { products, subscriptions } = await IAPService.getAvailableProducts();

        if (!mounted) return;

        setProducts(products);
        setSubscriptions(subscriptions);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to initialize IAP:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initIAP();

    return () => {
      mounted = false;
      // Cleanup is handled by IAPService singleton
    };
  }, []);

  /**
   * Handle successful purchase
   */
  const handlePurchaseSuccess = useCallback(
    (purchase: Purchase) => {
      console.log('Purchase successful:', purchase);

      // Update plan based on product ID
      const planType = getPlanTypeFromProductId(purchase.productId);
      if (planType) {
        setPlan(planType);
      }

      setIsPurchasing(false);
      setError(null);
    },
    [setPlan]
  );

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((err: PurchaseError) => {
    console.error('Purchase error:', err);

    // User cancelled is not an error to show
    if (err.code && String(err.code).includes('USER_CANCELLED')) {
      setError(null);
    } else {
      setError(err.message || 'Purchase failed');
    }

    setIsPurchasing(false);
  }, []);

  /**
   * Purchase a product
   */
  const purchase = useCallback(
    async (productId: string) => {
      try {
        setIsPurchasing(true);
        setError(null);

        await IAPService.purchaseProduct(
          productId,
          handlePurchaseSuccess,
          handlePurchaseError
        );
      } catch (err) {
        console.error('Purchase initiation failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to start purchase');
        setIsPurchasing(false);
      }
    },
    [handlePurchaseSuccess, handlePurchaseError]
  );

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async () => {
    try {
      setIsRestoring(true);
      setError(null);

      const purchases = await IAPService.restorePurchases();

      // Find the highest tier purchase
      let highestPlan: PlanType = 'free';

      for (const purchase of purchases) {
        const planType = getPlanTypeFromProductId(purchase.productId);

        if (planType === 'pro_cloud') {
          highestPlan = 'pro_cloud';
          break; // Cloud is highest, stop searching
        } else if (planType === 'pro_local' && highestPlan === 'free') {
          highestPlan = 'pro_local';
        }
      }

      setPlan(highestPlan);

      if (highestPlan !== 'free') {
        console.log(`Restored plan: ${highestPlan}`);
      }
    } catch (err) {
      console.error('Failed to restore purchases:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  }, [setPlan]);

  /**
   * Get product by ID
   */
  const getProductById = useCallback(
    (productId: string): ProductOrSubscription | null => {
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
