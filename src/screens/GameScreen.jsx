import React, { useState } from 'react';
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
import GameRewards from '../components/GameRewards';
import FavoriteActorsService from '../services/FavoriteActorsService';
import SubscriptionService, { FEATURES } from '../services/SubscriptionService';
import PaywallModal from '../components/PaywallModal';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const GameScreen = ({ route, navigation }) => {
  const { movieA, movieB } = route.params;

  const [leftNode, setLeftNode] = useState({ type: 'movie', data: movieA });
  const [rightNode, setRightNode] = useState({ type: 'movie', data: movieB });
  const [leftPath, setLeftPath] = useState([{ type: 'movie', data: movieA }]);
  const [rightPath, setRightPath] = useState([{ type: 'movie', data: movieB }]);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [gameRewards, setGameRewards] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const addActorToFavorites = async (actor) => {
    try {
      // Check if user has premium access
      const hasPremium = await SubscriptionService.hasFeature(FEATURES.UNLIMITED_PLAYS);
      if (!hasPremium) {
        setShowPaywall(true);
        return;
      }

      await FavoriteActorsService.addFavoriteActor({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profilePath ? IMAGE_BASE + actor.profilePath : PLACEHOLDER_IMAGE,
      });
    } catch (error) {
      console.error('Error adding actor to favorites:', error);
      Alert.alert('Error', 'Failed to add actor to favorites.');
    }
  };

  const handleSubscriptionSuccess = async () => {
    setShowPaywall(false);
    Alert.alert('🎉 Welcome to Premium!', 'You can now add actors to favorites!');
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
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
    );
    const movieData = await movieRes.json();

    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
    );
    const credits = await creditsRes.json();

    const topActors = (credits.cast || []).slice(0, 10).map((actor) => ({
      id: actor.id,
      name: actor.name,
      profilePath: actor.profile_path,
    }));

    return {
      id: movieData.id,
      title: movieData.title,
      posterPath: movieData.poster_path ? IMAGE_BASE + movieData.poster_path : PLACEHOLDER,
      actors: topActors,
    };
  };

  const fetchActorWithFilmography = async (actorId) => {
    const actorRes = await fetch(
      `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`,
    );
    const actorData = await actorRes.json();

    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`,
    );
    const credits = await creditsRes.json();

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
      profilePath: actorData.profile_path ? IMAGE_BASE + actorData.profile_path : PLACEHOLDER,
      filmography,
    };
  };

  const updateSide = (side, node) => {
    const setPath = side === 'A' ? setLeftPath : setRightPath;
    const getOtherPath = side === 'A' ? rightPath : leftPath;
    setPath((prev) => {
      const newPath = [...prev, node];

      const foundMatch = getOtherPath.find(
        (n) => n.data.id === node.data.id && n.type === node.type,
      );
      if (foundMatch && !isConnected) {
        setIsConnected(true);
        saveCompletedConnection();
        handleGameComplete(moves + 1);
      }

      return newPath;
    });
    setMoves((prev) => prev + 1);
  };

  const handleActorPress = async (actor, side) => {
    if (isConnected) {
      return;
    }
    setLoading(true);
    const actorData = await fetchActorWithFilmography(actor.id);
    const node = { type: 'actor', data: actorData };
    side === 'A' ? setLeftNode(node) : setRightNode(node);
    updateSide(side, node);
    setLoading(false);
  };

  const handleMoviePress = async (movie, side) => {
    if (isConnected) {
      return;
    }
    setLoading(true);
    const movieData = await fetchMovieWithCredits(movie.id);
    const node = { type: 'movie', data: movieData };
    side === 'A' ? setLeftNode(node) : setRightNode(node);
    updateSide(side, node);
    setLoading(false);
  };

  const saveCompletedConnection = async () => {
    try {
      const newConnection = {
        id: uuid.v4(),
        start: movieA,
        target: movieB,
        path: [...leftPath, ...rightPath.slice(1).reverse()],
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

  const handleGameComplete = async (finalMoves) => {
    try {
      // Collect all actors and movies from the paths
      const allActors = [];
      const allMovies = [];

      [...leftPath, ...rightPath].forEach((pathNode) => {
        if (pathNode.type === 'actor') {
          allActors.push(pathNode.data);
        } else if (pathNode.type === 'movie') {
          allMovies.push(pathNode.data);
          // Add actors from the movie
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

      // Prepare rewards data
      const rewardsData = {
        moves: finalMoves,
        expGained: result.expGained,
        stats: result.stats,
        achievements: result.newAchievements,
      };

      // Check for level up
      if (result.newAchievements?.some((a) => a.id === 'level_up')) {
        rewardsData.levelUp = true;
        rewardsData.newLevel = result.stats.level;
      }

      // Show standard win alert first
      Alert.alert('🎉 You Win!', `You connected both sides in ${finalMoves} moves!`, [
        {
          text: 'View Rewards',
          onPress: () => {
            setGameRewards(rewardsData);
            setShowRewards(true);
          },
        },
        { text: 'Continue', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Error handling game completion:', error);
      // Fallback to simple alert
      Alert.alert('🎉 You Win!', `You connected both sides in ${finalMoves} moves!`);
    }
  };

  const renderNode = (node, side) => {
    if (node.type === 'movie') {
      const { title, posterPath, actors } = node.data;
      return (
        <View key={node.data.id} style={styles.nodeCard}>
          <TouchableOpacity onPress={() => addToWatchlist(node.data)} activeOpacity={0.8}>
            <Image source={{ uri: posterPath }} style={styles.poster} />
          </TouchableOpacity>
          <Text style={styles.nodeTitle}>{title}</Text>
          <Text style={styles.subTitle}>Top Actors:</Text>
          {actors.map((actor, index) => (
            <View key={`${side}-actor-${actor.id}-${index}`} style={styles.actorItem}>
              <TouchableOpacity
                onPress={() => handleActorPress(actor, side)}
                style={styles.clickableItem}
              >
                <Text style={styles.linkText}>{actor.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => addActorToFavorites(actor)}
                style={styles.favoriteActorButton}
              >
                <Text style={styles.favoriteActorButtonText}>⭐</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }

    if (node.type === 'actor') {
      const { name, profilePath, filmography } = node.data;
      return (
        <View key={node.data.id} style={styles.nodeCard}>
          <Image source={{ uri: profilePath }} style={styles.poster} />
          <Text style={styles.nodeTitle}>{name}</Text>
          <Text style={styles.subTitle}>Filmography:</Text>
          <ScrollView style={styles.actorScrollView}>
            {filmography.map((movie, index) => (
              <TouchableOpacity
                key={`${side}-movie-${movie.id}-${index}`}
                onPress={() => handleMoviePress(movie, side)}
                style={styles.clickableItem}
              >
                <Text style={styles.linkText}>
                  {movie.title} ({movie.release_date.slice(0, 4)})
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
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('AccountOverviewScreen')}
        >
          <Text style={styles.headerButtonText}>👤</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        🎯 Connect {movieA.title} ↔ {movieB.title}
      </Text>
      <Text style={styles.moves}>Moves: {moves}</Text>
      {isConnected && <Text style={styles.win}>✅ You've connected the movies!</Text>}

      {loading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}

      <View style={styles.nodeRow}>
        {renderNode(leftNode, 'A')}
        {renderNode(rightNode, 'B')}
      </View>

      <GameRewards
        visible={showRewards}
        onClose={() => setShowRewards(false)}
        rewards={gameRewards}
      />

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscriptionSuccess}
      />
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
    width: 150,
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  subTitle: {
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 13,
    color: '#34495E',
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
  loadingIndicator: {
    marginVertical: 16,
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
});

export default GameScreen;
