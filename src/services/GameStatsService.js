import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for stats
const STORAGE_KEYS = {
  STATS: 'player_stats',
  ACHIEVEMENTS: 'achievements',
  DAILY_STREAK: 'daily_streak',
  LAST_PLAY_DATE: 'last_play_date',
  BEST_SCORES: 'best_scores',
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_WIN: {
    id: 'first_win',
    title: '🎯 First Connection',
    description: 'Complete your first movie connection',
    icon: '🎯',
    reward: "You've learned the ropes!",
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    title: '⚡ Speed Demon',
    description: 'Complete a connection in 3 moves or less',
    icon: '⚡',
    reward: 'Lightning fast!',
  },
  MINIMALIST: {
    id: 'minimalist',
    title: '🎪 Minimalist',
    description: 'Complete a connection in just 2 moves',
    icon: '🎪',
    reward: 'Efficiency master!',
  },
  MARATHON_PLAYER: {
    id: 'marathon_player',
    title: '🏃 Marathon Player',
    description: 'Play 5 games in one day',
    icon: '🏃',
    reward: 'Dedication pays off!',
  },
  STREAK_MASTER: {
    id: 'streak_master',
    title: '🔥 Streak Master',
    description: 'Play for 7 days in a row',
    icon: '🔥',
    reward: 'Consistency is key!',
  },
  COLLECTOR: {
    id: 'collector',
    title: '📚 Collector',
    description: 'Save 10 movies to your watchlist',
    icon: '📚',
    reward: 'Movie enthusiast!',
  },
  PERFECTIONIST: {
    id: 'perfectionist',
    title: '💎 Perfectionist',
    description: 'Complete 10 connections with 5 moves or less',
    icon: '💎',
    reward: 'Pure skill!',
  },
  EXPLORER: {
    id: 'explorer',
    title: '🗺️ Explorer',
    description: 'Discover 50 different actors in your games',
    icon: '🗺️',
    reward: 'Cinema explorer!',
  },
  CENTURY_CLUB: {
    id: 'century_club',
    title: '💯 Century Club',
    description: 'Complete 100 total connections',
    icon: '💯',
    reward: 'Elite player status!',
  },
};

// Daily challenges
export const DAILY_CHALLENGES = {
  QUICK_CONNECT: {
    id: 'quick_connect',
    title: '⚡ Quick Connect',
    description: 'Complete a connection in 4 moves or less',
    reward: '+1 Free Play',
    difficulty: 'Easy',
  },
  GENRE_MASTER: {
    id: 'genre_master',
    title: '🎭 Genre Master',
    description: 'Connect two movies from different decades',
    reward: '+2 Free Plays',
    difficulty: 'Medium',
  },
  ACTOR_EXPERT: {
    id: 'actor_expert',
    title: '🎬 Actor Expert',
    description: 'Use an actor who appeared in 5+ movies',
    reward: '+3 Free Plays',
    difficulty: 'Hard',
  },
};

class GameStatsService {
  // Initialize or get player stats
  async getPlayerStats() {
    try {
      const statsString = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      const defaultStats = {
        totalGames: 0,
        totalWins: 0,
        bestMoveCount: null,
        totalMoves: 0,
        averageMoves: 0,
        gamesThisWeek: 0,
        uniqueActorsFound: new Set(),
        moviesWatched: new Set(),
        perfectGames: 0, // Games completed in ≤3 moves
        quickGames: 0, // Games completed in ≤5 moves
        lastPlayDate: null,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
      };

      if (statsString) {
        const parsed = JSON.parse(statsString);
        // Convert Sets back from arrays
        if (parsed.uniqueActorsFound) {
          parsed.uniqueActorsFound = new Set(parsed.uniqueActorsFound);
        }
        if (parsed.moviesWatched) {
          parsed.moviesWatched = new Set(parsed.moviesWatched);
        }
        return { ...defaultStats, ...parsed };
      }

      return defaultStats;
    } catch (error) {
      console.error('Error getting player stats:', error);
      return this.getPlayerStats(); // Return default stats
    }
  }

  // Save player stats
  async savePlayerStats(stats) {
    try {
      // Convert Sets to arrays for storage
      const toSave = {
        ...stats,
        uniqueActorsFound: Array.from(stats.uniqueActorsFound || []),
        moviesWatched: Array.from(stats.moviesWatched || []),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  }

  // Record a completed game
  async recordGameComplete(gameData) {
    const { moves, actors, movies, isWin } = gameData;
    const stats = await this.getPlayerStats();

    // Update basic stats
    stats.totalGames += 1;
    if (isWin) {
      stats.totalWins += 1;
      stats.totalMoves += moves;

      // Update best move count
      if (stats.bestMoveCount === null || moves < stats.bestMoveCount) {
        stats.bestMoveCount = moves;
      }

      // Update average moves
      stats.averageMoves = Math.round((stats.totalMoves / stats.totalWins) * 10) / 10;

      // Track perfect and quick games
      if (moves <= 3) {
        stats.perfectGames += 1;
      }
      if (moves <= 5) {
        stats.quickGames += 1;
      }

      // Award experience points
      const expGained = this.calculateExperience(moves);
      stats.experience += expGained;

      // Check for level up
      while (stats.experience >= stats.nextLevelExp) {
        stats.experience -= stats.nextLevelExp;
        stats.level += 1;
        stats.nextLevelExp = Math.floor(stats.nextLevelExp * 1.2); // Increase by 20% each level
      }
    }

    // Track unique content
    if (actors) {
      actors.forEach((actor) => stats.uniqueActorsFound.add(actor.id));
    }
    if (movies) {
      movies.forEach((movie) => stats.moviesWatched.add(movie.id));
    }

    // Update streak
    await this.updateStreak(stats);

    await this.savePlayerStats(stats);

    // Check for achievements
    const newAchievements = await this.checkAchievements(stats);

    return { stats, newAchievements, expGained: isWin ? this.calculateExperience(moves) : 0 };
  }

  // Calculate experience points based on performance
  calculateExperience(moves) {
    const baseExp = 10;
    const bonus = Math.max(0, (6 - moves) * 5); // Bonus for fewer moves
    return baseExp + bonus;
  }

  // Update daily streak
  async updateStreak(stats) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (stats.lastPlayDate === today) {
      // Already played today, no streak change
      return;
    } else if (stats.lastPlayDate === yesterday) {
      // Continuing streak
      stats.currentStreak += 1;
    } else {
      // Streak broken or first play
      stats.currentStreak = 1;
    }

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }

    stats.lastPlayDate = today;
  }

  // Check for new achievements
  async checkAchievements(stats) {
    const currentAchievements = await this.getAchievements();
    const newAchievements = [];

    // Check each achievement
    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      if (currentAchievements.includes(achievement.id)) {
        return;
      }

      let earned = false;

      switch (achievement.id) {
        case 'first_win':
          earned = stats.totalWins >= 1;
          break;
        case 'speed_demon':
          earned = stats.bestMoveCount <= 3;
          break;
        case 'minimalist':
          earned = stats.bestMoveCount <= 2;
          break;
        case 'marathon_player':
          earned = this.getGamesPlayedToday(stats) >= 5;
          break;
        case 'streak_master':
          earned = stats.currentStreak >= 7;
          break;
        case 'collector':
          // This would need to check watchlist separately
          earned = false; // Implement in watchlist check
          break;
        case 'perfectionist':
          earned = stats.perfectGames >= 10;
          break;
        case 'explorer':
          earned = stats.uniqueActorsFound.size >= 50;
          break;
        case 'century_club':
          earned = stats.totalWins >= 100;
          break;
      }

      if (earned) {
        newAchievements.push(achievement);
        currentAchievements.push(achievement.id);
      }
    });

    if (newAchievements.length > 0) {
      await this.saveAchievements(currentAchievements);
    }

    return newAchievements;
  }

  // Get earned achievements
  async getAchievements() {
    try {
      const achievementsString = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return achievementsString ? JSON.parse(achievementsString) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Save achievements
  async saveAchievements(achievements) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  // Get games played today (would need implementation)
  getGamesPlayedToday(stats) {
    // This would need a more detailed tracking system
    return 0;
  }

  // Get daily challenge status
  async getDailyChallenge() {
    const today = new Date().toDateString();
    const challenges = Object.values(DAILY_CHALLENGES);
    const todaysChallenge = challenges[new Date().getDay() % challenges.length];

    return {
      ...todaysChallenge,
      date: today,
      completed: false, // Would need to track completion
      progress: 0,
    };
  }

  // Get leaderboard data (local best scores)
  async getPersonalBests() {
    const stats = await this.getPlayerStats();

    return {
      fastestWin: stats.bestMoveCount,
      totalWins: stats.totalWins,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      level: stats.level,
      uniqueActors: stats.uniqueActorsFound.size,
      averageMoves: stats.averageMoves,
    };
  }
}

export default new GameStatsService();
