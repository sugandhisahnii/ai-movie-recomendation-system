import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChevronDown, Heart, LogOut, Search, User2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-netflix-dark' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-netflix-red text-2xl md:text-3xl font-bold tracking-wider">
            AIMOVIE
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <Link to="/" className="hover:text-gray-300 transition">Home</Link>
            {user ? <Link to="/watchlist" className="hover:text-gray-300 transition">My List</Link> : null}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/search" className="text-white hover:text-gray-300 transition">
            <Search size={24} />
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/watchlist" className="text-white hover:text-gray-300 transition">
                <Heart size={24} />
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-white hover:bg-white/10 transition"
                >
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500 to-red-500 flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} className={`transition ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="border-b border-white/10 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Signed In</p>
                      <p className="mt-2 text-lg font-bold text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>

                    <div className="p-3">
                      <Link
                        to="/watchlist"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white transition hover:bg-white/8"
                      >
                        <Heart size={18} />
                        <span>My List</span>
                      </Link>

                      <Link
                        to="/search"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white transition hover:bg-white/8"
                      >
                        <Search size={18} />
                        <span>Search Movies</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-red-200 transition hover:bg-red-500/10"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-netflix-red text-white px-4 py-1.5 rounded hover:bg-red-700 transition">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
