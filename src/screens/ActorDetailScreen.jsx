import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY } from '@env';
import FavoriteActorsService from '../services/FavoriteActorsService';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const ActorDetailScreen = ({ route, navigation }) => {
  const { actorId, actorName, actorProfilePath } = route.params;
  const [actorData, setActorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await loadActorData();
      await checkIfFavorite();
    };
    loadData();
  }, [loadActorData, checkIfFavorite]);

  const loadActorData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch actor details
      const actorRes = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`,
      );
      const actor = await actorRes.json();

      // Fetch filmography
      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`,
      );
      const credits = await creditsRes.json();

      // Filter and sort filmography
      const filmography = (credits.cast || [])
        .filter((movie) => movie.release_date && movie.poster_path)
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 50) // Limit to 50 most recent movies
        .map((movie) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path ? IMAGE_BASE + movie.poster_path : PLACEHOLDER_IMAGE,
          character: movie.character,
        }));

      setActorData({
        ...actor,
        profilePath: actor.profile_path ? IMAGE_BASE + actor.profile_path : actorProfilePath,
        filmography,
      });
    } catch (error) {
      console.error('Error loading actor data:', error);
      Alert.alert('Error', 'Failed to load actor details.');
    } finally {
      setLoading(false);
    }
  }, [actorId, actorProfilePath]);

  const checkIfFavorite = useCallback(async () => {
    const favorite = await FavoriteActorsService.isFavoriteActor(actorId);
    setIsFavorite(favorite);
  }, [actorId]);

  const toggleFavorite = async () => {
    if (isFavorite) {
      await FavoriteActorsService.removeFavoriteActor(actorId);
      setIsFavorite(false);
    } else {
      await FavoriteActorsService.addFavoriteActor({
        id: actorId,
        name: actorName,
        profilePath: actorProfilePath,
      });
      setIsFavorite(true);
    }
  };

  const handleMoviePress = async (movie) => {
    try {
      // Navigate to movie detail screen
      navigation.navigate('MovieDetailScreen', {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePosterPath: movie.poster_path,
      });
    } catch (error) {
      console.error('Error navigating to movie detail:', error);
      Alert.alert('Error', 'Failed to open movie details.');
    }
  };

  const addToWatchlist = async (movie) => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const exists = current.find((m) => m.id === movie.id);
      if (!exists) {
        const movieData = {
          id: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
        };
        const updated = [...current, movieData];
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        Alert.alert('✅ Added to Watchlist', movie.title);
      } else {
        Alert.alert('ℹ️ Already in Watchlist', movie.title);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update watchlist.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading actor details...</Text>
      </View>
    );
  }

  if (!actorData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load actor details</Text>
      </View>
    );
  }

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
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actorHeader}>
          <Image source={{ uri: actorData.profilePath }} style={styles.actorImage} />
          <View style={styles.actorInfo}>
            <Text style={styles.actorName}>{actorData.name}</Text>
            <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
              <Text style={styles.favoriteButtonText}>
                {isFavorite ? '⭐ Remove from Favorites' : '⭐ Add to Favorites'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.filmographyTitle}>🎬 Filmography</Text>

        <View style={styles.moviesGrid}>
          {actorData.filmography.map((movie) => (
            <View key={movie.id} style={styles.movieCard}>
              <TouchableOpacity onPress={() => handleMoviePress(movie)} activeOpacity={0.8}>
                <Image source={{ uri: movie.poster_path }} style={styles.moviePoster} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addToWatchlist(movie)}
                style={styles.watchlistButton}
              >
                <Text style={styles.watchlistButtonText}>+ Watchlist</Text>
              </TouchableOpacity>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              <Text style={styles.movieYear}>({movie.release_date.slice(0, 4)})</Text>
              {movie.character && <Text style={styles.characterName}>as {movie.character}</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#B8DDF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20, // Add horizontal margin for spacing
  },
  headerSpacer: {
    width: 80, // Same width as back button to center logo
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
    fontSize: 13,
    color: '#34495E',
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8DDF0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8DDF0',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
  },
  actorHeader: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  actorImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
  },
  actorInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  actorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  favoriteButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderTopColor: '#FF9999',
    borderLeftColor: '#FF9999',
    borderRightColor: '#CC5555',
    borderBottomColor: '#CC5555',
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filmographyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  movieCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  moviePoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
  },
  watchlistButton: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    borderWidth: 1,
    borderTopColor: '#7EDDDD',
    borderLeftColor: '#7EDDDD',
    borderRightColor: '#3EBBBB',
    borderBottomColor: '#3EBBBB',
  },
  watchlistButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  movieTitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  movieYear: {
    fontSize: 11,
    color: '#34495E',
    textAlign: 'center',
  },
  characterName: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default ActorDetailScreen;
