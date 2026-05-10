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

  if (!movie) return <div className="h-[70vh] bg-netflix-dark animate-pulse"></div>;

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
    <div style={trailerKey ? undefined : bgStyle} className="h-[80vh] text-white object-contain relative overflow-hidden">
      {trailerKey ? (
        <iframe
          src={buildYouTubeEmbedUrl(trailerKey)}
          title={`${movie?.title || movie?.name || 'Featured'} trailer background`}
          className="absolute inset-0 h-full w-full scale-[1.35] pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : null}

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute w-full h-[80vh] bg-gradient-to-t from-netflix-dark via-black/25 to-black/70 z-10" />
      <div className="absolute w-full h-[80vh] bg-gradient-to-r from-netflix-dark via-black/45 to-transparent z-10" />

      <div className="absolute top-[35%] w-full pl-8 md:pl-16 z-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-red-200/80">
          Featured suggestion
        </p>
        <h1 className="text-4xl md:text-6xl font-bold max-w-2xl text-shadow-md">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        <div className="my-6">
          <Link to={`/movie/${movie.id}?autoplay=1`}>
            <button className="bg-white text-black font-semibold py-2 px-6 rounded mr-4 hover:bg-gray-300 transition flex items-center justify-center gap-2 inline-flex shadow-lg">
              <Play size={20} fill="black" /> Play
            </button>
          </Link>
          <Link to={`/movie/${movie.id}`}>
            <button className="bg-gray-600/70 text-white font-semibold py-2 px-6 rounded hover:bg-gray-600 transition flex items-center justify-center gap-2 inline-flex shadow-lg">
              <Info size={20} /> More Info
            </button>
          </Link>
        </div>
        <p className="w-full md:max-w-[70%] lg:max-w-[50%] text-gray-200 text-sm md:text-base leading-snug text-shadow">
          {movie?.overview?.length > 150 ? movie.overview.substring(0, 150) + '...' : movie?.overview}
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm text-white/85 backdrop-blur-sm">
          <Volume2 size={16} />
          <span>{trailerKey ? 'Trailer preview playing in background' : 'Backdrop preview mode'}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
