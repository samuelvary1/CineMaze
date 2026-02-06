import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import PlayerStats from '../components/PlayerStats';

const AccountOverviewScreen = ({ navigation }) => {
  const [showPlayerStats, setShowPlayerStats] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>CineMaze</Text>
            <View style={styles.logoAccent} />
          </View>
          <Text style={styles.tagline}>Discover Movies and Actors Through Play</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>🎮 Back</Text>
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

      {/* Play Section */}
      <Text style={styles.sectionTitle}>Play</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('RandomMoviesScreen')}
        >
          <Text style={styles.gridButtonEmoji}>🎯</Text>
          <Text style={styles.gridButtonLabel}>New Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('DailyChallengeScreen')}
        >
          <Text style={styles.gridButtonEmoji}>🗓️</Text>
          <Text style={styles.gridButtonLabel}>Daily Challenge</Text>
        </TouchableOpacity>
      </View>

      {/* Collection Section */}
      <Text style={styles.sectionTitle}>Collection</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('WatchlistScreen')}
        >
          <Text style={styles.gridButtonEmoji}>📋</Text>
          <Text style={styles.gridButtonLabel}>Watchlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('FavoriteActorsScreen')}
        >
          <Text style={styles.gridButtonEmoji}>⭐</Text>
          <Text style={styles.gridButtonLabel}>Favorite Actors</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <Text style={styles.sectionTitle}>Progress</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('CompletedConnectionsScreen')}
        >
          <Text style={styles.gridButtonEmoji}>🧩</Text>
          <Text style={styles.gridButtonLabel}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('AchievementsScreen')}
        >
          <Text style={styles.gridButtonEmoji}>🏆</Text>
          <Text style={styles.gridButtonLabel}>Achievements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={() => setShowPlayerStats(true)}>
          <Text style={styles.gridButtonEmoji}>📊</Text>
          <Text style={styles.gridButtonLabel}>Player Stats</Text>
        </TouchableOpacity>
      </View>

      <PlayerStats visible={showPlayerStats} onClose={() => setShowPlayerStats(false)} />

      {/* TMDB Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </Text>
        <Text style={styles.attributionVersion}>CineMaze v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#B8DDF0',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 4,
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
    fontSize: 30,
    fontWeight: '900',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
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
    fontSize: 14,
    color: '#34495E',
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    opacity: 0.8,
    marginTop: 2,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(44, 62, 80, 0.1)',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  logoImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  appIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  appIcon: {
    width: 110,
    height: 110,
    borderRadius: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34495E',
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginTop: 14,
    marginBottom: 8,
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 10,
    marginBottom: 4,
  },
  gridButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '47%',
    flexGrow: 1,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(44, 62, 80, 0.08)',
  },
  gridButtonEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  attribution: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 62, 80, 0.1)',
    alignItems: 'center',
    width: '100%',
  },
  attributionText: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  attributionVersion: {
    fontSize: 11,
    color: '#95A5A6',
    marginTop: 6,
  },
});

export default AccountOverviewScreen;
