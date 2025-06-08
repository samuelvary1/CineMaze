import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY } from '@env';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const fetchMovieWithActors = async () => {
  try {
    const page = Math.floor(Math.random() * 50) + 1;
    const discoverRes = await fetch(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`,
    );

    const discoverData = await discoverRes.json();
    const movies = discoverData.results.filter((m) => m.poster_path);
    if (movies.length === 0) {
      throw new Error('No movies with posters found');
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
  const [movieA, setMovieA] = useState(null);
  const [movieB, setMovieB] = useState(null);
  const [loading, setLoading] = useState(false);

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
    }

    setMovieA(mA);
    setMovieB(mB);
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

  if (loading || !movieA || !movieB) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading movies...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎬 CineMaze</Text>

      <View style={styles.movieContainer}>
        {[movieA, movieB].map((movie) => (
          <View key={movie.id} style={styles.movieCard}>
            <Image source={{ uri: movie.posterPath || PLACEHOLDER_IMAGE }} style={styles.poster} />
            <TouchableOpacity onPress={() => addToWatchlist(movie)}>
              <Text style={styles.watchlistAddButton}>+ Add to Watchlist</Text>
            </TouchableOpacity>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text style={styles.actorListTitle}>Top Actors:</Text>
            {movie.actors.map((actor) => (
              <Text key={actor.id} style={styles.actorName}>
                {actor.name}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.watchlistButton}
        onPress={() => navigation.navigate('WatchlistScreen')}
      >
        <Text style={styles.watchlistButtonText}>📋 View Watchlist</Text>
      </TouchableOpacity>

      <Button title="Shuffle" onPress={fetchTwoMovies} />

      <View style={{ marginTop: 15 }}>
        <Button
          title="Start Game with this Pair"
          onPress={() => navigation.navigate('GameScreen', { movieA, movieB })}
        />
      </View>
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
  movieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 20,
    gap: 20,
  },
  movieCard: {
    flex: 1,
    maxWidth: '48%',
    alignItems: 'center',
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  watchlistAddButton: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
  movieTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actorListTitle: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  actorName: {
    fontSize: 14,
    color: '#555',
  },
  watchlistButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  watchlistButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RandomMoviesScreen;
