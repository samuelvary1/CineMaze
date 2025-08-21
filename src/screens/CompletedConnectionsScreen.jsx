import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';

const CompletedConnectionsScreen = ({ navigation }) => {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('completedConnections');
        const saved = jsonValue != null ? JSON.parse(jsonValue) : [];
        setConnections(saved);
      } catch (e) {
        Alert.alert('Error', 'Failed to load completed connections.');
      }
    };

    const unsubscribe = navigation.addListener('focus', loadConnections);
    return unsubscribe;
  }, [navigation]);

  const addToWatchlist = async (movie) => {
    if (!movie) {
      Alert.alert('Error', 'Movie data not available.');
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const exists = current.find((m) => m.id === movie.id);

      if (!exists) {
        const movieForWatchlist = {
          id: movie.id,
          title: movie.title,
          posterPath: movie.posterPath || movie.poster_path,
        };
        const updated = [...current, movieForWatchlist];
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        Alert.alert('✅ Added to Watchlist', movie.title);
      } else {
        Alert.alert('ℹ️ Already in Watchlist', movie.title);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update watchlist.');
    }
  };

  const renderCard = (connection) => {
    // Helper function to get proper poster URL
    const getPosterUrl = (movie) => {
      if (!movie) {
        return PLACEHOLDER;
      }
      if (movie.posterPath) {
        // If posterPath already contains full URL, use it
        if (movie.posterPath.startsWith('http')) {
          return movie.posterPath;
        }
        // If it's just the path, add base URL
        return IMAGE_BASE + movie.posterPath;
      }
      if (movie.poster_path) {
        return IMAGE_BASE + movie.poster_path;
      }
      return PLACEHOLDER;
    };

    return (
      <View key={connection.id} style={styles.card}>
        <View style={styles.movieTitles}>
          <Text style={styles.movieTitle}>{connection.start?.title || 'Unknown Movie'}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.movieTitle}>{connection.target?.title || 'Unknown Movie'}</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => addToWatchlist(connection.start)}
            activeOpacity={0.8}
            style={styles.posterContainer}
          >
            <Image
              source={{
                uri: getPosterUrl(connection.start),
              }}
              style={styles.poster}
            />
          </TouchableOpacity>
          <Text style={styles.arrow}>→</Text>
          <TouchableOpacity
            onPress={() => addToWatchlist(connection.target)}
            activeOpacity={0.8}
            style={styles.posterContainer}
          >
            <Image
              source={{
                uri: getPosterUrl(connection.target),
              }}
              style={styles.poster}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.pathLength}>
          Moves: {connection.moves || connection.path?.length || 0}
        </Text>
        <Text style={styles.timestamp}>
          Completed: {new Date(connection.timestamp).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Completed Connections</Text>
      {connections.length === 0 ? (
        <Text style={styles.empty}>You haven't finished any games yet.</Text>
      ) : (
        connections.map(renderCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#B8DDF0', // Powder blue background
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  movieTitles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  posterContainer: {
    borderRadius: 8,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
  },
  arrow: {
    fontSize: 28,
    marginHorizontal: 15,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  pathLength: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

export default CompletedConnectionsScreen;
