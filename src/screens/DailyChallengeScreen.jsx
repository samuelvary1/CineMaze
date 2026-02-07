import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import DailyChallengeService from '../services/DailyChallengeService';
import MoviesContainer from '../components/MoviesContainer';
import MovieInfoModal from '../components/MovieInfoModal';
import { formatTime, logger } from '../utils/constants';

const DailyChallengeScreen = ({ navigation }) => {
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      setLoading(true);

      // Check for new day
      await DailyChallengeService.checkNewDay();

      // Get today's challenge with enhanced actor data
      const challenge = await DailyChallengeService.getTodaysChallengeWithActors();
      setTodaysChallenge(challenge);

      // Check if completed
      const completed = await DailyChallengeService.hasCompletedToday();
      setIsCompleted(completed);

      if (completed) {
        // Get result and leaderboard
        const todaysResult = await DailyChallengeService.getTodaysResult();
        setResult(todaysResult);

        const todaysLeaderboard = await DailyChallengeService.getTodaysLeaderboard();
        setLeaderboard(todaysLeaderboard);
      }

      // Get user stats
      const stats = await DailyChallengeService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      logger.error('Error loading daily challenge:', error);
      Alert.alert('Error', 'Failed to load daily challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    if (!todaysChallenge) {
      return;
    }

    navigation.navigate('GameScreen', {
      movieA: todaysChallenge.movieA,
      movieB: todaysChallenge.movieB,
      isDaily: true,
      challengeId: todaysChallenge.id,
    });
  };

  const getOrdinal = (num) => {
    const th = 'th';
    const rd = 'rd';
    const nd = 'nd';
    const st = 'st';

    if (num === 11 || num === 12 || num === 13) {
      return num + th;
    }

    const lastDigit = num.toString().slice(-1);
    switch (lastDigit) {
      case '1':
        return num + st;
      case '2':
        return num + nd;
      case '3':
        return num + rd;
      default:
        return num + th;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading Daily Challenge...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🗓️ Daily Challenge</Text>
          <TouchableOpacity style={styles.statsButton} onPress={() => setShowStatsModal(true)}>
            <Text style={styles.statsButtonText}>📊</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Challenge */}
        {todaysChallenge && (
          <View style={styles.challengeSection}>
            <Text style={styles.sectionTitle}>Today's Challenge</Text>
            <Text style={styles.challengeDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            <MoviesContainer
              movies={[todaysChallenge.movieA, todaysChallenge.movieB]}
              onMoviePress={(movie) => setSelectedMovie(movie)}
              isLoading={false}
              isDailyChallenge={true}
            />

            {!isCompleted ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartChallenge}>
                <Text style={styles.startButtonText}>🎯 Start Daily Challenge</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedSection}>
                <Text style={styles.completedTitle}>✅ Challenge Completed!</Text>
                {result && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultText}>
                      🎯 Solved in <Text style={styles.highlightText}>{result.moves}</Text> moves
                    </Text>
                    <Text style={styles.resultText}>
                      ⏱️ Time:{' '}
                      <Text style={styles.highlightText}>{formatTime(result.timeTaken)}</Text>
                    </Text>
                    {result.rank && (
                      <Text style={styles.resultText}>
                        🏆 Rank: <Text style={styles.highlightText}>{getOrdinal(result.rank)}</Text>{' '}
                        place today
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Today's Leaderboard */}
        {isCompleted && leaderboard.length > 0 && (
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>🏆 Today's Leaderboard</Text>
            <View style={styles.leaderboardContainer}>
              {leaderboard.slice(0, 10).map((entry, index) => (
                <View key={entry.id} style={styles.leaderboardRow}>
                  <Text style={styles.rank}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </Text>
                  <Text style={styles.playerName}>
                    {entry.id.startsWith('player-') ? `Player ${entry.id.slice(-4)}` : 'Anonymous'}
                  </Text>
                  <Text style={styles.moves}>{entry.moves} moves</Text>
                  <Text style={styles.time}>{formatTime(entry.timeTaken)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Come Back Tomorrow */}
        {isCompleted && (
          <View style={styles.comeBackSection}>
            <Text style={styles.comeBackTitle}>🌅 Come Back Tomorrow</Text>
            <Text style={styles.comeBackText}>
              A new challenge awaits! Keep your streak going and climb the leaderboard.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Stats Modal */}
      <Modal
        visible={showStatsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalPlaceholder} />
            <Text style={styles.modalTitle}>📊 Your Stats</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStatsModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {userStats && (
            <View style={styles.modalContent}>
              <Text style={styles.modalSectionTitle}>Daily Challenge Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.bestMoves || '-'}</Text>
                  <Text style={styles.statLabel}>Best Moves</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.longestStreak}</Text>
                  <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <MovieInfoModal
        visible={!!selectedMovie}
        movieId={selectedMovie?.id}
        movieTitle={selectedMovie?.title}
        moviePosterPath={selectedMovie?.posterPath}
        onClose={() => setSelectedMovie(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8DDF0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8DDF0',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 20,
    color: '#2C3E50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 40,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statsButtonText: {
    fontSize: 20,
  },
  challengeSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  challengeDate: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completedSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  resultText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statsSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  leaderboardSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardContainer: {
    marginTop: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  rank: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  moves: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginRight: 12,
  },
  time: {
    fontSize: 14,
    color: '#7F8C8D',
    width: 60,
    textAlign: 'right',
  },
  comeBackSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comeBackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F39C12',
    marginBottom: 12,
  },
  comeBackText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#B8DDF0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalPlaceholder: {
    width: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  modalContent: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default DailyChallengeScreen;
