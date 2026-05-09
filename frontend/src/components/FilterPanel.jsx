import { SlidersHorizontal } from 'lucide-react';

export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest Releases' },
  { value: 'revenue.desc', label: 'Highest Grossing' }
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '9', label: '9+ Stars' },
  { value: '8', label: '8+ Stars' },
  { value: '7', label: '7+ Stars' },
  { value: '6', label: '6+ Stars' }
];

export const LANGUAGE_OPTIONS = [
  { label: 'Any Language', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' }
];

const FilterPanel = ({ filters, setFilters, onFilterChange }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 40 }, (_, i) => currentYear - i);

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50 mt-4">
      <div className="flex items-center gap-2 mb-4 text-gray-300">
        <SlidersHorizontal size={20} />
        <h3 className="font-semibold">Advanced Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Genre Filter */}
        <select
          value={filters.with_genres || ''}
          onChange={(e) => handleChange('with_genres', e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-netflix-red focus:outline-none"
        >
          <option value="">Any Genre</option>
          {GENRES.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        {/* Year Filter */}
        <select
          value={filters.primary_release_year || ''}
          onChange={(e) => handleChange('primary_release_year', e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-netflix-red focus:outline-none"
        >
          <option value="">Any Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={filters['vote_average.gte'] || ''}
          onChange={(e) => handleChange('vote_average.gte', e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-netflix-red focus:outline-none"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Language Filter */}
        <select
          value={filters.with_original_language || ''}
          onChange={(e) => handleChange('with_original_language', e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-netflix-red focus:outline-none"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort Order */}
        <select
          value={filters.sort_by || 'popularity.desc'}
          onChange={(e) => handleChange('sort_by', e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-netflix-red focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
