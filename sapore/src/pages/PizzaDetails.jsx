import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePizza } from '../hooks/usePizza';
import { getImageUrl } from '../utils/imageUtils';
import { getPriceWithSize } from '../utils/priceUtils';
import { Button } from '../components/ui';
import { useState, useEffect } from 'react';
import WishlistButton from '../components/WishlistButton';
import PizzaDetailsSkeleton from '../components/skeletons/PizzaDetailsSkeleton';

const PizzaDetails = ({ addToCart }) => {
  const { id } = useParams();
  const { data: pizza, isLoading, error } = usePizza(id);
  const [selectedSize, setSelectedSize] = useState(null);

  // Автоматически выбираем первый доступный размер при загрузке пиццы
  useEffect(() => {
    if (pizza?.available_sizes?.length > 0 && !selectedSize) {
      setSelectedSize(pizza.available_sizes[0]);
    }
  }, [pizza, selectedSize]);

  if (isLoading) return <PizzaDetailsSkeleton />;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка загрузки</div>;
  if (!pizza) return <div className="text-center py-12">Пицца не найдена</div>;

  const handleSizeSelect = (size) => setSelectedSize(size);
  const price = getPriceWithSize(pizza.price, selectedSize);

  // --- Вычисление КБЖУ с учётом размера ---
  const multiplier = selectedSize?.price_multiplier || 1;

  const calcNutrition = (baseValue) => {
    if (!baseValue) return 0;
    const result = baseValue * multiplier;
    return Number.isInteger(result) ? result : Math.round(result * 10) / 10;
  };

  const calories = calcNutrition(pizza.calories);
  const protein = calcNutrition(pizza.protein);
  const fat = calcNutrition(pizza.fat);
  const carbs = calcNutrition(pizza.carbs);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Пожалуйста, выберите размер');
      return;
    }
    const pizzaWithSize = {
      ...pizza,
      price,
      name: pizza.name,
      size: selectedSize.name,
      size_label: selectedSize.label,
    };
    addToCart(pizzaWithSize);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <Link to="/catalog" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
        ← Назад к меню
      </Link>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="flex justify-center relative">
            <img
              src={getImageUrl(pizza.image)}
              alt={pizza.name}
              className="w-full max-h-96 object-contain rounded-xl"
            />
            <div className="absolute top-2 right-2">
              <WishlistButton pizzaId={pizza.id} />
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{pizza.name}</h1>
              <p className="text-gray-600 mt-2">{pizza.description}</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Категория: {pizza.category}</p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                  <div className="bg-amber-50 p-2 rounded-lg text-center">
                    <span className="block font-bold text-amber-600">{calories}</span>
                    <span className="text-gray-500 text-xs">ккал</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-center">
                    <span className="block font-bold text-amber-600">{protein} г</span>
                    <span className="text-gray-500 text-xs">Белки</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-center">
                    <span className="block font-bold text-amber-600">{fat} г</span>
                    <span className="text-gray-500 text-xs">Жиры</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-center">
                    <span className="block font-bold text-amber-600">{carbs} г</span>
                    <span className="text-gray-500 text-xs">Углеводы</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {pizza.available_sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeSelect(size)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      selectedSize?.id === size.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">{price} ₽</span>
                <Button variant="primary" onClick={handleAddToCart}>
                  В корзину
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PizzaDetails;