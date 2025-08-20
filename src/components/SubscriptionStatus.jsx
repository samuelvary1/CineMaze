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
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Loading...</Text>
      </View>
    );
  }

  const isPremium =
    subscriptionInfo.tier === SUBSCRIPTION_TIERS.PREMIUM && subscriptionInfo.isActive;

  return (
    <View style={[styles.statusBar, isPremium ? styles.premiumBar : styles.freeBar]}>
      <View style={styles.statusContent}>
        <Text style={styles.tierText}>{isPremium ? '✨ Premium' : '🆓 Free'}</Text>
        <Text style={styles.playsText}>
          {isPremium ? 'Unlimited plays' : `${subscriptionInfo.playsRemaining} plays remaining`}
        </Text>
        {isPremium && subscriptionInfo.expiryDate && (
          <Text style={styles.expiryText}>
            Until {formatExpiryDate(subscriptionInfo.expiryDate)}
          </Text>
        )}
      </View>
      {!isPremium && onUpgrade && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  freeBar: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  premiumBar: {
    backgroundColor: '#fff8e1',
    borderColor: '#4ECDC4',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tierText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#2c3e50',
  },
  playsText: {
    fontSize: 13,
    color: '#6c757d',
    marginRight: 8,
  },
  expiryText: {
    fontSize: 11,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SubscriptionStatus;
