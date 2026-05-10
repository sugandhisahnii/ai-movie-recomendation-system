import { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Info, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { buildYouTubeEmbedUrl, pickTrailer } from '../utils/trailers';
import API_BASE_URL from '../config/api';

const REQUEST_TIMEOUT_MS = 30000;
const FALLBACK_HERO = {
  id: 900001,
  title: 'Midnight Protocol',
  overview: 'A rogue signal predicts the citys next crime wave, and one analyst is forced to act before midnight.',
  backdrop_path: null
};

const HeroBanner = ({ refreshKey = 0 }) => {
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setMovie(null);
    setTrailerKey('');

    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/ml/collection?kind=featured&limit=8&seed=${refreshKey || Date.now()}`, {
          timeout: REQUEST_TIMEOUT_MS,
          signal: controller.signal
        });
        if (res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
          const randomMovie = res.data.results[Math.floor(Math.random() * res.data.results.length)];
          setMovie(randomMovie);

          try {
            const detailRes = await axios.get(`${API_BASE_URL}/api/movies/${randomMovie.id}`, {
              timeout: REQUEST_TIMEOUT_MS,
              signal: controller.signal
            });
            const trailer = pickTrailer(detailRes.data?.videos?.results);
            setTrailerKey(trailer?.key || '');
          } catch (detailErr) {
            if (!controller.signal.aborted && detailErr.code !== 'ERR_CANCELED') {
              setTrailerKey('');
            }
          }
          return;
        }
      } catch (err) {
        if (!controller.signal.aborted && err.code !== 'ERR_CANCELED') {
          console.error('Error fetching trending for banner:', err);
        }
      }

      setMovie(FALLBACK_HERO);
    };
    fetchTrending();

    return () => controller.abort();
  }, [refreshKey]);

  if (!movie) return <div className="h-[72vh] min-h-[520px] bg-netflix-dark animate-pulse sm:h-[70vh]"></div>;

  const bgStyle = movie.backdrop_path ? {
    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  } : {
    backgroundImage: `linear-gradient(to right, rgba(12,16,24,0.95) 0%, rgba(12,16,24,0.7) 35%, rgba(0,0,0,0.85) 100%), url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center'
  };

  return (
    <div style={trailerKey ? undefined : bgStyle} className="relative min-h-[620px] overflow-hidden text-white sm:min-h-[680px] md:h-[80vh]">
      {trailerKey ? (
        <iframe
          src={buildYouTubeEmbedUrl(trailerKey)}
          title={`${movie?.title || movie?.name || 'Featured'} trailer background`}
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.1] sm:scale-[1.2] md:scale-[1.35]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : null}

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute z-10 h-full w-full bg-gradient-to-t from-netflix-dark via-black/25 to-black/70" />
      <div className="absolute z-10 h-full w-full bg-gradient-to-r from-netflix-dark via-black/55 to-transparent" />

      <div className="absolute inset-x-0 bottom-14 z-20 px-4 sm:bottom-16 sm:px-6 md:bottom-auto md:top-[30%] md:px-10 lg:px-16">
        <div className="max-w-3xl">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-red-200/80 sm:mb-4 sm:text-xs sm:tracking-[0.4em]">
          Featured suggestion
        </p>
        <h1 className="max-w-2xl text-3xl font-bold text-shadow-md sm:text-4xl md:text-5xl lg:text-6xl">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        <div className="my-5 flex flex-col gap-3 sm:my-6 sm:flex-row">
          <Link to={`/movie/${movie.id}?autoplay=1`}>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-white px-6 py-3 font-semibold text-black shadow-lg transition hover:bg-gray-300 sm:w-auto">
              <Play size={20} fill="black" /> Play
            </button>
          </Link>
          <Link to={`/movie/${movie.id}`}>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-gray-600/70 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-gray-600 sm:w-auto">
              <Info size={20} /> More Info
            </button>
          </Link>
        </div>
        <p className="w-full text-sm leading-6 text-gray-200 text-shadow sm:max-w-[85%] md:max-w-[70%] md:text-base lg:max-w-[50%]">
          {movie?.overview?.length > 150 ? movie.overview.substring(0, 150) + '...' : movie?.overview}
        </p>

        <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs text-white/85 backdrop-blur-sm sm:mt-8 sm:text-sm">
          <Volume2 size={16} />
          <span className="truncate">{trailerKey ? 'Trailer preview playing in background' : 'Backdrop preview mode'}</span>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
