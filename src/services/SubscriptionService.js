import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  getAvailablePurchases,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
};

// Feature flags based on subscription
export const FEATURES = {
  UNLIMITED_PLAYS: 'unlimited_plays',
  WATCHLIST: 'watchlist',
};

// Product IDs for App Store and Google Play
const SUBSCRIPTION_SKUS = {
  MONTHLY: Platform.OS === 'ios' ? 'com.cinemaze.premium.monthly' : 'premium_monthly',
};

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTION_TIER: 'subscription_tier',
  LAST_PLAY_DATE: 'last_play_date',
  DAILY_PLAYS_COUNT: 'daily_plays_count',
  SUBSCRIPTION_EXPIRY: 'subscription_expiry',
  LAST_RECEIPT_CHECK: 'last_receipt_check',
  PURCHASE_RECEIPT: 'purchase_receipt',
};

class SubscriptionService {
  constructor() {
    this.initialized = false;
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
  }

  // Initialize IAP connection
  async initializeIAP() {
    if (this.initialized) {
      return;
    }

    try {
      await initConnection();
      this.initialized = true;

      // Set up purchase listeners
      this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
        console.log('Purchase updated:', purchase);
        const receipt = purchase.transactionReceipt;

        if (receipt) {
          // Validate receipt with app store
          const isValid = await this.validateReceipt(receipt, purchase);

          if (isValid) {
            // Grant premium access
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month
            await this.setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM, expiryDate);
            await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_RECEIPT, receipt);

            Alert.alert('🎉 Success!', 'Premium subscription activated!');
          } else {
            Alert.alert('⚠️ Error', 'Failed to validate purchase. Please contact support.');
          }
        }

        // Acknowledge the purchase
        await finishTransaction(purchase);
      });

      this.purchaseErrorSubscription = purchaseErrorListener((error) => {
        console.error('Purchase error:', error);
        Alert.alert(
          '⚠️ Purchase Failed',
          error.message || 'Something went wrong with your purchase.',
        );
      });

      console.log('IAP initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      // Fallback to simulated mode if IAP fails
      this.initialized = false;
    }
  }

  // Cleanup IAP connection
  async cleanup() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }

    if (this.initialized) {
      await endConnection();
      this.initialized = false;
    }
  }

  // Validate receipt with app store
  async validateReceipt(receipt, purchase) {
    try {
      if (Platform.OS === 'ios') {
        // For production, you'd validate with your server or Apple's validation endpoint
        // For now, we'll do basic validation
        return receipt && receipt.length > 0;
      } else {
        // Android validation would go here
        return receipt && receipt.length > 0;
      }
    } catch (error) {
      console.error('Receipt validation error:', error);
      return false;
    }
  }

  // Get available subscription products
  async getProducts() {
    try {
      if (!this.initialized) {
        await this.initializeIAP();
      }

      if (this.initialized) {
        const products = await getSubscriptions([SUBSCRIPTION_SKUS.MONTHLY]);
        return products;
      } else {
        // Return mock product for testing
        return [
          {
            productId: SUBSCRIPTION_SKUS.MONTHLY,
            price: '$0.99',
            currency: 'USD',
            title: 'CineMaze Premium Monthly',
            description: 'Unlimited plays and watchlist access',
          },
        ];
      }
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // Restore purchases for existing subscribers
  async restorePurchases() {
    try {
      if (!this.initialized) {
        await this.initializeIAP();
      }

      if (this.initialized) {
        const purchases = await getAvailablePurchases();

        for (const purchase of purchases) {
          if (purchase.productId === SUBSCRIPTION_SKUS.MONTHLY) {
            const isValid = await this.validateReceipt(purchase.transactionReceipt, purchase);
            if (isValid) {
              // Check if subscription is still active
              const expiryDate = new Date(purchase.transactionDate);
              expiryDate.setMonth(expiryDate.getMonth() + 1);

              if (new Date() < expiryDate) {
                await this.setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM, expiryDate);
                return { success: true, restored: true };
              }
            }
          }
        }
      }

      return { success: true, restored: false };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { success: false, error: error.message };
    }
  }

  // Purchase subscription - UPDATED for real IAP
  async purchaseSubscription() {
    try {
      if (!this.initialized) {
        await this.initializeIAP();
      }

      if (this.initialized) {
        // Request subscription from app store
        await requestSubscription(SUBSCRIPTION_SKUS.MONTHLY);
        // Note: The actual purchase completion is handled by the purchase listener
        return { success: true, processing: true };
      } else {
        // Fallback to simulated purchase for development/testing
        console.log('IAP not available, using simulated purchase');
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        await this.setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM, expiryDate);
        return { success: true, expiryDate, simulated: true };
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Check subscription status with periodic receipt validation
  async checkSubscriptionStatus() {
    try {
      const lastCheck = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RECEIPT_CHECK);
      const now = new Date();
      const lastCheckDate = lastCheck ? new Date(lastCheck) : null;

      // Only check receipt every 24 hours to avoid excessive API calls
      if (!lastCheckDate || now - lastCheckDate > 24 * 60 * 60 * 1000) {
        await this.validateStoredReceipt();
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RECEIPT_CHECK, now.toISOString());
      }

      return await this.isSubscriptionActive();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Validate stored receipt to ensure subscription is still active
  async validateStoredReceipt() {
    try {
      const receipt = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_RECEIPT);
      if (!receipt) {
        return;
      }

      // In a real app, you'd validate this with your server or app store
      // For now, we'll check the local expiry date
      return await this.isSubscriptionActive();
    } catch (error) {
      console.error('Error validating stored receipt:', error);
      return false;
    }
  }

  // Get current subscription tier
  async getSubscriptionTier() {
    try {
      const tier = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TIER);
      return tier || SUBSCRIPTION_TIERS.FREE;
    } catch (error) {
      console.error('Error getting subscription tier:', error);
      return SUBSCRIPTION_TIERS.FREE;
    }
  }

  // Set subscription tier
  async setSubscriptionTier(tier, expiryDate = null) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TIER, tier);
      if (expiryDate) {
        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY, expiryDate.toISOString());
      }
    } catch (error) {
      console.error('Error setting subscription tier:', error);
    }
  }

  // Check if subscription is active and not expired
  async isSubscriptionActive() {
    try {
      const tier = await this.getSubscriptionTier();
      if (tier === SUBSCRIPTION_TIERS.FREE) {
        return false;
      }

      const expiryString = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY);
      if (!expiryString) {
        return false;
      }

      const expiryDate = new Date(expiryString);
      const now = new Date();

      if (now > expiryDate) {
        // Subscription expired, downgrade to free
        await this.setSubscriptionTier(SUBSCRIPTION_TIERS.FREE);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Check if user has feature access
  async hasFeature(feature) {
    const isActive = await this.isSubscriptionActive();

    switch (feature) {
      case FEATURES.UNLIMITED_PLAYS:
        return isActive;
      case FEATURES.WATCHLIST:
        return isActive;
      default:
        return false;
    }
  }

  // Get daily plays count
  async getDailyPlaysCount() {
    try {
      const today = new Date().toDateString();
      const lastPlayDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAY_DATE);
      const playsCount = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PLAYS_COUNT);

      // Reset count if it's a new day
      if (lastPlayDate !== today) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_PLAY_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PLAYS_COUNT, '0');
        return 0;
      }

      return parseInt(playsCount || '0', 10);
    } catch (error) {
      console.error('Error getting daily plays count:', error);
      return 0;
    }
  }

  // Increment daily plays count
  async incrementDailyPlays() {
    try {
      const currentCount = await this.getDailyPlaysCount();
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PLAYS_COUNT, newCount.toString());
      return newCount;
    } catch (error) {
      console.error('Error incrementing daily plays:', error);
      return 0;
    }
  }

  // Check if user can play (either premium or has free plays left)
  async canPlay() {
    const hasUnlimitedPlays = await this.hasFeature(FEATURES.UNLIMITED_PLAYS);
    if (hasUnlimitedPlays) {
      return true;
    }

    const dailyPlays = await this.getDailyPlaysCount();
    return dailyPlays < 1; // Free users get 1 play per day
  }

  // Get plays remaining for free users
  async getPlaysRemaining() {
    const hasUnlimitedPlays = await this.hasFeature(FEATURES.UNLIMITED_PLAYS);
    if (hasUnlimitedPlays) {
      return 'Unlimited';
    }

    const dailyPlays = await this.getDailyPlaysCount();
    return Math.max(0, 1 - dailyPlays);
  }

  // Get subscription status info
  async getSubscriptionInfo() {
    try {
      const tier = await this.getSubscriptionTier();
      const isActive = await this.isSubscriptionActive();
      const playsRemaining = await this.getPlaysRemaining();
      const canPlay = await this.canPlay();

      let expiryDate = null;
      if (isActive) {
        const expiryString = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY);
        expiryDate = expiryString ? new Date(expiryString) : null;
      }

      return {
        tier,
        isActive,
        playsRemaining,
        canPlay,
        expiryDate,
        hasWatchlist: await this.hasFeature(FEATURES.WATCHLIST),
        hasUnlimitedPlays: await this.hasFeature(FEATURES.UNLIMITED_PLAYS),
      };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return {
        tier: SUBSCRIPTION_TIERS.FREE,
        isActive: false,
        playsRemaining: 0,
        canPlay: false,
        expiryDate: null,
        hasWatchlist: false,
        hasUnlimitedPlays: false,
      };
    }
  }
}

export default new SubscriptionService();
