import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Info, LoaderCircle, Play, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildYouTubeEmbedUrl, pickTrailer } from '../utils/trailers';
import API_BASE_URL from '../config/api';

const REQUEST_TIMEOUT_MS = 30000;

const buildFallbackImage = (title, isLargeRow) => {
  const width = isLargeRow ? 500 : 500;
  const height = isLargeRow ? 750 : 281;
  const label = (title || 'AIMOVIE').replace(/&/g, '&amp;').slice(0, 24);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1f2937" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text x="50%" y="45%" text-anchor="middle" fill="#ef4444" font-size="${isLargeRow ? 42 : 28}" font-family="Arial, sans-serif" font-weight="700">AIMOVIE</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#f9fafb" font-size="${isLargeRow ? 26 : 18}" font-family="Arial, sans-serif">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const FALLBACK_MOVIES = Array.from({ length: 10 }, (_, index) => ({
  id: 900001 + index,
  title: ['Midnight Protocol', 'Crimson Run', 'Glass Horizon', 'Velvet Signal', 'Orbit 17'][index % 5],
  poster_path: [
    '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    '/q719jXXEzOoYaps6babgKnONONX.jpg',
    '/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
    '/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg'
  ][index % 5],
  backdrop_path: [
    '/9nhjGaFLKtddDPtPaX5EmKqsWdH.jpg',
    '/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',
    '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    '/v9Du2HC3hlknAvGlWhquRbeifwW.jpg',
    '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg'
  ][index % 5]
}));

const MovieRow = ({ title, fetchUrl, isLargeRow = false }) => {
  const [movies, setMovies] = useState([]);
  const [activeMovieId, setActiveMovieId] = useState(null);
  const [trailersByMovieId, setTrailersByMovieId] = useState({});
  const [previewLayout, setPreviewLayout] = useState(null);
  const rowRef = useRef(null);
  const wrapperRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setMovies([]);

    const fetchData = async () => {
      try {
        // Add a random page (1 to 5) so that the UI shows different movies on refresh
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const separator = fetchUrl.includes('?') ? '&' : '?';
        const finalUrl = `${fetchUrl}${separator}page=${randomPage}`;

        const request = await axios.get(`${API_BASE_URL}${finalUrl}`, {
          timeout: REQUEST_TIMEOUT_MS,
          signal: controller.signal
        });
        if (request.data && Array.isArray(request.data.results) && request.data.results.length > 0) {
           // Shuffle the results array for even more variety
           const shuffled = [...request.data.results].sort(() => 0.5 - Math.random());
           setMovies(shuffled);
           return;
        }

        if (Array.isArray(request.data) && request.data.length > 0) {
           // For local mock array
           const shuffled = [...request.data].sort(() => 0.5 - Math.random());
           setMovies(shuffled);
           return;
        }
      } catch (err) {
        if (!controller.signal.aborted && err.code !== 'ERR_CANCELED') {
          console.error('Failed to fetch movies for row:', err);
        }
      }

      // Provide mock data if API fails or returns no usable items
      setMovies(FALLBACK_MOVIES);
    };
    fetchData();

    return () => controller.abort();
  }, [fetchUrl]);

  useEffect(() => {
    setActiveMovieId(null);
    setTrailersByMovieId({});
    setPreviewLayout(null);
  }, [fetchUrl]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleClick = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleHoverStart = async (movie, element) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setActiveMovieId(movie.id);

    if (element && wrapperRef.current) {
      const itemRect = element.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const previewWidth = isLargeRow ? 260 : 440;
      const maxLeft = Math.max(0, wrapperRef.current.clientWidth - previewWidth - 24);
      const left = Math.min(Math.max(0, itemRect.left - wrapperRect.left - 10), maxLeft);
      const top = Math.max(0, itemRect.top - wrapperRect.top - 18);

      setPreviewLayout({ left, top, width: previewWidth });
    }

    if (trailersByMovieId[movie.id] !== undefined) {
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/movies/${movie.id}`, {
        timeout: REQUEST_TIMEOUT_MS
      });
      const trailer = pickTrailer(res.data?.videos?.results);
      setTrailersByMovieId((current) => ({
        ...current,
        [movie.id]: trailer?.key || null
      }));
    } catch (err) {
      setTrailersByMovieId((current) => ({
        ...current,
        [movie.id]: null
      }));
    }
  };

  const handleHoverEnd = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveMovieId(null);
      setPreviewLayout(null);
    }, 220);
  };

  const activeMovie = movies.find((movie) => movie.id === activeMovieId) || null;

  return (
    <div ref={wrapperRef} className="relative mb-2 mt-5 px-4 text-white group sm:px-6 md:px-8">
      <h2 className="mb-4 text-lg font-bold sm:text-xl md:text-2xl">{title}</h2>
      
      <ChevronLeft 
        onClick={() => handleClick('left')}
        className="absolute bottom-0 left-1 top-0 my-auto hidden cursor-pointer rounded-full bg-black/50 text-white opacity-0 transition hover:scale-110 group-hover:opacity-100 md:block z-40"
        size={40}
      />
      
      <div className="relative">
        <div
          ref={rowRef}
          className="scrollbar-hide flex items-start gap-2 overflow-x-scroll overflow-y-visible py-2 sm:gap-3"
        >
          {!movies.length ? (
            Array.from({ length: isLargeRow ? 6 : 5 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className={`animate-pulse rounded-md bg-gray-800/80 ${isLargeRow ? 'h-56 w-36 sm:h-64 sm:w-44' : 'h-32 w-56 sm:h-36 sm:w-72'} min-w-0 flex-none`}
              />
            ))
          ) : null}

          {movies.map((movie, i) => {
            const imagePath = isLargeRow ? movie.poster_path : movie.backdrop_path;
            const imageUrl = imagePath
              ? `https://image.tmdb.org/t/p/w500${imagePath}`
              : buildFallbackImage(movie.title || movie.name, isLargeRow);
            const isActive = activeMovieId === movie.id;
            
            return (
              <div
                key={`${movie.id}-${i}`}
                className={`relative flex-none ${isLargeRow ? 'w-36 sm:w-44' : 'w-56 sm:w-64 md:w-72'}`}
                onMouseEnter={(event) => handleHoverStart(movie, event.currentTarget)}
                onMouseLeave={handleHoverEnd}
              >
                <Link to={`/movie/${movie.id}`} className="block">
                  <img
                    className={`cursor-pointer rounded-md object-cover transition duration-300 ${isLargeRow ? 'h-56 w-36 sm:h-64 sm:w-44' : 'h-32 w-56 sm:h-36 sm:w-64 md:h-40 md:w-72'} ${isActive ? 'scale-[0.98] opacity-100' : 'hover:scale-[1.02]'}`}
                    src={imageUrl}
                    alt={movie.title || movie.name}
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {activeMovie && previewLayout ? (
          <div
            className="pointer-events-none absolute inset-0 z-50 hidden overflow-visible lg:block"
          >
            <div
              className="pointer-events-auto absolute overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-[0_24px_70px_rgba(0,0,0,0.72)]"
              style={{
                left: previewLayout.left,
                top: previewLayout.top,
                width: previewLayout.width
              }}
              onMouseEnter={() => handleHoverStart(activeMovie)}
              onMouseLeave={handleHoverEnd}
            >
              <div className="relative h-56 w-full bg-black">
                {trailersByMovieId[activeMovie.id] ? (
                  <iframe
                    src={buildYouTubeEmbedUrl(trailersByMovieId[activeMovie.id])}
                    title={`${activeMovie.title || activeMovie.name} preview`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : activeMovieId && trailersByMovieId[activeMovie.id] === undefined ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
                    <div className="flex flex-col items-center gap-3 text-white/80">
                      <LoaderCircle size={28} className="animate-spin" />
                      <span className="text-sm tracking-wide text-gray-300">Loading trailer preview</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={activeMovie.backdrop_path ? `https://image.tmdb.org/t/p/w780${activeMovie.backdrop_path}` : buildFallbackImage(activeMovie.title || activeMovie.name, isLargeRow)}
                    alt={activeMovie.title || activeMovie.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181818] to-transparent" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/movie/${activeMovie.id}?autoplay=1`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200"
                    >
                      <Play size={18} fill="black" />
                    </Link>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-white"
                    >
                      <Plus size={18} />
                    </button>
                    <Link
                      to={`/movie/${activeMovie.id}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-white"
                    >
                      <Info size={18} />
                    </Link>
                  </div>

                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-300">
                    HD
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 text-sm">
                  <span className="font-semibold text-green-400">
                    {Math.max(82, Math.round((activeMovie.vote_average || 7.8) * 10))}% Match
                  </span>
                  <span className="rounded border border-white/20 px-1.5 py-0.5 text-xs text-gray-300">
                    {activeMovie.release_date?.slice(0, 4) || 'New'}
                  </span>
                  <span className="text-gray-400">
                    {trailersByMovieId[activeMovie.id] ? 'Auto trailer' : trailersByMovieId[activeMovie.id] === undefined ? 'Loading preview' : 'Preview card'}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-white">{activeMovie.title || activeMovie.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-300">
                  {activeMovie.overview || 'Hover preview is active for this title.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                  {(activeMovie.genres || []).slice(0, 3).map((genre, index) => {
                    const genreId = typeof genre === 'object' ? genre?.id : '';
                    const genreLabel = typeof genre === 'object' ? genre?.name : genre;

                    return (
                      <span
                        key={`${activeMovie.id}-${genreId || genreLabel || `genre-${index}`}-${index}`}
                        className="rounded-full bg-white/5 px-3 py-1"
                      >
                        {genreLabel || 'Genre'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ChevronRight 
        onClick={() => handleClick('right')}
        className="absolute bottom-0 right-1 top-0 my-auto hidden cursor-pointer rounded-full bg-black/50 text-white opacity-0 transition hover:scale-110 group-hover:opacity-100 md:block z-40"
        size={40}
      />
    </div>
  );
};

export default MovieRow;
