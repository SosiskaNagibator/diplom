import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProduct';
import { useQuery } from '@tanstack/react-query';
import { getImageUrl } from '../utils/imageUtils';
import { getPriceWithSize } from '../utils/priceUtils';
import { buildProductSeo } from '../utils/seoUtils';
import { API_CATALOG, API_CONSTRUCTOR } from '../constants/api';
import { Button } from '../components/ui';
import { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import WishlistButton from '../components/WishlistButton';
import PizzaDetailsSkeleton from '../components/skeletons/PizzaDetailsSkeleton';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import NutritionModal from '../components/NutritionModal';
import ToppingCard from '../components/constructor/ToppingCard';

const PIZZA_CATEGORIES = ['klassika', 'myasnye', 'vegetarianskie', 'ostrye', 'sladkie', 'rybnye'];
const relatedGridStyle = { gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' };

const fetchRelated = async (categorySlug, excludeId) => {
  if (!categorySlug) return [];
  const res = await fetch(`${API_CATALOG}?category_slug=${encodeURIComponent(categorySlug)}&limit=5`);
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== 'success') return [];
  return data.pizzas.filter(p => p.id !== excludeId).slice(0, 4);
};

const fetchToppings = async () => {
  const res = await fetch(API_CONSTRUCTOR);
  if (!res.ok) throw new Error('Ошибка загрузки начинок');
  const data = await res.json();
  return data.toppings || [];
};

const PizzaDetails = ({ addToCart }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: pizza, isLoading, error } = useProduct(slug);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    setSelectedSize(null);
    setSelectedToppings([]);
  }, [slug]);

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

  const { data: allToppings = [] } = useQuery({
    queryKey: ['constructor-toppings'],
    queryFn: fetchToppings,
    staleTime: 10 * 60 * 1000,
  });

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog');
    }
  };

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.id === topping.id);
      if (exists) return prev.filter(t => t.id !== topping.id);
      return [...prev, topping];
    });
  };

  const toppingsSum = selectedToppings.reduce((sum, t) => sum + Number(t.price || 0), 0);

  if (isLoading) return <PizzaDetailsSkeleton />;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка загрузки</div>;
  if (!pizza) return <div className="text-center py-12">Товар не найден</div>;

  const seo = buildProductSeo(pizza);
  const isPizza = PIZZA_CATEGORIES.includes(pizza?.category_slug);
  const handleSizeSelect = (size) => setSelectedSize(size);
  const basePrice = getPriceWithSize(pizza.price, selectedSize);
  const multiplier = selectedSize?.price_multiplier || 1;
  const price = basePrice + toppingsSum;

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
    const toppingNames = selectedToppings.map(t => t.name).join(', ');
    const pizzaWithSize = {
      ...pizza,
      price,
      size: selectedSize?.name || 'Стандартная',
      size_label: selectedSize?.label || '',
      toppings: selectedToppings.map(t => ({ id: t.id, name: t.name, price: t.price })),
      toppings_sum: toppingsSum,
      description: toppingNames
        ? `${pizza.description} + ${toppingNames}`
        : pizza.description,
    };
    addToCart(pizzaWithSize);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title={seo.title}
        description={seo.description}
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

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
      >
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
                src={getImageUrl(pizza.image, 'large')}
                srcSet={`${getImageUrl(pizza.image, 'medium')} 800w, ${getImageUrl(pizza.image, 'large')} 1200w`}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={pizza.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton pizzaId={pizza.id} />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-800">{seo.h1 || pizza.name}</h1>
              {hasNutrition && (
                <button
                  type="button"
                  onClick={() => setShowNutrition(true)}
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                  aria-label="Пищевая ценность"
                  title="Пищевая ценность"
                >
                  <FaInfoCircle className="text-xl" />
                </button>
              )}
            </div>

            <p className="text-gray-600 mt-2">{pizza.description}</p>

            <p className="text-sm font-medium text-gray-500 mt-3">Категория: {pizza.category}</p>

            {pizza.available_sizes && pizza.available_sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700 mb-2">Размер</p>
                <div className="flex flex-wrap gap-2">
                  {pizza.available_sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                        selectedSize?.id === size.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isPizza && allToppings.length > 0 && (
              <div className="mt-5">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Дополнительные начинки</p>
                  {selectedToppings.length > 0 && (
                    <span className="text-xs text-amber-600 font-medium">
                      Выбрано: {selectedToppings.length}
                    </span>
                  )}
                </div>
                <div className="max-h-[150px] overflow-y-auto custom-scrollbar rounded-lg -mx-1 px-1">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-1">
                    {allToppings.map(topping => {
                      const selected = !!selectedToppings.find(t => t.id === topping.id);
                      return (
                        <ToppingCard
                          key={topping.id}
                          topping={topping}
                          selected={selected}
                          isFree={false}
                          onToggle={() => toggleTopping(topping)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-amber-600">{price} ₽</span>
                  {toppingsSum > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      +{toppingsSum} ₽ за начинки
                    </div>
                  )}
                </div>
                <Button variant="primary" onClick={handleAddToCart}>В корзину</Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <NutritionModal
        isOpen={showNutrition}
        onClose={() => setShowNutrition(false)}
        name={`${pizza.name}${selectedSize ? ` · ${selectedSize.label}` : ''}`}
        calories={calories}
        protein={protein}
        fat={fat}
        carbs={carbs}
        description={pizza.description}
      />

      {related.length > 0 && (
        <section className="mt-12">
          <div className="text-2xl font-bold text-gray-800 mb-4">Похожие товары</div>
          <div className="grid gap-4" style={relatedGridStyle}>
            {related.map(item => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={getImageUrl(item.image, 'thumb')}
                    srcSet={`${getImageUrl(item.image, 'thumb')} 400w, ${getImageUrl(item.image, 'medium')} 800w`}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
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
    </div>
  );
};

export default PizzaDetails;