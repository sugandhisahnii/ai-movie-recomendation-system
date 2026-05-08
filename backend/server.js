require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-movie-recomendation-system.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests and explicitly approved frontends.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ml', require('./routes/mlRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server failed to start:', error.message);
});
