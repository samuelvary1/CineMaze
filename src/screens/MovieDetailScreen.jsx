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
import SubscriptionService, { FEATURES } from '../services/SubscriptionService';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const MovieDetailScreen = ({ route, navigation }) => {
  const { movieId, movieTitle, moviePosterPath } = route.params;
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [favoriteActors, setFavoriteActors] = useState(new Set());

  const loadMovieData = useCallback(async () => {
    try {
      setLoading(true);

      // Check if movie is in watchlist
      const checkWatchlistStatus = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('watchlist');
          const current = jsonValue != null ? JSON.parse(jsonValue) : [];
          const exists = current.find((m) => m.id === movieId);
          setIsInWatchlist(!!exists);
        } catch (error) {
          console.error('Error checking watchlist status:', error);
        }
      };

      await checkWatchlistStatus();

      // Check favorite actors status
      const checkFavoriteActorsStatus = async (actors) => {
        try {
          const favoriteIds = new Set();
          for (const actor of actors) {
            const isFavorite = await FavoriteActorsService.isFavoriteActor(actor.id);
            if (isFavorite) {
              favoriteIds.add(actor.id);
            }
          }
          setFavoriteActors(favoriteIds);
        } catch (error) {
          console.error('Error checking favorite actors status:', error);
        }
      };

      // Fetch movie details
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
      );
      const movie = await movieRes.json();

      // Fetch cast
      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
      );
      const credits = await creditsRes.json();

      // Get top 10 actors
      const topActors = (credits.cast || []).slice(0, 10).map((actor) => ({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profile_path ? IMAGE_BASE + actor.profile_path : PLACEHOLDER_IMAGE,
        character: actor.character,
      }));

      // Get director
      const director = (credits.crew || []).find((person) => person.job === 'Director');

      // Fetch streaming providers with robust deduplication
      let streamingProviders = [];
      try {
        const providersRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`,
        );
        const providersData = await providersRes.json();
        const rawProviders = providersData.results?.US?.flatrate || [];

        // Define major streaming services to include
        const majorServices = [
          'netflix',
          'hulu',
          'disney plus',
          'disney+',
          'hbo max',
          'hbo',
          'amazon prime video',
          'prime video',
          'paramount plus',
          'paramount+',
          'apple tv plus',
          'apple tv+',
          'peacock',
          'showtime',
          'starz',
        ];

        // Filter for major services only and remove duplicates
        const uniqueNames = new Set();
        streamingProviders = rawProviders.filter((provider) => {
          const normalizedName = provider.provider_name.toLowerCase().trim();

          // Check if it's a major service
          const isMajorService = majorServices.some(
            (service) => normalizedName.includes(service) || service.includes(normalizedName),
          );

          if (!isMajorService) {
            return false; // Skip non-major services
          }

          if (uniqueNames.has(normalizedName)) {
            return false; // Skip duplicate
          }
          uniqueNames.add(normalizedName);
          return true;
        });

        console.log(
          'Major streaming providers:',
          streamingProviders.map((p) => p.provider_name),
        );
      } catch (error) {
        console.error('Error fetching streaming providers:', error);
      }

      setMovieData({
        ...movie,
        posterPath: movie.poster_path ? IMAGE_BASE + movie.poster_path : moviePosterPath,
        actors: topActors,
        director: director ? director.name : 'Unknown',
        streamingProviders,
      });

      // Check favorite actors status after movie data is loaded
      await checkFavoriteActorsStatus(topActors);
    } catch (error) {
      console.error('Error loading movie data:', error);
      Alert.alert('Error', 'Failed to load movie details.');
    } finally {
      setLoading(false);
    }
  }, [movieId, moviePosterPath]);

  useEffect(() => {
    loadMovieData();
  }, [loadMovieData]);

  const addToWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const exists = current.find((m) => m.id === movieId);
      if (!exists) {
        const movieForWatchlist = {
          id: movieId,
          title: movieTitle,
          posterPath: moviePosterPath,
        };
        const updated = [...current, movieForWatchlist];
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        setIsInWatchlist(true);
        Alert.alert('✅ Added to Watchlist', movieTitle);
      } else {
        Alert.alert('ℹ️ Already in Watchlist', movieTitle);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update watchlist.');
    }
  };

  const handleActorPress = async (actor) => {
    try {
      // Check if user has premium access
      const hasPremium = await SubscriptionService.hasFeature(FEATURES.UNLIMITED_PLAYS);
      if (!hasPremium) {
        Alert.alert(
          '🔒 Premium Feature',
          'Actor details are available with a premium subscription.',
          [{ text: 'OK' }],
        );
        return;
      }

      // Navigate to actor detail screen
      navigation.navigate('ActorDetailScreen', {
        actorId: actor.id,
        actorName: actor.name,
        actorProfilePath: actor.profilePath,
      });
    } catch (error) {
      console.error('Error navigating to actor detail:', error);
      Alert.alert('Error', 'Failed to open actor details.');
    }
  };

  const addActorToFavorites = async (actor) => {
    try {
      // Check if user has premium access
      const hasPremium = await SubscriptionService.hasFeature(FEATURES.UNLIMITED_PLAYS);
      if (!hasPremium) {
        Alert.alert(
          '🔒 Premium Feature',
          'Favorite actors feature is available with a premium subscription.',
          [{ text: 'OK' }],
        );
        return;
      }

      const success = await FavoriteActorsService.addFavoriteActor({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profilePath,
      });

      if (success) {
        setFavoriteActors((prev) => new Set([...prev, actor.id]));
      }
    } catch (error) {
      console.error('Error adding actor to favorites:', error);
      Alert.alert('Error', 'Failed to add actor to favorites.');
    }
  };

  const renderStreamingService = (provider, index) => {
    // Simple color mapping for popular services
    const getServiceColor = (name) => {
      const serviceName = name.toLowerCase();
      if (serviceName.includes('netflix')) {
        return '#E50914';
      }
      if (serviceName.includes('hulu')) {
        return '#1CE783';
      }
      if (serviceName.includes('disney')) {
        return '#113CCF';
      }
      if (serviceName.includes('hbo')) {
        return '#6B46C1';
      }
      if (serviceName.includes('prime') || serviceName.includes('amazon')) {
        return '#00A8E1';
      }
      if (serviceName.includes('paramount')) {
        return '#0064FF';
      }
      if (serviceName.includes('apple')) {
        return '#000000';
      }
      if (serviceName.includes('peacock')) {
        return '#00B4E5';
      }
      if (serviceName.includes('showtime')) {
        return '#FF0000';
      }
      if (serviceName.includes('starz')) {
        return '#000000';
      }
      return '#6B7280'; // Default gray
    };

    const backgroundColor = getServiceColor(provider.provider_name);

    return (
      <View
        key={`${provider.provider_id}-${index}`}
        style={[styles.streamingBadge, { backgroundColor }]}
      >
        <Text style={styles.streamingName}>{provider.provider_name}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading movie details...</Text>
      </View>
    );
  }

  if (!movieData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load movie details</Text>
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
        <View style={styles.movieHeader}>
          <TouchableOpacity onPress={addToWatchlist} activeOpacity={0.8}>
            <Image source={{ uri: movieData.posterPath }} style={styles.moviePoster} />
          </TouchableOpacity>
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{movieData.title}</Text>
            <Text style={styles.movieYear}>
              ({movieData.release_date ? movieData.release_date.slice(0, 4) : 'Unknown'})
            </Text>
            <Text style={styles.movieDirector}>Directed by {movieData.director}</Text>
            <TouchableOpacity
              style={[styles.watchlistButton, isInWatchlist && styles.watchlistButtonAdded]}
              onPress={addToWatchlist}
            >
              <Text
                style={[
                  styles.watchlistButtonText,
                  isInWatchlist && styles.watchlistButtonTextAdded,
                ]}
              >
                {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Streaming Services Section */}
        {movieData.streamingProviders && movieData.streamingProviders.length > 0 && (
          <View style={styles.streamingSection}>
            <Text style={styles.streamingTitle}>🎬 Available On</Text>
            <View style={styles.streamingContainer}>
              {movieData.streamingProviders.map((provider, index) =>
                renderStreamingService(provider, index),
              )}
            </View>
          </View>
        )}

        <Text style={styles.castTitle}>🎭 Top Cast</Text>

        <View style={styles.actorsGrid}>
          {movieData.actors.map((actor) => (
            <View key={actor.id} style={styles.actorCard}>
              <TouchableOpacity onPress={() => handleActorPress(actor)} activeOpacity={0.8}>
                <Image source={{ uri: actor.profilePath }} style={styles.actorImage} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addActorToFavorites(actor)}
                style={[
                  styles.favoriteButton,
                  favoriteActors.has(actor.id) && styles.favoriteButtonAdded,
                ]}
              >
                <Text
                  style={[
                    styles.favoriteButtonText,
                    favoriteActors.has(actor.id) && styles.favoriteButtonTextAdded,
                  ]}
                >
                  {favoriteActors.has(actor.id) ? '✓' : '⭐'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.actorName}>{actor.name}</Text>
              {favoriteActors.has(actor.id) && (
                <Text style={styles.favoriteStatus}>⭐ In Favorites</Text>
              )}
              {actor.character && <Text style={styles.characterName}>as {actor.character}</Text>}
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
  movieHeader: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  moviePoster: {
    width: 140,
    height: 210,
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
  movieInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  movieYear: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 4,
  },
  movieDirector: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  streamingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  streamingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  streamingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  streamingBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  streamingName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  watchlistButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderTopColor: '#7EDDDD',
    borderLeftColor: '#7EDDDD',
    borderRightColor: '#3EBBBB',
    borderBottomColor: '#3EBBBB',
  },
  watchlistButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  watchlistButtonAdded: {
    backgroundColor: '#28A745',
    borderTopColor: '#4CAF50',
    borderLeftColor: '#4CAF50',
    borderRightColor: '#1E7E34',
    borderBottomColor: '#1E7E34',
  },
  watchlistButtonTextAdded: {
    color: '#FFFFFF',
  },
  castTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actorCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actorImage: {
    width: 80,
    height: 120,
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
  favoriteButton: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    borderWidth: 1,
    borderTopColor: '#FF9999',
    borderLeftColor: '#FF9999',
    borderRightColor: '#CC5555',
    borderBottomColor: '#CC5555',
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButtonAdded: {
    backgroundColor: '#28A745',
    borderTopColor: '#4CAF50',
    borderLeftColor: '#4CAF50',
    borderRightColor: '#1E7E34',
    borderBottomColor: '#1E7E34',
  },
  favoriteButtonTextAdded: {
    color: '#FFFFFF',
  },
  favoriteStatus: {
    fontSize: 9,
    color: '#28A745',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 2,
  },
  actorName: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  characterName: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default MovieDetailScreen;
