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
import uuid from 'react-native-uuid';
import GameStatsService from '../services/GameStatsService';
import DailyChallengeService from '../services/DailyChallengeService';
import GameSummaryCard from '../components/GameSummaryCard';
import FavoriteActorsService from '../services/FavoriteActorsService';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const GameScreen = ({ route, navigation }) => {
  const { movieA, movieB, isDaily = false, challengeId } = route.params;

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
      console.error('Error loading favorite actors:', error);
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
      console.error('Error adding actor to favorites:', error);
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
      console.error('Error fetching actor:', error);
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
      console.error('Error fetching movie:', error);
      Alert.alert('Connection Error', 'Failed to load movie data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCompletedConnection = async (currentLeft, currentRight) => {
    try {
      const lp = currentLeft || leftPath;
      const rp = currentRight || rightPath;
      const newConnection = {
        id: uuid.v4(),
        start: movieA,
        target: movieB,
        path: [...lp, ...rp.slice(1).reverse()],
        moves: moves + 1,
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
      });

      // Handle daily challenge submission (non-blocking)
      if (isDaily && challengeId) {
        try {
          await DailyChallengeService.submitResult(finalMoves, timeTaken, [...lp, ...rp]);
        } catch (dailyError) {
          console.error('Error submitting daily challenge result:', dailyError);
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
      });
      setShowSummary(true);
    } catch (error) {
      console.error('Error handling game completion:', error);
      Alert.alert('🎉 You Win!', `You connected both sides in ${finalMoves} moves!`);
    }
  };

  const renderPathBreadcrumbs = (path, side) => {
    if (path.length <= 1) {
      return null;
    }
    return (
      <View style={styles.breadcrumbContainer}>
        {path.slice(0, -1).map((node, index) => (
          <Text key={`breadcrumb-${side}-${index}`} style={styles.breadcrumbText} numberOfLines={1}>
            {index > 0 ? ' → ' : ''}
            {node.type === 'movie' ? '🎬' : '🎭'} {node.data.title || node.data.name}
          </Text>
        ))}
      </View>
    );
  };

  const renderNode = (node, side) => {
    const sideLabel = side === 'A' ? 'Left' : 'Right';
    const sideColor = side === 'A' ? '#3498DB' : '#E67E22';
    const path = side === 'A' ? leftPath : rightPath;
    if (node.type === 'movie') {
      const { title, posterPath, actors } = node.data;

      return (
        <View key={`${side}-movie-${node.data.id}`} style={styles.nodeCard}>
          <View style={[styles.sideLabel, { backgroundColor: sideColor }]}>
            <Text style={styles.sideLabelText}>{sideLabel} Path</Text>
          </View>
          {renderPathBreadcrumbs(path, side)}
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
          {renderPathBreadcrumbs(path, side)}
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
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>CineMaze</Text>
            <View style={styles.logoAccent} />
          </View>
          <Text style={styles.tagline}>Discover Movies and Actors Through Play</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={showHelpInstructions}>
            <Text style={styles.headerButtonText}>❓</Text>
          </TouchableOpacity>
          {moves > 0 && !isConnected && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={undoLastMove}
              disabled={!lastSide}
            >
              <Text style={[styles.headerButtonText, !lastSide && { opacity: 0.3 }]}>↩️</Text>
            </TouchableOpacity>
          )}
          {!isDaily && (
            <TouchableOpacity style={styles.headerButton} onPress={resetGame}>
              <Text style={styles.headerButtonText}>🔄</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AccountOverviewScreen')}
          >
            <Text style={styles.headerButtonText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>
        🎯 Connect {movieA.title} ↔ {movieB.title}
      </Text>
      <Text style={styles.moves}>Moves: {moves}</Text>
      {isConnected && <Text style={styles.win}>✅ You've connected the movies!</Text>}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  logoContainer: {
    alignItems: 'flex-start',
    flex: 1,
  },
  logoTextContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerButtonText: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moves: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495E',
    fontWeight: '600',
  },
  win: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
    gap: 16,
  },
  nodeCard: {
    width: 165,
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
  breadcrumbContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 6,
    width: '100%',
    maxHeight: 40,
  },
  breadcrumbText: {
    fontSize: 10,
    color: '#34495E',
    fontWeight: '500',
  },
  poster: {
    width: 140,
    height: 210,
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
