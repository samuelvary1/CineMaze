import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import SubscriptionService, { SUBSCRIPTION_TIERS } from '../services/SubscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeveloperSettings = ({ visible, onClose, onSubscriptionChanged }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    if (visible) {
      loadSubscriptionInfo();
    }
  }, [visible]);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await SubscriptionService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const toggleSubscription = async () => {
    try {
      const currentTier = await SubscriptionService.getSubscriptionTier();

      if (currentTier === SUBSCRIPTION_TIERS.FREE) {
        // Upgrade to premium
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription
        await SubscriptionService.setSubscriptionTier(SUBSCRIPTION_TIERS.PREMIUM, expiryDate);
        Alert.alert('✅ Upgraded to Premium', 'You now have unlimited plays!');
      } else {
        // Downgrade to free
        await SubscriptionService.setSubscriptionTier(SUBSCRIPTION_TIERS.FREE);
        Alert.alert('⬇️ Downgraded to Free', 'You now have daily play limits.');
      }

      await loadSubscriptionInfo();
      if (onSubscriptionChanged) {
        onSubscriptionChanged();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle subscription');
    }
  };

  const resetDailyPlays = async () => {
    try {
      await AsyncStorage.setItem('daily_plays_count', '0');
      await AsyncStorage.setItem('last_play_date', new Date().toDateString());
      Alert.alert('✅ Daily Plays Reset', 'Play count has been reset to 0');
      await loadSubscriptionInfo();
      if (onSubscriptionChanged) {
        onSubscriptionChanged();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset daily plays');
    }
  };

  const simulatePlayUsage = async () => {
    try {
      const newCount = await SubscriptionService.incrementDailyPlays();
      Alert.alert('🎮 Play Simulated', `Daily plays used: ${newCount}`);
      await loadSubscriptionInfo();
      if (onSubscriptionChanged) {
        onSubscriptionChanged();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to simulate play');
    }
  };

  const clearAllData = async () => {
    Alert.alert('Clear All Data', 'This will reset all subscription and play data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              'subscription_tier',
              'last_play_date',
              'daily_plays_count',
              'subscription_expiry',
              'watchlist',
            ]);
            Alert.alert('✅ Data Cleared', 'All app data has been reset');
            await loadSubscriptionInfo();
            if (onSubscriptionChanged) {
              onSubscriptionChanged();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to clear data');
          }
        },
      },
    ]);
  };

  const isPremium =
    subscriptionInfo?.tier === SUBSCRIPTION_TIERS.PREMIUM && subscriptionInfo?.isActive;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🔧 Developer Settings</Text>

          {subscriptionInfo && (
            <View style={styles.statusSection}>
              <Text style={styles.statusTitle}>Current Status:</Text>
              <Text style={styles.statusText}>
                Tier: <Text style={styles.statusValue}>{subscriptionInfo.tier}</Text>
              </Text>
              <Text style={styles.statusText}>
                Active:{' '}
                <Text style={styles.statusValue}>{subscriptionInfo.isActive ? 'Yes' : 'No'}</Text>
              </Text>
              <Text style={styles.statusText}>
                Plays Remaining:{' '}
                <Text style={styles.statusValue}>{subscriptionInfo.playsRemaining}</Text>
              </Text>
              <Text style={styles.statusText}>
                Can Play:{' '}
                <Text style={styles.statusValue}>{subscriptionInfo.canPlay ? 'Yes' : 'No'}</Text>
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isPremium ? styles.downgradeButton : styles.upgradeButton,
              ]}
              onPress={toggleSubscription}
            >
              <Text style={styles.actionButtonText}>
                {isPremium ? '⬇️ Switch to Free' : '⬆️ Switch to Premium'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={resetDailyPlays}>
              <Text style={styles.actionButtonText}>🔄 Reset Daily Plays</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={simulatePlayUsage}>
              <Text style={styles.actionButtonText}>🎮 Simulate Play Usage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={clearAllData}
            >
              <Text style={styles.actionButtonText}>🗑️ Clear All Data</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#34C759',
  },
  downgradeButton: {
    backgroundColor: '#FF9500',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#8E8E93',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeveloperSettings;
