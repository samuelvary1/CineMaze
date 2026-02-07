import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY, OMDB_API_KEY } from '@env';
import FavoriteActorsService from '../services/FavoriteActorsService';
import { IMAGE_BASE, PLACEHOLDER_IMAGE, logger } from '../utils/constants';

const MovieInfoModal = ({ visible, movieId, movieTitle, moviePosterPath, onClose }) => {
  const [movieData, setMovieData] = useState(null);
  const [externalRatings, setExternalRatings] = useState(null);
  const [oscarDetails, setOscarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [favoriteActors, setFavoriteActors] = useState(new Set());

  useEffect(() => {
    if (visible && movieId) {
      loadMovieDetails();
    } else {
      // Reset state when modal closes
      setMovieData(null);
      setExternalRatings(null);
      setOscarDetails(null);
      setFavoriteActors(new Set());
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, movieId]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);

      // Check watchlist status
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const watchlist = jsonValue != null ? JSON.parse(jsonValue) : [];
      setIsInWatchlist(watchlist.some((m) => m.id === movieId));

      // Fetch movie details and credits in parallel
      const [movieRes, creditsRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=release_dates`,
        ),
        fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
        ),
      ]);
      const [movie, credits] = await Promise.all([movieRes.json(), creditsRes.json()]);

      // Get top 8 actors
      const topActors = (credits.cast || []).slice(0, 8).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profilePath: actor.profile_path ? IMAGE_BASE + actor.profile_path : PLACEHOLDER_IMAGE,
      }));

      // Get director
      const director = (credits.crew || []).find((person) => person.job === 'Director');

      const data = {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        runtime: movie.runtime,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        genres: (movie.genres || []).map((g) => g.name),
        posterPath: movie.poster_path ? IMAGE_BASE + movie.poster_path : moviePosterPath,
        imdbId: movie.imdb_id,
        actors: topActors,
        director: director ? director.name : null,
        tagline: movie.tagline,
      };

      setMovieData(data);

      // Load favorite actors status
      try {
        const favActors = await FavoriteActorsService.getFavoriteActors();
        setFavoriteActors(new Set(favActors.map((a) => a.id)));
      } catch (e) {
        logger.error('Error loading favorite actors:', e);
      }

      // Try to fetch OMDB data for IMDb/RT scores if we have an IMDb ID
      if (movie.imdb_id) {
        fetchExternalRatings(movie.imdb_id);
        fetchOscarDetails(movie.imdb_id);
      }
    } catch (error) {
      logger.error('Error loading movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExternalRatings = async (imdbId) => {
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
      const data = await res.json();

      if (data.Response === 'True') {
        const ratings = {};

        // IMDb Rating
        if (data.imdbRating && data.imdbRating !== 'N/A') {
          ratings.imdb = data.imdbRating;
        }

        // Rotten Tomatoes
        const rtRating = (data.Ratings || []).find((r) => r.Source === 'Rotten Tomatoes');
        if (rtRating) {
          ratings.rottenTomatoes = rtRating.Value;
        }

        // Metacritic
        if (data.Metascore && data.Metascore !== 'N/A') {
          ratings.metacritic = data.Metascore;
        }

        setExternalRatings(ratings);
      }
    } catch (error) {
      logger.error('Error fetching OMDB ratings:', error);
      // Non-critical, we just won't show external ratings
    }
  };

  const fetchOscarDetails = async (imdbId) => {
    try {
      const sparql = `
SELECT ?awardLabel WHERE {
  ?film wdt:P345 "${imdbId}".
  ?film wdt:P166 ?award.
  ?award wdt:P31/wdt:P279* wd:Q19020.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;
      const nomSparql = `
SELECT ?awardLabel WHERE {
  ?film wdt:P345 "${imdbId}".
  ?film wdt:P1411 ?award.
  ?award wdt:P31/wdt:P279* wd:Q19020.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;
      const [wonRes, nomRes] = await Promise.all([
        fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`, {
          headers: { Accept: 'application/sparql-results+json' },
        }),
        fetch(
          `https://query.wikidata.org/sparql?query=${encodeURIComponent(nomSparql)}&format=json`,
          { headers: { Accept: 'application/sparql-results+json' } },
        ),
      ]);
      const [wonData, nomData] = await Promise.all([wonRes.json(), nomRes.json()]);

      const cleanLabel = (label) => {
        return label
          .replace(/Academy Award for /i, '')
          .replace(/Best /i, 'Best ')
          .trim();
      };

      const won = (wonData.results?.bindings || [])
        .map((b) => cleanLabel(b.awardLabel?.value || ''))
        .filter(Boolean);
      const nominated = (nomData.results?.bindings || [])
        .map((b) => cleanLabel(b.awardLabel?.value || ''))
        .filter((n) => !won.includes(n));

      if (won.length > 0 || nominated.length > 0) {
        setOscarDetails({ won, nominated });
      }
    } catch (error) {
      logger.error('Error fetching Oscar details from Wikidata:', error);
    }
  };

  const addToWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const exists = current.find((m) => m.id === movieId);
      if (!exists) {
        const movieForWatchlist = {
          id: movieId,
          title: movieTitle || movieData?.title,
          posterPath: moviePosterPath || movieData?.posterPath,
        };
        const updated = [...current, movieForWatchlist];
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        setIsInWatchlist(true);
      } else {
        Alert.alert('ℹ️ Already in Watchlist', movieTitle || movieData?.title);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update watchlist.');
    }
  };

  const removeFromWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const updated = current.filter((m) => m.id !== movieId);
      await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
      setIsInWatchlist(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update watchlist.');
    }
  };

  const toggleActorFavorite = async (actor) => {
    try {
      const isFav = favoriteActors.has(actor.id);
      if (isFav) {
        await FavoriteActorsService.removeFavoriteActor(actor.id);
        setFavoriteActors((prev) => {
          const next = new Set(prev);
          next.delete(actor.id);
          return next;
        });
      } else {
        await FavoriteActorsService.addFavoriteActor({
          id: actor.id,
          name: actor.name,
          profilePath: actor.profilePath,
        });
        setFavoriteActors((prev) => new Set([...prev, actor.id]));
      }
    } catch (error) {
      logger.error('Error toggling actor favorite:', error);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) {
      return null;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getRTIcon = (score) => {
    if (!score) {
      return '🍅';
    }
    const num = parseInt(score.replace('%', ''), 10);
    return num >= 60 ? '🍅' : '🤢';
  };

  const renderRatings = () => {
    const ratings = [];

    // TMDB rating (always available)
    if (movieData?.voteAverage) {
      ratings.push(
        <View key="tmdb" style={styles.ratingItem}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.ratingValue}>{movieData.voteAverage.toFixed(1)}</Text>
          <Text style={styles.ratingSource}>TMDB</Text>
        </View>,
      );
    }

    // IMDb rating
    if (externalRatings?.imdb) {
      ratings.push(
        <View key="imdb" style={styles.ratingItem}>
          <Text style={styles.ratingIcon}>🎬</Text>
          <Text style={styles.ratingValue}>{externalRatings.imdb}</Text>
          <Text style={styles.ratingSource}>IMDb</Text>
        </View>,
      );
    }

    // Rotten Tomatoes
    if (externalRatings?.rottenTomatoes) {
      ratings.push(
        <View key="rt" style={styles.ratingItem}>
          <Text style={styles.ratingIcon}>{getRTIcon(externalRatings.rottenTomatoes)}</Text>
          <Text style={styles.ratingValue}>{externalRatings.rottenTomatoes}</Text>
          <Text style={styles.ratingSource}>Rotten Tomatoes</Text>
        </View>,
      );
    }

    // Metacritic
    if (externalRatings?.metacritic) {
      ratings.push(
        <View key="mc" style={styles.ratingItem}>
          <View
            style={[
              styles.metacriticBadge,
              {
                backgroundColor:
                  parseInt(externalRatings.metacritic, 10) >= 60
                    ? '#6C3'
                    : parseInt(externalRatings.metacritic, 10) >= 40
                    ? '#FC3'
                    : '#F00',
              },
            ]}
          >
            <Text style={styles.metacriticValue}>{externalRatings.metacritic}</Text>
          </View>
          <Text style={styles.ratingSource}>Metacritic</Text>
        </View>,
      );
    }

    return ratings;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498DB" />
              <Text style={styles.loadingText}>Loading movie details...</Text>
            </View>
          ) : movieData ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header: Poster + Basic Info */}
              <View style={styles.headerRow}>
                <Image source={{ uri: movieData.posterPath }} style={styles.poster} />
                <View style={styles.headerInfo}>
                  <Text style={styles.title} numberOfLines={3}>
                    {movieData.title}
                  </Text>
                  {movieData.releaseDate && (
                    <Text style={styles.year}>{movieData.releaseDate.slice(0, 4)}</Text>
                  )}
                  {movieData.director && (
                    <Text style={styles.director}>Directed by {movieData.director}</Text>
                  )}
                  <View style={styles.metaRow}>
                    {movieData.runtime > 0 && (
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
                          🕐 {formatRuntime(movieData.runtime)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {movieData.genres.length > 0 && (
                    <View style={styles.genreRow}>
                      {movieData.genres.slice(0, 3).map((genre) => (
                        <View key={genre} style={styles.genreChip}>
                          <Text style={styles.genreChipText}>{genre}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Tagline */}
              {movieData.tagline ? <Text style={styles.tagline}>"{movieData.tagline}"</Text> : null}

              {/* Ratings Row */}
              <View style={styles.ratingsRow}>{renderRatings()}</View>

              {/* Oscars */}
              {oscarDetails && (
                <View style={styles.awardsCard}>
                  <Text style={styles.awardsIcon}>{oscarDetails.won.length > 0 ? '🏆' : '🎖️'}</Text>
                  <View style={styles.awardsContent}>
                    {oscarDetails.won.length > 0 && (
                      <>
                        <Text style={styles.awardsTitle}>
                          Won {oscarDetails.won.length} Oscar
                          {oscarDetails.won.length > 1 ? 's' : ''}
                        </Text>
                        {oscarDetails.won.map((cat, i) => (
                          <Text key={`won-${i}`} style={styles.awardCategory}>
                            🏆 {cat}
                          </Text>
                        ))}
                      </>
                    )}
                    {oscarDetails.nominated.length > 0 && (
                      <>
                        <Text
                          style={[
                            styles.awardsTitle,
                            oscarDetails.won.length > 0 && { marginTop: 6 },
                          ]}
                        >
                          Nominated for {oscarDetails.nominated.length} Oscar
                          {oscarDetails.nominated.length > 1 ? 's' : ''}
                        </Text>
                        {oscarDetails.nominated.map((cat, i) => (
                          <Text key={`nom-${i}`} style={styles.awardCategoryNom}>
                            ☆ {cat}
                          </Text>
                        ))}
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isInWatchlist ? styles.actionBtnWatchlisted : styles.actionBtnWatchlist,
                  ]}
                  onPress={isInWatchlist ? removeFromWatchlist : addToWatchlist}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>
                    {isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                  </Text>
                </TouchableOpacity>
                {movieData.imdbId && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnImdb]}
                    onPress={() =>
                      Linking.openURL(`https://www.imdb.com/title/${movieData.imdbId}/`)
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionBtnText}>IMDb →</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Overview */}
              {movieData.overview ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📖 Overview</Text>
                  <Text style={styles.overview}>{movieData.overview}</Text>
                </View>
              ) : null}

              {/* Top Cast */}
              {movieData.actors.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎭 Top Cast</Text>
                  <View style={styles.castGrid}>
                    {movieData.actors.map((actor) => {
                      const isFav = favoriteActors.has(actor.id);
                      return (
                        <TouchableOpacity
                          key={actor.id}
                          style={[styles.castItem, isFav && styles.castItemFavorited]}
                          onPress={() => toggleActorFavorite(actor)}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={{ uri: actor.profilePath }}
                            style={[styles.castPhoto, isFav && styles.castPhotoFavorited]}
                          />
                          <View style={styles.castInfo}>
                            <Text style={styles.castName} numberOfLines={1}>
                              {isFav ? '⭐ ' : ''}
                              {actor.name}
                            </Text>
                            {actor.character && (
                              <Text style={styles.castCharacter} numberOfLines={1}>
                                as {actor.character}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.castFavIcon}>{isFav ? '★' : '☆'}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>Failed to load movie details</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F8FAFE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '50%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECF0F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7F8C8D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  year: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  director: {
    fontSize: 13,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  metaChip: {
    backgroundColor: '#EBF5FB',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  genreChip: {
    backgroundColor: '#D5F5E3',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  genreChipText: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '600',
  },
  // Tagline
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  // Ratings
  ratingsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  ratingIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C3E50',
  },
  ratingSource: {
    fontSize: 10,
    color: '#95A5A6',
    fontWeight: '600',
    marginTop: 1,
  },
  metacriticBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metacriticValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Awards
  awardsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  awardsIcon: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 1,
  },
  awardsContent: {
    flex: 1,
  },
  awardsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 4,
  },
  awardCategory: {
    fontSize: 12,
    color: '#6D4C41',
    fontWeight: '500',
    lineHeight: 20,
    paddingLeft: 2,
  },
  awardCategoryNom: {
    fontSize: 12,
    color: '#8D6E63',
    fontWeight: '500',
    lineHeight: 20,
    paddingLeft: 2,
    fontStyle: 'italic',
  },
  awardsText: {
    fontSize: 13,
    color: '#5D4037',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  overview: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 21,
  },
  // Cast
  castGrid: {
    gap: 8,
  },
  castItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  castPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  castInfo: {
    flex: 1,
  },
  castName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
  },
  castCharacter: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  castItemFavorited: {
    backgroundColor: '#FFFDE7',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  castPhotoFavorited: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  castFavIcon: {
    fontSize: 18,
    color: '#FFD700',
    marginLeft: 6,
  },
  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnWatchlist: {
    backgroundColor: '#4ECDC4',
  },
  actionBtnWatchlisted: {
    backgroundColor: '#27AE60',
  },
  actionBtnImdb: {
    backgroundColor: '#F5C518',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MovieInfoModal;
