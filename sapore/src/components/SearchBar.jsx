import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { API_CATALOG } from '../constants/api';
import { getImageUrl } from '../utils/imageUtils';
import { useDebounce } from '../hooks/useDebounce';

const fetchSuggestions = async (query) => {
  if (!query || query.length < 2) return [];
  const res = await fetch(`${API_CATALOG}?search=${encodeURIComponent(query)}&limit=5`);
  const data = await res.json();
  return data.pizzas || [];
};

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: () => fetchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000,
  });

  useEffect(() => {
    if (debouncedQuery.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, suggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith('/catalog')) {
      setQuery('');
      setIsOpen(false);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (pizza) => {
    navigate(`/pizza/${pizza.id}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleFocus = () => {
    if (debouncedQuery.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="Поиск пиццы..."
          className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            {suggestions.map((pizza) => (
              <li
                key={pizza.id}
                onClick={() => handleSuggestionClick(pizza)}
                className="px-4 py-2 hover:bg-amber-50 cursor-pointer flex items-center gap-3 transition"
              >
                <img
                  src={getImageUrl(pizza.image)}
                  alt={pizza.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <div className="font-medium text-gray-800">{pizza.name}</div>
                  <div className="text-xs text-gray-500">{pizza.category}</div>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;