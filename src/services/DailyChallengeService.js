import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY } from '@env';
import { logger } from '../utils/constants';

const STORAGE_KEYS = {
  DAILY_CHALLENGE_RESULT: 'dailyChallengeResult',
  GLOBAL_LEADERBOARD: 'globalLeaderboard',
  CHALLENGE_HISTORY: 'challengeHistory',
};

// Predefined movie pairs for daily challenges (seeded by date)
const CHALLENGE_MOVIE_PAIRS = [
  // Week 1
  [
    {
      id: 550,
      title: 'Fight Club',
      posterPath: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      actors: [
        { id: 287, name: 'Brad Pitt' },
        { id: 819, name: 'Edward Norton' },
        { id: 1283, name: 'Helena Bonham Carter' },
      ],
    },
    {
      id: 13,
      title: 'Forrest Gump',
      posterPath: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      actors: [
        { id: 31, name: 'Tom Hanks' },
        { id: 8891, name: 'Robin Wright' },
        { id: 3896, name: 'Gary Sinise' },
      ],
    },
  ],
  [
    {
      id: 424,
      title: "Schindler's List",
      posterPath: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
      actors: [
        { id: 3896, name: 'Liam Neeson' },
        { id: 3895, name: 'Ralph Fiennes' },
        { id: 1932, name: 'Ben Kingsley' },
      ],
    },
    {
      id: 155,
      title: 'The Dark Knight',
      posterPath: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      actors: [
        { id: 3894, name: 'Christian Bale' },
        { id: 1810, name: 'Heath Ledger' },
        { id: 64, name: 'Gary Oldman' },
      ],
    },
  ],
  [
    {
      id: 11,
      title: 'Star Wars',
      posterPath: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
      actors: [
        { id: 2, name: 'Mark Hamill' },
        { id: 3, name: 'Harrison Ford' },
        { id: 4, name: 'Carrie Fisher' },
      ],
    },
    {
      id: 278,
      title: 'The Shawshank Redemption',
      posterPath: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      actors: [
        { id: 504, name: 'Tim Robbins' },
        { id: 192, name: 'Morgan Freeman' },
        { id: 4885, name: 'Bob Gunton' },
      ],
    },
  ],
  [
    {
      id: 680,
      title: 'Pulp Fiction',
      posterPath: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      actors: [
        { id: 8891, name: 'John Travolta' },
        { id: 8, name: 'Samuel L. Jackson' },
        { id: 5293, name: 'Uma Thurman' },
      ],
    },
    {
      id: 120,
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      posterPath: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
      actors: [
        { id: 108, name: 'Elijah Wood' },
        { id: 1327, name: 'Ian McKellen' },
        { id: 114, name: 'Orlando Bloom' },
      ],
    },
  ],
  [
    {
      id: 238,
      title: 'The Godfather',
      posterPath: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      actors: [
        { id: 3084, name: 'Marlon Brando' },
        { id: 1158, name: 'Al Pacino' },
        { id: 3087, name: 'James Caan' },
      ],
    },
    {
      id: 27205,
      title: 'Inception',
      posterPath: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      actors: [
        { id: 6193, name: 'Leonardo DiCaprio' },
        { id: 8784, name: 'Marion Cotillard' },
        { id: 2524, name: 'Tom Hardy' },
      ],
    },
  ],
  [
    {
      id: 389,
      title: 'Good Will Hunting',
      posterPath: 'https://image.tmdb.org/t/p/w500/bABCBKYBK7A5G1x0FzoeoNfuj2.jpg',
      actors: [
        { id: 1892, name: 'Matt Damon' },
        { id: 2157, name: 'Robin Williams' },
        { id: 880, name: 'Ben Affleck' },
      ],
    },
    {
      id: 1891,
      title: 'The Empire Strikes Back',
      posterPath: 'https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg',
      actors: [
        { id: 2, name: 'Mark Hamill' },
        { id: 3, name: 'Harrison Ford' },
        { id: 4, name: 'Carrie Fisher' },
      ],
    },
  ],
  [
    {
      id: 858,
      title: 'The Godfather: Part II',
      posterPath: 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
      actors: [
        { id: 1158, name: 'Al Pacino' },
        { id: 380, name: 'Robert De Niro' },
        { id: 3085, name: 'Robert Duvall' },
      ],
    },
    {
      id: 497,
      title: 'The Green Mile',
      posterPath: 'https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg',
      actors: [
        { id: 31, name: 'Tom Hanks' },
        { id: 2178, name: 'Michael Clarke Duncan' },
        { id: 4726, name: 'David Morse' },
      ],
    },
  ],
];

class DailyChallengeService {
  // Get today's date as a string (YYYY-MM-DD)
  getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Generate today's challenge based on date seed
  getTodaysChallenge() {
    const todayString = this.getTodayString();
    const daysSinceEpoch = Math.floor(new Date(todayString).getTime() / (1000 * 60 * 60 * 24));
    const challengeIndex = daysSinceEpoch % CHALLENGE_MOVIE_PAIRS.length;

    const moviePair = CHALLENGE_MOVIE_PAIRS[challengeIndex];

    return {
      id: `daily-${todayString}`,
      date: todayString,
      movieA: moviePair[0],
      movieB: moviePair[1],
      isDaily: true,
    };
  }

  // Check if user has completed today's challenge
  async hasCompletedToday() {
    try {
      const resultData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE_RESULT);
      if (!resultData) {
        return false;
      }

      const result = JSON.parse(resultData);
      return result.date === this.getTodayString();
    } catch (error) {
      logger.error('Error checking daily challenge completion:', error);
      return false;
    }
  }

  // Get today's challenge result
  async getTodaysResult() {
    try {
      const resultData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE_RESULT);
      if (!resultData) {
        return null;
      }

      const result = JSON.parse(resultData);
      if (result.date !== this.getTodayString()) {
        return null;
      }

      return result;
    } catch (error) {
      logger.error("Error getting today's result:", error);
      return null;
    }
  }

  // Submit daily challenge result
  async submitResult(moves, timeTaken, path) {
    try {
      const todayString = this.getTodayString();
      const result = {
        id: `daily-${todayString}`,
        date: todayString,
        moves,
        timeTaken,
        path,
        completedAt: new Date().toISOString(),
      };

      // Save today's result
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE_RESULT, JSON.stringify(result));

      // Add to challenge history
      await this.addToHistory(result);

      // Update global leaderboard
      await this.updateGlobalLeaderboard(result);

      return result;
    } catch (error) {
      logger.error('Error submitting daily challenge result:', error);
      throw error;
    }
  }

  // Add result to challenge history
  async addToHistory(result) {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_HISTORY);
      const history = historyData ? JSON.parse(historyData) : [];

      // Remove any existing entry for this date and add new one
      const filteredHistory = history.filter((h) => h.date !== result.date);
      filteredHistory.push(result);

      // Keep only last 30 days
      const sortedHistory = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      const recentHistory = sortedHistory.slice(0, 30);

      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_HISTORY, JSON.stringify(recentHistory));
    } catch (error) {
      logger.error('Error adding to challenge history:', error);
    }
  }

  // Get challenge history
  async getHistory() {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_HISTORY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      logger.error('Error getting challenge history:', error);
      return [];
    }
  }

  // Update global leaderboard (simulated - in real app this would be server-side)
  async updateGlobalLeaderboard(result) {
    try {
      const leaderboardData = await AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_LEADERBOARD);
      const leaderboard = leaderboardData ? JSON.parse(leaderboardData) : {};

      const dateKey = result.date;
      if (!leaderboard[dateKey]) {
        leaderboard[dateKey] = [];
      }

      // Create anonymous entry for this user
      const playerEntry = {
        id: `player-${Date.now()}`, // In real app, would use user ID
        moves: result.moves,
        timeTaken: result.timeTaken,
        completedAt: result.completedAt,
        rank: 0, // Will be calculated
      };

      // Add entry and sort by moves (then by time)
      leaderboard[dateKey].push(playerEntry);
      leaderboard[dateKey].sort((a, b) => {
        if (a.moves !== b.moves) {
          return a.moves - b.moves;
        }
        return a.timeTaken - b.timeTaken;
      });

      // Assign ranks
      leaderboard[dateKey].forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Keep only top 100 per day
      leaderboard[dateKey] = leaderboard[dateKey].slice(0, 100);

      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_LEADERBOARD, JSON.stringify(leaderboard));

      return playerEntry.rank;
    } catch (error) {
      logger.error('Error updating global leaderboard:', error);
      return null;
    }
  }

  // Get global leaderboard for a specific date
  async getLeaderboardForDate(date) {
    try {
      const leaderboardData = await AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_LEADERBOARD);
      const leaderboard = leaderboardData ? JSON.parse(leaderboardData) : {};

      return leaderboard[date] || [];
    } catch (error) {
      logger.error('Error getting leaderboard for date:', error);
      return [];
    }
  }

  // Get today's leaderboard
  async getTodaysLeaderboard() {
    return this.getLeaderboardForDate(this.getTodayString());
  }

  // Get user's stats across all daily challenges
  async getUserStats() {
    try {
      const history = await this.getHistory();

      if (history.length === 0) {
        return {
          totalCompleted: 0,
          averageMoves: 0,
          bestMoves: null,
          averageTime: 0,
          bestTime: null,
          currentStreak: 0,
          longestStreak: 0,
        };
      }

      const totalCompleted = history.length;
      const averageMoves = history.reduce((sum, h) => sum + h.moves, 0) / totalCompleted;
      const bestMoves = Math.min(...history.map((h) => h.moves));
      const averageTime = history.reduce((sum, h) => sum + h.timeTaken, 0) / totalCompleted;
      const bestTime = Math.min(...history.map((h) => h.timeTaken));

      // Calculate streaks
      const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date();
      for (let i = 0; i < sortedHistory.length; i++) {
        const resultDate = new Date(sortedHistory[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (resultDate.toDateString() === expectedDate.toDateString()) {
          tempStreak++;
          if (i === 0) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        totalCompleted,
        averageMoves: Math.round(averageMoves * 10) / 10,
        bestMoves,
        averageTime: Math.round(averageTime),
        bestTime,
        currentStreak,
        longestStreak,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      return {
        totalCompleted: 0,
        averageMoves: 0,
        bestMoves: null,
        averageTime: 0,
        bestTime: null,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  }

  // Check if it's a new day and reset daily state if needed
  async checkNewDay() {
    const todayString = this.getTodayString();
    const lastCheckData = await AsyncStorage.getItem('lastDailyCheck');

    if (lastCheckData !== todayString) {
      // It's a new day, clear today's result
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_CHALLENGE_RESULT);
      await AsyncStorage.setItem('lastDailyCheck', todayString);
      return true;
    }

    return false;
  }

  // Fetch full actor data from TMDB API for a movie
  async fetchMovieActors(movieId) {
    try {
      const creditsRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
      );
      const credits = await creditsRes.json();

      const actors = (credits.cast || []).slice(0, 10).map((actor) => ({
        id: actor.id,
        name: actor.name,
        profilePath: actor.profile_path,
      }));

      return actors;
    } catch (error) {
      logger.error('Error fetching movie actors:', error);
      return [];
    }
  }

  // Get today's challenge with enhanced actor data
  async getTodaysChallengeWithActors() {
    const baseChallenge = this.getTodaysChallenge();

    try {
      // Fetch full actor data for both movies
      const [movieAActors, movieBActors] = await Promise.all([
        this.fetchMovieActors(baseChallenge.movieA.id),
        this.fetchMovieActors(baseChallenge.movieB.id),
      ]);

      return {
        ...baseChallenge,
        movieA: {
          ...baseChallenge.movieA,
          actors: movieAActors.length > 0 ? movieAActors : baseChallenge.movieA.actors,
        },
        movieB: {
          ...baseChallenge.movieB,
          actors: movieBActors.length > 0 ? movieBActors : baseChallenge.movieB.actors,
        },
      };
    } catch (error) {
      logger.error('Error fetching enhanced challenge data:', error);
      // Fall back to base challenge if API fails
      return baseChallenge;
    }
  }
}

export default new DailyChallengeService();
