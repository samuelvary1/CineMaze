import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SubscriptionService, { FEATURES } from '../services/SubscriptionService';
import PaywallModal from '../components/PaywallModal';

const AccountOverviewScreen = ({ navigation }) => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const isActive = await SubscriptionService.isSubscriptionActive();
      const tier = await SubscriptionService.getSubscriptionTier();
      const devInfo = SubscriptionService.getDevelopmentInfo();

      setSubscriptionStatus({
        isActive,
        tier,
        developmentMode: devInfo.developmentMode,
        platform: devInfo.platform,
        productId: devInfo.productId,
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const checkPremiumAndNavigate = async (feature, screenName) => {
    try {
      const hasFeature = await SubscriptionService.hasFeature(feature);
      if (hasFeature) {
        navigation.navigate(screenName);
      } else {
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      navigation.navigate(screenName); // Fallback to allow navigation
    }
  };

  const handleWatchlistPress = () => {
    checkPremiumAndNavigate(FEATURES.WATCHLIST, 'WatchlistScreen');
  };

  const handleFavoriteActorsPress = () => {
    checkPremiumAndNavigate(FEATURES.UNLIMITED_PLAYS, 'FavoriteActorsScreen');
  };

  const handleSubscriptionSuccess = () => {
    setShowPaywall(false);
    checkSubscriptionStatus(); // Refresh status after subscription
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>CineMaze</Text>
            <View style={styles.logoAccent} />
          </View>
          <Text style={styles.tagline}>Discover Movies and Actors Through Play</Text>
        </View>
        <TouchableOpacity style={styles.backToGameButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backToGameText}>🎮 Back</Text>
        </TouchableOpacity>
      </View>

      {/* Subscription Status Indicator */}
      {subscriptionStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>
            {subscriptionStatus.developmentMode ? '🔧 Development Mode' : '🚀 Production Mode'}
          </Text>
          <Text style={styles.statusText}>
            Status: {subscriptionStatus.isActive ? '✅ Premium Active' : '❌ Free Tier'}
            {subscriptionStatus.developmentMode && subscriptionStatus.isActive
              ? ' (Simulated)'
              : ''}
          </Text>
          <Text style={styles.statusDetail}>
            Platform: {subscriptionStatus.platform} | Product: {subscriptionStatus.productId}
          </Text>
        </View>
      )}

      {/* App Logo */}
      <View style={styles.logoImageContainer}>
        <View style={styles.appIconContainer}>
          <Image
            source={require('../assets/images/app-icon.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>🎬 Account Overview</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RandomMoviesScreen')}
        >
          <Text style={styles.buttonText}>🎯 New Game</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleWatchlistPress}>
          <Text style={styles.buttonText}>📋 Watchlist</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleFavoriteActorsPress}>
          <Text style={styles.buttonText}>⭐ Favorite Actors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CompletedConnectionsScreen')}
        >
          <Text style={styles.buttonText}>🧩 Completed Games</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AchievementsScreen')}
        >
          <Text style={styles.buttonText}>🏆 Achievements</Text>
        </TouchableOpacity>
      </View>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscriptionSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Increased from 35 to move everything down
    backgroundColor: '#B8DDF0', // Powder blue background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 20, // Increased from 10 to move header down more
    marginBottom: 12, // Reduced from 16
  },
  logoContainer: {
    alignItems: 'flex-start',
    flex: 1,
  },
  logoTextContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: -0.8,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  tagline: {
    fontSize: 17,
    color: '#2C3E50',
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    opacity: 0.9,
    marginTop: 2,
  },
  backToGameButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backToGameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 8, // Reduced from 10
    padding: 10, // Reduced from 12
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  logoImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15, // Reduced from 30 to move icon up
    marginBottom: 8, // Reduced from 10
    paddingHorizontal: 20,
  },
  appIconContainer: {
    width: 160, // Reduced from 200 to save space
    height: 160, // Reduced from 200 to save space
    borderRadius: 28, // Adjusted proportionally
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  appIcon: {
    width: 145, // Reduced from 180
    height: 145, // Reduced from 180
    borderRadius: 25, // Adjusted proportionally
  },
  content: {
    flex: 1,
    padding: 12, // Reduced from 15
    paddingBottom: 25, // Add bottom padding to move buttons up from bottom
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22, // Reduced from 24 to save space
    fontWeight: 'bold',
    marginBottom: 18, // Reduced from 25
    textAlign: 'center',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12, // Reduced from 14
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 12, // Reduced from 15
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderTopColor: '#7EDDDD',
    borderLeftColor: '#7EDDDD',
    borderRightColor: '#3EBBBB',
    borderBottomColor: '#3EBBBB',
    // Rubber button appearance
    transform: [{ perspective: 1000 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AccountOverviewScreen;
