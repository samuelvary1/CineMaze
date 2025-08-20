import SubscriptionService, {
  SUBSCRIPTION_TIERS,
  FEATURES,
} from '../src/services/SubscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('subscription tiers', () => {
    test('free user has limited plays', async () => {
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          tier: SUBSCRIPTION_TIERS.FREE,
          expiryDate: null,
        }),
      );

      const hasWatchlist = await SubscriptionService.hasFeature(FEATURES.WATCHLIST);

      expect(hasWatchlist).toBe(false);
    });

    test('premium user has unlimited access', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          tier: SUBSCRIPTION_TIERS.PREMIUM,
          expiryDate: futureDate.toISOString(),
        }),
      );

      const hasUnlimited = await SubscriptionService.hasFeature(FEATURES.UNLIMITED_PLAYS);
      const hasWatchlist = await SubscriptionService.hasFeature(FEATURES.WATCHLIST);

      expect(hasUnlimited).toBe(true);
      expect(hasWatchlist).toBe(true);
    });

    test('expired premium subscription reverts to free', async () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          tier: SUBSCRIPTION_TIERS.PREMIUM,
          expiryDate: pastDate.toISOString(),
        }),
      );

      const isActive = await SubscriptionService.isSubscriptionActive();
      expect(isActive).toBe(false);
    });
  });

  describe('daily plays', () => {
    test('tracks daily play count correctly', async () => {
      AsyncStorage.getItem.mockResolvedValue('0');

      await SubscriptionService.incrementDailyPlays();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(expect.stringContaining('dailyPlays'), '1');
    });

    test('calculates remaining plays for free users', async () => {
      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({ tier: SUBSCRIPTION_TIERS.FREE }))
        .mockResolvedValueOnce('0'); // dailyPlays count

      const remaining = await SubscriptionService.getPlaysRemaining();
      expect(remaining).toBe(1);
    });
  });
});
