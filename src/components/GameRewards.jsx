import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const GameRewards = ({ visible, onClose, rewards }) => {
  const [slideAnim] = useState(new Animated.Value(height));
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(height);
      scaleAnim.setValue(0);
    }
  }, [visible, slideAnim, scaleAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!rewards || (!rewards.levelUp && !rewards.achievements?.length && !rewards.expGained)) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
            {/* Level Up Celebration */}
            {rewards.levelUp && (
              <View style={styles.levelUpSection}>
                <Text style={styles.levelUpTitle}>🎉 LEVEL UP! 🎉</Text>
                <Text style={styles.levelUpText}>You reached Level {rewards.newLevel}!</Text>
                <Text style={styles.levelUpSubtext}>Keep playing to unlock more achievements!</Text>
              </View>
            )}

            {/* Experience Gained */}
            {rewards.expGained > 0 && !rewards.levelUp && (
              <View style={styles.expSection}>
                <Text style={styles.expTitle}>⭐ Great Game!</Text>
                <Text style={styles.expText}>+{rewards.expGained} XP</Text>
                <Text style={styles.expSubtext}>
                  {rewards.moves <= 3
                    ? 'Perfect execution!'
                    : rewards.moves <= 5
                    ? 'Excellent strategy!'
                    : 'Good effort!'}
                </Text>
              </View>
            )}

            {/* New Achievements */}
            {rewards.achievements?.length > 0 && (
              <View style={styles.achievementsSection}>
                <Text style={styles.achievementsTitle}>
                  🏆 Achievement{rewards.achievements.length > 1 ? 's' : ''} Unlocked!
                </Text>
                {rewards.achievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementCard}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <View style={styles.achievementText}>
                      <Text style={styles.achievementName}>{achievement.title}</Text>
                      <Text style={styles.achievementDesc}>{achievement.description}</Text>
                      <Text style={styles.achievementReward}>{achievement.reward}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Stats Summary */}
            {rewards.stats && (
              <View style={styles.statsSection}>
                <Text style={styles.statsTitle}>📊 Your Stats</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsText}>Level: {rewards.stats.level}</Text>
                  <Text style={styles.statsText}>Total Wins: {rewards.stats.totalWins}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsText}>
                    Best Score: {rewards.stats.bestMoveCount || 'N/A'}
                  </Text>
                  <Text style={styles.statsText}>Streak: {rewards.stats.currentStreak}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.continueButton} onPress={handleClose}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  levelUpSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelUpTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelUpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  levelUpSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  expSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  expTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  expText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  expSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  achievementsSection: {
    width: '100%',
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  achievementReward: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  statsSection: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    minWidth: 140,
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
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GameRewards;
