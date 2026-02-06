import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameStatsService from '../services/GameStatsService';

const AchievementsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [earnedIds, setEarnedIds] = useState([]);
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    loadAchievementData();
  }, []);

  const loadAchievementData = async () => {
    try {
      const playerStats = await GameStatsService.getPlayerStats();
      setStats(playerStats);

      const earned = await GameStatsService.getAchievements();
      setEarnedIds(earned);

      const watchlistData = await AsyncStorage.getItem('watchlist');
      const watchlist = watchlistData ? JSON.parse(watchlistData) : [];
      setWatchlistCount(watchlist.length);
    } catch (error) {
      console.error('Error loading achievement data:', error);
    }
  };

  const getProgress = (id) => {
    if (!stats) {
      return { progress: 0, total: 1 };
    }
    switch (id) {
      case 'first_win':
        return { progress: Math.min(stats.totalWins, 1), total: 1 };
      case 'speed_demon':
        return { progress: stats.bestMoveCount <= 3 ? 1 : 0, total: 1 };
      case 'minimalist':
        return { progress: stats.bestMoveCount <= 2 ? 1 : 0, total: 1 };
      case 'marathon_player':
        return { progress: 0, total: 5 };
      case 'streak_master':
        return { progress: Math.min(stats.currentStreak, 7), total: 7 };
      case 'collector':
        return { progress: Math.min(watchlistCount, 10), total: 10 };
      case 'perfectionist':
        return { progress: Math.min(stats.perfectGames, 10), total: 10 };
      case 'explorer':
        return { progress: Math.min(stats.uniqueActorsFound?.size || 0, 50), total: 50 };
      case 'century_club':
        return { progress: Math.min(stats.totalWins, 100), total: 100 };
      case 'easy_first':
        return { progress: Math.min(stats.easyWins || 0, 1), total: 1 };
      case 'medium_first':
        return { progress: Math.min(stats.mediumWins || 0, 1), total: 1 };
      case 'hard_first':
        return { progress: Math.min(stats.hardWins || 0, 1), total: 1 };
      case 'easy_25':
        return { progress: Math.min(stats.easyWins || 0, 25), total: 25 };
      case 'medium_25':
        return { progress: Math.min(stats.mediumWins || 0, 25), total: 25 };
      case 'hard_25':
        return { progress: Math.min(stats.hardWins || 0, 25), total: 25 };
      case 'hard_100':
        return { progress: Math.min(stats.hardWins || 0, 100), total: 100 };
      default:
        return { progress: 0, total: 1 };
    }
  };

  // Build achievements list from the canonical ACHIEVEMENTS in GameStatsService
  const { ACHIEVEMENTS } = require('../services/GameStatsService');
  const achievements = Object.values(ACHIEVEMENTS).map((a) => {
    const unlocked = earnedIds.includes(a.id);
    const { progress, total } = getProgress(a.id);
    return { ...a, unlocked, progress, total };
  });

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
