const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const options = {
      method: 'GET',
      url: `${TMDB_BASE_URL}${endpoint}`,
      params: {
        api_key: process.env.TMDB_API_KEY,
        ...params
      }
    };

    const response = await axios.request(options);
    return response.data;

  } catch (error) {
    console.error("TMDB FULL ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
const getTrendingMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/movie/week');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending movies', error: error.message });
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error searching movies', error: error.message });
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie details', error: error.message });
  }
};

// @desc    Get movies by genre/discovery
// @route   GET /api/movies/discover
// @access  Public
const discoverMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/discover/movie', req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error discovering movies', error: error.message });
  }
};

// @desc    Get movie recommendations
// @route   GET /api/movies/recommend
// @access  Public
const getMovieRecommendations = async (req, res) => {
  try {
    const { movieId, title } = req.query;
    
    if (movieId) {
      const data = await fetchFromTMDB(`/movie/${movieId}/recommendations`, req.query);
      return res.json(data);
    }
    
    // If no movieId, but we have a title, we might search for it first or just return empty
    // But TMDB requires a movie ID for recommendations.
    res.json({ results: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie recommendations', error: error.message });
  }
};

module.exports = {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  discoverMovies,
  getMovieRecommendations
};
