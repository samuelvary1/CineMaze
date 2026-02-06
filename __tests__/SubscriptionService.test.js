import SubscriptionService, {
  SUBSCRIPTION_TIERS,
  FEATURES,
} from '../src/services/SubscriptionService';

describe('SubscriptionService', () => {
  describe('all features are free', () => {
    test('all features are always available', async () => {
      const hasWatchlist = await SubscriptionService.hasFeature(FEATURES.WATCHLIST);
      const hasUnlimited = await SubscriptionService.hasFeature(FEATURES.UNLIMITED_PLAYS);

      expect(hasWatchlist).toBe(true);
      expect(hasUnlimited).toBe(true);
    });

    test('subscription is always active', async () => {
      const isActive = await SubscriptionService.isSubscriptionActive();
      expect(isActive).toBe(true);
    });

    test('user can always play', async () => {
      const canPlay = await SubscriptionService.canPlay();
      expect(canPlay).toBe(true);
    });

    test('plays remaining is always Unlimited', async () => {
      const remaining = await SubscriptionService.getPlaysRemaining();
      expect(remaining).toBe('Unlimited');
    });

    test('subscription info shows all features unlocked', async () => {
      const info = await SubscriptionService.getSubscriptionInfo();
      expect(info.tier).toBe(SUBSCRIPTION_TIERS.PREMIUM);
      expect(info.isActive).toBe(true);
      expect(info.canPlay).toBe(true);
      expect(info.hasWatchlist).toBe(true);
      expect(info.hasUnlimitedPlays).toBe(true);
    });
  });
});
