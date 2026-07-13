import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePizzas } from '../hooks/usePizzas';
import { getPriceWithSize } from '../utils/priceUtils';
import { Button, Card } from '../components/ui';
import PizzaSkeleton from '../components/PizzaSkeleton';
import { getImageUrl } from '../utils/imageUtils'; // <-- добавлен импорт

function Catalog({ addToCart }) {
  const [activeCategoryId, setActiveCategoryId] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});

  const { data, isLoading, error } = usePizzas(activeCategoryId);

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

  const handleSizeChange = (pizzaId, size) => {
    setSelectedSizes(prev => ({ ...prev, [pizzaId]: size }));
    setPriceAnimations(prev => ({ ...prev, [pizzaId]: 'price-pop-small' }));
    setTimeout(() => setPriceAnimations(prev => ({ ...prev, [pizzaId]: '' })), 400);
  };

  const getPrice = (pizza) => {
    const selectedSize = selectedSizes[pizza.id];
    return getPriceWithSize(pizza.price, selectedSize);
  };

  const handleAddToCart = (e, pizza) => {
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
  };

  if (error) {
    return <div className="text-center py-12 text-red-500">Ошибка загрузки: {error.message}</div>;
  }

  const pizzas = data?.pizzas || [];
  const categories = data?.categories || [];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.09,
        duration: 0.55,
        ease: 'easeOut'
      }
    })
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Меню</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            activeCategoryId === 0
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:text-amber-600'
          }`}
          onClick={() => setActiveCategoryId(0)}
        >
          Все
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              activeCategoryId === cat.id
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:text-amber-600'
            }`}
            onClick={() => setActiveCategoryId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <PizzaSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          pizzas.map((pizza, index) => (
            <motion.div
              key={`${pizza.id}-${activeCategoryId}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card hover className="overflow-hidden border border-gray-100">
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(pizza.image)} // <-- изменено
                    alt={pizza.name}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
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
                            selectedSizes[pizza.id]?.id === size.id
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => handleSizeChange(pizza.id, size)}
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
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default Catalog;