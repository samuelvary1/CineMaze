import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SubscriptionService, { FEATURES } from '../services/SubscriptionService';
import PaywallModal from '../components/PaywallModal';

const AccountOverviewScreen = ({ navigation }) => {
  const [showPaywall, setShowPaywall] = useState(false);

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
      </View>

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
        onSuccess={() => {
          setShowPaywall(false);
          // Could add success callback here if needed
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Reduced from 60
    backgroundColor: '#B8DDF0', // Powder blue background
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20, // Added top margin to move header down
    marginBottom: 16, // Reduced from 24
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: -0.5,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  logoImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30, // Added top margin to move icon down
    marginBottom: 20, // Keep bottom margin as before
    paddingHorizontal: 20,
  },
  appIconContainer: {
    width: 200,
    height: 200,
    borderRadius: 32,
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
    width: 180,
    height: 180,
    borderRadius: 30,
  },
  content: {
    flex: 1,
    padding: 15, // Reduced from 20
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25, // Reduced from 40
    textAlign: 'center',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14, // Reduced from 16
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 15, // Reduced from 20
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
