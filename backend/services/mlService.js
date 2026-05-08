const { loadArtifact } = require('./recommendationService');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

const LANGUAGE_ALIASES = {
  english: 'en',
  hindi: 'hi',
  bollywood: 'hi',
  korean: 'ko',
  japanese: 'ja',
  tamil: 'ta',
  telugu: 'te',
  malayalam: 'ml',
  french: 'fr',
  spanish: 'es',
  german: 'de'
};

const MOOD_PROFILES = {
  sad: {
    aliases: ['sad', 'heartbroken', 'melancholy', 'emotional'],
    genres: ['drama', 'romance'],
    keywords: ['loss', 'grief', 'heartbreak', 'family', 'tragedy', 'lonely', 'relationship']
  },
  romantic: {
    aliases: ['romantic', 'romance', 'love'],
    genres: ['romance', 'drama', 'comedy'],
    keywords: ['love', 'relationship', 'couple', 'wedding', 'date', 'affair', 'heart']
  },
  thriller: {
    aliases: ['thriller', 'tense', 'suspense', 'suspenseful'],
    genres: ['thriller', 'mystery', 'crime', 'action'],
    keywords: ['murder', 'investigation', 'conspiracy', 'psychological', 'survival', 'killer', 'chase']
  },
  'feel good': {
    aliases: ['feel good', 'uplifting', 'cheerful', 'happy'],
    genres: ['comedy', 'family', 'romance', 'music'],
    keywords: ['friendship', 'hope', 'joy', 'inspiring', 'feel good', 'dream', 'family']
  },
  dark: {
    aliases: ['dark', 'gritty', 'intense', 'bleak'],
    genres: ['thriller', 'crime', 'drama', 'horror'],
    keywords: ['revenge', 'obsession', 'violence', 'noir', 'corruption', 'serial killer', 'murder']
  },
  action: {
    aliases: ['action', 'adrenaline'],
    genres: ['action', 'adventure', 'thriller'],
    keywords: ['battle', 'mission', 'fight', 'chase', 'war', 'hero']
  },
  funny: {
    aliases: ['funny', 'comedy', 'laugh', 'light'],
    genres: ['comedy', 'family'],
    keywords: ['funny', 'friendship', 'party', 'school', 'chaos', 'holiday']
  },
  scary: {
    aliases: ['scary', 'horror', 'creepy'],
    genres: ['horror', 'thriller', 'mystery'],
    keywords: ['ghost', 'haunted', 'supernatural', 'monster', 'fear', 'demon']
  },
  'sci-fi': {
    aliases: ['sci-fi', 'science fiction', 'space', 'futuristic'],
    genres: ['science fiction', 'adventure', 'action'],
    keywords: ['space', 'future', 'robot', 'alien', 'time travel', 'technology', 'virtual reality']
  }
};

const HOME_COLLECTIONS = {
  featured: {
    title: 'Featured',
    filter: () => true,
    score: (movie) => movie.popularity * 0.7 + movie.voteAverage * 6 + Math.log10(movie.voteCount + 1) * 3
  },
  trending: {
    title: 'Trending Now',
    filter: () => true,
    score: (movie) => movie.popularity * 0.75 + movie.voteAverage * 5 + Math.log10(movie.voteCount + 1) * 2.5
  },
  romantic: {
    title: 'Romantic Favorites',
    filter: (movie) => movie.genres.includes('romance') || movie.searchBlob.includes('love'),
    score: (movie) => movie.voteAverage * 8 + movie.popularity * 0.35 + Math.log10(movie.voteCount + 1) * 2.5
  },
  thriller: {
    title: 'Thriller Picks',
    filter: (movie) => movie.genres.includes('thriller') || movie.genres.includes('mystery') || movie.searchBlob.includes('psychological'),
    score: (movie) => movie.voteAverage * 8 + movie.popularity * 0.4 + Math.log10(movie.voteCount + 1) * 2.5
  },
  hindi: {
    title: 'Hindi Picks',
    filter: (movie) => movie.original_language === 'hi',
    score: (movie) => movie.popularity * 0.65 + movie.voteAverage * 7 + Math.log10(movie.voteCount + 1) * 2.5
  },
  english: {
    title: 'English Hits',
    filter: (movie) => movie.original_language === 'en',
    score: (movie) => movie.popularity * 0.72 + movie.voteAverage * 6.5 + Math.log10(movie.voteCount + 1) * 2.5
  },
  korean: {
    title: 'Korean Spotlight',
    filter: (movie) => movie.original_language === 'ko',
    score: (movie) => movie.popularity * 0.62 + movie.voteAverage * 7.5 + Math.log10(movie.voteCount + 1) * 2.5
  },
  japanese: {
    title: 'Japanese Picks',
    filter: (movie) => movie.original_language === 'ja',
    score: (movie) => movie.popularity * 0.6 + movie.voteAverage * 7.5 + Math.log10(movie.voteCount + 1) * 2.5
  },
  tamil: {
    title: 'Tamil Favourites',
    filter: (movie) => movie.original_language === 'ta',
    score: (movie) => movie.popularity * 0.6 + movie.voteAverage * 7.2 + Math.log10(movie.voteCount + 1) * 2.5
  },
  telugu: {
    title: 'Telugu Watchlist',
    filter: (movie) => movie.original_language === 'te',
    score: (movie) => movie.popularity * 0.6 + movie.voteAverage * 7.2 + Math.log10(movie.voteCount + 1) * 2.5
  }
};

let cachedIndex = null;

const normalizeText = (value) => String(value || '').trim().toLowerCase();
const tokenize = (value) => normalizeText(value).split(/[^a-z0-9]+/).filter(Boolean);

const toTitleCase = (value) => value.replace(/\b\w/g, (char) => char.toUpperCase());

const clampLimit = (limit) => {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
};

const rotateArray = (items, offset) => {
  if (!items.length) {
    return items;
  }

  const safeOffset = ((offset % items.length) + items.length) % items.length;
  return items.slice(safeOffset).concat(items.slice(0, safeOffset));
};

const shuffleWithSeed = (items, seed) => {
  const output = [...items];
  let state = seed || 1;

  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
};

const buildBigramSet = (value) => {
  const normalized = normalizeText(value).replace(/\s+/g, ' ');
  if (normalized.length < 2) {
    return new Set([normalized]);
  }

  const set = new Set();
  for (let index = 0; index < normalized.length - 1; index += 1) {
    set.add(normalized.slice(index, index + 2));
  }
  return set;
};

const diceCoefficient = (leftSet, rightSet) => {
  let overlap = 0;
  leftSet.forEach((item) => {
    if (rightSet.has(item)) {
      overlap += 1;
    }
  });

  const total = leftSet.size + rightSet.size;
  return total ? (2 * overlap) / total : 0;
};

const extractLanguage = (input, explicitLanguage) => {
  if (explicitLanguage) {
    return normalizeText(explicitLanguage);
  }

  const normalized = normalizeText(input);
  return Object.entries(LANGUAGE_ALIASES).find(([label]) => normalized.includes(label))?.[1] || '';
};

const sanitizeQuery = (query) => {
  let output = normalizeText(query);
  Object.keys(LANGUAGE_ALIASES).forEach((label) => {
    output = output.replace(new RegExp(`\\b${label}\\b`, 'g'), ' ');
  });
  return output.replace(/\s+/g, ' ').trim();
};

const buildIndex = () => {
  if (cachedIndex) {
    return cachedIndex;
  }

  const artifact = loadArtifact();
  if (!artifact) {
    return null;
  }

  const moviesById = artifact.movies_by_id || {};
  const titleLookup = artifact.title_lookup || {};
  const recommendationsById = artifact.recommendations_by_id || {};

  const movieEntries = Object.values(moviesById).map((movie) => ({
    ...movie,
    normalizedTitle: normalizeText(movie.title),
    titleTokens: tokenize(movie.title),
    titleBigrams: buildBigramSet(movie.title),
    searchBlob: normalizeText(movie.search_blob),
    popularity: Number(movie.popularity) || 0,
    voteAverage: Number(movie.vote_average) || 0,
    voteCount: Number(movie.vote_count) || 0
  }));

  const movieMap = new Map(movieEntries.map((movie) => [String(movie.movie_id), movie]));
  const titleEntries = Object.entries(titleLookup)
    .map(([normalizedTitle, movieId]) => {
      const movie = movieMap.get(String(movieId));
      if (!movie) {
        return null;
      }

      return {
        movieId: String(movieId),
        normalizedTitle,
        title: movie.title,
        titleTokens: tokenize(movie.title),
        titleBigrams: buildBigramSet(movie.title),
        originalLanguage: movie.original_language
      };
    })
    .filter(Boolean);

  cachedIndex = {
    artifact,
    movieEntries,
    movieMap,
    recommendationsById,
    titleEntries
  };

  return cachedIndex;
};

const serializeMovie = (movie) => ({
  movie_id: movie.movie_id,
  id: movie.movie_id,
  title: movie.title,
  poster_path: movie.poster_path || null,
  backdrop_path: movie.poster_path || null,
  overview: movie.overview || '',
  genres: movie.genres || [],
  original_language: movie.original_language || '',
  vote_average: movie.vote_average ?? null,
  vote_count: movie.vote_count ?? 0,
  popularity: movie.popularity ?? 0,
  release_year: movie.release_year || ''
});

const scoreTitleMatch = (query, queryTokens, queryBigrams, titleEntry) => {
  if (!query) {
    return 0;
  }

  if (titleEntry.normalizedTitle === query) {
    return 1;
  }

  let score = 0;
  if (titleEntry.normalizedTitle.startsWith(query)) {
    score += 0.35;
  } else if (titleEntry.normalizedTitle.includes(query)) {
    score += 0.22;
  }

  const overlapCount = queryTokens.filter((token) => titleEntry.titleTokens.includes(token)).length;
  const tokenScore = queryTokens.length ? overlapCount / queryTokens.length : 0;
  const diceScore = diceCoefficient(queryBigrams, titleEntry.titleBigrams);

  score += tokenScore * 0.35;
  score += diceScore * 0.3;

  return score;
};

const detectMoodProfile = (mood) => {
  const normalized = normalizeText(mood);
  if (!normalized) {
    return null;
  }

  return Object.entries(MOOD_PROFILES).find(([, profile]) => (
    profile.aliases.some((alias) => normalized.includes(alias))
  )) || null;
};

const searchByTitle = (query, options = {}) => {
  const index = buildIndex();
  if (!index) {
    return { error: 'Recommendation model not trained yet. Run backend/scripts/train_recommender.py first.' };
  }

  const language = extractLanguage(query, options.language);
  const cleanedQuery = sanitizeQuery(query);
  const limit = clampLimit(options.limit);
  const queryTokens = tokenize(cleanedQuery);
  const queryBigrams = buildBigramSet(cleanedQuery);

  const scoredMatches = index.titleEntries
    .filter((entry) => !language || entry.originalLanguage === language)
    .map((entry) => ({
      entry,
      score: scoreTitleMatch(cleanedQuery, queryTokens, queryBigrams, entry)
    }))
    .filter((item) => item.score >= 0.18)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  const topMatches = scoredMatches.map(({ entry, score }) => ({
    ...serializeMovie(index.movieMap.get(entry.movieId)),
    match_score: Number(score.toFixed(4))
  }));

  const primaryMatch = topMatches[0];
  const primaryRecommendations = primaryMatch
    ? (index.recommendationsById[String(primaryMatch.movie_id)]?.recommendations || [])
        .filter((item) => {
          if (!language) {
            return true;
          }
          return index.movieMap.get(String(item.movie_id))?.original_language === language;
        })
        .slice(0, limit)
    : [];

  return {
    query,
    detected_language: language || null,
    top_matches: topMatches,
    recommended: primaryRecommendations,
    source: 'ml-title-search'
  };
};

const scoreMoodSeed = (movie, profile, language) => {
  if (language && movie.original_language !== language) {
    return 0;
  }

  const genreHits = profile.genres.filter((genre) => movie.genres.includes(genre)).length;
  const keywordHits = profile.keywords.filter((keyword) => movie.searchBlob.includes(keyword)).length;
  const aliasHits = profile.aliases.filter((alias) => movie.searchBlob.includes(alias)).length;

  const genreScore = profile.genres.length ? genreHits / profile.genres.length : 0;
  const keywordScore = profile.keywords.length ? keywordHits / profile.keywords.length : 0;
  const aliasScore = profile.aliases.length ? aliasHits / profile.aliases.length : 0;
  const qualityBoost = Math.min(movie.voteAverage / 10, 1) * 0.08;
  const popularityBoost = Math.min(movie.popularity / 100, 1) * 0.07;

  return (genreScore * 0.5) + (keywordScore * 0.27) + (aliasScore * 0.08) + qualityBoost + popularityBoost;
};

const getTrendingByLanguage = (movieEntries, language, limit) => movieEntries
  .filter((movie) => !language || movie.original_language === language)
  .sort((left, right) => (
    (right.popularity * 0.65 + right.voteAverage * 4 + Math.log10(right.voteCount + 1) * 2) -
    (left.popularity * 0.65 + left.voteAverage * 4 + Math.log10(left.voteCount + 1) * 2)
  ))
  .slice(0, limit)
  .map(serializeMovie);

const getMoodRecommendations = (mood, options = {}) => {
  const index = buildIndex();
  if (!index) {
    return { error: 'Recommendation model not trained yet. Run backend/scripts/train_recommender.py first.' };
  }

  const limit = clampLimit(options.limit);
  const language = extractLanguage(mood, options.language);
  const profileEntry = detectMoodProfile(mood);

  if (!profileEntry) {
    return {
      error: `Mood "${mood}" not recognized.`,
      supported_moods: Object.keys(MOOD_PROFILES)
    };
  }

  const [profileName, profile] = profileEntry;

  const seeds = index.movieEntries
    .map((movie) => ({
      movie,
      score: scoreMoodSeed(movie, profile, language)
    }))
    .filter((item) => item.score >= 0.12)
    .sort((left, right) => right.score - left.score)
    .slice(0, 15);

  const combined = new Map();

  seeds.forEach(({ movie, score }) => {
    const baseValue = combined.get(String(movie.movie_id)) || {
      ...serializeMovie(movie),
      recommendation_score: 0,
      reason: 'seed'
    };
    baseValue.recommendation_score += score * 1.15;
    combined.set(String(movie.movie_id), baseValue);

    const neighbors = index.recommendationsById[String(movie.movie_id)]?.recommendations || [];
    neighbors.forEach((neighbor) => {
      const neighborMovie = index.movieMap.get(String(neighbor.movie_id));
      if (!neighborMovie) {
        return;
      }
      if (language && neighborMovie.original_language !== language) {
        return;
      }

      const current = combined.get(String(neighbor.movie_id)) || {
        ...serializeMovie(neighborMovie),
        recommendation_score: 0,
        reason: `similar to ${movie.title}`
      };
      current.recommendation_score += score * (0.65 + (neighbor.score || 0));
      combined.set(String(neighbor.movie_id), current);
    });
  });

  const recommended = [...combined.values()]
    .sort((left, right) => right.recommendation_score - left.recommendation_score)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      recommendation_score: Number(item.recommendation_score.toFixed(4))
    }));

  return {
    mood,
    detected_mood: profileName,
    detected_language: language || null,
    top_matches: seeds.slice(0, Math.min(limit, 5)).map(({ movie, score }) => ({
      ...serializeMovie(movie),
      mood_score: Number(score.toFixed(4))
    })),
    recommended,
    trending_in_language: getTrendingByLanguage(index.movieEntries, language, Math.min(limit, 8)),
    source: 'ml-mood-search'
  };
};

const getHomeCollection = (kind, options = {}) => {
  const index = buildIndex();
  if (!index) {
    return { error: 'Recommendation model not trained yet. Run backend/scripts/train_recommender.py first.' };
  }

  const collection = HOME_COLLECTIONS[kind];
  if (!collection) {
    return {
      error: `Collection "${kind}" not found.`,
      supported_collections: Object.keys(HOME_COLLECTIONS)
    };
  }

  const language = extractLanguage('', options.language);
  const limit = clampLimit(options.limit);
  const seed = Number(options.seed) || Date.now();

  const ranked = index.movieEntries
    .filter((movie) => collection.filter(movie))
    .filter((movie) => !language || movie.original_language === language)
    .map((movie) => ({
      movie,
      score: collection.score(movie)
    }))
    .sort((left, right) => right.score - left.score);

  const poolSize = Math.min(Math.max(limit * 4, 20), ranked.length);
  const candidatePool = ranked.slice(0, poolSize);
  const rotated = rotateArray(candidatePool, seed);
  const randomized = shuffleWithSeed(rotated, seed);

  const results = randomized
    .slice(0, limit)
    .map(({ movie, score }) => ({
      ...serializeMovie(movie),
      collection_score: Number(score.toFixed(3))
    }));

  return {
    kind,
    title: collection.title,
    detected_language: language || null,
    seed,
    results,
    source: 'ml-home-collection'
  };
};

module.exports = {
  LANGUAGE_ALIASES,
  MOOD_PROFILES,
  detectMoodProfile,
  getHomeCollection,
  searchByTitle,
  getMoodRecommendations
};
