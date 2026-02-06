import { TMDB_API_KEY } from '@env';
import { BASE_URL, IMAGE_BASE, PLACEHOLDER_IMAGE, logger } from '../utils/constants';

/**
 * Fetch a movie by TMDB ID with its top actors (same shape as RandomMoviesScreen).
 * Returns { id, title, posterPath, actors } or null on failure.
 */
const fetchMovieById = async (movieId) => {
  try {
    const [detailRes, creditsRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
    ]);

    const detail = await detailRes.json();
    const credits = await creditsRes.json();

    if (!detail.id || detail.success === false) {
      return null;
    }

    const topActors = Array.isArray(credits.cast)
      ? credits.cast.slice(0, 10).map((actor) => ({
          id: actor.id,
          name: actor.name,
          profilePath: actor.profile_path,
        }))
      : [];

    return {
      id: detail.id,
      title: detail.title,
      posterPath: detail.poster_path ? IMAGE_BASE + detail.poster_path : PLACEHOLDER_IMAGE,
      actors: topActors,
    };
  } catch (error) {
    logger.error('Error fetching movie by ID:', error);
    return null;
  }
};

/**
 * Parse a cinemaze:// deep link URL.
 * Expected format: cinemaze://challenge?a=MOVIE_ID_A&b=MOVIE_ID_B
 * Returns { movieIdA, movieIdB } or null if invalid.
 */
const parseDeepLink = (url) => {
  try {
    if (!url || !url.startsWith('cinemaze://')) {
      return null;
    }

    const queryString = url.split('?')[1];
    if (!queryString) {
      return null;
    }

    const params = {};
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      params[key] = value;
    });

    const movieIdA = parseInt(params.a, 10);
    const movieIdB = parseInt(params.b, 10);

    if (!movieIdA || !movieIdB || isNaN(movieIdA) || isNaN(movieIdB)) {
      return null;
    }

    return { movieIdA, movieIdB };
  } catch (error) {
    logger.error('Error parsing deep link:', error);
    return null;
  }
};

/**
 * Build a challenge deep link URL for sharing.
 */
const buildChallengeLink = (movieIdA, movieIdB) => {
  return `cinemaze://challenge?a=${movieIdA}&b=${movieIdB}`;
};

export default {
  fetchMovieById,
  parseDeepLink,
  buildChallengeLink,
};
