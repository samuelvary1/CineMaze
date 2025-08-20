import React, { useState, useLayoutEffect, useCallback } from 'react';
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

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';

// Header right button component
const HeaderRightButton = ({ onPress, style, textStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={textStyle}>👤</Text>
  </TouchableOpacity>
);

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

  // Header right component callback
  const renderHeaderRight = useCallback(
    () => (
      <HeaderRightButton
        onPress={() => navigation.navigate('AccountOverviewScreen')}
        style={styles.headerRightButton}
        textStyle={styles.headerRightText}
      />
    ),
    [navigation],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
    });
  }, [navigation, renderHeaderRight]);

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
          <Image source={{ uri: posterPath }} style={styles.poster} />
          <TouchableOpacity onPress={() => addToWatchlist(node.data)}>
            <Text style={styles.watchlistButton}>+ Add to Watchlist</Text>
          </TouchableOpacity>
          <Text style={styles.nodeTitle}>{title}</Text>
          <Text style={styles.subTitle}>Top Actors:</Text>
          {actors.map((actor, index) => (
            <TouchableOpacity
              key={`${side}-actor-${actor.id}-${index}`}
              onPress={() => handleActorPress(actor, side)}
            >
              <Text style={styles.linkText}>{actor.name}</Text>
            </TouchableOpacity>
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
      <Text style={styles.title}>
        🎯 Connect {movieA.title} ↔ {movieB.title}
      </Text>
      <Text style={styles.moves}>Moves: {moves}</Text>
      {isConnected && <Text style={styles.win}>✅ You’ve connected the movies!</Text>}

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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  moves: {
    fontSize: 16,
    marginBottom: 10,
  },
  win: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  watchlistNavButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  watchlistNavButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
    gap: 20,
  },
  nodeCard: {
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
  nodeTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subTitle: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  linkText: {
    color: '#007BFF',
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
  },
  watchlistButton: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  headerRightButton: {
    marginRight: 15,
  },
  headerRightText: {
    fontSize: 18,
  },
  actorScrollView: {
    maxHeight: 225,
  },
});

export default GameScreen;
