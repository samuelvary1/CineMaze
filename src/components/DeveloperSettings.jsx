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

            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetDailyPlays}
            >
              <Text style={styles.actionButtonText}>🔄 Reset Daily Plays</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.simulateButton]}
              onPress={simulatePlayUsage}
            >
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
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#2c3e50',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#6c757d',
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#495057',
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  upgradeButton: {
    backgroundColor: '#28a745',
    shadowColor: '#28a745',
  },
  downgradeButton: {
    backgroundColor: '#fd7e14',
    shadowColor: '#fd7e14',
  },
  resetButton: {
    backgroundColor: '#6f42c1',
    shadowColor: '#6f42c1',
  },
  simulateButton: {
    backgroundColor: '#20c997',
    shadowColor: '#20c997',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    shadowColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default DeveloperSettings;
