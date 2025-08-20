import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import GameStatsService, { ACHIEVEMENTS } from '../services/GameStatsService';

const PlayerStats = ({ visible, onClose }) => {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [playerStats, earnedAchievements] = await Promise.all([
        GameStatsService.getPlayerStats(),
        GameStatsService.getAchievements(),
      ]);

      setStats(playerStats);
      setAchievements(earnedAchievements);
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getProgressToNextLevel = () => {
    if (!stats) {
      return 0;
    }
    return (stats.experience / stats.nextLevelExp) * 100;
  };

  const renderAchievementCard = (achievementId) => {
    const achievement = ACHIEVEMENTS[achievementId.toUpperCase()];
    if (!achievement) {
      return null;
    }

    return (
      <View key={achievement.id} style={styles.achievementCard}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementText}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDesc}>{achievement.description}</Text>
        </View>
      </View>
    );
  };

  const renderLockedAchievement = (achievement) => {
    return (
      <View key={achievement.id} style={[styles.achievementCard, styles.lockedCard]}>
        <Text style={styles.lockedIcon}>🔒</Text>
        <View style={styles.achievementText}>
          <Text style={[styles.achievementTitle, styles.lockedText]}>{achievement.title}</Text>
          <Text style={[styles.achievementDesc, styles.lockedText]}>{achievement.description}</Text>
        </View>
      </View>
    );
  };

  if (loading || !stats) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>📊 Loading Stats...</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>📊 Your Stats</Text>

            {/* Player Level */}
            <View style={styles.levelSection}>
              <Text style={styles.levelTitle}>🎖️ Level {stats.level}</Text>
              <View style={styles.expBar}>
                <View style={[styles.expFill, { width: `${getProgressToNextLevel()}%` }]} />
              </View>
              <Text style={styles.expText}>
                {stats.experience} / {stats.nextLevelExp} XP
              </Text>
            </View>

            {/* Core Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎮 Game Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalWins}</Text>
                  <Text style={styles.statLabel}>Games Won</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.bestMoveCount || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Best Score</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.averageMoves || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Avg Moves</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Daily Streak</Text>
                </View>
              </View>
            </View>

            {/* Discovery Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🗺️ Discovery</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.uniqueActorsFound.size}</Text>
                  <Text style={styles.statLabel}>Actors Found</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.moviesWatched.size}</Text>
                  <Text style={styles.statLabel}>Movies Seen</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.perfectGames}</Text>
                  <Text style={styles.statLabel}>Perfect Games</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.longestStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🏆 Achievements ({achievements.length}/{Object.keys(ACHIEVEMENTS).length})
              </Text>

              {/* Earned Achievements */}
              {achievements.map(renderAchievementCard)}

              {/* Locked Achievements */}
              {Object.values(ACHIEVEMENTS)
                .filter((achievement) => !achievements.includes(achievement.id))
                .map(renderLockedAchievement)}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  levelSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  expBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  expFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  expText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  lockedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  lockedIcon: {
    fontSize: 24,
    marginRight: 12,
    opacity: 0.5,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  lockedText: {
    opacity: 0.5,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PlayerStats;
