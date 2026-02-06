import { TMDB_API_KEY } from '@env';

const BASE_URL = 'https://api.themoviedb.org/3';

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
    description: 'These actors are in lots of movies together',
  },
  MEDIUM: {
    key: 'medium',
    label: 'Medium',
    emoji: '🟡',
    color: '#F39C12',
    xpMultiplier: 1.5,
    description: 'A moderate challenge — think a few steps ahead',
  },
  HARD: {
    key: 'hard',
    label: 'Hard',
    emoji: '🔴',
    color: '#E74C3C',
    xpMultiplier: 2.5,
    description: 'Deep movie knowledge required',
  },
};

/**
 * Classify the difficulty of a movie pair based on how many actors they share.
 *
 * Logic:
 * - Fetch the full cast for both movies
 * - Count how many actors appear in both casts (direct shared actors)
 * - If ≥3 shared actors → EASY (they're clearly connected)
 * - If 1–2 shared actors → MEDIUM (a direct link exists but it's not obvious)
 * - If 0 shared actors → HARD (requires multiple hops through intermediary movies)
 *
 * Falls back to a heuristic based on movie popularity if API calls fail.
 */
const classifyPair = async (movieA, movieB) => {
  try {
    // Fetch full cast for both movies
    const [castA, castB] = await Promise.all([fetchFullCast(movieA.id), fetchFullCast(movieB.id)]);

    if (!castA || !castB) {
      return classifyByPopularity(movieA, movieB);
    }

    // Count shared actors (actors who appear in both movies)
    const actorIdsA = new Set(castA.map((a) => a.id));
    const sharedCount = castB.filter((a) => actorIdsA.has(a.id)).length;

    if (sharedCount >= 3) {
      return DIFFICULTY.EASY;
    }
    if (sharedCount >= 1) {
      return DIFFICULTY.MEDIUM;
    }
    return DIFFICULTY.HARD;
  } catch (error) {
    console.error('Error classifying difficulty:', error);
    return classifyByPopularity(movieA, movieB);
  }
};

/**
 * Fetch the full cast list for a movie (top 50 billed actors).
 */
const fetchFullCast = async (movieId) => {
  try {
    const res = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    // Take top 50 — enough to find connections without being too broad
    return Array.isArray(data.cast) ? data.cast.slice(0, 50) : null;
  } catch (error) {
    console.error('Error fetching cast:', error);
    return null;
  }
};

/**
 * Fallback: classify based on the actors passed in with the movie data.
 * If movies share actors from their top-10 cast, it's easier.
 */
const classifyByPopularity = (movieA, movieB) => {
  const actorsA = movieA.actors || [];
  const actorsB = movieB.actors || [];

  const idsA = new Set(actorsA.map((a) => a.id));
  const sharedCount = actorsB.filter((a) => idsA.has(a.id)).length;

  if (sharedCount >= 2) {
    return DIFFICULTY.EASY;
  }
  if (sharedCount >= 1) {
    return DIFFICULTY.MEDIUM;
  }
  return DIFFICULTY.HARD;
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
