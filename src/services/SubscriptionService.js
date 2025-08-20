import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTION_TIER: 'subscription_tier',
  LAST_PLAY_DATE: 'last_play_date',
  DAILY_PLAYS_COUNT: 'daily_plays_count',
  SUBSCRIPTION_EXPIRY: 'subscription_expiry',
};

class SubscriptionService {
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

  // Simulate subscription purchase (in real app, this would integrate with app store)
  async purchaseSubscription() {
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

      await this.setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM, expiryDate);
      return { success: true, expiryDate };
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      return { success: false, error: error.message };
    }
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
