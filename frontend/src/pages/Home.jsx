import { useState } from 'react';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';

const LANGUAGE_LANES = [
  { label: 'Hindi', value: 'hi' },
  { label: 'English', value: 'en' },
  { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' }
];

const Home = () => {
  const [refreshSeed, setRefreshSeed] = useState(() => Date.now());
  const [selectedLanguage, setSelectedLanguage] = useState('hi');

  const handleRefresh = () => {
    setRefreshSeed(Date.now());
  };

  const selectedLanguageLabel = LANGUAGE_LANES.find((item) => item.value === selectedLanguage)?.label || 'Hindi';

  return (
    <div>
      <HeroBanner refreshKey={refreshSeed} />

      <div className="-mt-32 z-30 relative">
        <div className="flex justify-end px-8 mb-2">
          <button
            onClick={handleRefresh}
            className="rounded-full border border-gray-700 bg-black/50 px-5 py-2 text-sm font-semibold text-white hover:bg-black/70 transition"
          >
            Refresh Rows
          </button>
        </div>

        <MovieRow 
          title="Featured Now" 
          fetchUrl={`/api/ml/collection?kind=featured&limit=12&seed=${refreshSeed}`} 
          isLargeRow 
        />
        <MovieRow 
          title="Trending Now" 
          fetchUrl={`/api/ml/collection?kind=trending&limit=14&seed=${refreshSeed + 1}`} 
        />
        <MovieRow 
          title="Thriller Picks" 
          fetchUrl={`/api/ml/collection?kind=thriller&limit=14&seed=${refreshSeed + 2}`} 
        />
        <MovieRow 
          title="Hindi Picks" 
          fetchUrl={`/api/ml/collection?kind=hindi&limit=14&seed=${refreshSeed + 3}`} 
        />
        <MovieRow 
          title="Romantic Favorites" 
          fetchUrl={`/api/ml/collection?kind=romantic&limit=14&seed=${refreshSeed + 4}`} 
        />

        <MovieRow 
          title="English Hits" 
          fetchUrl={`/api/ml/collection?kind=english&limit=14&seed=${refreshSeed + 5}`} 
        />

        <section className="px-8 mt-14 mb-4 text-white">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 px-6 py-8 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-gray-400 mb-3">Browse by Language</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Pick a language lane</h2>
            <p className="max-w-3xl text-gray-300 leading-relaxed">
              Select a language first, then the homepage will show a rotating lane for that language instead of mixing random language sections together.
            </p>

            <div className="mt-8 border-b border-white/10">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {LANGUAGE_LANES.map((item) => {
                  const isActive = selectedLanguage === item.value;

                  return (
                    <button
                      key={item.value}
                      onClick={() => setSelectedLanguage(item.value)}
                      className={`relative pb-4 text-sm md:text-base font-semibold tracking-wide transition ${
                        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span
                        className={`inline-flex rounded-full px-4 py-2 transition ${
                          isActive ? 'bg-white/12' : 'bg-transparent'
                        }`}
                      >
                        {item.label}
                      </span>

                      <span
                        className={`absolute left-0 right-0 -bottom-px mx-auto h-0.5 rounded-full bg-netflix-red transition-all ${
                          isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 text-sm text-gray-400">
              <span className="inline-block h-2 w-2 rounded-full bg-netflix-red" />
              <span>Now browsing: {selectedLanguageLabel}</span>
            </div>
          </div>
        </section>

        <MovieRow 
          title={`${selectedLanguageLabel} Spotlight`}
          fetchUrl={`/api/ml/collection?kind=featured&language=${selectedLanguage}&limit=14&seed=${refreshSeed + 6}`} 
        />
        <MovieRow 
          title={`Trending in ${selectedLanguageLabel}`}
          fetchUrl={`/api/ml/collection?kind=trending&language=${selectedLanguage}&limit=14&seed=${refreshSeed + 7}`} 
        />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
