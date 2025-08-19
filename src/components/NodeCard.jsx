import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const NodeCard = ({ node, side, onActorPress, onMoviePress, onAddToWatchlist }) => {
  if (node.type === 'movie') {
    const { title, posterPath, actors } = node.data;
    return (
      <View key={node.data.id} style={styles.nodeCard}>
        <Image source={{ uri: posterPath }} style={styles.poster} />
        <TouchableOpacity onPress={() => onAddToWatchlist(node.data)}>
          <Text style={styles.watchlistButton}>+ Add to Watchlist</Text>
        </TouchableOpacity>
        <Text style={styles.nodeTitle}>{title}</Text>
        <Text style={styles.subTitle}>Top Actors:</Text>
        {actors.map((actor, index) => (
          <TouchableOpacity
            key={`${side}-actor-${actor.id}-${index}`}
            onPress={() => onActorPress(actor, side)}
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
          {filmography.map((movie, index) => (
            <TouchableOpacity
              key={`${side}-movie-${movie.id}-${index}`}
              onPress={() => onMoviePress(movie, side)}
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

const styles = StyleSheet.create({
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
});

export default NodeCard;
