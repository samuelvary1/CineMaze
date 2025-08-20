import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import SubscriptionService from '../services/SubscriptionService';

const PaywallModal = ({ visible, onClose, onSubscribe, playsRemaining }) => {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await SubscriptionService.purchaseSubscription();
      if (result.success) {
        if (result.processing) {
          Alert.alert(
            '🕐 Processing',
            'Your purchase is being processed. This may take a moment.',
            [{ text: 'OK' }],
          );
        } else if (result.simulated) {
          Alert.alert(
            '🎉 Welcome to Premium!',
            'You now have unlimited plays and access to the watchlist feature! (Simulated)',
            [{ text: 'Great!', onPress: onSubscribe }],
          );
        } else {
          Alert.alert(
            '🎉 Welcome to Premium!',
            'You now have unlimited plays and access to the watchlist feature!',
            [{ text: 'Great!', onPress: onSubscribe }],
          );
        }
      } else if (result.cancelled) {
        // User cancelled, don't show error message
        console.log('Purchase cancelled by user');
      } else {
        Alert.alert('Purchase Failed', result.error || 'Please try again later.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const result = await SubscriptionService.restorePurchases();
      if (result.success && result.restored) {
        Alert.alert('✅ Purchases Restored!', 'Your premium subscription has been restored!', [
          { text: 'Great!', onPress: onSubscribe },
        ]);
      } else if (result.success && !result.restored) {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      } else {
        Alert.alert('Restore Failed', result.error || 'Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🎬 Upgrade to Premium!</Text>

          <View style={styles.currentStatus}>
            <Text style={styles.statusText}>
              Daily plays remaining: <Text style={styles.playsCount}>{playsRemaining}</Text>
            </Text>
          </View>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Premium Features:</Text>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureText}>Unlimited daily plays</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📋</Text>
              <Text style={styles.featureText}>Save movies to watchlist</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>No daily restrictions</Text>
            </View>
          </View>

          <View style={styles.pricing}>
            <Text style={styles.price}>$0.99/month</Text>
            <Text style={styles.priceSubtext}>Cancel anytime</Text>
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, loading && styles.disabledButton]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.restoreButton, restoring && styles.disabledButton]}
            onPress={handleRestorePurchases}
            disabled={restoring}
          >
            {restoring ? (
              <ActivityIndicator color="#4ECDC4" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Subscriptions managed through your App Store/Play Store account
          </Text>
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
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  currentStatus: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  playsCount: {
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  features: {
    width: '100%',
    marginBottom: 25,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 25,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 5,
  },
  priceSubtext: {
    fontSize: 14,
    color: '#888',
  },
  subscribeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restoreButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default PaywallModal;
