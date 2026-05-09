import { Search as SearchIcon, X } from 'lucide-react';

const SearchBar = ({ query, setQuery, onSearch, placeholder = "Search for movies..." }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch(''); // Trigger search with empty query if needed
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full py-4 pl-12 pr-12 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-netflix-red border-none text-lg"
      />
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
      
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
        >
          <X size={24} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
