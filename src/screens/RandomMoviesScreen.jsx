import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY } from '@env';
import MoviesContainer from '../components/MoviesContainer';
import PaywallModal from '../components/PaywallModal';
import SubscriptionStatus from '../components/SubscriptionStatus';
import DeveloperSettings from '../components/DeveloperSettings';
import PlayerStats from '../components/PlayerStats';
import SubscriptionService, { FEATURES } from '../services/SubscriptionService';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const fetchMovieWithActors = async () => {
  try {
    const page = Math.floor(Math.random() * 20) + 1; // Reduced from 50 to 20 for better quality
    const discoverRes = await fetch(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}&with_original_language=en&vote_count.gte=100&vote_average.gte=5.0&certification_country=US&certification.lte=R&include_adult=false`,
    );

    const discoverData = await discoverRes.json();

    // Additional filtering for quality and appropriateness
    const movies = discoverData.results.filter((m) => {
      // Must have poster
      if (!m.poster_path) {
        return false;
      }

      // Filter out adult content
      if (m.adult) {
        return false;
      }

      // Must have reasonable vote count (popular enough)
      if (m.vote_count < 50) {
        return false;
      }

      // Must have decent rating
      if (m.vote_average < 4.5) {
        return false;
      }

      // Filter out genres that might contain inappropriate content
      // Genre IDs: 99=Documentary, 10770=TV Movie might have questionable content
      const badGenreIds = [10770]; // TV Movies often have lower quality
      if (m.genre_ids && m.genre_ids.some((id) => badGenreIds.includes(id))) {
        return false;
      }

      // Filter out movies with suspicious keywords in title
      const suspiciousKeywords = [
        'xxx',
        'sex',
        'porn',
        'erotic',
        'nude',
        'naked',
        'seduction',
        'temptation',
        'desire',
        'lust',
        'passion',
        'intimate',
        'sensual',
      ];
      const title = m.title.toLowerCase();
      if (suspiciousKeywords.some((keyword) => title.includes(keyword))) {
        return false;
      }

      // Filter out very old movies (before 1970) as they might have quality issues
      if (m.release_date && new Date(m.release_date).getFullYear() < 1970) {
        return false;
      }

      return true;
    });

    if (movies.length === 0) {
      throw new Error('No suitable movies found');
    }

    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    const creditsRes = await fetch(
      `${BASE_URL}/movie/${randomMovie.id}/credits?api_key=${TMDB_API_KEY}`,
    );
    const credits = await creditsRes.json();

    const topActors = Array.isArray(credits.cast)
      ? credits.cast.slice(0, 10).map((actor) => ({
          id: actor.id,
          name: actor.name,
          profilePath: actor.profile_path,
        }))
      : [];

    return {
      id: randomMovie.id,
      title: randomMovie.title,
      posterPath: randomMovie.poster_path
        ? IMAGE_BASE + randomMovie.poster_path
        : PLACEHOLDER_IMAGE,
      actors: topActors,
    };
  } catch (err) {
    console.warn('Fetch failed:', err.message);
    return null;
  }
};

const RandomMoviesScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDeveloperSettings, setShowDeveloperSettings] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AccountOverviewScreen')}
          style={styles.headerRightButton}
        >
          <Text style={styles.headerRightText}>👤</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Load subscription info on component mount
  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await SubscriptionService.getSubscriptionInfo();
      console.log('Subscription info:', info);
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const fetchTwoMovies = async () => {
    setLoading(true);
    let mA = null;
    let mB = null;
    let tries = 0;
    while ((!mA || !mB || mA.id === mB.id) && tries < 5) {
      mA = await fetchMovieWithActors();
      mB = await fetchMovieWithActors();
      tries++;
    }

    if (!mA || !mB) {
      Alert.alert('Error', 'Could not load movies. Please try again.');
      setLoading(false);
      return;
    }

    setMovies([mA, mB]);
    setInitialLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchTwoMovies();
  }, []);

  const addToWatchlist = async (movie) => {
    try {
      // Check if user has watchlist feature
      const hasWatchlist = await SubscriptionService.hasFeature(FEATURES.WATCHLIST);
      if (!hasWatchlist) {
        Alert.alert(
          '🔒 Premium Feature',
          'Watchlist is available with Premium subscription. Upgrade to save your favorite movies!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => setShowPaywall(true) },
          ],
        );
        return;
      }

      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const exists = current.find((m) => m.id === movie.id);
      if (!exists) {
        const updated = [...current, movie];
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        Alert.alert('✅ Added to Watchlist', movie.title);
      } else {
        Alert.alert('ℹ️ Already in Watchlist', movie.title);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update watchlist.');
    }
  };

  const handleStartGame = async () => {
    try {
      // Check if user can play
      const canPlay = await SubscriptionService.canPlay();
      if (!canPlay) {
        setShowPaywall(true);
        return;
      }

      // Increment play count for free users
      const hasUnlimitedPlays = await SubscriptionService.hasFeature(FEATURES.UNLIMITED_PLAYS);
      if (!hasUnlimitedPlays) {
        await SubscriptionService.incrementDailyPlays();
      }

      // Navigate to game
      navigation.navigate('GameScreen', {
        movieA: movies[0],
        movieB: movies[1],
      });
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const handleSubscriptionSuccess = async () => {
    setShowPaywall(false);
    await loadSubscriptionInfo();
    Alert.alert('🎉 Welcome to Premium!', 'You can now start the game!');
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 CineMaze</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowPlayerStats(true)}>
            <Text style={styles.headerButtonText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowDeveloperSettings(true)}
          >
            <Text style={styles.headerButtonText}>🔧</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SubscriptionStatus />

      <MoviesContainer movies={movies} onAddToWatchlist={addToWatchlist} isLoading={loading} />

      <TouchableOpacity style={styles.shuffleButton} onPress={fetchTwoMovies}>
        <Text style={styles.shuffleButtonText}>🎲 Shuffle Movies</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.startGameButton, movies.length !== 2 && styles.disabledButton]}
        onPress={handleStartGame}
        disabled={movies.length !== 2}
      >
        <Text
          style={[styles.startGameButtonText, movies.length !== 2 && styles.disabledButtonText]}
        >
          🎯 Start Game with this Pair
        </Text>
      </TouchableOpacity>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscriptionSuccess}
      />

      <DeveloperSettings
        visible={showDeveloperSettings}
        onClose={() => setShowDeveloperSettings(false)}
        onSubscriptionChanged={loadSubscriptionInfo}
      />

      <PlayerStats visible={showPlayerStats} onClose={() => setShowPlayerStats(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerButtonText: {
    fontSize: 20,
  },
  shuffleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#FF6B6B',
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
  shuffleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  startGameButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
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
  startGameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButtonText: {
    color: '#999',
  },
  headerRightButton: {
    marginRight: 15,
  },
  headerRightText: {
    fontSize: 18,
  },
  loadingText: {
    marginTop: 10,
  },
});

export default RandomMoviesScreen;
