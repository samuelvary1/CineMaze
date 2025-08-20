import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SubscriptionService, { SUBSCRIPTION_TIERS } from '../services/SubscriptionService';

const SubscriptionStatus = ({ onUpgrade }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await SubscriptionService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Error loading subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (date) => {
    if (!date) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading || !subscriptionInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading subscription info...</Text>
      </View>
    );
  }

  const isPremium =
    subscriptionInfo.tier === SUBSCRIPTION_TIERS.PREMIUM && subscriptionInfo.isActive;

  return (
    <View style={styles.container}>
      <View style={[styles.statusCard, isPremium ? styles.premiumCard : styles.freeCard]}>
        <View style={styles.header}>
          <Text style={styles.tier}>{isPremium ? '✨ Premium' : '🆓 Free'}</Text>
          {isPremium && (
            <Text style={styles.expiry}>
              Expires: {formatExpiryDate(subscriptionInfo.expiryDate)}
            </Text>
          )}
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>Daily Plays:</Text>
            <Text style={[styles.featureValue, isPremium ? styles.unlimited : styles.limited]}>
              {subscriptionInfo.playsRemaining}
            </Text>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>Watchlist:</Text>
            <Text
              style={[
                styles.featureValue,
                subscriptionInfo.hasWatchlist ? styles.enabled : styles.disabled,
              ]}
            >
              {subscriptionInfo.hasWatchlist ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {!isPremium && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium - $0.99/month</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
  },
  freeCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  premiumCard: {
    backgroundColor: '#fff8e1',
    borderColor: '#4ECDC4',
  },
  header: {
    marginBottom: 15,
  },
  tier: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  expiry: {
    fontSize: 14,
    color: '#666',
  },
  features: {
    marginBottom: 15,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 16,
    color: '#333',
  },
  featureValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unlimited: {
    color: '#4ECDC4',
  },
  limited: {
    color: '#FF6B6B',
  },
  enabled: {
    color: '#28a745',
  },
  disabled: {
    color: '#6c757d',
  },
  upgradeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionStatus;
