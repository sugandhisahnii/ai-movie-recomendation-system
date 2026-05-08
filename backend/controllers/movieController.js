const axios = require('axios');
const { getMovieById, getRecommendationsByTitle } = require('../services/recommendationService');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const TMDB_TIMEOUT_MS = 3500;
const YOUTUBE_TIMEOUT_MS = 3500;
const PLACEHOLDER_VALUES = new Set([
  '',
  'your_tmdb_api_key_here',
  'your_tmdb_access_token_here',
  'your_youtube_api_key_here'
]);
const DEMO_MOVIES = [
  {
    id: 900001,
    title: 'Midnight Protocol',
    overview: 'An elite analyst uncovers a broadcast signal that predicts crimes hours before they happen.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/9nhjGaFLKtddDPtPaX5EmKqsWdH.jpg',
    vote_average: 7.8,
    release_date: '2024-04-12',
    genres: [{ id: 53, name: 'Thriller' }, { id: 878, name: 'Sci-Fi' }]
  },
  {
    id: 900002,
    title: 'Crimson Run',
    overview: 'A getaway driver has one night to outrun a citywide dragnet after a heist collapses.',
    poster_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    backdrop_path: '/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',
    vote_average: 7.4,
    release_date: '2023-11-03',
    genres: [{ id: 28, name: 'Action' }, { id: 80, name: 'Crime' }]
  },
  {
    id: 900003,
    title: 'Glass Horizon',
    overview: 'A storm chaser and a satellite engineer race to stop a weather system rewriting coastlines.',
    poster_path: '/q719jXXEzOoYaps6babgKnONONX.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 8.1,
    release_date: '2024-06-21',
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }]
  },
  {
    id: 900004,
    title: 'Velvet Signal',
    overview: 'A radio host becomes the anonymous guide for a city falling into blackout and panic.',
    poster_path: '/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
    backdrop_path: '/v9Du2HC3hlknAvGlWhquRbeifwW.jpg',
    vote_average: 7.2,
    release_date: '2022-09-15',
    genres: [{ id: 9648, name: 'Mystery' }, { id: 53, name: 'Thriller' }]
  },
  {
    id: 900005,
    title: 'Orbit 17',
    overview: 'The last crew aboard a repair station discovers they were never meant to come home.',
    poster_path: '/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    vote_average: 8.3,
    release_date: '2024-02-09',
    genres: [{ id: 878, name: 'Sci-Fi' }, { id: 27, name: 'Horror' }]
  },
  {
    id: 900006,
    title: 'Sunset Laugh Club',
    overview: 'A washed-up comic finds a second act by coaching a stubborn group of open-mic regulars.',
    poster_path: '/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdrop_path: '/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    vote_average: 6.9,
    release_date: '2023-07-14',
    genres: [{ id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }]
  },
  {
    id: 900007,
    title: 'Letters to Verona',
    overview: 'Two archivists decoding a lost collection of love letters discover their own unfinished story.',
    poster_path: '/e4dD1HyTqsnvNdrz3lF9AG8M47Z.jpg',
    backdrop_path: '/7u8D7l0H6Q0Pj7x0Q9x8XwQYV8j.jpg',
    vote_average: 7.1,
    release_date: '2024-05-03',
    genres: [{ id: 10749, name: 'Romance' }, { id: 18, name: 'Drama' }]
  },
  {
    id: 900008,
    title: 'Metro Masala',
    overview: 'A Mumbai food critic and a stunt chef are forced into a televised road trip across India.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/2PDTWfuBWQKvc7aPAqJK5UCpz08.jpg',
    vote_average: 7.0,
    release_date: '2022-12-01',
    genres: [{ id: 35, name: 'Comedy' }, { id: 10749, name: 'Romance' }]
  }
];

const buildDemoResults = (results = DEMO_MOVIES) => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
  source: 'demo'
});

const buildEmptyResults = () => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0
});

const findDemoMovie = (id) => DEMO_MOVIES.find((movie) => String(movie.id) === String(id));
const hasResults = (data) => Array.isArray(data?.results) && data.results.length > 0;
const normalizeText = (value) => String(value || '').trim().toLowerCase();
const hasVideos = (movie) => Array.isArray(movie?.videos?.results) && movie.videos.results.length > 0;

const searchDemoMovies = (query) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return buildEmptyResults();
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const results = DEMO_MOVIES.filter((movie) => {
    const haystack = normalizeText([
      movie.title,
      movie.overview,
      ...movie.genres.map((genre) => genre.name)
    ].join(' '));

    return tokens.every((token) => haystack.includes(token));
  });

  return buildDemoResults(results);
};

const discoverDemoMovies = (query = {}) => {
  const genreIds = String(query.with_genres || '')
    .split(',')
    .map((genreId) => Number(genreId.trim()))
    .filter(Boolean);

  const results = DEMO_MOVIES.filter((movie) => {
    if (!genreIds.length) {
      return true;
    }

    const movieGenreIds = movie.genres.map((genre) => genre.id);
    return genreIds.some((genreId) => movieGenreIds.includes(genreId));
  });

  return buildDemoResults(results);
};

const formatArtifactMovieDetails = (movie) => ({
  id: movie.movie_id,
  movie_id: movie.movie_id,
  title: movie.title,
  overview: movie.overview || '',
  poster_path: movie.poster_path || null,
  backdrop_path: movie.backdrop_path || movie.poster_path || null,
  vote_average: movie.vote_average || 0,
  vote_count: movie.vote_count || 0,
  popularity: movie.popularity || 0,
  release_date: movie.release_year ? `${movie.release_year}-01-01` : '',
  original_language: movie.original_language || '',
  genres: Array.isArray(movie.genres)
    ? movie.genres.map((genre, index) => ({
        id: index + 1,
        name: genre
          .split(' ')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      }))
    : [],
  credits: { cast: [] },
  videos: { results: [] },
  source: 'ml-artifact'
});

const getTMDBCredentials = () => {
  const apiKey = process.env.TMDB_API_KEY?.trim() || '';
  const accessToken = process.env.TMDB_ACCESS_TOKEN?.trim() || '';

  return {
    apiKey: PLACEHOLDER_VALUES.has(apiKey) ? '' : apiKey,
    accessToken: PLACEHOLDER_VALUES.has(accessToken) ? '' : accessToken
  };
};

const getYouTubeApiKey = () => {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  return PLACEHOLDER_VALUES.has(apiKey) ? '' : apiKey;
};

const fetchFromTMDB = async (endpoint, params = {}) => {
  const { apiKey, accessToken } = getTMDBCredentials();

  if (!apiKey && !accessToken) {
    throw new Error('TMDB credential missing. Set TMDB_API_KEY or TMDB_ACCESS_TOKEN in backend/.env');
  }

  const options = {
    method: 'GET',
    url: `${TMDB_BASE_URL}${endpoint}`,
    timeout: TMDB_TIMEOUT_MS,
    params,
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined
  };

  if (apiKey) {
    options.params = {
      api_key: apiKey,
      ...params
    };
  }

  const response = await axios.request(options);
  return response.data;
};

const fetchFromYouTube = async (endpoint, params = {}) => {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube credential missing. Set YOUTUBE_API_KEY in backend/.env');
  }

  const response = await axios.get(`${YOUTUBE_BASE_URL}${endpoint}`, {
    timeout: YOUTUBE_TIMEOUT_MS,
    params: {
      key: apiKey,
      ...params
    }
  });

  return response.data;
};

const scoreTmdbMatch = (candidate, seedMovie) => {
  let score = 0;
  const candidateTitle = normalizeText(candidate?.title || candidate?.name);
  const seedTitle = normalizeText(seedMovie?.title || seedMovie?.name);

  if (candidateTitle && seedTitle) {
    if (candidateTitle === seedTitle) {
      score += 12;
    } else if (candidateTitle.includes(seedTitle) || seedTitle.includes(candidateTitle)) {
      score += 6;
    }
  }

  const candidateYear = String(candidate?.release_date || '').slice(0, 4);
  const seedYear = String(seedMovie?.release_date || '').slice(0, 4);
  if (candidateYear && seedYear && candidateYear === seedYear) {
    score += 5;
  }

  if (candidate?.original_language && seedMovie?.original_language && candidate.original_language === seedMovie.original_language) {
    score += 3;
  }

  score += Number(candidate?.popularity || 0) / 1000;
  return score;
};

const findTrailerFallbackByTitle = async (seedMovie) => {
  const title = seedMovie?.title || seedMovie?.name;
  if (!title) {
    return null;
  }

  const year = String(seedMovie?.release_date || '').slice(0, 4);
  const searchResults = await fetchFromTMDB('/search/movie', {
    query: title,
    primary_release_year: year || undefined,
    include_adult: false
  });

  if (!Array.isArray(searchResults?.results) || !searchResults.results.length) {
    return null;
  }

  const bestMatch = [...searchResults.results]
    .sort((left, right) => scoreTmdbMatch(right, seedMovie) - scoreTmdbMatch(left, seedMovie))[0];

  if (!bestMatch?.id) {
    return null;
  }

  return fetchFromTMDB(`/movie/${bestMatch.id}`, { append_to_response: 'credits,videos' });
};

const sanitizeTrailerQuery = (title) => String(title || '')
  .replace(/[^\w\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const findYouTubeTrailerFallback = async (seedMovie) => {
  const rawTitle = seedMovie?.title || seedMovie?.name;
  const title = sanitizeTrailerQuery(rawTitle);
  if (!title) {
    return null;
  }

  const year = String(seedMovie?.release_date || '').slice(0, 4);
  const searchQuery = `${title} ${year ? `${year} ` : ''}official trailer`;
  const data = await fetchFromYouTube('/search', {
    part: 'snippet',
    q: searchQuery,
    type: 'video',
    maxResults: 5,
    videoEmbeddable: 'true',
    safeSearch: 'none'
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  const bestVideo = items.find((item) => item?.id?.videoId) || null;

  if (!bestVideo?.id?.videoId) {
    return null;
  }

  return {
    id: bestVideo.id.videoId,
    key: bestVideo.id.videoId,
    name: bestVideo.snippet?.title || `${rawTitle} Official Trailer`,
    site: 'YouTube',
    type: 'Trailer',
    official: true
  };
};

const mergeTrailerFallback = (seedMovie, trailerSource) => ({
  ...seedMovie,
  poster_path: seedMovie.poster_path || trailerSource.poster_path || null,
  backdrop_path: seedMovie.backdrop_path || trailerSource.backdrop_path || trailerSource.poster_path || null,
  vote_average: seedMovie.vote_average || trailerSource.vote_average || 0,
  vote_count: seedMovie.vote_count || trailerSource.vote_count || 0,
  popularity: seedMovie.popularity || trailerSource.popularity || 0,
  release_date: seedMovie.release_date || trailerSource.release_date || '',
  original_language: seedMovie.original_language || trailerSource.original_language || '',
  credits: trailerSource.credits || seedMovie.credits || { cast: [] },
  videos: trailerSource.videos || seedMovie.videos || { results: [] },
  trailer_source: 'tmdb-title-fallback'
});

const mergeYouTubeTrailerFallback = (seedMovie, trailerVideo) => ({
  ...seedMovie,
  videos: {
    results: trailerVideo ? [trailerVideo] : []
  },
  trailer_source: 'youtube-search-fallback'
});

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
const getTrendingMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/movie/week');
    res.json(hasResults(data) ? data : buildDemoResults());
  } catch (error) {
    res.json(buildDemoResults());
  }
};

// @desc    Search movies
// @route   GET /api/movies/search?query=something
// @access  Public
const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is required' });
    
    const data = await fetchFromTMDB('/search/movie', { query });
    res.json(Array.isArray(data?.results) ? data : buildEmptyResults());
  } catch (error) {
    res.json(searchDemoMovies(req.query.query));
  }
};

// @desc    Get movie details
// @route   GET /api/movies/:id
// @access  Public
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // append_to_response to get credits and videos in one call
    const data = await fetchFromTMDB(`/movie/${id}`, { append_to_response: 'credits,videos' });
    if (hasVideos(data)) {
      return res.json(data);
    }

    try {
      const fallback = await findTrailerFallbackByTitle(data);
      if (fallback && hasVideos(fallback)) {
        return res.json(mergeTrailerFallback(data, fallback));
      }
    } catch (fallbackError) {
      // Keep the original TMDB movie if title fallback lookup fails.
    }

    try {
      const youtubeTrailer = await findYouTubeTrailerFallback(data);
      if (youtubeTrailer) {
        return res.json(mergeYouTubeTrailerFallback(data, youtubeTrailer));
      }
    } catch (youtubeError) {
      // Keep original movie payload if YouTube fallback is unavailable.
    }

    res.json(data);
  } catch (error) {
    const artifactMovie = getMovieById(req.params.id);
    if (artifactMovie) {
      const formattedArtifact = formatArtifactMovieDetails(artifactMovie);

      try {
        const fallback = await findTrailerFallbackByTitle(formattedArtifact);
        if (fallback && hasVideos(fallback)) {
          return res.json(mergeTrailerFallback(formattedArtifact, fallback));
        }
      } catch (fallbackError) {
        // Fall through to the artifact-only payload.
      }

      try {
        const youtubeTrailer = await findYouTubeTrailerFallback(formattedArtifact);
        if (youtubeTrailer) {
          return res.json(mergeYouTubeTrailerFallback(formattedArtifact, youtubeTrailer));
        }
      } catch (youtubeError) {
        // Fall through to the artifact-only payload.
      }

      return res.json(formattedArtifact);
    }

    const movie = findDemoMovie(req.params.id);

    if (movie) {
      const demoPayload = {
        ...movie,
        credits: { cast: [] },
        videos: { results: [] }
      };

      try {
        const fallback = await findTrailerFallbackByTitle(demoPayload);
        if (fallback && hasVideos(fallback)) {
          return res.json(mergeTrailerFallback(demoPayload, fallback));
        }
      } catch (fallbackError) {
        // Fall through to demo-only payload.
      }

      try {
        const youtubeTrailer = await findYouTubeTrailerFallback(demoPayload);
        if (youtubeTrailer) {
          return res.json(mergeYouTubeTrailerFallback(demoPayload, youtubeTrailer));
        }
      } catch (youtubeError) {
        // Fall through to demo-only payload.
      }

      return res.json(demoPayload);
    }

    res.status(404).json({ message: 'Movie not found' });
  }
};

// @desc    Get movies by genre/discovery
// @route   GET /api/movies/discover
// @access  Public
const discoverMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/discover/movie', req.query);
    res.json(hasResults(data) ? data : discoverDemoMovies(req.query));
  } catch (error) {
    res.json(discoverDemoMovies(req.query));
  }
};

// @desc    Get ML recommendations by title
// @route   GET /api/movies/recommend?title=Inception&limit=8
// @access  Public
const getMovieRecommendations = async (req, res) => {
  const { title, movieId, limit } = req.query;

  if (!title && !movieId) {
    return res.status(400).json({ message: 'Title or movieId is required' });
  }

  const parsedLimit = Number(limit);
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 20)
    : 8;

  const artifactMovie = movieId ? getMovieById(movieId) : null;
  const result = getRecommendationsByTitle(artifactMovie?.title || title, safeLimit);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  res.json(result);
};

module.exports = {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  discoverMovies,
  getMovieRecommendations
};
