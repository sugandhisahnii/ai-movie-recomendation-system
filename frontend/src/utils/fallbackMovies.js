export const FALLBACK_MOVIES = [
  {
    id: 900001,
    title: 'Midnight Protocol',
    overview: 'An elite analyst uncovers a broadcast signal that predicts crimes hours before they happen.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/9nhjGaFLKtddDPtPaX5EmKqsWdH.jpg',
    vote_average: 7.8,
    release_date: '2024-04-12',
    genres: [{ id: 53, name: 'Thriller' }, { id: 878, name: 'Sci-Fi' }],
    original_language: 'en'
  },
  {
    id: 900002,
    title: 'Crimson Run',
    overview: 'A getaway driver has one night to outrun a citywide dragnet after a heist collapses.',
    poster_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    backdrop_path: '/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',
    vote_average: 7.4,
    release_date: '2023-11-03',
    genres: [{ id: 28, name: 'Action' }, { id: 80, name: 'Crime' }],
    original_language: 'en'
  },
  {
    id: 900003,
    title: 'Glass Horizon',
    overview: 'A storm chaser and a satellite engineer race to stop a weather system rewriting coastlines.',
    poster_path: '/q719jXXEzOoYaps6babgKnONONX.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 8.1,
    release_date: '2024-06-21',
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }],
    original_language: 'en'
  },
  {
    id: 900004,
    title: 'Velvet Signal',
    overview: 'A radio host becomes the anonymous guide for a city falling into blackout and panic.',
    poster_path: '/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
    backdrop_path: '/v9Du2HC3hlknAvGlWhquRbeifwW.jpg',
    vote_average: 7.2,
    release_date: '2022-09-15',
    genres: [{ id: 9648, name: 'Mystery' }, { id: 53, name: 'Thriller' }],
    original_language: 'en'
  },
  {
    id: 900005,
    title: 'Orbit 17',
    overview: 'The last crew aboard a repair station discovers they were never meant to come home.',
    poster_path: '/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    vote_average: 8.3,
    release_date: '2024-02-09',
    genres: [{ id: 878, name: 'Sci-Fi' }, { id: 27, name: 'Horror' }],
    original_language: 'en'
  },
  {
    id: 900006,
    title: 'Sunset Laugh Club',
    overview: 'A washed-up comic finds a second act by coaching a stubborn group of open-mic regulars.',
    poster_path: '/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdrop_path: '/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    vote_average: 6.9,
    release_date: '2023-07-14',
    genres: [{ id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }],
    original_language: 'en'
  },
  {
    id: 900007,
    title: 'Letters to Verona',
    overview: 'Two archivists decoding a lost collection of love letters discover their own unfinished story.',
    poster_path: '/e4dD1HyTqsnvNdrz3lF9AG8M47Z.jpg',
    backdrop_path: '/7u8D7l0H6Q0Pj7x0Q9x8XwQYV8j.jpg',
    vote_average: 7.1,
    release_date: '2024-05-03',
    genres: [{ id: 10749, name: 'Romance' }, { id: 18, name: 'Drama' }],
    original_language: 'en'
  },
  {
    id: 900008,
    title: 'Metro Masala',
    overview: 'A Mumbai food critic and a stunt chef are forced into a televised road trip across India.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/2PDTWfuBWQKvc7aPAqJK5UCpz08.jpg',
    vote_average: 7.0,
    release_date: '2022-12-01',
    genres: [{ id: 35, name: 'Comedy' }, { id: 10749, name: 'Romance' }],
    original_language: 'hi'
  }
];

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const scoreMovie = (movie, query) => {
  const haystack = normalizeText([
    movie.title,
    movie.overview,
    ...(movie.genres || []).map((genre) => genre.name)
  ].join(' '));
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);

  if (!tokens.length) {
    return 0;
  }

  let score = 0;
  tokens.forEach((token) => {
    if (haystack.includes(token)) {
      score += 1;
    }
  });

  return score / tokens.length;
};

export const filterFallbackMoviesByLanguage = (movies, language) => {
  if (!language) {
    return movies;
  }

  return movies.filter((movie) => movie.original_language === language);
};

export const getFallbackSearchResult = (query, language = '') => {
  const filtered = filterFallbackMoviesByLanguage(FALLBACK_MOVIES, language);
  const scored = filtered
    .map((movie) => ({
      ...movie,
      match_score: scoreMovie(movie, query),
      score: scoreMovie(movie, query)
    }))
    .filter((movie) => movie.match_score > 0)
    .sort((left, right) => right.match_score - left.match_score);

  return {
    top_matches: scored.slice(0, 5),
    recommended: scored.slice(0, 10),
    trending_in_language: filtered.slice(0, 5),
    detected_language: language || null,
    source: 'fallback'
  };
};

export const getFallbackMoodResult = (mood, language = '') => {
  const filtered = filterFallbackMoviesByLanguage(FALLBACK_MOVIES, language);
  const scored = filtered
    .map((movie) => ({
      ...movie,
      mood_score: scoreMovie(movie, mood),
      recommendation_score: Math.max(scoreMovie(movie, mood), 0.55)
    }))
    .sort((left, right) => right.recommendation_score - left.recommendation_score);

  return {
    detected_mood: mood,
    recommended: scored.slice(0, 8),
    trending_in_language: filtered.slice(0, 5),
    detected_language: language || null,
    source: 'fallback'
  };
};

export const getFallbackRecommendations = (movieId) => (
  FALLBACK_MOVIES.filter((movie) => String(movie.id) !== String(movieId))
    .slice(0, 8)
    .map((movie, index) => ({
      ...movie,
      score: Math.max(0.65, 0.95 - (index * 0.04))
    }))
);
