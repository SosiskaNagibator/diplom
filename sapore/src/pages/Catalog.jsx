import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { API_CATALOG } from '../constants/api';
import { getPriceWithSize } from '../utils/priceUtils';
import { Button, Card } from '../components/ui';
import PizzaSkeleton from '../components/PizzaSkeleton';
import { getImageUrl } from '../utils/imageUtils';
import WishlistButton from '../components/WishlistButton';
import SEO from '../components/SEO';
import { useActiveSection } from '../hooks/useActiveSection';

const fetchCatalog = async (search) => {
  const url = search
    ? `${API_CATALOG}?search=${encodeURIComponent(search)}&limit=500`
    : `${API_CATALOG}?limit=500`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
};

function Catalog({ addToCart }) {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = (searchParams.get('search') || '').trim();

  const { data, isLoading, error } = useQuery({
    queryKey: ['catalog-all', searchQuery],
    queryFn: () => fetchCatalog(searchQuery),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.pizzas || [];
  const categories = data?.categories || [];

  const grouped = useMemo(() => {
    const map = {};
    const byName = {};

    categories.forEach((cat) => {
      const key = String(cat.id);
      map[key] = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        items: [],
      };
      byName[cat.name] = key;
    });

    items.forEach((item) => {
      let key = item.category_id != null ? String(item.category_id) : '';
      if (!key || !map[key]) {
        key = byName[item.category] || '';
      }
      if (key && map[key]) {
        map[key].items.push(item);
      }
    });

    return categories
      .map((cat) => map[String(cat.id)])
      .filter((g) => g && g.items.length > 0);
  }, [items, categories]);

  const sectionIds = useMemo(
    () => (searchQuery ? [] : grouped.map((g) => `category-${g.id}`)),
    [grouped, searchQuery]
  );

  const activeSectionId = useActiveSection(sectionIds);

  useEffect(() => {
    if (items.length) {
      const defaults = {};
      items.forEach((p) => {
        if (p.available_sizes && p.available_sizes.length > 0) {
          defaults[p.id] = p.available_sizes[0];
        }
      });
      setSelectedSizes(defaults);
    }
  }, [items]);

  const handleSizeChange = useCallback((pizzaId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [pizzaId]: size }));
    setPriceAnimations((prev) => ({ ...prev, [pizzaId]: 'price-pop-small' }));
    setTimeout(
      () => setPriceAnimations((prev) => ({ ...prev, [pizzaId]: '' })),
      400
    );
  }, []);

  const getPrice = useCallback(
    (pizza) => {
      const size = selectedSizes[pizza.id];
      return getPriceWithSize(pizza.price, size);
    },
    [selectedSizes]
  );

  const handleAddToCart = useCallback(
    (e, pizza) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      const size = selectedSizes[pizza.id];
      addToCart({
        ...pizza,
        price: getPrice(pizza),
        name: pizza.name,
        size: size?.name || 'Стандартная',
        size_label: size?.label || '',
      });
    },
    [selectedSizes, getPrice, addToCart]
  );

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -140;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const renderCard = (pizza, index = 0) => (
    <motion.div
      key={pizza.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="h-full"
    >
      <Link to={`/product/${pizza.slug}`} className="block h-full">
        <Card
          hover
          className="overflow-hidden border border-gray-100 relative h-full flex flex-col"
        >
          <div className="relative overflow-hidden flex-shrink-0 aspect-square bg-gray-50">
            <picture>
              <source
                srcSet={getImageUrl(pizza.image, 'thumb')}
                media="(max-width: 640px)"
              />
              <source
                srcSet={getImageUrl(pizza.image, 'medium')}
                media="(min-width: 641px)"
              />
              <img
                src={getImageUrl(pizza.image, 'medium')}
                alt={pizza.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="font-semibold text-gray-800 text-lg">
              {pizza.name}
            </div>
            <div className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">
              {pizza.description}
            </div>
            {pizza.available_sizes && pizza.available_sizes.length > 0 && (
              <div className="mt-3 flex gap-1 flex-wrap">
                {pizza.available_sizes.map((size) => (
                  <button
                    key={size.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selectedSizes[pizza.id]?.id === size.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSizeChange(pizza.id, size);
                    }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-3 pt-1">
              <span
                className={`text-amber-600 font-bold text-xl ${
                  priceAnimations[pizza.id] || ''
                }`}
              >
                {getPrice(pizza)} ₽
              </span>
              <Button
                variant="primary"
                onClick={(e) => handleAddToCart(e, pizza)}
              >
                В корзину
              </Button>
            </div>
          </div>
          <WishlistButton
            pizzaId={pizza.id}
            className="absolute top-2 right-2"
          />
        </Card>
      </Link>
    </motion.div>
  );

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Ошибка загрузки: {error.message}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SEO
        title={
          searchQuery
            ? `Поиск: ${searchQuery} — Sapore`
            : 'Меню — пицца, закуски, напитки, соусы'
        }
        description="Полное меню Sapore: итальянские пиццы, закуски, напитки и соусы. Доставка за 30 минут в Ростове-на-Дону."
        url="/catalog"
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {searchQuery ? 'Поиск' : 'Меню'}
      </h1>

      {searchQuery ? (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="text-gray-600">
              Результаты по запросу{' '}
              <span className="font-semibold text-amber-600">
                «{searchQuery}»
              </span>
              {!isLoading && (
                <span className="text-gray-400 ml-2">
                  — найдено: {items.length}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Сбросить поиск
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PizzaSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-xl font-medium text-gray-800 mb-2">
                Ничего не найдено
              </div>
              <div className="text-gray-500 mb-6">
                Попробуйте изменить запрос или посмотрите всё меню
              </div>
              <Button variant="primary" onClick={() => navigate('/catalog')}>
                Перейти в меню
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((pizza, index) => renderCard(pizza, index))}
            </div>
          )}
        </>
      ) : isLoading ? (
        <>
          <div className="sticky top-20 z-40 bg-white rounded-2xl px-2 py-2 mb-8 border border-gray-100 shadow-sm">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <PizzaSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="sticky top-20 z-40 bg-white rounded-2xl px-2 py-2 mb-8 border border-gray-100 shadow-sm">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {grouped.map((group) => {
                const isActive = activeSectionId === `category-${group.id}`;
                return (
                  <button
                    key={group.id}
                    onClick={() => scrollToSection(`category-${group.id}`)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {group.name}
                    <span
                      className={`ml-1.5 text-xs ${
                        isActive ? 'text-white/80' : 'text-gray-400'
                      }`}
                    >
                      {group.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-12">
            {grouped.map((group) => (
              <section
                key={group.id}
                id={`category-${group.id}`}
                className="scroll-mt-40"
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {group.name}
                  </h2>
                  <Link
                    to={`/category/${group.slug}`}
                    className="text-sm text-amber-600 hover:text-amber-700 transition"
                  >
                    Открыть страницу →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((pizza, index) => renderCard(pizza, index))}
                </div>
              </section>
            ))}
          </div>

          {grouped.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              В меню пока нет товаров
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Catalog;