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
      {movie.actors && movie.actors.length > 0 && (
        <View style={styles.actorBadge}>
          <Text style={styles.actorBadgeText}>🎭 {movie.actors.length} actors</Text>
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
    marginBottom: 4,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  actorBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  actorBadgeText: {
    fontSize: 12,
    color: '#34495E',
    fontWeight: '500',
  },
});

export default MovieCard;
