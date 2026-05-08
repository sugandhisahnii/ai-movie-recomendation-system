const User = require('../models/User');

const dedupeWatchlist = (watchlist = []) => {
  const seen = new Set();

  return watchlist.filter((movie) => {
    const movieId = String(movie.movieId);
    if (seen.has(movieId)) {
      return false;
    }

    seen.add(movieId);
    return true;
  });
};

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const dedupedWatchlist = dedupeWatchlist(user.watchlist);

    if (dedupedWatchlist.length !== user.watchlist.length) {
      user.watchlist = dedupedWatchlist;
      await user.save();
    }

    res.json(dedupedWatchlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { movieId, title, posterPath } = req.body;
    const user = await User.findById(req.user._id);
    const normalizedMovieId = String(movieId);

    // Check if already in watchlist
    const exists = user.watchlist.find((movie) => String(movie.movieId) === normalizedMovieId);
    if (exists) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    user.watchlist.push({ movieId: normalizedMovieId, title, posterPath });
    await user.save();

    res.status(201).json(dedupeWatchlist(user.watchlist));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:movieId
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.watchlist = user.watchlist.filter(
      (movie) => String(movie.movieId) !== String(req.params.movieId)
    );
    
    await user.save();
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
