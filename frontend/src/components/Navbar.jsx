import { Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { Heart, Search, RefreshCw, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-netflix-dark' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-12 md:py-4">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link to="/browse" className="shrink-0 text-netflix-red text-xl font-bold tracking-wider sm:text-2xl md:text-3xl">
            AIMOVIE
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <Link to="/browse" className="hover:text-gray-300 transition">Home</Link>
            <Link to="/watchlist" className="hover:text-gray-300 transition">My List</Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
          <button onClick={handleRefresh} className="text-white hover:text-gray-300 transition" aria-label="Refresh page">
            <RefreshCw size={20} className="sm:h-6 sm:w-6" />
          </button>
          <Link to="/search" className="text-white hover:text-gray-300 transition">
            <Search size={20} className="sm:h-6 sm:w-6" />
          </Link>
          <Link to="/watchlist" className="text-white hover:text-gray-300 transition" aria-label="Open watchlist">
            <Heart size={20} className="sm:h-6 sm:w-6" />
          </Link>
          <Link to={user ? "/profile" : "/login"} className="ml-1 flex items-center gap-2 text-white transition hover:text-gray-300 sm:ml-2" aria-label="User Profile">
            {user ? (
               <div className="flex h-8 w-8 items-center justify-center rounded bg-netflix-red text-sm font-bold">
                 {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
               </div>
            ) : (
               <User size={20} className="sm:h-6 sm:w-6" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
