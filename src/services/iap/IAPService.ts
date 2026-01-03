import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  restorePurchases as restorePurchasesIAP,
  type ProductOrSubscription,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';
import { ALL_PRODUCT_IDS, SUBSCRIPTION_IDS, CONSUMABLE_IDS } from '@/constants/iap';

type PurchaseCallback = (purchase: Purchase) => void;
type ErrorCallback = (error: PurchaseError) => void;

class IAPServiceClass {
  private isInitialized = false;
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private onPurchaseSuccess: PurchaseCallback | null = null;
  private onPurchaseError: ErrorCallback | null = null;

  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('IAP already initialized');
      return;
    }

    try {
      console.log('Initializing IAP connection...');
      await initConnection();
      this.isInitialized = true;
      console.log('IAP connection initialized successfully');

      // Set up purchase listeners
      this.setupListeners();
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw error;
    }
  }

  /**
   * Clean up IAP connection
   */
  async cleanup(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Remove listeners
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      // End connection
      await endConnection();
      this.isInitialized = false;
      console.log('IAP connection cleaned up');
    } catch (error) {
      console.error('Failed to cleanup IAP:', error);
    }
  }

  /**
   * Set up purchase event listeners
   */
  private setupListeners(): void {
    // Purchase update listener
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        console.log('Purchase updated:', purchase);

        try {
          // Acknowledge purchase
          await finishTransaction({ purchase, isConsumable: false });
          console.log('Purchase finished successfully');

          // Call success callback
          if (this.onPurchaseSuccess) {
            this.onPurchaseSuccess(purchase);
          }
        } catch (error) {
          console.error('Failed to finish transaction:', error);
        }
      }
    );

    // Purchase error listener
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.warn('Purchase error:', error);

        // Call error callback
        if (this.onPurchaseError) {
          this.onPurchaseError(error);
        }
      }
    );
  }

  /**
   * Get available products
   */
  async getAvailableProducts(): Promise<{
    products: ProductOrSubscription[];
    subscriptions: ProductOrSubscription[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Fetch all products
      const allProducts = await fetchProducts({ skus: ALL_PRODUCT_IDS });

      // Handle null result
      if (!allProducts) {
        console.warn('No products returned from fetchProducts');
        return { products: [], subscriptions: [] };
      }

      // Separate products and subscriptions
      const products = allProducts.filter(p => p.type === 'in-app');
      const subscriptions = allProducts.filter(p => p.type === 'subs');

      console.log('Available products:', products);
      console.log('Available subscriptions:', subscriptions);

      return { products, subscriptions };
    } catch (error) {
      console.error('Failed to get products:', error);
      return { products: [], subscriptions: [] };
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(
    productId: string,
    onSuccess: PurchaseCallback,
    onError: ErrorCallback
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Set callbacks
    this.onPurchaseSuccess = onSuccess;
    this.onPurchaseError = onError;

    try {
      console.log('Requesting purchase for:', productId);

      // Request purchase (works for both in-app and subscriptions in v14+)
      const isSubscription = SUBSCRIPTION_IDS.includes(productId);
      await requestPurchase({
        type: isSubscription ? 'subs' : 'in-app',
        request: Platform.OS === 'ios'
          ? { apple: { sku: productId } }
          : { google: { skus: [productId] } }
      });
    } catch (error) {
      console.error('Purchase request failed:', error);
      onError(error as PurchaseError);
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<Purchase[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Restoring purchases...');

      // Use the new restorePurchases API
      const purchases = await restorePurchasesIAP();

      console.log('Restored purchases:', purchases);
      return Array.isArray(purchases) ? purchases : [];
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  /**
   * Check if user has active purchase for a product
   */
  async hasPurchased(productId: string): Promise<boolean> {
    try {
      const purchases = await this.restorePurchases();
      return purchases.some(p => p.productId === productId);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const IAPService = new IAPServiceClass();
