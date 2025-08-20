// src/screens/WatchlistScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';

const WatchlistScreen = ({ navigation }) => {
  const [watchlist, setWatchlist] = useState([]);

  const loadWatchlist = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const movies = jsonValue != null ? JSON.parse(jsonValue) : [];
      setWatchlist(movies);
    } catch (e) {
      Alert.alert('Error', 'Failed to load watchlist.');
    }
  }, []);

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetailScreen', {
      movieId: movie.id,
      movieTitle: movie.title,
      moviePosterPath: movie.posterPath,
    });
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const updated = watchlist.filter((m) => m.id !== movieId);
      await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
      setWatchlist(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to remove movie.');
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>CineMaze</Text>
            <View style={styles.logoAccent} />
          </View>
          <Text style={styles.tagline}>Discover Movies and Actors Through Play</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>📽️ Your Watchlist</Text>
        {watchlist.length === 0 ? (
          <Text style={styles.empty}>Your watchlist is empty.</Text>
        ) : (
          <View style={styles.moviesGrid}>
            {watchlist.map((movie) => (
              <View key={movie.id} style={styles.card}>
                <TouchableOpacity
                  onPress={() => handleMoviePress(movie)}
                  activeOpacity={0.8}
                  style={styles.movieTouchable}
                >
                  <Image source={{ uri: movie.posterPath || PLACEHOLDER }} style={styles.poster} />
                  <View style={styles.movieInfo}>
                    <Text style={styles.titleText}>{movie.title}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromWatchlist(movie.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8DDF0',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTextContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 28,
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
    fontSize: 14,
    color: '#34495E',
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7F8C8D',
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  card: {
    width: 160,
    alignItems: 'center',
    marginBottom: 20,
  },
  movieTouchable: {
    alignItems: 'center',
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  movieInfo: {
    alignItems: 'center',
    width: '100%',
  },
  titleText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  removeText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default WatchlistScreen;
