const express = require('express');
const router = express.Router();
const {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  discoverMovies,
  getMovieRecommendations
} = require('../controllers/movieController');

router.get('/trending', getTrendingMovies);
router.get('/search', searchMovies);
router.get('/discover', discoverMovies);
router.get('/recommend', getMovieRecommendations);
router.get('/:id', getMovieDetails);

module.exports = router;
