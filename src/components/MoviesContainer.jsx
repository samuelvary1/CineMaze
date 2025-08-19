import React, { memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MovieCard from './MovieCard';

const MoviesContainer = memo(({ movies, onAddToWatchlist, isLoading }) => {
  return (
    <View style={styles.containerWrapper}>
      <View style={styles.movieContainer}>
        {!isLoading && movies && movies.length === 2
          ? movies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${index}-${Date.now()}`}
                movie={movie}
                onAddToWatchlist={onAddToWatchlist}
              />
            ))
          : null}
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading new movies...</Text>
        </View>
      )}
    </View>
  );
});

MoviesContainer.displayName = 'MoviesContainer';

const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    minHeight: 520, // Generous height to accommodate all content
    marginBottom: 20,
    position: 'relative',
  },
  movieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: '100%',
    gap: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent overlay
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default MoviesContainer;
