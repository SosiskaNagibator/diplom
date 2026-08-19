import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePizzas } from '../hooks/usePizzas';
import { getPriceWithSize } from '../utils/priceUtils';
import { Button, Card } from '../components/ui';
import PizzaSkeleton from '../components/PizzaSkeleton';
import { getImageUrl } from '../utils/imageUtils';
import Pagination from '../components/Pagination';
import WishlistButton from '../components/WishlistButton';

function Catalog({ addToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [activeCategoryId, setActiveCategoryId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});
  const limit = 9;

  const { data, isLoading, error } = usePizzas(activeCategoryId, currentPage, limit, searchQuery);

  useEffect(() => {
    if (searchQuery) {
      setActiveCategoryId(0);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, searchQuery]);

  useEffect(() => {
    if (data?.pizzas) {
      const defaultSizes = {};
      data.pizzas.forEach(pizza => {
        if (pizza.available_sizes && pizza.available_sizes.length > 0) {
          defaultSizes[pizza.id] = pizza.available_sizes[0];
        }
      });
      setSelectedSizes(defaultSizes);
    }
  }, [data]);

  const handleSizeChange = useCallback((pizzaId, size) => {
    setSelectedSizes(prev => ({ ...prev, [pizzaId]: size }));
    setPriceAnimations(prev => ({ ...prev, [pizzaId]: 'price-pop-small' }));
    setTimeout(() => setPriceAnimations(prev => ({ ...prev, [pizzaId]: '' })), 400);
  }, []);

  const getPrice = useCallback((pizza) => {
    const selectedSize = selectedSizes[pizza.id];
    return getPriceWithSize(pizza.price, selectedSize);
  }, [selectedSizes]);

  const handleAddToCart = useCallback((e, pizza) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const selectedSize = selectedSizes[pizza.id];
    const price = getPrice(pizza);
    const pizzaWithSize = {
      ...pizza,
      price,
      name: pizza.name,
      size: selectedSize?.name || 'Стандартная',
      size_label: selectedSize?.label || '25 см'
    };
    addToCart(pizzaWithSize);
  }, [selectedSizes, getPrice, addToCart]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCategoryChange = (categoryId) => {
    setActiveCategoryId(categoryId);
    if (searchQuery) setSearchParams({});
  };

  if (error) return <div className="text-center py-12 text-red-500">Ошибка загрузки: {error.message}</div>;

  const pizzas = data?.pizzas || [];
  const categories = data?.categories || [];
  const pagination = data?.pagination || { totalPages: 1, total: 0 };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.06, duration: 0.5, ease: 'easeOut' }
    })
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Меню'}
      </h1>
      {searchQuery && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Найдено: {pagination.total} пицц</span>
          <button onClick={() => setSearchParams({})} className="text-sm text-amber-600 hover:text-amber-700 underline">
            Очистить поиск
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            activeCategoryId === 0 ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:text-amber-600'
          }`}
          onClick={() => handleCategoryChange(0)}
        >
          Все
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              activeCategoryId === cat.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:text-amber-600'
            }`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: limit }).map((_, index) => <PizzaSkeleton key={`skeleton-${index}`} />)
        ) : (
          pizzas.map((pizza, index) => (
            <motion.div key={`${pizza.id}-${activeCategoryId}-${currentPage}-${searchQuery}`} custom={index} initial="hidden" animate="visible" variants={cardVariants}>
              <Link to={`/pizza/${pizza.id}`} className="block">
                <Card hover className="overflow-hidden border border-gray-100 relative">
                  <div className="relative overflow-hidden">
                    <img src={getImageUrl(pizza.image)} alt={pizza.name} className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-gray-800 text-lg">{pizza.name}</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{pizza.description}</div>
                    {pizza.available_sizes && pizza.available_sizes.length > 0 && (
                      <div className="mt-3 flex gap-1 flex-wrap">
                        {pizza.available_sizes.map(size => (
                          <button
                            key={size.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                              selectedSizes[pizza.id]?.id === size.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={(e) => { e.preventDefault(); handleSizeChange(pizza.id, size); }}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-amber-600 font-bold text-xl ${priceAnimations[pizza.id] || ''}`}>
                        {getPrice(pizza)} ₽
                      </span>
                      <Button variant="primary" onClick={(e) => handleAddToCart(e, pizza)}>
                        В корзину
                      </Button>
                    </div>
                  </div>
                  <WishlistButton pizzaId={pizza.id} className="absolute top-2 right-2" />
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
      {!isLoading && pizzas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'По вашему запросу ничего не найдено' : 'В этой категории пока нет пицц'}
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
    </div>
  );
}

export default Catalog;