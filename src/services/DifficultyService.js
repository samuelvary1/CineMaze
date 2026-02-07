import { logger } from '../utils/constants';

/**
 * Difficulty levels with XP multipliers and display info.
 */
export const DIFFICULTY = {
  EASY: {
    key: 'easy',
    label: 'Easy',
    emoji: '🟢',
    color: '#27AE60',
    xpMultiplier: 1.0,
    description: 'Well-known blockbusters — lots of connection paths',
  },
  MEDIUM: {
    key: 'medium',
    label: 'Medium',
    emoji: '🟡',
    color: '#F39C12',
    xpMultiplier: 1.5,
    description: 'A solid challenge — think a few steps ahead',
  },
  HARD: {
    key: 'hard',
    label: 'Hard',
    emoji: '🔴',
    color: '#E74C3C',
    xpMultiplier: 2.5,
    description: 'Tough pairing — deep film knowledge helps',
  },
};

/**
 * Classify difficulty using weighted randomness.
 *
 * Target distribution: ~45% Easy, ~35% Medium, ~20% Hard
 *
 * The random roll is nudged by how many actors the movies have loaded —
 * movies with fewer recognized actors (less data from TMDB) are slightly
 * more likely to land on harder difficulties.
 */
const classifyPair = async (movieA, movieB) => {
  try {
    // Count how many actors we got for each movie (max 10 each)
    const actorCount = (movieA.actors || []).length + (movieB.actors || []).length;

    // Nudge: fewer actors = slightly harder. Range: 0-20 actors total.
    // With 20 actors: nudge = 0 (no penalty)
    // With 10 actors: nudge = -0.05 (slight push toward harder)
    // With 0 actors:  nudge = -0.10
    const nudge = (actorCount - 20) / 200;

    const roll = Math.random() + nudge;

    // ~45% Easy, ~35% Medium, ~20% Hard
    if (roll >= 0.55) {
      return DIFFICULTY.EASY;
    }
    if (roll >= 0.2) {
      return DIFFICULTY.MEDIUM;
    }
    return DIFFICULTY.HARD;
  } catch (error) {
    logger.error('Error classifying difficulty:', error);
    return DIFFICULTY.MEDIUM;
  }
};

/**
 * Get the XP for a game factoring in difficulty.
 * Base formula: 10 + max(0, (6 - moves) * 5)
 * Then multiplied by difficulty multiplier.
 */
const calculateDifficultyXP = (moves, difficulty) => {
  const baseExp = 10;
  const moveBonus = Math.max(0, (6 - moves) * 5);
  const raw = baseExp + moveBonus;
  return Math.floor(raw * (difficulty?.xpMultiplier || 1));
};

export default {
  classifyPair,
  calculateDifficultyXP,
  DIFFICULTY,
};
