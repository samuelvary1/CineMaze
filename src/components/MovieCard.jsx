import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const MovieCard = memo(({ movie, onAddToWatchlist }) => {
  return (
    <View style={styles.movieCard}>
      <Image source={{ uri: movie.posterPath || PLACEHOLDER_IMAGE }} style={styles.poster} />
      <TouchableOpacity onPress={() => onAddToWatchlist(movie)}>
        <Text style={styles.watchlistAddButton}>+ Add to Watchlist</Text>
      </TouchableOpacity>
      <Text style={styles.movieTitle}>{movie.title}</Text>
      <Text style={styles.actorListTitle}>Top Actors:</Text>
      {movie.actors.map((actor) => (
        <Text key={actor.id} style={styles.actorName}>
          {actor.name}
        </Text>
      ))}
    </View>
  );
});

MovieCard.displayName = 'MovieCard';

const styles = StyleSheet.create({
  movieCard: {
    flex: 1,
    maxWidth: '48%',
    alignItems: 'center',
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  watchlistAddButton: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
  movieTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actorListTitle: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  actorName: {
    fontSize: 14,
    color: '#555',
  },
});

export default MovieCard;
