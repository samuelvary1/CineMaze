import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AchievementsScreen = ({ navigation }) => {
  const [completedConnections, setCompletedConnections] = useState([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [favoriteActorsCount, setFavoriteActorsCount] = useState(0);

  useEffect(() => {
    loadAchievementData();
  }, []);

  const loadAchievementData = async () => {
    try {
      // Load completed connections
      const connectionsData = await AsyncStorage.getItem('completedConnections');
      const connections = connectionsData ? JSON.parse(connectionsData) : [];
      setCompletedConnections(connections);

      // Load watchlist count
      const watchlistData = await AsyncStorage.getItem('watchlist');
      const watchlist = watchlistData ? JSON.parse(watchlistData) : [];
      setWatchlistCount(watchlist.length);

      // Load favorite actors count
      const actorsData = await AsyncStorage.getItem('favoriteActors');
      const actors = actorsData ? JSON.parse(actorsData) : [];
      setFavoriteActorsCount(actors.length);
    } catch (error) {
      console.error('Error loading achievement data:', error);
    }
  };

  const achievements = [
    {
      id: 'first_game',
      title: 'First Steps',
      description: 'Complete your first movie connection',
      icon: '🎯',
      unlocked: completedConnections.length >= 1,
      progress: Math.min(completedConnections.length, 1),
      total: 1,
    },
    {
      id: 'game_master',
      title: 'Game Master',
      description: 'Complete 10 movie connections',
      icon: '🎮',
      unlocked: completedConnections.length >= 10,
      progress: Math.min(completedConnections.length, 10),
      total: 10,
    },
    {
      id: 'cinema_expert',
      title: 'Cinema Expert',
      description: 'Complete 25 movie connections',
      icon: '🎬',
      unlocked: completedConnections.length >= 25,
      progress: Math.min(completedConnections.length, 25),
      total: 25,
    },
    {
      id: 'movie_legend',
      title: 'Movie Legend',
      description: 'Complete 50 movie connections',
      icon: '🏆',
      unlocked: completedConnections.length >= 50,
      progress: Math.min(completedConnections.length, 50),
      total: 50,
    },
    {
      id: 'collector',
      title: 'Collector',
      description: 'Add 20 movies to your watchlist',
      icon: '📚',
      unlocked: watchlistCount >= 20,
      progress: Math.min(watchlistCount, 20),
      total: 20,
    },
    {
      id: 'star_tracker',
      title: 'Star Tracker',
      description: 'Follow 15 favorite actors',
      icon: '⭐',
      unlocked: favoriteActorsCount >= 15,
      progress: Math.min(favoriteActorsCount, 15),
      total: 15,
    },
    {
      id: 'speed_runner',
      title: 'Speed Runner',
      description: 'Complete a connection in under 30 seconds',
      icon: '⚡',
      unlocked: false, // This would need to be tracked in game logic
      progress: 0,
      total: 1,
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Complete 5 connections without any wrong guesses',
      icon: '💎',
      unlocked: false, // This would need to be tracked in game logic
      progress: 0,
      total: 5,
    },
  ];

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  const renderAchievement = (achievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlocked ? styles.unlockedCard : styles.lockedCard,
      ]}
    >
      <View style={styles.achievementIcon}>
        <Text style={styles.iconText}>{achievement.icon}</Text>
      </View>
      <View style={styles.achievementContent}>
        <Text
          style={[
            styles.achievementTitle,
            achievement.unlocked ? styles.unlockedTitle : styles.lockedTitle,
          ]}
        >
          {achievement.title}
        </Text>
        <Text
          style={[
            styles.achievementDescription,
            achievement.unlocked ? styles.unlockedDescription : styles.lockedDescription,
          ]}
        >
          {achievement.description}
        </Text>
        {!achievement.unlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(achievement.progress / achievement.total) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.total}
            </Text>
          </View>
        )}
      </View>
      {achievement.unlocked && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Achievements</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {unlockedCount} of {achievements.length} unlocked
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(unlockedCount / achievements.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {achievements.map(renderAchievement)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8DDF0',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E5984',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E5984',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E5984',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  unlockedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  lockedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#CCCCCC',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unlockedTitle: {
    color: '#2E5984',
  },
  lockedTitle: {
    color: '#999999',
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  unlockedDescription: {
    color: '#555555',
  },
  lockedDescription: {
    color: '#AAAAAA',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 8,
    minWidth: 40,
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AchievementsScreen;
