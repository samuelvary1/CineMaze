import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';

const MovieCard = memo(({ movie, onAddToWatchlist }) => {
  return (
    <View style={styles.movieCard}>
      <TouchableOpacity onPress={() => onAddToWatchlist(movie)} activeOpacity={0.8}>
        <Image source={{ uri: movie.posterPath || PLACEHOLDER_IMAGE }} style={styles.poster} />
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
    width: 140, // Slightly smaller to fit better
    height: 210, // Proportionally smaller
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
  movieTitle: {
    marginTop: 8, // Reduced from 10
    marginBottom: 4, // Add small spacing before actors list
    fontSize: 15, // Slightly smaller
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  actorListTitle: {
    marginTop: 6, // Reduced from 10
    fontWeight: 'bold',
    fontSize: 13, // Slightly smaller
    color: '#34495E',
  },
  actorName: {
    fontSize: 13, // Slightly smaller
    color: '#555',
    lineHeight: 16, // Tighter line spacing
  },
});

export default MovieCard;
