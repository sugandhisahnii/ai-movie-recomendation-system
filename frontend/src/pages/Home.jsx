import { useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';

const LANGUAGES = [
  { code: 'hi', label: 'Hindi' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' }
];

const Home = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

  return (
    <div className="pb-8">
      <HeroBanner />
      
      {/* 
        Note: These endpoints wrap the TMDB API on our backend. 
        If the keys aren't set, the MovieRow will display mock items.
      */}
      <div className="-mt-32 z-30 relative">
        <MovieRow 
          title="AIMOVIE Exclusives" 
          fetchUrl="/api/movies/discover?with_networks=28" 
          isLargeRow 
        />
        <MovieRow 
          title="Trending Now" 
          fetchUrl="/api/movies/trending" 
        />
        <MovieRow 
          title="Action Thrillers" 
          fetchUrl="/api/movies/discover?with_genres=28,53" 
        />
        <MovieRow 
          title="Comedy Movies" 
          fetchUrl="/api/movies/discover?with_genres=35" 
        />
        <MovieRow 
          title="Romantic Favorites" 
          fetchUrl="/api/movies/discover?with_genres=10749" 
        />
        
        {/* Interactive Language Selection Section */}
        <div className="mt-8 ml-8 pr-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Browse by Language</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-5 py-2 rounded-full font-semibold transition duration-300 ${
                  selectedLanguage.code === lang.code
                    ? 'bg-netflix-red text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Row based on selected language */}
        <MovieRow 
          key={selectedLanguage.code}
          title={`${selectedLanguage.label} Spotlight`} 
          fetchUrl={`/api/movies/discover?with_original_language=${selectedLanguage.code}`} 
        />
      </div>
    </div>
  );
};

export default Home;
