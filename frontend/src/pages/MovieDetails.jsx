import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Play, Plus, Heart } from 'lucide-react';
import { buildYouTubeEmbedUrl, pickTrailer } from '../utils/trailers';
import API_BASE_URL from '../config/api';
import { getFallbackRecommendations } from '../utils/fallbackMovies';

const WATCHLIST_STORAGE_KEY = 'aimovie_watchlist';

const buildPosterFallback = (title) => {
  const safeTitle = (title || 'AIMOVIE').replace(/&/g, '&amp;').slice(0, 24);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#111827" />
          <stop offset="100%" stop-color="#1f2937" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="50%" y="44%" text-anchor="middle" fill="#ef4444" font-size="44" font-family="Arial, sans-serif" font-weight="700">AIMOVIE</text>
      <text x="50%" y="56%" text-anchor="middle" fill="#f9fafb" font-size="24" font-family="Arial, sans-serif">${safeTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const MovieDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showWatchSection, setShowWatchSection] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const watchSectionRef = useRef(null);
  const autoplayHandledRef = useRef('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/movies/${id}`);
        setMovie(res.data);
        
        if (res.data.videos && res.data.videos.results) {
          const trailer = pickTrailer(res.data.videos.results);
          if (trailer) setTrailerUrl(trailer.key);
        }
      } catch (err) {
        // Mock data fallback
        setMovie({
          id,
          title: 'Mock Movie Detail',
          overview: 'This is a mock description because the TMDB API is not yet configured. Set the TMDB_API_KEY in the backend to view actual details.',
          backdrop_path: null,
          vote_average: 8.5,
          release_date: '2024-01-01',
          genres: [{ name: 'Action' }, { name: 'Sci-Fi' }]
        });
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    setShowWatchSection(false);
    setTrailerUrl('');
    autoplayHandledRef.current = '';
  }, [id]);

  useEffect(() => {
    if (!movie) {
      setIsSaved(false);
      return;
    }

    const storedWatchlist = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '[]');
    const targetMovieId = String(movie.id || movie.movie_id || '');
    setIsSaved(storedWatchlist.some((entry) => String(entry.movieId) === targetMovieId));
  }, [movie]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const targetMovieId = movie?.id || movie?.movie_id || id;
      const targetTitle = movie?.title || movie?.name;

      if (!targetMovieId && !targetTitle) {
        return;
      }

      try {
        const params = new URLSearchParams();
        params.set('limit', '8');

        if (targetMovieId) {
          params.set('movieId', String(targetMovieId));
        } else if (targetTitle) {
          params.set('title', targetTitle);
        }

        const res = await axios.get(`${API_BASE_URL}/api/movies/recommend?${params.toString()}`);
        setRecommendations(res.data.results || []);
      } catch (err) {
        setRecommendations(getFallbackRecommendations(targetMovieId));
      }
    };

    fetchRecommendations();
  }, [id, movie?.id, movie?.movie_id, movie?.title, movie?.name]);

  const handleWatchlist = () => {
    const storedWatchlist = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '[]');
    const nextEntry = {
      movieId: String(movie.id || movie.movie_id),
      title: movie.title || movie.name,
      posterPath: movie.poster_path || '',
    };

    if (storedWatchlist.some((entry) => String(entry.movieId) === nextEntry.movieId)) {
      const nextWatchlist = storedWatchlist.filter((entry) => String(entry.movieId) !== nextEntry.movieId);
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(nextWatchlist));
      setIsSaved(false);
      alert('Removed from watchlist.');
      return;
    }

    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify([nextEntry, ...storedWatchlist]));
    setIsSaved(true);
    alert('Added to watchlist.');
  };

  const handlePlay = () => {
    setShowWatchSection(true);

    requestAnimationFrame(() => {
      watchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    const shouldAutoplay = searchParams.get('autoplay') === '1';
    if (!shouldAutoplay || !movie) {
      return;
    }

    const marker = `${id}:${movie.title || movie.name || ''}`;
    if (autoplayHandledRef.current === marker) {
      return;
    }

    autoplayHandledRef.current = marker;
    handlePlay();
  }, [id, movie, searchParams]);

  if (!movie) return <div className="px-4 pt-24 text-center sm:px-6 md:px-8">Loading...</div>;

  const bgStyle = movie.backdrop_path ? {
    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
    backgroundSize: 'cover',
    backgroundPosition: 'top center',
  } : {
    background: 'linear-gradient(to bottom, #232526, #414345)'
  };
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title || movie.name} official trailer`)}`;
  return (
    <div className="min-h-screen bg-netflix-dark relative">
      {/* Background Banner */}
      <div style={bgStyle} className="relative h-[42vh] min-h-[320px] w-full sm:h-[50vh] md:h-[70vh]">
         <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/60 to-transparent"></div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:-mt-48 md:flex-row md:gap-12 md:px-8">
        <div className="relative mx-auto -mt-24 w-full max-w-xs flex-shrink-0 group sm:-mt-28 md:mx-0 md:mt-0 md:w-1/3 md:max-w-none">
           <img 
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : buildPosterFallback(movie.title || movie.name)} 
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
           />
           <button
             onClick={handleWatchlist}
             className={`absolute top-4 right-4 p-3 rounded-full transition text-white ${isSaved ? 'bg-netflix-red' : 'bg-black/60 hover:bg-netflix-red'}`}
           >
              <Heart size={24} fill={isSaved ? 'currentColor' : 'none'} />
           </button>
        </div>

        <div className="w-full text-white md:w-2/3">
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl md:text-5xl">{movie.title || movie.name}</h1>
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-400 sm:gap-4 sm:text-base">
            <span className="text-green-500">{Math.round((movie.vote_average || 0) * 10)}% Match</span>
            <span>{movie.release_date?.substring(0,4)}</span>
            <span className="px-2 py-0.5 border border-gray-600 rounded text-sm">HD</span>
          </div>

          <p className="mb-8 max-w-2xl text-base leading-7 text-gray-200 text-shadow sm:text-lg sm:leading-relaxed">
            {movie.overview}
          </p>

          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
             <button
                onClick={handlePlay}
                className="flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-lg font-bold text-black transition hover:bg-gray-300 sm:px-8 sm:text-xl"
             >
                <Play fill="black" /> Play
             </button>
             <button onClick={handleWatchlist} className="flex items-center justify-center gap-2 rounded-md bg-gray-600/70 px-6 py-3 text-lg font-bold text-white transition hover:bg-gray-600 sm:px-8 sm:text-xl">
                <Plus /> {isSaved ? 'Saved' : 'My List'}
             </button>
          </div>

          <div className="text-gray-400">
            <p className="mb-2"><span className="text-gray-500">Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
          </div>
        </div>
      </div>

      {showWatchSection && (
        <div ref={watchSectionRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16">
          <h2 className="text-2xl font-bold text-white mb-6">Now Playing</h2>
          {trailerUrl ? (
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={buildYouTubeEmbedUrl(trailerUrl, { controls: true })}
                title={`${movie.title || movie.name} trailer`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-8 text-white shadow-2xl">
              <p className="text-lg font-semibold mb-3">Trailer not available in app data</p>
              <p className="text-gray-400 mb-6">
                This title does not currently have a playable trailer from the backend, so there is no inline preview yet.
              </p>
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
              >
                <Play size={18} fill="white" />
                Watch Trailer on YouTube
              </a>
            </div>
          )}

          {trailerUrl ? (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Official Trailer</h3>
              <p className="text-gray-400">
                Trailer playback started for {movie.title || movie.name}.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Trailer Section</h3>
              <p className="text-gray-400">
                Trailer section is visible, but this title does not have an inline trailer source yet.
              </p>
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Play size={16} fill="white" />
                Search on YouTube
              </a>
            </div>
          )}
        </div>
      )}

      {trailerUrl && !showWatchSection && (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16">
          <h2 className="text-2xl font-bold text-white mb-6">Official Trailer</h2>
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src={buildYouTubeEmbedUrl(trailerUrl, { autoplay: false, controls: true, loop: false })}
              title={`${movie.title || movie.name} trailer`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:px-8 md:pb-20">
          <h2 className="text-2xl font-bold text-white mb-6">ML Recommendations</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
            {recommendations.map((item, index) => {
              const movieId = item.movie_id || item.id || `rec-${index}`;
              const movieLabel = item.title || item.name || item.original_title || `item-${index}`;

              return (
              <Link to={`/movie/${movieId}`} key={`${movieId}-${movieLabel}-${index}`} className="group">
                <div className="aspect-[2/3] overflow-hidden rounded-md bg-gray-800 shadow-lg">
                  <img
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : buildPosterFallback(item.title)}
                    alt={item.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="text-white font-semibold leading-snug">{item.title}</h3>
                  <p className="text-sm text-gray-400">Similarity {(item.score * 100).toFixed(1)}%</p>
                </div>
              </Link>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
