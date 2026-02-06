import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const getStarRating = (moves) => {
  if (moves <= 3) {
    return 3;
  }
  if (moves <= 5) {
    return 2;
  }
  return 1;
};

const getStarDisplay = (stars) => '★'.repeat(stars) + '☆'.repeat(3 - stars);

const getRatingLabel = (stars) => {
  switch (stars) {
    case 3:
      return 'Perfect!';
    case 2:
      return 'Great!';
    case 1:
      return 'Good!';
    default:
      return '';
  }
};

const getRatingColor = (stars) => {
  switch (stars) {
    case 3:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 1:
      return '#CD7F32';
    default:
      return '#888';
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

const GameSummaryCard = ({ visible, onClose, onHome, gameData }) => {
  if (!visible || !gameData) {
    return null;
  }

  const {
    moves,
    timeTaken,
    leftPath,
    rightPath,
    movieA,
    movieB,
    expGained,
    stats,
    newAchievements,
    isDaily,
  } = gameData;

  const stars = getStarRating(moves);
  const starColor = getRatingColor(stars);

  const handleShare = async () => {
    const starText = '⭐'.repeat(stars);
    const shareLines = [
      `CineMaze ${starText}`,
      `${movieA.title} ↔ ${movieB.title}`,
      `${moves} moves · ${formatTime(timeTaken)}`,
      '',
      'Can you beat my score?',
    ];

    try {
      await Share.share({ message: shareLines.join('\n') });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderPathNode = (node, index, isLast) => (
    <View key={`path-${index}`} style={styles.pathNodeWrapper}>
      <View style={styles.pathNodeRow}>
        <View
          style={[
            styles.pathDot,
            {
              backgroundColor: node.type === 'movie' ? '#3498DB' : '#E67E22',
            },
          ]}
        />
        <Text style={styles.pathNodeText} numberOfLines={1}>
          {node.type === 'movie' ? '🎬 ' : '🎭 '}
          {node.data.title || node.data.name}
        </Text>
      </View>
      {!isLast && <View style={styles.pathConnector} />}
    </View>
  );

  // Build the merged display path: leftPath → rightPath reversed (skip duplicate)
  const mergedPath = [...leftPath];
  if (rightPath.length > 1) {
    const reversed = [...rightPath].reverse();
    // Skip first element of reversed if it matches last of leftPath
    const startIdx =
      reversed.length > 0 &&
      mergedPath.length > 0 &&
      reversed[0].data.id === mergedPath[mergedPath.length - 1].data.id
        ? 1
        : 0;
    mergedPath.push(...reversed.slice(startIdx));
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Star Rating */}
            <Text style={[styles.starsText, { color: starColor }]}>{getStarDisplay(stars)}</Text>
            <Text style={[styles.ratingLabel, { color: starColor }]}>{getRatingLabel(stars)}</Text>

            {/* Daily badge */}
            {isDaily && (
              <View style={styles.dailyBadge}>
                <Text style={styles.dailyBadgeText}>🗓️ DAILY CHALLENGE</Text>
              </View>
            )}

            {/* Connection Title */}
            <Text style={styles.connectionTitle}>
              {movieA.title} ↔ {movieB.title}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{moves}</Text>
                <Text style={styles.statLabel}>Moves</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatTime(timeTaken)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              {expGained > 0 && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.expValue]}>+{expGained}</Text>
                    <Text style={styles.statLabel}>XP</Text>
                  </View>
                </>
              )}
            </View>

            {/* Level progress */}
            {stats && (
              <View style={styles.levelRow}>
                <Text style={styles.levelText}>Level {stats.level}</Text>
                <View style={styles.expBar}>
                  <View
                    style={[
                      styles.expFill,
                      {
                        width: `${Math.min(100, (stats.experience / stats.nextLevelExp) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.expBarLabel}>
                  {stats.experience}/{stats.nextLevelExp} XP
                </Text>
              </View>
            )}

            {/* Connection Path */}
            <View style={styles.pathSection}>
              <Text style={styles.pathTitle}>YOUR PATH</Text>
              {mergedPath.map((node, index) =>
                renderPathNode(node, index, index === mergedPath.length - 1),
              )}
            </View>

            {/* Achievements */}
            {newAchievements?.length > 0 && (
              <View style={styles.achievementSection}>
                <Text style={styles.achievementSectionTitle}>
                  🏆 Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
                </Text>
                {newAchievements.map((a, i) => (
                  <View key={i} style={styles.achievementPill}>
                    <Text style={styles.achievementIcon}>{a.icon}</Text>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementName}>{a.title}</Text>
                      <Text style={styles.achievementDesc}>{a.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Streak */}
            {stats && stats.currentStreak > 0 && (
              <View style={styles.streakRow}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{stats.currentStreak} day streak!</Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>📤 Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={onHome}>
              <Text style={styles.homeButtonText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: width * 0.88,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 12,
  },

  // Stars
  starsText: {
    fontSize: 42,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 2,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Daily badge
  dailyBadge: {
    backgroundColor: '#4ECDC4',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  dailyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Title
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  expValue: {
    color: '#4ECDC4',
  },

  // Level bar
  levelRow: {
    marginBottom: 16,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
  },
  expBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  expFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  expBarLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 4,
  },

  // Path
  pathSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  pathTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#95A5A6',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  pathNodeWrapper: {
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  pathNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  pathNodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
  },
  pathConnector: {
    width: 2,
    height: 14,
    backgroundColor: '#D5D8DC',
    marginLeft: 4,
    marginVertical: 2,
  },

  // Achievements
  achievementSection: {
    marginBottom: 16,
  },
  achievementSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  achievementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#FFD54F',
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },

  // Streak
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  streakEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default GameSummaryCard;
