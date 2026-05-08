import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useEffect, useRef, useState, useContext } from 'react';
import axios from 'axios';
import { Play, Plus, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { buildYouTubeEmbedUrl, pickTrailer } from '../utils/trailers';
import API_BASE_URL from '../config/api';

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
  const { user, logout } = useContext(AuthContext);
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
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [id, movie?.id, movie?.movie_id, movie?.title, movie?.name]);

  const handleWatchlist = async () => {
     try {
       await axios.post(`${API_BASE_URL}/api/watchlist`, {
         movieId: movie.id,
         title: movie.title || movie.name,
         posterPath: movie.poster_path
       });
       alert("Added to watchlist!");
     } catch (err) {
       if (err.response?.status === 401) {
         logout();
         alert("Session expired. Please sign in again.");
         return;
       }

       console.log('Watchlist request failed');
       alert("Could not add to watchlist right now.");
     }
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

  if (!movie) return <div className="pt-24 text-center">Loading...</div>;

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
      <div style={bgStyle} className="h-[60vh] md:h-[70vh] w-full relative">
         <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/60 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 relative -mt-32 md:-mt-64 z-10 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 flex-shrink-0 relative group">
           <img 
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : buildPosterFallback(movie.title || movie.name)} 
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
           />
           {user && (
             <button onClick={handleWatchlist} className="absolute top-4 right-4 bg-black/60 p-3 rounded-full hover:bg-netflix-red transition text-white">
                <Heart size={24} />
             </button>
           )}
        </div>

        <div className="w-full md:w-2/3 text-white">
          <h1 className="text-5xl font-bold mb-2">{movie.title || movie.name}</h1>
          <div className="flex items-center gap-4 text-gray-400 font-semibold mb-6">
            <span className="text-green-500">{Math.round((movie.vote_average || 0) * 10)}% Match</span>
            <span>{movie.release_date?.substring(0,4)}</span>
            <span className="px-2 py-0.5 border border-gray-600 rounded text-sm">HD</span>
          </div>

          <p className="text-lg leading-relaxed text-gray-200 mb-8 max-w-2xl text-shadow">
            {movie.overview}
          </p>

          <div className="flex gap-4 mb-12">
             <button
                onClick={handlePlay}
                className="bg-white text-black px-8 py-3 rounded-md font-bold text-xl hover:bg-gray-300 transition flex items-center gap-2"
             >
                <Play fill="black" /> Play
             </button>
             {user && (
               <button onClick={handleWatchlist} className="bg-gray-600/70 text-white px-8 py-3 rounded-md font-bold text-xl hover:bg-gray-600 transition flex items-center gap-2">
                  <Plus /> My List
               </button>
             )}
          </div>

          <div className="text-gray-400">
            <p className="mb-2"><span className="text-gray-500">Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
          </div>
        </div>
      </div>

      {showWatchSection && (
        <div ref={watchSectionRef} className="max-w-7xl mx-auto px-8 py-16">
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
        <div className="max-w-7xl mx-auto px-8 py-16">
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
        <div className="max-w-7xl mx-auto px-8 pb-20">
          <h2 className="text-2xl font-bold text-white mb-6">ML Recommendations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
