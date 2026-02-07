// src/screens/WatchlistScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

const WatchlistScreen = ({ navigation }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unwatched', 'watched'

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

  const toggleWatched = async (movieId) => {
    try {
      const updated = watchlist.map((m) => (m.id === movieId ? { ...m, watched: !m.watched } : m));
      await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
      setWatchlist(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to update movie.');
    }
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

  const filteredList =
    filter === 'all'
      ? watchlist
      : filter === 'watched'
      ? watchlist.filter((m) => m.watched)
      : watchlist.filter((m) => !m.watched);

  const watchedCount = watchlist.filter((m) => m.watched).length;
  const unwatchedCount = watchlist.length - watchedCount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>📽️ Watchlist</Text>

      {/* Filter tabs */}
      {watchlist.length > 0 && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({watchlist.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unwatched' && styles.filterTabActive]}
            onPress={() => setFilter('unwatched')}
          >
            <Text style={[styles.filterText, filter === 'unwatched' && styles.filterTextActive]}>
              To Watch ({unwatchedCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'watched' && styles.filterTabActive]}
            onPress={() => setFilter('watched')}
          >
            <Text style={[styles.filterText, filter === 'watched' && styles.filterTextActive]}>
              Watched ({watchedCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {watchlist.length === 0 ? (
          <Text style={styles.empty}>Your watchlist is empty.</Text>
        ) : filteredList.length === 0 ? (
          <Text style={styles.empty}>
            {filter === 'watched' ? 'No watched movies yet.' : 'All movies watched!'}
          </Text>
        ) : (
          <View style={styles.moviesGrid}>
            {filteredList.map((movie) => (
              <View key={movie.id} style={styles.card}>
                <TouchableOpacity
                  onPress={() => handleMoviePress(movie)}
                  activeOpacity={0.8}
                  style={styles.movieTouchable}
                >
                  <View>
                    <Image
                      source={{ uri: movie.posterPath || PLACEHOLDER_IMAGE }}
                      style={[styles.poster, movie.watched && styles.posterWatched]}
                    />
                    {movie.watched && (
                      <View style={styles.watchedOverlay}>
                        <Text style={styles.watchedCheckmark}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.movieInfo}>
                    <Text style={[styles.titleText, movie.watched && styles.titleTextWatched]}>
                      {movie.title}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.watchedButton, movie.watched && styles.watchedButtonActive]}
                    onPress={() => toggleWatched(movie.id)}
                  >
                    <Text
                      style={[
                        styles.watchedButtonText,
                        movie.watched && styles.watchedButtonTextActive,
                      ]}
                    >
                      {movie.watched ? '✓ Watched' : '○ Watched?'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFromWatchlist(movie.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
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
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Filter tabs
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  filterTextActive: {
    color: '#2C3E50',
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7F8C8D',
    marginTop: 40,
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
  posterWatched: {
    opacity: 0.5,
  },
  watchedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: 'rgba(39, 174, 96, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchedCheckmark: {
    fontSize: 48,
    fontWeight: '800',
    color: '#27AE60',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    marginBottom: 6,
    color: '#2C3E50',
  },
  titleTextWatched: {
    color: '#95A5A6',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  watchedButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  watchedButtonActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  watchedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  watchedButtonTextActive: {
    color: '#FFFFFF',
  },
  removeText: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WatchlistScreen;
