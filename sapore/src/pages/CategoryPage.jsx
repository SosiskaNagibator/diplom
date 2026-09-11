import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { API_CATALOG } from '../constants/api';
import { getImageUrl } from '../utils/imageUtils';
import { getPriceWithSize } from '../utils/priceUtils';
import { Button, Card } from '../components/ui';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import WishlistButton from '../components/WishlistButton';
import PizzaSkeleton from '../components/PizzaSkeleton';

const fetchCategory = async (slug) => {
  const res = await fetch(`${API_CATALOG}?category_slug=${encodeURIComponent(slug)}&limit=100`);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
};

const categoryDescriptions = {
  'klassika': 'Классические итальянские пиццы по традиционным рецептам: Маргарита, Карбонара, Четыре сыра. Готовим в дровяной печи, доставляем за 30 минут.',
  'myasnye': 'Пиццы с мясом: пепперони, бекон, ветчина, охотничьи колбаски. Сытные и ароматные.',
  'vegetarianskie': 'Вегетарианские пиццы с овощами, грибами и сыром. Без мяса, но с ярким вкусом.',
  'ostrye': 'Острые пиццы с халапеньо, чили и салями. Для тех, кто любит поострее.',
  'sladkie': 'Сладкие пиццы с ягодами и фруктами. Отличный выбор на десерт.',
  'rybnye': 'Пиццы с морепродуктами: креветки, мидии, кальмары. Свежие поставки каждый день.',
  'zakuski': 'Закуски к пицце: чесночный хлеб, крылышки, картофель фри.',
  'napitki': 'Напитки: кола, соки, лимонады, кофе.',
  'salaty': 'Свежие салаты: Цезарь, Греческий, овощной.',
};

const CategoryPage = ({ addToCart }) => {
  const { slug } = useParams();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategory(slug),
  });

  useEffect(() => {
    if (data?.pizzas) {
      const defaults = {};
      data.pizzas.forEach(p => {
        if (p.available_sizes && p.available_sizes.length > 0) {
          defaults[p.id] = p.available_sizes[0];
        }
      });
      setSelectedSizes(defaults);
    }
  }, [data]);

  const handleSizeChange = useCallback((pizzaId, size) => {
    setSelectedSizes(prev => ({ ...prev, [pizzaId]: size }));
    setPriceAnimations(prev => ({ ...prev, [pizzaId]: 'price-pop-small' }));
    setTimeout(() => setPriceAnimations(prev => ({ ...prev, [pizzaId]: '' })), 400);
  }, []);

  const getPrice = useCallback((pizza) => {
    const size = selectedSizes[pizza.id];
    return getPriceWithSize(pizza.price, size);
  }, [selectedSizes]);

  const handleAdd = useCallback((e, pizza) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const size = selectedSizes[pizza.id];
    addToCart({
      ...pizza,
      price: getPrice(pizza),
      size: size?.name || 'Стандартная',
      size_label: size?.label || '',
    });
  }, [selectedSizes, getPrice, addToCart]);

  if (isLoading) {
    return (
      <div className="fade-in">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <PizzaSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data?.pizzas?.length) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Товары не найдены</h1>
        <Link to="/catalog"><Button variant="primary">Вернуться в меню</Button></Link>
      </div>
    );
  }

  const items = data.pizzas;
  const categoryName = items[0]?.category || 'Категория';
  const categoryDesc = categoryDescriptions[slug] || `Товары категории «${categoryName}»`;

  return (
    <div className="fade-in">
      <SEO
        title={`${categoryName} — доставка в Ростове-на-Дону`}
        description={categoryDesc}
        url={`/category/${slug}`}
      />

      <Breadcrumbs items={[
        { label: 'Главная', to: '/' },
        { label: 'Меню', to: '/catalog' },
        { label: categoryName },
      ]} />

      <h1 className="text-3xl font-bold text-gray-800 mb-2">{categoryName}</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">{categoryDesc}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((pizza, index) => (
          <motion.div
            key={pizza.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="h-full"
          >
            <Link to={`/product/${pizza.slug}`} className="block h-full">
              <Card hover className="overflow-hidden border border-gray-100 relative h-full flex flex-col">
                <div className="relative overflow-hidden flex-shrink-0 aspect-square bg-gray-50">
                  <picture>
                    <source srcSet={getImageUrl(pizza.image, 'thumb')} media="(max-width: 640px)" />
                    <source srcSet={getImageUrl(pizza.image, 'medium')} media="(min-width: 641px)" />
                    <img
                      src={getImageUrl(pizza.image, 'medium')}
                      alt={pizza.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="font-semibold text-gray-800 text-lg">{pizza.name}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{pizza.description}</div>
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
                  <div className="flex items-center justify-between mt-3 pt-1">
                    <span className={`text-amber-600 font-bold text-xl ${priceAnimations[pizza.id] || ''}`}>
                      {getPrice(pizza)} ₽
                    </span>
                    <Button variant="primary" onClick={(e) => handleAdd(e, pizza)}>В корзину</Button>
                  </div>
                </div>
                <WishlistButton pizzaId={pizza.id} className="absolute top-2 right-2" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;