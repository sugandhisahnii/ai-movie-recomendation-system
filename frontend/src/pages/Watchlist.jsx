import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

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

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const uniqueWatchlist = watchlist.filter((movie, index, items) => (
    items.findIndex((candidate) => String(candidate.movieId) === String(movie.movieId)) === index
  ));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/watchlist`);
        setWatchlist(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [logout, navigate, user]);

  const handleRemove = async (movieId) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/watchlist/${movieId}`);
      setWatchlist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  if (loading) {
    return <div className="pt-24 px-8 text-white">Loading watchlist...</div>;
  }

  if (!user) {
    return (
      <div className="pt-24 px-8 text-white">
        <h1 className="text-3xl font-bold mb-4">My Watchlist</h1>
        <p className="text-gray-300 mb-6">Sign in to save movies to your watchlist.</p>
        <Link to="/login" className="inline-block bg-netflix-red px-6 py-3 rounded-md font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 px-8 pb-16 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">My Watchlist</h1>

      {uniqueWatchlist.length === 0 ? (
        <p className="text-gray-300">No movies added yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {uniqueWatchlist.map((movie, index) => (
            <div key={`${movie.movieId}-${movie._id || movie.addedAt || index}`} className="group relative">
              <Link to={`/movie/${movie.movieId}`}>
                <div className="aspect-[2/3] overflow-hidden rounded-md bg-gray-800">
                  <img
                    src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : buildFallbackPoster(movie.title)}
                    alt={movie.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
              <button
                onClick={() => handleRemove(movie.movieId)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-netflix-red text-white p-2 rounded-full transition"
                aria-label={`Remove ${movie.title} from watchlist`}
              >
                <Trash2 size={18} />
              </button>
              <p className="text-white mt-3 font-semibold line-clamp-2">{movie.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
