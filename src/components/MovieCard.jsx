import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

const MovieCard = memo(({ movie, onMoviePress }) => {
  const topCast = movie.actors ? movie.actors.slice(0, 3) : [];

  return (
    <View style={styles.movieCard}>
      <TouchableOpacity onPress={() => onMoviePress(movie)} activeOpacity={0.8}>
        <Image source={{ uri: movie.posterPath || PLACEHOLDER_IMAGE }} style={styles.poster} />
      </TouchableOpacity>
      <Text style={styles.movieTitle}>{movie.title}</Text>
      {topCast.length > 0 && (
        <View style={styles.castContainer}>
          <Text style={styles.castLabel}>Top Cast</Text>
          {topCast.map((actor) => (
            <Text key={actor.id} style={styles.castName} numberOfLines={1}>
              {actor.name}
            </Text>
          ))}
        </View>
      )}
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
    marginTop: 8,
    marginBottom: 2,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  castContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  castLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34495E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.5,
    marginBottom: 2,
  },
  castName: {
    fontSize: 12,
    color: '#34495E',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default MovieCard;
