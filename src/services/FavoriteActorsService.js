import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { logger } from '../utils/constants';

const FAVORITE_ACTORS_KEY = 'favoriteActors';

class FavoriteActorsService {
  static async getFavoriteActors() {
    try {
      const jsonValue = await AsyncStorage.getItem(FAVORITE_ACTORS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      logger.error('Error getting favorite actors:', error);
      return [];
    }
  }

  static async addFavoriteActor(actor) {
    try {
      const favorites = await this.getFavoriteActors();
      const exists = favorites.find((a) => a.id === actor.id);

      if (!exists) {
        const updated = [
          ...favorites,
          {
            id: actor.id,
            name: actor.name,
            profilePath: actor.profilePath,
            addedAt: new Date().toISOString(),
          },
        ];
        await AsyncStorage.setItem(FAVORITE_ACTORS_KEY, JSON.stringify(updated));
        Alert.alert('⭐ Added to Favorites', `${actor.name} added to your favorite actors!`);
        return true;
      } else {
        Alert.alert('ℹ️ Already in Favorites', `${actor.name} is already in your favorites!`);
        return false;
      }
    } catch (error) {
      logger.error('Error adding favorite actor:', error);
      Alert.alert('Error', 'Failed to add actor to favorites.');
      return false;
    }
  }

  static async removeFavoriteActor(actorId) {
    try {
      const favorites = await this.getFavoriteActors();
      const updated = favorites.filter((a) => a.id !== actorId);
      await AsyncStorage.setItem(FAVORITE_ACTORS_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      logger.error('Error removing favorite actor:', error);
      return false;
    }
  }

  static async isFavoriteActor(actorId) {
    try {
      const favorites = await this.getFavoriteActors();
      return favorites.some((a) => a.id === actorId);
    } catch (error) {
      logger.error('Error checking favorite actor:', error);
      return false;
    }
  }

  static async clearFavoriteActors() {
    try {
      await AsyncStorage.removeItem(FAVORITE_ACTORS_KEY);
      return true;
    } catch (error) {
      logger.error('Error clearing favorite actors:', error);
      return false;
    }
  }
}

export default FavoriteActorsService;
