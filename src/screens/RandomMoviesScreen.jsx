import React, { useEffect, useState, useCallback } from 'react';
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
import DeveloperSettings from '../components/DeveloperSettings';
import PlayerStats from '../components/PlayerStats';
import DailyChallengeService from '../services/DailyChallengeService';
import GameStatsService from '../services/GameStatsService';

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
  const [showDeveloperSettings, setShowDeveloperSettings] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [totalWins, setTotalWins] = useState(0);

  const loadPlayerInfo = useCallback(async () => {
    try {
      const stats = await GameStatsService.getPlayerStats();
      setStreak(stats.currentStreak || 0);
      setPlayerLevel(stats.level || 1);
      setTotalWins(stats.totalWins || 0);
    } catch (error) {
      console.error('Error loading player info:', error);
    }
  }, []);

  // Refresh streak + daily challenge status whenever screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlayerInfo();
      checkDailyChallengeStatus();
    });
    return unsubscribe;
  }, [navigation, loadPlayerInfo]);

  useEffect(() => {
    loadPlayerInfo();
  }, [loadPlayerInfo]);

  const checkDailyChallengeStatus = async () => {
    try {
      const completed = await DailyChallengeService.hasCompletedToday();
      setDailyChallengeCompleted(completed);
    } catch (error) {
      console.error('Error checking daily challenge status:', error);
    }
  };

  const fetchTwoMovies = async () => {
    setLoading(true);
    let mA = null;
    let mB = null;
    let tries = 0;
    while ((!mA || !mB || mA.id === mB.id) && tries < 5) {
      [mA, mB] = await Promise.all([fetchMovieWithActors(), fetchMovieWithActors()]);
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

  const handleStartGame = () => {
    if (movies.length === 2) {
      navigation.navigate('GameScreen', {
        movieA: movies[0],
        movieB: movies[1],
      });
    }
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
        <View style={styles.logoContainer}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>CineMaze</Text>
            <View style={styles.logoAccent} />
          </View>
          <Text style={styles.tagline}>Discover Movies and Actors Through Play</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, !dailyChallengeCompleted && styles.newChallengeButton]}
            onPress={() => navigation.navigate('DailyChallengeScreen')}
          >
            <Text style={styles.headerButtonText}>🗓️</Text>
            {!dailyChallengeCompleted && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowPlayerStats(true)}>
            <Text style={styles.headerButtonText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowDeveloperSettings(true)}
          >
            <Text style={styles.headerButtonText}>🔧</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AccountOverviewScreen')}
          >
            <Text style={styles.headerButtonText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Player info banner */}
      <View style={styles.playerBanner}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerEmoji}>🎖️</Text>
          <Text style={styles.bannerValue}>Lvl {playerLevel}</Text>
        </View>
        {streak > 0 && (
          <View style={[styles.bannerItem, styles.streakItem]}>
            <Text style={styles.bannerEmoji}>🔥</Text>
            <Text style={[styles.bannerValue, styles.streakValue]}>
              {streak} day{streak !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
        <View style={styles.bannerItem}>
          <Text style={styles.bannerEmoji}>🏆</Text>
          <Text style={styles.bannerValue}>
            {totalWins} win{totalWins !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <MoviesContainer movies={movies} onAddToWatchlist={addToWatchlist} isLoading={loading} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.startGameButton, movies.length !== 2 && styles.disabledButton]}
          onPress={handleStartGame}
          disabled={movies.length !== 2}
        >
          <Text
            style={[styles.startGameButtonText, movies.length !== 2 && styles.disabledButtonText]}
          >
            🎯 Start Game
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shuffleButton} onPress={fetchTwoMovies}>
          <Text style={styles.shuffleButtonText}>🎲 Shuffle</Text>
        </TouchableOpacity>
      </View>

      <DeveloperSettings
        visible={showDeveloperSettings}
        onClose={() => setShowDeveloperSettings(false)}
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
    backgroundColor: '#B8DDF0', // Powder blue background
  },
  container: {
    padding: 16,
    paddingTop: 65, // Reduced from 80 to move content up
    alignItems: 'center',
    paddingBottom: 30,
    backgroundColor: '#B8DDF0', // Powder blue background
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  headerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(44, 62, 80, 0.1)',
    position: 'relative',
  },
  newChallengeButton: {
    backgroundColor: '#4ECDC4',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerButtonText: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 60, // Significantly increased from 35 to prevent dynamic height issues
    marginBottom: 12, // Also increased bottom margin for better balance
  },
  shuffleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderTopColor: '#FF9999',
    borderLeftColor: '#FF9999',
    borderRightColor: '#CC5555',
    borderBottomColor: '#CC5555',
    // Rubber button appearance
    transform: [{ perspective: 1000 }],
  },
  shuffleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  startGameButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
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
  startGameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    elevation: 2,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    borderTopColor: '#D5DBDB',
    borderLeftColor: '#D5DBDB',
    borderRightColor: '#A8B5B5',
    borderBottomColor: '#A8B5B5',
  },
  disabledButtonText: {
    color: '#7F8C8D',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  // Player banner
  playerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    width: '100%',
    gap: 16,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakItem: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bannerEmoji: {
    fontSize: 16,
  },
  bannerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
  streakValue: {
    color: '#E65100',
  },
});

export default RandomMoviesScreen;
