import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Subscription tiers - kept for API compatibility but everything is free
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
};

// Feature flags - all features are now free
export const FEATURES = {
  UNLIMITED_PLAYS: 'unlimited_plays',
  WATCHLIST: 'watchlist',
};

// Storage keys
const STORAGE_KEYS = {
  LAST_PLAY_DATE: 'last_play_date',
  DAILY_PLAYS_COUNT: 'daily_plays_count',
};

class SubscriptionService {
  constructor() {
    this.initialized = true;
  }

  // No-op - IAP no longer needed
  async initializeIAP() {
    this.initialized = true;
  }

  // No-op cleanup
  async cleanup() {}

  // All features are always available
  async hasFeature(_feature) {
    return true;
  }

  // Always returns premium since everything is free
  async getSubscriptionTier() {
    return SUBSCRIPTION_TIERS.PREMIUM;
  }

  // No-op
  async setSubscriptionTier() {}

  // Always active
  async isSubscriptionActive() {
    return true;
  }

  // Always can play
  async canPlay() {
    return true;
  }

  // Always unlimited
  async getPlaysRemaining() {
    return 'Unlimited';
  }

  // Get daily plays count (kept for stats tracking)
  async getDailyPlaysCount() {
    try {
      const today = new Date().toDateString();
      const lastPlayDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAY_DATE);
      const playsCount = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PLAYS_COUNT);

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

  // Increment daily plays count (kept for stats tracking)
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

  // Get subscription status info - everything is free and unlocked
  async getSubscriptionInfo() {
    return {
      tier: SUBSCRIPTION_TIERS.PREMIUM,
      isActive: true,
      playsRemaining: 'Unlimited',
      canPlay: true,
      expiryDate: null,
      hasWatchlist: true,
      hasUnlimitedPlays: true,
    };
  }

  // Get development status info
  getDevelopmentInfo() {
    return {
      developmentMode: __DEV__,
      platform: Platform.OS,
      productId: 'N/A (free app)',
      message: 'All features are free and unlocked.',
    };
  }

  // No-op stubs for backward compatibility
  async checkSubscriptionStatus() {
    return true;
  }

  async getProducts() {
    return [];
  }

  async restorePurchases() {
    return { success: true, restored: false };
  }

  async purchaseSubscription() {
    return { success: true };
  }
}

export default new SubscriptionService();
