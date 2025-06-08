// src/screens/WatchlistScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';

const WatchlistScreen = () => {
  const [watchlist, setWatchlist] = useState([]);

  const loadWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const movies = jsonValue != null ? JSON.parse(jsonValue) : [];
      setWatchlist(movies);
    } catch (e) {
      Alert.alert('Error', 'Failed to load watchlist.');
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
    const unsubscribe = loadWatchlist();
    return () => unsubscribe;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📽️ Your Watchlist</Text>
      {watchlist.length === 0 ? (
        <Text style={styles.empty}>Your watchlist is empty.</Text>
      ) : (
        watchlist.map((movie) => (
          <View key={movie.id} style={styles.card}>
            <Image source={{ uri: movie.posterPath || PLACEHOLDER }} style={styles.poster} />
            <Text style={styles.titleText}>{movie.title}</Text>
            <TouchableOpacity onPress={() => removeFromWatchlist(movie.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  card: {
    width: 160,
    alignItems: 'center',
    marginBottom: 20,
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  titleText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  removeText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default WatchlistScreen;
