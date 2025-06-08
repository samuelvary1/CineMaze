import React, { useState, useEffect } from 'react';
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
import { TMDB_API_KEY } from '@env';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';

const GameScreen = ({ route }) => {
  const { movieA, movieB } = route.params;

  const [leftNode, setLeftNode] = useState({ type: 'movie', data: movieA });
  const [rightNode, setRightNode] = useState({ type: 'movie', data: movieB });
  const [path, setPath] = useState([]);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(false);

  // Utility: fetch top 10 actors for a movie
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

  // Utility: fetch filmography for an actor
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
      .sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
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

  const handleActorPress = async (actor, side) => {
    setLoading(true);
    const actorData = await fetchActorWithFilmography(actor.id);
    const node = { type: 'actor', data: actorData };
    side === 'A' ? setLeftNode(node) : setRightNode(node);
    updatePath(node, side);
    setLoading(false);
  };

  const handleMoviePress = async (movie, side) => {
    setLoading(true);
    const movieData = await fetchMovieWithCredits(movie.id);
    const node = { type: 'movie', data: movieData };
    side === 'A' ? setLeftNode(node) : setRightNode(node);
    updatePath(node, side);
    setLoading(false);

    // Check win condition
    if (movie.id === movieB.id) {
      Alert.alert('🎉 You Win!', `You connected the movies in ${moves + 1} moves!`);
    }
  };

  const updatePath = (node, side) => {
    setPath((prev) => [...prev, { ...node, side }]);
    setMoves((prev) => prev + 1);
  };

  const renderNode = (node, side) => {
    if (node.type === 'movie') {
      const { title, posterPath, actors } = node.data;
      return (
        <View key={node.data.id} style={styles.nodeCard}>
          <Image source={{ uri: posterPath }} style={styles.poster} />
          <Text style={styles.nodeTitle}>{title}</Text>
          <Text style={styles.subTitle}>Top Actors:</Text>
          {actors.map((actor, index) => (
            <TouchableOpacity
              key={`${actor.id}-${index}`}
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
          <ScrollView style={{ maxHeight: 225 }}>
            {filmography.map((movie) => (
              <TouchableOpacity key={movie.id} onPress={() => handleMoviePress(movie, side)}>
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
        🎯 Connect {movieA.title} → {movieB.title}
      </Text>
      <Text style={styles.moves}>Moves: {moves}</Text>

      {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

      <View style={styles.nodeRow}>
        {renderNode(leftNode, 'A')}
        {renderNode(rightNode, 'B')}
      </View>
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
    marginBottom: 15,
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
});

export default GameScreen;
