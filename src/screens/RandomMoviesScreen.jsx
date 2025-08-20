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
      <Text style={styles.title}>🎬 CineMaze</Text>

      <MoviesContainer movies={movies} onAddToWatchlist={addToWatchlist} isLoading={loading} />

      <TouchableOpacity style={styles.shuffleButton} onPress={fetchTwoMovies}>
        <Text style={styles.shuffleButtonText}>🎲 Shuffle Movies</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.startGameButton, movies.length !== 2 && styles.disabledButton]}
        onPress={() =>
          navigation.navigate('GameScreen', {
            movieA: movies[0],
            movieB: movies[1],
          })
        }
        disabled={movies.length !== 2}
      >
        <Text
          style={[styles.startGameButtonText, movies.length !== 2 && styles.disabledButtonText]}
        >
          🎯 Start Game with this Pair
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shuffleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  shuffleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  startGameButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startGameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
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
