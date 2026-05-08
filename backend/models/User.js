const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  watchlist: [{
    movieId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    posterPath: {
      type: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
