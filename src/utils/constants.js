export const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';
export const BASE_URL = 'https://api.themoviedb.org/3';

export const COLORS = {
  powderBlue: '#B8DDF0',
  teal: '#4ECDC4',
  dark: '#2C3E50',
  red: '#FF6B6B',
  blue: '#3498DB',
  orange: '#E67E22',
  green: '#27AE60',
  yellow: '#F39C12',
  hardRed: '#E74C3C',
  gray: '#7F8C8D',
  lightGray: '#BDC3C7',
  white: '#FFFFFF',
};

/**
 * Dev-only logger. Calls are silenced in production builds.
 */
export const logger = {
  error: (...args) => __DEV__ && console.error(...args),
  warn: (...args) => __DEV__ && console.warn(...args),
  log: (...args) => __DEV__ && console.log(...args),
};

/**
 * Format seconds into a human-readable time string.
 * @param {number} seconds
 * @returns {string} e.g. "1m 23s" or "45s" or "--"
 */
export const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) {
    return '--';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};
