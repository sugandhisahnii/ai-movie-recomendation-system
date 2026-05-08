const { getHomeCollection, getMoodRecommendations, searchByTitle } = require('../services/mlService');

const applyNoStore = (res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
};

const mlSearch = (req, res) => {
  applyNoStore(res);
  const { query, limit, language } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  const result = searchByTitle(query, { limit, language });
  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  res.json(result);
};

const mlMood = (req, res) => {
  applyNoStore(res);
  const { mood, limit, language } = req.query;
  if (!mood) {
    return res.status(400).json({ message: 'Mood is required' });
  }

  const result = getMoodRecommendations(mood, { limit, language });
  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
};

const mlCollection = (req, res) => {
  applyNoStore(res);
  const { kind, limit, language, seed } = req.query;
  if (!kind) {
    return res.status(400).json({ message: 'Collection kind is required' });
  }

  const result = getHomeCollection(kind, { limit, language, seed });
  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
};

module.exports = {
  mlCollection,
  mlSearch,
  mlMood
};
