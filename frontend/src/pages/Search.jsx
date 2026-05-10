import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Library, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { getFallbackMoodResult, getFallbackSearchResult } from '../utils/fallbackMovies';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';

const MOOD_KEYWORDS = {
  sad: ['sad', 'heartbroken', 'melancholy', 'emotional'],
  romantic: ['romantic', 'romance', 'love'],
  thriller: ['thriller', 'suspense', 'tense'],
  'feel good': ['feel good', 'happy', 'uplifting', 'cheerful'],
  dark: ['dark', 'gritty', 'bleak', 'intense'],
  action: ['action', 'adrenaline'],
  funny: ['funny', 'comedy', 'laugh'],
  scary: ['scary', 'horror', 'creepy'],
  'sci-fi': ['sci-fi', 'science fiction', 'space', 'futuristic']
};

const LANGUAGE_OPTIONS = [
  { label: 'Any Language', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' }
];

const QUICK_MOODS = ['Sad', 'Romantic', 'Thriller', 'Feel Good', 'Dark', 'Sci-Fi'];

const shuffleArray = (items) => {
  const output = [...(items || [])];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
};

const buildFallbackPoster = (title) => {
  const safeTitle = (title || 'AIMOVIE').replace(/&/g, '&amp;').slice(0, 24);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="50%" y="44%" text-anchor="middle" fill="#ef4444" font-size="42" font-family="Arial, sans-serif" font-weight="700">AIMOVIE</text>
      <text x="50%" y="56%" text-anchor="middle" fill="#f8fafc" font-size="24" font-family="Arial, sans-serif">${safeTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const detectIntent = (query) => {
  const normalized = query.trim().toLowerCase();
  const matchedMood = Object.entries(MOOD_KEYWORDS).find(([, aliases]) => (
    aliases.some((alias) => normalized.includes(alias))
  ));

  if (matchedMood) {
    return { type: 'mood', label: matchedMood[0] };
  }

  return { type: 'title', label: '' };
};

const MovieGrid = ({ title, items, scoreLabel }) => {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-5">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((movie, index) => {
          const movieId = movie.movie_id || movie.id || `movie-${index}`;
          const movieLabel = movie.title || movie.name || movie.original_title || `item-${index}`;

          return (
          <Link to={`/movie/${movieId}`} key={`${movieId}-${movieLabel}-${index}`} className="group relative">
            <div className="aspect-[2/3] overflow-hidden rounded-md bg-gray-800">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : buildFallbackPoster(movie.title)}
                alt={movie.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-white font-semibold leading-snug">{movie.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-400 mt-1">
                <span>{movie.release_date ? movie.release_date.slice(0, 4) : (movie.release_year || 'NA')}</span>
                {movie[scoreLabel] ? <span>{(movie[scoreLabel] * 100).toFixed(1)}%</span> : null}
              </div>
            </div>
          </Link>
        )})}
      </div>
    </section>
  );
};

const Search = () => {
  const [searchMode, setSearchMode] = useState('ml'); // 'ml' or 'advanced'
  
  // Shared
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // ML Search State
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [result, setResult] = useState(null);

  // Advanced Search State
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [advancedResults, setAdvancedResults] = useState(null);

  const fetchMlResults = async (input, forcedIntent = null) => {
    const trimmedQuery = input.trim();
    if (!trimmedQuery) {
      return;
    }

    setLoading(true);
    setStatusMessage('');
    const intent = forcedIntent || detectIntent(trimmedQuery);

    try {
      const params = new URLSearchParams();
      const endpoint = intent.type === 'mood' ? '/api/ml/mood' : '/api/ml/search';

      params.set(intent.type === 'mood' ? 'mood' : 'query', trimmedQuery);
      params.set('limit', '10');
      if (language) {
        params.set('language', language);
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}?${params.toString()}`);
      setResult({
        ...response.data,
        intent: intent.type
      });

      const hasUsefulResults = response.data.top_matches?.length || response.data.recommended?.length;
      if (!hasUsefulResults) {
        setStatusMessage('No strong ML matches found for this query.');
      }
    } catch (error) {
      console.error(error);
      const fallbackResult = intent.type === 'mood'
        ? getFallbackMoodResult(trimmedQuery, language)
        : getFallbackSearchResult(trimmedQuery, language);

      setResult({
        ...fallbackResult,
        intent: intent.type
      });
      setStatusMessage('Live prediction service is unavailable or model is missing. Showing fallback recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvancedResults = async () => {
    setLoading(true);
    setStatusMessage('');

    try {
      const params = new URLSearchParams();
      let endpoint = '/api/movies/discover';

      // Clean empty filters
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      if (advancedQuery.trim()) {
        endpoint = '/api/movies/search';
        params.set('query', advancedQuery.trim());
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}?${params.toString()}`);
      
      if (response.data?.results) {
        setAdvancedResults(response.data.results);
        if (response.data.results.length === 0) {
          setStatusMessage('No movies found matching your filters.');
        }
      } else {
        setAdvancedResults([]);
        setStatusMessage('No movies found matching your filters.');
      }

    } catch (error) {
      console.error("Advanced search error:", error);
      setStatusMessage('Failed to fetch movies with these filters. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger advanced search automatically when filters change
  useEffect(() => {
    if (searchMode === 'advanced') {
      fetchAdvancedResults();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFilters, searchMode]);

  const handleMlSearch = (event) => {
    event.preventDefault();
    fetchMlResults(query);
  };

  const handleAdvancedSearchSubmit = (searchQuery) => {
    fetchAdvancedResults();
  };

  const handleMoodClick = (mood) => {
    setSearchMode('ml');
    setQuery(mood);
    fetchMlResults(mood, { type: 'mood', label: mood.toLowerCase() });
  };

  const handleShuffleResults = () => {
    if (!result) return;
    setResult((current) => ({
      ...current,
      recommended: shuffleArray(current?.recommended),
      trending_in_language: shuffleArray(current?.trending_in_language)
    }));
  };

  const intentSummary = result?.intent === 'mood'
    ? `Mood detected: ${result.detected_mood || 'custom'}`
    : result?.top_matches?.[0]
      ? `Best title match: ${result.top_matches[0].title}`
      : '';

  return (
    <div className="pt-24 px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-4">Discover Movies</h1>
            <p className="text-gray-400 text-lg">
              {searchMode === 'ml' 
                ? <span>Search by movie title or type a mood like <span className="text-white">sad</span>, <span className="text-white">romantic</span>, <span className="text-white">thriller</span>.</span>
                : <span>Find exactly what you're looking for with advanced filters.</span>
              }
            </p>
          </div>
          
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSearchMode('ml')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition font-medium ${searchMode === 'ml' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Sparkles size={18} /> ML Search
            </button>
            <button
              onClick={() => setSearchMode('advanced')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition font-medium ${searchMode === 'advanced' ? 'bg-netflix-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Library size={18} /> Advanced
            </button>
          </div>
        </div>

        {searchMode === 'ml' ? (
          <>
            <form onSubmit={handleMlSearch} className="grid gap-4 md:grid-cols-[1fr_200px_140px] mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title or mood..."
                  className="w-full py-4 pl-12 pr-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-netflix-red border-none text-lg"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg bg-gray-800 text-white px-4 py-4 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-lg bg-netflix-red px-6 py-4 font-semibold text-white hover:opacity-90 transition"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3 mb-10">
              {QUICK_MOODS.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodClick(mood)}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-5 py-3 text-white font-medium hover:bg-gray-700 transition"
                >
                  <Sparkles size={16} />
                  {mood}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mb-10">
            <div className="flex gap-4">
              <SearchBar 
                query={advancedQuery} 
                setQuery={setAdvancedQuery} 
                onSearch={handleAdvancedSearchSubmit} 
              />
              <button
                onClick={() => handleAdvancedSearchSubmit()}
                className="rounded-lg bg-netflix-red px-6 py-4 font-semibold text-white hover:opacity-90 transition shrink-0"
              >
                Search
              </button>
            </div>
            <FilterPanel filters={advancedFilters} setFilters={setAdvancedFilters} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red"></div>
          </div>
        ) : null}

        {!loading && statusMessage ? (
          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-gray-300">
            {statusMessage}
          </div>
        ) : null}

        {/* Render ML Results */}
        {!loading && searchMode === 'ml' && result ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
              <div className="flex flex-wrap items-center gap-3">
                {intentSummary ? <span>{intentSummary}</span> : null}
                {result.detected_language ? <span>Language: {result.detected_language.toUpperCase()}</span> : null}
              </div>

              {(result.recommended?.length || result.trending_in_language?.length) ? (
                <button
                  onClick={handleShuffleResults}
                  className="rounded-full border border-gray-700 bg-gray-900/80 px-4 py-2 text-white hover:bg-gray-800 transition"
                >
                  Shuffle Results
                </button>
              ) : null}
            </div>

            <MovieGrid
              title="Top Matches"
              items={result.top_matches}
              scoreLabel={result.intent === 'mood' ? 'mood_score' : 'match_score'}
            />

            <MovieGrid
              title="Recommended for You"
              items={result.recommended}
              scoreLabel={result.intent === 'mood' ? 'recommendation_score' : 'score'}
            />

            {result.trending_in_language?.length ? (
              <MovieGrid
                title={`Trending${result.detected_language ? ` in ${result.detected_language.toUpperCase()}` : ''}`}
                items={result.trending_in_language}
                scoreLabel=""
              />
            ) : null}
          </>
        ) : null}

        {/* Render Advanced Results */}
        {!loading && searchMode === 'advanced' && advancedResults?.length > 0 ? (
          <MovieGrid
            title="Search Results"
            items={advancedResults}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Search;
