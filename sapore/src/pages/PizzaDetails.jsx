import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProduct';
import { useQuery } from '@tanstack/react-query';
import { getImageUrl } from '../utils/imageUtils';
import { getPriceWithSize } from '../utils/priceUtils';
import { API_CATALOG } from '../constants/api';
import { Button } from '../components/ui';
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import WishlistButton from '../components/WishlistButton';
import PizzaDetailsSkeleton from '../components/skeletons/PizzaDetailsSkeleton';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

const fetchRelated = async (categorySlug, excludeId) => {
  if (!categorySlug) return [];
  const res = await fetch(`${API_CATALOG}?category_slug=${encodeURIComponent(categorySlug)}&limit=5`);
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== 'success') return [];
  return data.pizzas.filter(p => p.id !== excludeId).slice(0, 4);
};

const PizzaDetails = ({ addToCart }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: pizza, isLoading, error } = useProduct(slug);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (pizza?.available_sizes?.length > 0 && !selectedSize) {
      setSelectedSize(pizza.available_sizes[0]);
    }
  }, [pizza, selectedSize]);

  const { data: related = [] } = useQuery({
    queryKey: ['related', pizza?.category_slug, pizza?.id],
    queryFn: () => fetchRelated(pizza.category_slug, pizza.id),
    enabled: !!pizza?.category_slug && !!pizza?.id,
    staleTime: 5 * 60 * 1000,
  });

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog');
    }
  };

  if (isLoading) return <PizzaDetailsSkeleton />;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка загрузки</div>;
  if (!pizza) return <div className="text-center py-12">Товар не найден</div>;

  const handleSizeSelect = (size) => setSelectedSize(size);
  const price = getPriceWithSize(pizza.price, selectedSize);
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
  const hasNutrition = pizza.calories > 0 || pizza.protein > 0 || pizza.fat > 0 || pizza.carbs > 0;

  const handleAddToCart = () => {
    const pizzaWithSize = {
      ...pizza,
      price,
      size: selectedSize?.name || 'Стандартная',
      size_label: selectedSize?.label || '',
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
      <SEO
        title={`${pizza.name} — заказать с доставкой`}
        description={pizza.description}
        image={getImageUrl(pizza.image, 'medium')}
        url={`/product/${pizza.slug}`}
        type="product"
      />

      <Breadcrumbs items={[
        { label: 'Главная', to: '/' },
        { label: 'Меню', to: '/catalog' },
        ...(pizza.category_slug ? [{ label: pizza.category, to: `/category/${pizza.category_slug}` }] : []),
        { label: pizza.name },
      ]} />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
          title="Закрыть"
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="relative">
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={getImageUrl(pizza.image, 'medium')}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
              />
              <div className="absolute inset-0 bg-white/30" />
              <img
                src={getImageUrl(pizza.image, 'large')}
                alt={pizza.name}
                className="relative w-full h-full object-contain drop-shadow-xl"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton pizzaId={pizza.id} />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{pizza.name}</h1>
              <p className="text-gray-600 mt-2">{pizza.description}</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Категория: {pizza.category}</p>
                {hasNutrition && (
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
                )}
              </div>
            </div>

            <div className="mt-6">
              {pizza.available_sizes && pizza.available_sizes.length > 0 && (
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
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">{price} ₽</span>
                <Button variant="primary" onClick={handleAddToCart}>В корзину</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Похожие товары</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(item => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={getImageUrl(item.image, 'thumb')}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-3">
                  <div className="font-medium text-gray-800 text-sm line-clamp-2">{item.name}</div>
                  <div className="text-amber-600 font-bold text-sm mt-1">{item.price} ₽</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default PizzaDetails;