import React, { memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MovieCard from './MovieCard';

const MoviesContainer = memo(({ movies, onMoviePress, isLoading, isDailyChallenge = false }) => {
  return (
    <View style={styles.containerWrapper}>
      <View style={styles.movieContainer}>
        {!isLoading && movies && movies.length === 2
          ? movies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}-${Date.now()}`}
                movie={movie}
                onMoviePress={onMoviePress}
              />
            ))
          : null}
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3498DB" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      )}
    </View>
  );
});

MoviesContainer.displayName = 'MoviesContainer';

const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    minHeight: 420, // Reduced from 520 to condense layout
    marginBottom: 12, // Reduced from 20
    position: 'relative',
  },
  movieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: '100%',
    gap: 16, // Reduced from 20
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 221, 240, 0.7)',
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
});

export default MoviesContainer;
