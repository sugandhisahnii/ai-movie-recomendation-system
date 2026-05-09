import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Search } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-netflix-dark' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <Link to="/browse" className="text-netflix-red text-2xl md:text-3xl font-bold tracking-wider">
            AIMOVIE
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <Link to="/browse" className="hover:text-gray-300 transition">Home</Link>
            <Link to="/watchlist" className="hover:text-gray-300 transition">My List</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/search" className="text-white hover:text-gray-300 transition">
            <Search size={24} />
          </Link>
          <Link to="/watchlist" className="text-white hover:text-gray-300 transition" aria-label="Open watchlist">
            <Heart size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
