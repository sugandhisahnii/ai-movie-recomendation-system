const fs = require('fs');
const path = require('path');

const RECOMMENDER_PATH = path.join(__dirname, '..', 'data', 'recommender.json');

let cachedArtifact = null;

const normalizeTitle = (value) => String(value || '').trim().toLowerCase();

const loadArtifact = () => {
  if (cachedArtifact) {
    return cachedArtifact;
  }

  if (!fs.existsSync(RECOMMENDER_PATH)) {
    return null;
  }

  const raw = fs.readFileSync(RECOMMENDER_PATH, 'utf-8');
  cachedArtifact = JSON.parse(raw);
  return cachedArtifact;
};

const findTitleKey = (title, artifact) => {
  const normalized = normalizeTitle(title);
  if (!normalized) {
    return '';
  }

  if (artifact.title_lookup?.[normalized]) {
    return normalized;
  }

  return Object.keys(artifact.title_lookup || {}).find((key) => key.includes(normalized)) || '';
};

const getMovieById = (movieId) => {
  const artifact = loadArtifact();
  if (!artifact) {
    return null;
  }

  return artifact.movies_by_id?.[String(movieId)] || null;
};

const getRecommendationsByTitle = (title, limit = 10) => {
  const artifact = loadArtifact();
  if (!artifact) {
    return {
      error: 'Recommendation model not trained yet. Run backend/scripts/train_recommender.py first.'
    };
  }

  const titleKey = findTitleKey(title, artifact);
  if (!titleKey) {
    return {
      error: `Movie "${title}" not found in recommendation dataset.`
    };
  }

  const movieId = artifact.title_lookup[titleKey];
  const item = artifact.recommendations_by_id?.[String(movieId)];

  if (!item) {
    return {
      error: `Recommendations unavailable for "${title}".`
    };
  }

  return {
    movie_id: item.movie_id,
    title: item.title,
    poster_path: item.poster_path,
    release_year: item.release_year,
    results: item.recommendations.slice(0, limit),
    source: 'ml-hybrid-v11'
  };
};

module.exports = {
  loadArtifact,
  getMovieById,
  getRecommendationsByTitle
};
