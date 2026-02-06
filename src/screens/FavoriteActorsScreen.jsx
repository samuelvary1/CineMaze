import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import FavoriteActorsService from '../services/FavoriteActorsService';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const FavoriteActorsScreen = ({ navigation }) => {
  const [favoriteActors, setFavoriteActors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getActorImageUrl = (profilePath) => {
    if (!profilePath) {
      return PLACEHOLDER_IMAGE;
    }
    // If it already starts with http, use as is (new format)
    if (profilePath.startsWith('http')) {
      return profilePath;
    }
    // If it's just a path, prepend IMAGE_BASE (old format)
    return IMAGE_BASE + profilePath;
  };

  useEffect(() => {
    loadFavoriteActors();
  }, []);

  const loadFavoriteActors = async () => {
    try {
      const actors = await FavoriteActorsService.getFavoriteActors();
      setFavoriteActors(actors);
    } catch (error) {
      console.error('Error loading favorite actors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActorPress = (actor) => {
    navigation.navigate('ActorDetailScreen', {
      actorId: actor.id,
      actorName: actor.name,
      actorProfilePath: actor.profilePath,
    });
  };

  const handleRemoveActor = async (actorId, actorName) => {
    Alert.alert('Remove from Favorites', `Remove ${actorName} from your favorite actors?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await FavoriteActorsService.removeFavoriteActor(actorId);
          loadFavoriteActors();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading favorite actors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>⭐ Favorite Actors</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {favoriteActors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No favorite actors yet!</Text>
            <Text style={styles.emptySubText}>
              Tap on actor headshots in the game to add them to your favorites.
            </Text>
          </View>
        ) : (
          <View style={styles.actorsGrid}>
            {favoriteActors.map((actor) => (
              <View key={actor.id} style={styles.actorCard}>
                <TouchableOpacity onPress={() => handleActorPress(actor)} activeOpacity={0.8}>
                  <Image
                    source={{ uri: getActorImageUrl(actor.profilePath) }}
                    style={styles.actorImage}
                    defaultSource={{ uri: PLACEHOLDER_IMAGE }}
                  />
                </TouchableOpacity>
                <Text style={styles.actorName}>{actor.name}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveActor(actor.id, actor.name)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#B8DDF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20, // Add horizontal margin for spacing
  },
  headerSpacer: {
    width: 80, // Same width as back button to center logo
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
    fontSize: 13,
    color: '#34495E',
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2C3E50',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8DDF0',
  },
  loadingText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#34495E',
    textAlign: 'center',
    lineHeight: 20,
  },
  actorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actorCard: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actorImage: {
    width: 90, // Reduced from 120
    height: 135, // Reduced from 180 (maintaining aspect ratio)
    borderRadius: 12,
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
  },
  actorName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2C3E50',
  },
  removeButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    borderWidth: 2,
    borderTopColor: '#FF6B6B',
    borderLeftColor: '#FF6B6B',
    borderRightColor: '#C0392B',
    borderBottomColor: '#C0392B',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FavoriteActorsScreen;
