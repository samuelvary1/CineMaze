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
  Linking,
} from 'react-native';
import { TMDB_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoriteActorsService from '../services/FavoriteActorsService';
import { IMAGE_BASE, PLACEHOLDER_IMAGE, logger } from '../utils/constants';

const ActorInfoModal = ({
  visible,
  actorId,
  actorName,
  actorProfilePath,
  onClose,
  onFavoriteToggled,
}) => {
  const [actorData, setActorData] = useState(null);
  const [oscarDetails, setOscarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchlistMovies, setWatchlistMovies] = useState(new Set());

  useEffect(() => {
    if (visible && actorId) {
      loadActorDetails();
    } else {
      setActorData(null);
      setOscarDetails(null);
      setWatchlistMovies(new Set());
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, actorId]);

  const loadActorDetails = async () => {
    try {
      setLoading(true);

      // Check favorite status
      const fav = await FavoriteActorsService.isFavoriteActor(actorId);
      setIsFavorite(fav);

      // Fetch actor details and credits in parallel
      const [actorRes, creditsRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`,
        ),
        fetch(
          `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`,
        ),
      ]);
      const [actor, credits] = await Promise.all([actorRes.json(), creditsRes.json()]);

      // Top movies sorted by popularity
      const topMovies = (credits.cast || [])
        .filter((m) => m.release_date && m.poster_path && m.vote_count > 50)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10)
        .map((movie) => ({
          id: movie.id,
          title: movie.title,
          releaseDate: movie.release_date,
          posterPath: movie.poster_path ? IMAGE_BASE + movie.poster_path : PLACEHOLDER_IMAGE,
          character: movie.character,
          voteAverage: movie.vote_average,
        }));

      const data = {
        id: actor.id,
        name: actor.name,
        biography: actor.biography,
        birthday: actor.birthday,
        deathday: actor.deathday,
        placeOfBirth: actor.place_of_birth,
        profilePath: actor.profile_path
          ? IMAGE_BASE + actor.profile_path
          : actorProfilePath || PLACEHOLDER_IMAGE,
        imdbId: actor.imdb_id,
        knownFor: actor.known_for_department,
        popularity: actor.popularity,
        topMovies,
      };

      setActorData(data);

      // Load watchlist status
      try {
        const jsonValue = await AsyncStorage.getItem('watchlist');
        const watchlist = jsonValue != null ? JSON.parse(jsonValue) : [];
        setWatchlistMovies(new Set(watchlist.map((m) => m.id)));
      } catch (e) {
        logger.error('Error loading watchlist:', e);
      }

      // Fetch Oscar details from Wikidata using actor's IMDb ID
      if (actor.imdb_id) {
        fetchOscarDetails(actor.imdb_id);
      }
    } catch (error) {
      logger.error('Error loading actor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOscarDetails = async (imdbId) => {
    try {
      // Wikidata SPARQL for actor Oscar wins with associated film
      const sparql = `
SELECT ?awardLabel ?filmLabel WHERE {
  ?person wdt:P345 "${imdbId}".
  ?person p:P166 ?stmt.
  ?stmt ps:P166 ?award.
  ?award wdt:P31/wdt:P279* wd:Q19020.
  OPTIONAL { ?stmt pq:P1686 ?film. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;
      // Wikidata SPARQL for actor Oscar nominations with associated film
      const nomSparql = `
SELECT ?awardLabel ?filmLabel WHERE {
  ?person wdt:P345 "${imdbId}".
  ?person p:P1411 ?stmt.
  ?stmt ps:P1411 ?award.
  ?award wdt:P31/wdt:P279* wd:Q19020.
  OPTIONAL { ?stmt pq:P1686 ?film. }
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
        .map((b) => ({
          category: cleanLabel(b.awardLabel?.value || ''),
          film: b.filmLabel?.value || null,
        }))
        .filter((w) => w.category);

      const wonCategories = won.map((w) => w.category);
      const nominated = (nomData.results?.bindings || [])
        .map((b) => ({
          category: cleanLabel(b.awardLabel?.value || ''),
          film: b.filmLabel?.value || null,
        }))
        .filter((n) => n.category && !wonCategories.includes(n.category));

      if (won.length > 0 || nominated.length > 0) {
        setOscarDetails({ won, nominated });
      }
    } catch (error) {
      logger.error('Error fetching actor Oscar details from Wikidata:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await FavoriteActorsService.removeFavoriteActor(actorId);
        setIsFavorite(false);
      } else {
        await FavoriteActorsService.addFavoriteActor({
          id: actorId,
          name: actorName || actorData?.name,
          profilePath: actorProfilePath || actorData?.profilePath,
        });
        setIsFavorite(true);
      }
      // Notify parent so GameScreen can refresh its favoriteActors set
      if (onFavoriteToggled) {
        onFavoriteToggled();
      }
    } catch (error) {
      logger.error('Error toggling actor favorite:', error);
    }
  };

  const toggleMovieWatchlist = async (movie) => {
    try {
      const jsonValue = await AsyncStorage.getItem('watchlist');
      const current = jsonValue != null ? JSON.parse(jsonValue) : [];
      const isInList = current.some((m) => m.id === movie.id);

      if (isInList) {
        const updated = current.filter((m) => m.id !== movie.id);
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        setWatchlistMovies((prev) => {
          const next = new Set(prev);
          next.delete(movie.id);
          return next;
        });
      } else {
        const updated = [
          ...current,
          {
            id: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
          },
        ];
        await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
        setWatchlistMovies((prev) => new Set([...prev, movie.id]));
      }
    } catch (error) {
      logger.error('Error toggling movie watchlist:', error);
    }
  };

  const calculateAge = () => {
    if (!actorData?.birthday) {
      return null;
    }
    const birth = new Date(actorData.birthday);
    const end = actorData.deathday ? new Date(actorData.deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatBirthday = () => {
    if (!actorData?.birthday) {
      return null;
    }
    const date = new Date(actorData.birthday);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
              <Text style={styles.loadingText}>Loading actor details...</Text>
            </View>
          ) : actorData ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header: Photo + Basic Info */}
              <View style={styles.headerRow}>
                <Image source={{ uri: actorData.profilePath }} style={styles.photo} />
                <View style={styles.headerInfo}>
                  <Text style={styles.name} numberOfLines={2}>
                    {actorData.name}
                  </Text>
                  {actorData.birthday && (
                    <Text style={styles.meta}>
                      🎂 {formatBirthday()}
                      {calculateAge() !== null && ` (age ${calculateAge()})`}
                    </Text>
                  )}
                  {actorData.deathday && (
                    <Text style={styles.meta}>
                      ✝️{' '}
                      {new Date(actorData.deathday).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  )}
                  {actorData.placeOfBirth && (
                    <Text style={styles.metaLight} numberOfLines={2}>
                      📍 Born in {actorData.placeOfBirth}
                    </Text>
                  )}
                  {actorData.knownFor && (
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>🎬 {actorData.knownFor}</Text>
                    </View>
                  )}
                </View>
              </View>

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
                        {oscarDetails.won.map((item, i) => (
                          <View key={`won-${i}`} style={styles.awardRow}>
                            <Text style={styles.awardCategory}>🏆 {item.category}</Text>
                            {item.film && <Text style={styles.awardFilm}>for {item.film}</Text>}
                          </View>
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
                        {oscarDetails.nominated.map((item, i) => (
                          <View key={`nom-${i}`} style={styles.awardRow}>
                            <Text style={styles.awardCategoryNom}>☆ {item.category}</Text>
                            {item.film && <Text style={styles.awardFilmNom}>for {item.film}</Text>}
                          </View>
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
                    isFavorite ? styles.actionBtnFavorited : styles.actionBtnFavorite,
                  ]}
                  onPress={toggleFavorite}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>
                    {isFavorite ? '★ Favorited' : '☆ Favorite'}
                  </Text>
                </TouchableOpacity>
                {actorData.imdbId && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnImdb]}
                    onPress={() =>
                      Linking.openURL(`https://www.imdb.com/name/${actorData.imdbId}/`)
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionBtnText}>IMDb →</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Biography */}
              {actorData.biography ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📖 Biography</Text>
                  <Text style={styles.bioText} numberOfLines={8}>
                    {actorData.biography}
                  </Text>
                </View>
              ) : null}

              {/* Top Movies */}
              {actorData.topMovies.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎬 Top Movies</Text>
                  <View style={styles.movieGrid}>
                    {actorData.topMovies.map((movie) => {
                      const inWatchlist = watchlistMovies.has(movie.id);
                      return (
                        <TouchableOpacity
                          key={movie.id}
                          style={[styles.movieItem, inWatchlist && styles.movieItemWatchlisted]}
                          onPress={() => toggleMovieWatchlist(movie)}
                          activeOpacity={0.7}
                        >
                          <Image source={{ uri: movie.posterPath }} style={styles.moviePoster} />
                          <View style={styles.movieInfo}>
                            <Text style={styles.movieTitle} numberOfLines={1}>
                              {movie.title}
                            </Text>
                            {movie.releaseDate && (
                              <Text style={styles.movieYear}>{movie.releaseDate.slice(0, 4)}</Text>
                            )}
                            {movie.character && (
                              <Text style={styles.movieCharacter} numberOfLines={1}>
                                as {movie.character}
                              </Text>
                            )}
                            {movie.voteAverage > 0 && (
                              <Text style={styles.movieRating}>
                                ⭐ {movie.voteAverage.toFixed(1)}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.watchlistIcon}>{inWatchlist ? '✓' : '+'}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>Failed to load actor details</Text>
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
  photo: {
    width: 120,
    height: 160,
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
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 3,
  },
  metaLight: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 6,
  },
  metaChip: {
    backgroundColor: '#EBF5FB',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  metaChipText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
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
  awardRow: {
    marginBottom: 4,
  },
  awardFilm: {
    fontSize: 11,
    color: '#8D6E63',
    fontStyle: 'italic',
    paddingLeft: 22,
    lineHeight: 16,
  },
  awardFilmNom: {
    fontSize: 11,
    color: '#A1887F',
    fontStyle: 'italic',
    paddingLeft: 22,
    lineHeight: 16,
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
  actionBtnFavorite: {
    backgroundColor: '#FF6B6B',
  },
  actionBtnFavorited: {
    backgroundColor: '#FFD700',
  },
  actionBtnImdb: {
    backgroundColor: '#F5C518',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
  bioText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 21,
  },
  // Movies
  movieGrid: {
    gap: 8,
  },
  movieItem: {
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
  moviePoster: {
    width: 40,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
  },
  movieYear: {
    fontSize: 11,
    color: '#95A5A6',
    fontWeight: '600',
  },
  movieCharacter: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  movieRating: {
    fontSize: 11,
    color: '#F39C12',
    fontWeight: '600',
    marginTop: 1,
  },
  movieItemWatchlisted: {
    backgroundColor: '#E8F8F5',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  watchlistIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
    marginLeft: 6,
  },
});

export default ActorInfoModal;
