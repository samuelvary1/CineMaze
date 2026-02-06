import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeepLinkService from '../services/DeepLinkService';
import DifficultyService from '../services/DifficultyService';
import { IMAGE_BASE, PLACEHOLDER_IMAGE, formatTime, logger } from '../utils/constants';

const getStarDisplay = (stars) => {
  if (!stars) {
    return '';
  }
  return '★'.repeat(stars) + '☆'.repeat(3 - stars);
};

const getStarColor = (stars) => {
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

const CompletedConnectionsScreen = ({ navigation }) => {
  const [connections, setConnections] = useState([]);
  const [replayingId, setReplayingId] = useState(null);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('completedConnections');
        const saved = jsonValue != null ? JSON.parse(jsonValue) : [];
        setConnections(saved);
      } catch (e) {
        Alert.alert('Error', 'Failed to load completed connections.');
      }
    };

    const unsubscribe = navigation.addListener('focus', loadConnections);
    return unsubscribe;
  }, [navigation]);

  const handleReplay = async (connection) => {
    setReplayingId(connection.id);
    try {
      // Fetch fresh movie data with actors for replay
      const [movieA, movieB] = await Promise.all([
        DeepLinkService.fetchMovieById(connection.start.id),
        DeepLinkService.fetchMovieById(connection.target.id),
      ]);

      if (!movieA || !movieB) {
        Alert.alert('Error', 'Could not load movie data for replay.');
        return;
      }

      // Classify difficulty for the replay
      let difficulty = null;
      try {
        difficulty = await DifficultyService.classifyPair(movieA, movieB);
      } catch (err) {
        logger.error('Error classifying difficulty:', err);
      }

      navigation.navigate('GameScreen', {
        movieA,
        movieB,
        difficulty,
        previousBest: connection.moves,
      });
    } catch (error) {
      logger.error('Error replaying:', error);
      Alert.alert('Error', 'Failed to start replay.');
    } finally {
      setReplayingId(null);
    }
  };

  const handleShare = async (connection) => {
    const stars = connection.stars || 1;
    const starText = '⭐'.repeat(stars);
    const diffLabel = connection.difficulty
      ? ` ${connection.difficulty.emoji} ${connection.difficulty.label}`
      : '';
    const challengeLink = DeepLinkService.buildChallengeLink(
      connection.start.id,
      connection.target.id,
    );

    const shareLines = [
      `🎬 CineMaze ${starText}${diffLabel}`,
      `${connection.start.title} ↔ ${connection.target.title}`,
      `${connection.moves} moves · ${formatTime(connection.timeTaken)}`,
      '',
      '🎯 Can you beat my score?',
      challengeLink,
    ];

    try {
      await Share.share({ message: shareLines.join('\n') });
    } catch (error) {
      logger.error('Error sharing:', error);
    }
  };

  const renderCard = (connection) => {
    const getPosterUrl = (movie) => {
      if (!movie) {
        return PLACEHOLDER_IMAGE;
      }
      if (movie.posterPath) {
        if (movie.posterPath.startsWith('http')) {
          return movie.posterPath;
        }
        return IMAGE_BASE + movie.posterPath;
      }
      if (movie.poster_path) {
        return IMAGE_BASE + movie.poster_path;
      }
      return PLACEHOLDER_IMAGE;
    };

    const stars = connection.stars || 0;
    const starColor = getStarColor(stars);
    const isReplaying = replayingId === connection.id;

    return (
      <TouchableOpacity
        key={connection.id}
        style={styles.card}
        onPress={() => handleReplay(connection)}
        activeOpacity={0.7}
      >
        {/* Score header */}
        <View style={styles.scoreRow}>
          {stars > 0 && (
            <Text style={[styles.stars, { color: starColor }]}>{getStarDisplay(stars)}</Text>
          )}
          {connection.difficulty && (
            <View style={[styles.diffBadge, { backgroundColor: connection.difficulty.color }]}>
              <Text style={styles.diffBadgeText}>
                {connection.difficulty.emoji} {connection.difficulty.label}
              </Text>
            </View>
          )}
        </View>

        {/* Movie posters + titles */}
        <View style={styles.movieRow}>
          <View style={styles.movieSide}>
            <Image source={{ uri: getPosterUrl(connection.start) }} style={styles.poster} />
            <Text style={styles.movieTitle} numberOfLines={2}>
              {connection.start?.title || 'Unknown'}
            </Text>
          </View>
          <Text style={styles.arrow}>↔</Text>
          <View style={styles.movieSide}>
            <Image source={{ uri: getPosterUrl(connection.target) }} style={styles.poster} />
            <Text style={styles.movieTitle} numberOfLines={2}>
              {connection.target?.title || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{connection.moves || '?'}</Text>
            <Text style={styles.statLabel}>Moves</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(connection.timeTaken)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(connection.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.statLabel}>Date</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.replayButton}
            onPress={() => handleReplay(connection)}
            disabled={isReplaying}
          >
            <Text style={styles.replayButtonText}>
              {isReplaying ? '⏳ Loading...' : '🔄 Replay'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={() => handleShare(connection)}>
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Completed Games</Text>
      <Text style={styles.subtitle}>Tap a game to replay and try to beat your score</Text>
      {connections.length === 0 ? (
        <Text style={styles.empty}>You haven't finished any games yet.</Text>
      ) : (
        connections.map(renderCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#B8DDF0',
  },
  container: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stars: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  diffBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  movieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  movieSide: {
    flex: 1,
    alignItems: 'center',
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#ccc',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  movieTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 6,
  },
  arrow: {
    fontSize: 22,
    color: '#BDC3C7',
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFE',
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  replayButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  replayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CompletedConnectionsScreen;
