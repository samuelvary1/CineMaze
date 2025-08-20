// Curated database of high-quality, popular movies
export const CURATED_MOVIES = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    year: 1994,
    tmdbId: 278,
    genres: ['Drama'],
    rating: 9.3,
    poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    actors: [
      { id: 504, name: 'Tim Robbins' },
      { id: 192, name: 'Morgan Freeman' },
      { id: 2178, name: 'Bob Gunton' },
      { id: 4026, name: 'William Sadler' },
      { id: 2179, name: 'Clancy Brown' },
    ],
  },
  {
    id: 2,
    title: 'The Godfather',
    year: 1972,
    tmdbId: 238,
    genres: ['Crime', 'Drama'],
    rating: 9.2,
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    actors: [
      { id: 3084, name: 'Marlon Brando' },
      { id: 1158, name: 'Al Pacino' },
      { id: 3087, name: 'James Caan' },
      { id: 3086, name: 'Robert Duvall' },
      { id: 6574, name: 'Diane Keaton' },
    ],
  },
  {
    id: 3,
    title: 'The Dark Knight',
    year: 2008,
    tmdbId: 155,
    genres: ['Action', 'Crime', 'Drama'],
    rating: 9.0,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    actors: [
      { id: 3894, name: 'Christian Bale' },
      { id: 1037, name: 'Heath Ledger' },
      { id: 64, name: 'Gary Oldman' },
      { id: 6384, name: 'Aaron Eckhart' },
      { id: 5293, name: 'Maggie Gyllenhaal' },
    ],
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    year: 1994,
    tmdbId: 680,
    genres: ['Crime', 'Drama'],
    rating: 8.9,
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    actors: [
      { id: 62, name: 'John Travolta' },
      { id: 8891, name: 'Samuel L. Jackson' },
      { id: 2231, name: 'Uma Thurman' },
      { id: 4937, name: 'Bruce Willis' },
      { id: 72129, name: 'Ving Rhames' },
    ],
  },
  {
    id: 5,
    title: 'Forrest Gump',
    year: 1994,
    tmdbId: 13,
    genres: ['Comedy', 'Drama', 'Romance'],
    rating: 8.8,
    poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    actors: [
      { id: 31, name: 'Tom Hanks' },
      { id: 11701, name: 'Robin Wright' },
      { id: 15277, name: 'Gary Sinise' },
      { id: 206, name: 'Sally Field' },
      { id: 9642, name: 'Mykelti Williamson' },
    ],
  },
  {
    id: 6,
    title: 'Inception',
    year: 2010,
    tmdbId: 27205,
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    rating: 8.8,
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    actors: [
      { id: 6193, name: 'Leonardo DiCaprio' },
      { id: 2037, name: 'Marion Cotillard' },
      { id: 24045, name: 'Tom Hardy' },
      { id: 27578, name: 'Elliot Page' },
      { id: 2524, name: 'Ken Watanabe' },
    ],
  },
  {
    id: 7,
    title: 'The Matrix',
    year: 1999,
    tmdbId: 603,
    genres: ['Action', 'Sci-Fi'],
    rating: 8.7,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    actors: [
      { id: 6384, name: 'Keanu Reeves' },
      { id: 2975, name: 'Laurence Fishburne' },
      { id: 5064, name: 'Carrie-Anne Moss' },
      { id: 1331, name: 'Hugo Weaving' },
      { id: 1336, name: 'Gloria Foster' },
    ],
  },
  {
    id: 8,
    title: 'Goodfellas',
    year: 1990,
    tmdbId: 769,
    genres: ['Biography', 'Crime', 'Drama'],
    rating: 8.7,
    poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    actors: [
      { id: 380, name: 'Robert De Niro' },
      { id: 1772, name: 'Ray Liotta' },
      { id: 1158, name: 'Joe Pesci' },
      { id: 2231, name: 'Lorraine Bracco' },
      { id: 2406, name: 'Paul Sorvino' },
    ],
  },
];

// Function to get random movies from our curated database
export const getRandomMoviesFromDatabase = (count = 2) => {
  const shuffled = [...CURATED_MOVIES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to search movies by title
export const searchMoviesByTitle = (query) => {
  return CURATED_MOVIES.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()));
};

// Function to filter by genre
export const getMoviesByGenre = (genre) => {
  return CURATED_MOVIES.filter((movie) => movie.genres.includes(genre));
};
