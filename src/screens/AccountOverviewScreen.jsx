import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import PlayerStats from '../components/PlayerStats';

const AccountOverviewScreen = ({ navigation }) => {
  const [showPlayerStats, setShowPlayerStats] = useState(false);

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

      {/* App Logo */}
      <View style={styles.logoImageContainer}>
        <View style={styles.appIconContainer}>
          <Image
            source={require('../assets/images/app-icon-1024.png')}
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

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DailyChallengeScreen')}
        >
          <Text style={styles.buttonText}>🗓️ Daily Challenge</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('WatchlistScreen')}
        >
          <Text style={styles.buttonText}>📋 Watchlist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FavoriteActorsScreen')}
        >
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

        <TouchableOpacity style={styles.button} onPress={() => setShowPlayerStats(true)}>
          <Text style={styles.buttonText}>📊 Player Stats</Text>
        </TouchableOpacity>
      </View>

      <PlayerStats visible={showPlayerStats} onClose={() => setShowPlayerStats(false)} />
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
  logoImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5, // Reduced from 15 to move logo up more
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
    paddingBottom: 50, // Increased from 25 to add more space from bottom
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
    paddingVertical: 10, // Reduced from 12
    paddingHorizontal: 25, // Reduced from 30
    borderRadius: 18, // Slightly reduced from 20
    marginBottom: 10, // Reduced from 12
    width: '75%', // Reduced from 85%
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, // Reduced shadow for smaller buttons
    },
    shadowOpacity: 0.25, // Slightly reduced
    shadowRadius: 6, // Reduced from 8
    elevation: 6, // Reduced from 8
    borderWidth: 2, // Reduced from 3
    borderTopColor: '#7EDDDD',
    borderLeftColor: '#7EDDDD',
    borderRightColor: '#3EBBBB',
    borderBottomColor: '#3EBBBB',
    // Rubber button appearance
    transform: [{ perspective: 1000 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AccountOverviewScreen;
