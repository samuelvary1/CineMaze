import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY } from '@env';
import GameStatsService from '../services/GameStatsService';
import DailyChallengeService from '../services/DailyChallengeService';
import GameSummaryCard from '../components/GameSummaryCard';
import PathMapModal from '../components/PathMapModal';
import FavoriteActorsService from '../services/FavoriteActorsService';
import { IMAGE_BASE, PLACEHOLDER_IMAGE, logger } from '../utils/constants';

const GameScreen = ({ route, navigation }) => {
  const {
    movieA,
    movieB,
    isDaily = false,
    challengeId,
    difficulty = null,
    previousBest = null,
  } = route.params;

  const [leftNode, setLeftNode] = useState({ type: 'movie', data: movieA });
  const [rightNode, setRightNode] = useState({ type: 'movie', data: movieB });
  const [leftPath, setLeftPath] = useState([{ type: 'movie', data: movieA }]);
  const [rightPath, setRightPath] = useState([{ type: 'movie', data: movieB }]);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [favoriteActors, setFavoriteActors] = useState(new Set());
  const [gameStartTime] = useState(Date.now());
  const [lastSide, setLastSide] = useState(null);
  const [showPathMap, setShowPathMap] = useState(false);

  // Refs to avoid stale closure in updateSide
  const leftPathRef = useRef(leftPath);
  const rightPathRef = useRef(rightPath);
  useEffect(() => {
    leftPathRef.current = leftPath;
  }, [leftPath]);
  useEffect(() => {
    rightPathRef.current = rightPath;
  }, [rightPath]);

  useEffect(() => {
    loadFavoriteActors();
  }, []);

  const loadFavoriteActors = async () => {
    try {
      const favoriteActorsData = await AsyncStorage.getItem('favoriteActors');
      if (favoriteActorsData) {
        const actors = JSON.parse(favoriteActorsData);
        const actorIds = new Set(actors.map((actor) => actor.id));
        setFavoriteActors(actorIds);
      }
    } catch (error) {
      logger.error('Error loading favorite actors:', error);
    }
  };

  const addActorToFavorites = async (actor) => {
    try {
      await FavoriteActorsService.addFavoriteActor({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profilePath ? IMAGE_BASE + actor.profilePath : PLACEHOLDER_IMAGE,
      });

      // Refresh favorite actors list
      await loadFavoriteActors();
    } catch (error) {
      logger.error('Error adding actor to favorites:', error);
      Alert.alert('Error', 'Failed to add actor to favorites.');
    }
  };

  const showHelpInstructions = () => {
    Alert.alert(
      '🎮 How to Play',
      'Connect two movies by finding actors they share!\n\n' +
        '• Tap an actor to see their movies\n' +
        '• Tap a movie to see its actors\n' +
        '• Build a path from one side to the other\n' +
        '• Try to solve it in the fewest moves possible!\n\n' +
        '⭐ Tap the star next to actors to add them to favorites',
      [{ text: 'Got it!', style: 'default' }],
    );
  };

  const resetGame = () => {
    Alert.alert(
      '🔄 Start Over',
      'Are you sure you want to reset your progress? This will clear all your moves and start fresh.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Over',
          style: 'destructive',
          onPress: () => {
            // Reset to initial state
            setLeftNode({ type: 'movie', data: movieA });
            setRightNode({ type: 'movie', data: movieB });
            setLeftPath([{ type: 'movie', data: movieA }]);
            setRightPath([{ type: 'movie', data: movieB }]);
            setMoves(0);
            setIsConnected(false);
            setLoading(false);
          },
        },
      ],
    );
  };

  const undoLastMove = () => {
    if (moves === 0 || isConnected) {
      return;
    }

    if (lastSide === 'A' && leftPath.length > 1) {
      const newPath = leftPath.slice(0, -1);
      setLeftPath(newPath);
      setLeftNode(newPath[newPath.length - 1]);
      setMoves((prev) => Math.max(0, prev - 1));
      setLastSide(null);
    } else if (lastSide === 'B' && rightPath.length > 1) {
      const newPath = rightPath.slice(0, -1);
      setRightPath(newPath);
      setRightNode(newPath[newPath.length - 1]);
      setMoves((prev) => Math.max(0, prev - 1));
      setLastSide(null);
    }
  };

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

  const fetchMovieWithCredits = async (movieId) => {
    const [movieRes, creditsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
      ),
    ]);
    const [movieData, credits] = await Promise.all([movieRes.json(), creditsRes.json()]);

    const topActors = (credits.cast || []).slice(0, 10).map((actor) => ({
      id: actor.id,
      name: actor.name,
      profilePath: actor.profile_path,
    }));

    return {
      id: movieData.id,
      title: movieData.title,
      posterPath: movieData.poster_path ? IMAGE_BASE + movieData.poster_path : PLACEHOLDER_IMAGE,
      actors: topActors,
    };
  };

  const fetchActorWithFilmography = async (actorId) => {
    const [actorRes, creditsRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`,
      ),
      fetch(
        `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`,
      ),
    ]);
    const [actorData, credits] = await Promise.all([actorRes.json(), creditsRes.json()]);

    const filmography = (credits.cast || [])
      .filter((m) => m.release_date)
      .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
      }));

    return {
      id: actorData.id,
      name: actorData.name,
      profilePath: actorData.profile_path ? IMAGE_BASE + actorData.profile_path : PLACEHOLDER_IMAGE,
      filmography,
    };
  };

  const updateSide = (side, node) => {
    const setPath = side === 'A' ? setLeftPath : setRightPath;
    const otherPath = side === 'A' ? rightPathRef.current : leftPathRef.current;
    setPath((prev) => {
      const newPath = [...prev, node];

      const foundMatch = otherPath.find((n) => n.data.id === node.data.id && n.type === node.type);
      if (foundMatch && !isConnected) {
        setIsConnected(true);
        const currentLeft = side === 'A' ? newPath : leftPathRef.current;
        const currentRight = side === 'A' ? rightPathRef.current : newPath;
        saveCompletedConnection(currentLeft, currentRight);
        handleGameComplete(moves + 1, currentLeft, currentRight);
      }

      return newPath;
    });
    setMoves((prev) => prev + 1);
  };

  const handleActorPress = async (actor, side) => {
    if (isConnected || loading) {
      return;
    }
    setLoading(true);
    try {
      const actorData = await fetchActorWithFilmography(actor.id);
      const node = { type: 'actor', data: actorData };
      side === 'A' ? setLeftNode(node) : setRightNode(node);
      updateSide(side, node);
      setLastSide(side);
    } catch (error) {
      logger.error('Error fetching actor:', error);
      Alert.alert('Connection Error', 'Failed to load actor data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = async (movie, side) => {
    if (isConnected || loading) {
      return;
    }
    setLoading(true);
    try {
      const movieData = await fetchMovieWithCredits(movie.id);
      const node = { type: 'movie', data: movieData };
      side === 'A' ? setLeftNode(node) : setRightNode(node);
      updateSide(side, node);
      setLastSide(side);
    } catch (error) {
      logger.error('Error fetching movie:', error);
      Alert.alert('Connection Error', 'Failed to load movie data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCompletedConnection = async (currentLeft, currentRight) => {
    try {
      const lp = currentLeft || leftPath;
      const rp = currentRight || rightPath;
      const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
      const finalMoves = moves + 1;

      // Star rating (same logic as GameSummaryCard)
      let stars = 1;
      if (finalMoves <= 3) {
        stars = 3;
      } else if (finalMoves <= 5) {
        stars = 2;
      }

      const newConnection = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        start: movieA,
        target: movieB,
        path: [...lp, ...rp.slice(1).reverse()],
        moves: finalMoves,
        timeTaken,
        stars,
        difficulty: difficulty
          ? {
              key: difficulty.key,
              label: difficulty.label,
              emoji: difficulty.emoji,
              color: difficulty.color,
            }
          : null,
        timestamp: new Date().toISOString(),
      };

      const jsonValue = await AsyncStorage.getItem('completedConnections');
      const existing = jsonValue != null ? JSON.parse(jsonValue) : [];

      const updated = [newConnection, ...existing];
      await AsyncStorage.setItem('completedConnections', JSON.stringify(updated));
    } catch (e) {
      Alert.alert('Error', 'Failed to save completed connection.');
    }
  };

  const handleGameComplete = async (finalMoves, currentLeft, currentRight) => {
    try {
      const gameEndTime = Date.now();
      const timeTaken = Math.floor((gameEndTime - gameStartTime) / 1000);

      const lp = currentLeft || leftPath;
      const rp = currentRight || rightPath;

      // Collect all actors and movies from the paths
      const allActors = [];
      const allMovies = [];

      [...lp, ...rp].forEach((pathNode) => {
        if (pathNode.type === 'actor') {
          allActors.push(pathNode.data);
        } else if (pathNode.type === 'movie') {
          allMovies.push(pathNode.data);
          if (pathNode.data.actors) {
            allActors.push(...pathNode.data.actors);
          }
        }
      });

      // Record game completion with stats service
      const result = await GameStatsService.recordGameComplete({
        moves: finalMoves,
        actors: allActors,
        movies: allMovies,
        isWin: true,
        difficulty,
      });

      // Handle daily challenge submission (non-blocking)
      if (isDaily && challengeId) {
        try {
          await DailyChallengeService.submitResult(finalMoves, timeTaken, [...lp, ...rp]);
        } catch (dailyError) {
          logger.error('Error submitting daily challenge result:', dailyError);
        }
      }

      // Show summary card with all data
      setSummaryData({
        moves: finalMoves,
        timeTaken,
        leftPath: lp,
        rightPath: rp,
        movieA,
        movieB,
        expGained: result.expGained,
        stats: result.stats,
        newAchievements: result.newAchievements,
        isDaily,
        difficulty,
      });
      setShowSummary(true);
    } catch (error) {
      logger.error('Error handling game completion:', error);
      Alert.alert('🎉 You Win!', `You connected both sides in ${finalMoves} moves!`);
    }
  };

  const renderNode = (node, side) => {
    const sideLabel = side === 'A' ? 'Left' : 'Right';
    const sideColor = side === 'A' ? '#3498DB' : '#E67E22';
    if (node.type === 'movie') {
      const { title, posterPath, actors } = node.data;

      return (
        <View key={`${side}-movie-${node.data.id}`} style={styles.nodeCard}>
          <View style={[styles.sideLabel, { backgroundColor: sideColor }]}>
            <Text style={styles.sideLabelText}>{sideLabel} Path</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(title, 'Add to watchlist?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Add', onPress: () => addToWatchlist(node.data) },
              ]);
            }}
            activeOpacity={0.8}
          >
            <Image source={{ uri: posterPath }} style={styles.poster} />
          </TouchableOpacity>
          <Text style={styles.nodeTitle}>{title}</Text>
          {actors.map((actor, index) => {
            const isFavorited = favoriteActors.has(actor.id);
            return (
              <View key={`${side}-actor-${actor.id}-${index}`} style={styles.actorItem}>
                <TouchableOpacity
                  onPress={() => handleActorPress(actor, side)}
                  style={styles.clickableItem}
                >
                  <Text style={[styles.linkText, isFavorited && styles.favoritedActorText]}>
                    {isFavorited ? '⭐ ' : ''}
                    {actor.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => addActorToFavorites(actor)}
                  style={[styles.favoriteActorButton, isFavorited && styles.favoritedActorButton]}
                >
                  <Text
                    style={[
                      styles.favoriteActorButtonText,
                      isFavorited && styles.favoritedActorButtonText,
                    ]}
                  >
                    {isFavorited ? '★' : '⭐'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      );
    }

    if (node.type === 'actor') {
      const { name, profilePath, filmography } = node.data;
      return (
        <View key={`${side}-actor-${node.data.id}`} style={styles.nodeCard}>
          <View style={[styles.sideLabel, { backgroundColor: sideColor }]}>
            <Text style={styles.sideLabelText}>{sideLabel} Path</Text>
          </View>
          <Image source={{ uri: profilePath }} style={styles.poster} />
          <Text style={styles.nodeTitle}>{name}</Text>
          <ScrollView style={styles.actorScrollView}>
            {filmography.map((movie, index) => (
              <TouchableOpacity
                key={`${side}-movie-${movie.id}-${index}`}
                onPress={() => handleMoviePress(movie, side)}
                style={styles.clickableItem}
              >
                <Text style={styles.linkText}>
                  {movie.title}
                  {movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>CineMaze</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.moveBadge}>Moves: {moves}</Text>
          {previousBest && (
            <Text style={{ fontSize: 10, color: '#7F8C8D', marginTop: 2 }}>
              Best: {previousBest}
            </Text>
          )}
        </View>
      </View>

      {/* Goal card */}
      <View style={styles.goalCard}>
        <View style={styles.goalSide}>
          <Text style={styles.goalEmoji}>🎬</Text>
          <Text style={styles.goalMovie} numberOfLines={2}>
            {movieA.title}
          </Text>
        </View>
        <Text style={styles.goalArrow}>↔</Text>
        <View style={styles.goalSide}>
          <Text style={styles.goalEmoji}>🎬</Text>
          <Text style={styles.goalMovie} numberOfLines={2}>
            {movieB.title}
          </Text>
        </View>
      </View>
      {isConnected && <Text style={styles.win}>✅ Connected!</Text>}

      {difficulty && (
        <View style={[styles.difficultyChip, { backgroundColor: difficulty.color }]}>
          <Text style={styles.difficultyChipText}>
            {difficulty.emoji} {difficulty.label} — {difficulty.xpMultiplier}x XP
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={showHelpInstructions}>
          <Text style={styles.actionIcon}>❓</Text>
          <Text style={styles.actionLabel}>Help</Text>
        </TouchableOpacity>
        {moves > 0 && (
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowPathMap(true)}>
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionLabel}>Path</Text>
          </TouchableOpacity>
        )}
        {moves > 0 && !isConnected && (
          <TouchableOpacity
            style={[styles.actionButton, !lastSide && styles.actionButtonDisabled]}
            onPress={undoLastMove}
            disabled={!lastSide}
          >
            <Text style={styles.actionIcon}>↩️</Text>
            <Text style={styles.actionLabel}>Undo</Text>
          </TouchableOpacity>
        )}
        {!isDaily && (
          <TouchableOpacity style={styles.actionButton} onPress={resetGame}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionLabel}>Reset</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AccountOverviewScreen')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nodeRow}>
        {renderNode(leftNode, 'A')}
        {renderNode(rightNode, 'B')}
      </View>

      <GameSummaryCard
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        onHome={() => {
          setShowSummary(false);
          navigation.navigate('RandomMoviesScreen');
        }}
        gameData={summaryData}
      />

      <PathMapModal
        visible={showPathMap}
        onClose={() => setShowPathMap(false)}
        leftPath={leftPath}
        rightPath={rightPath}
        movieA={movieA}
        movieB={movieB}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60, // Add top padding to avoid status bar overlap
    alignItems: 'center',
    paddingBottom: 30,
    backgroundColor: '#B8DDF0', // Powder blue background
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2C3E50',
    letterSpacing: -0.5,
  },
  moveBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalSide: {
    flex: 1,
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  goalMovie: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  goalArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#BDC3C7',
    marginHorizontal: 8,
  },
  win: {
    fontSize: 15,
    color: '#27AE60',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  difficultyChip: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  difficultyChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 56,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(44, 62, 80, 0.08)',
  },
  actionButtonDisabled: {
    opacity: 0.35,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 2,
  },
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  nodeCard: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  sideLabel: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  sideLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  poster: {
    width: '85%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: '#ccc',
    // Raised edge effects
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    // Border effect for raised appearance
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
  },
  nodeTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  linkText: {
    color: '#3498DB',
    marginTop: 2,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  clickableItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginVertical: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 28,
    justifyContent: 'center',
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(184, 221, 240, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
  },
  actorScrollView: {
    maxHeight: 300, // Increased from 200 to show more movies
    width: '100%',
  },
  actorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  favoriteActorButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    borderWidth: 1,
    borderTopColor: '#FF9999',
    borderLeftColor: '#FF9999',
    borderRightColor: '#CC5555',
    borderBottomColor: '#CC5555',
    marginLeft: 8,
  },
  favoriteActorButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoritedActorText: {
    color: '#2980B9', // Keep the same color as normal text
    fontWeight: 'bold',
  },
  favoritedActorButton: {
    backgroundColor: '#4ECDC4',
    borderTopColor: '#7EDDDD',
    borderLeftColor: '#7EDDDD',
    borderRightColor: '#3EBBBB',
    borderBottomColor: '#3EBBBB',
  },
  favoritedActorButtonText: {
    color: '#FFFFFF',
  },
});

export default GameScreen;
