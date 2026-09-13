import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
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
import { usePageSeo } from '../hooks/usePageSeo';

const fetchCatalog = async (search) => {
  const url = search
    ? `${API_CATALOG}?search=${encodeURIComponent(search)}&limit=500`
    : `${API_CATALOG}?limit=500`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const tabsContainerVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.05 },
  },
};

const tabItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

function Catalog({ addToCart }) {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = (searchParams.get('search') || '').trim();

  const { data: pageSeo } = usePageSeo('catalog');
  const seoTitle = pageSeo?.title || '';
  const seoDescription = pageSeo?.description || '';
  const seoH1 = pageSeo?.h1 || 'Меню пиццерии';

  const { data, isLoading, error } = useQuery({
    queryKey: ['catalog-all', searchQuery],
    queryFn: () => fetchCatalog(searchQuery),
    staleTime: 5 * 60 * 1000,
  });

  useLayoutEffect(() => {
    if (isLoading) return;
    const saved = sessionStorage.getItem('catalogScroll');
    if (saved !== null) {
      const y = parseInt(saved, 10);
      sessionStorage.removeItem('catalogScroll');
      if (!isNaN(y) && y > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
        });
      }
    }
  }, [isLoading]);

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

  const saveScroll = useCallback(() => {
    sessionStorage.setItem('catalogScroll', String(window.scrollY));
  }, []);

  const renderCard = (pizza) => (
    <motion.div variants={cardItemVariants} className="h-full">
      <Link
        to={`/product/${pizza.slug}`}
        className="block h-full"
        onClick={saveScroll}
      >
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-full"
        >
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
                <motion.img
                  src={getImageUrl(pizza.image, 'medium')}
                  alt={pizza.name}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full object-cover"
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
                    <motion.button
                      key={size.id}
                      whileTap={{ scale: 0.92 }}
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
                    </motion.button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-1">
                <motion.span
                  key={`${pizza.id}-${getPrice(pizza)}`}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.35 }}
                  className={`text-amber-600 font-bold text-xl ${
                    priceAnimations[pizza.id] || ''
                  }`}
                >
                  {getPrice(pizza)} ₽
                </motion.span>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="primary"
                    onClick={(e) => handleAddToCart(e, pizza)}
                  >
                    В корзину
                  </Button>
                </motion.div>
              </div>
            </div>
            <WishlistButton
              pizzaId={pizza.id}
              className="absolute top-2 right-2"
            />
          </Card>
        </motion.div>
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
        title={searchQuery ? `Поиск: ${searchQuery}` : seoTitle}
        description={seoDescription}
        url="/catalog"
      />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        {searchQuery ? 'Поиск' : seoH1}
      </motion.h1>

      {searchQuery ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
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
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/catalog')}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Сбросить поиск
            </motion.button>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PizzaSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-100"
            >
              <div className="text-xl font-medium text-gray-800 mb-2">
                Ничего не найдено
              </div>
              <div className="text-gray-500 mb-6">
                Попробуйте изменить запрос или посмотрите всё меню
              </div>
              <Button variant="primary" onClick={() => navigate('/catalog')}>
                Перейти в меню
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {items.map((pizza) => renderCard(pizza))}
            </motion.div>
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
          <motion.div
            variants={tabsContainerVariants}
            initial="hidden"
            animate="visible"
            className="sticky top-20 z-40 bg-white rounded-2xl px-2 py-2 mb-8 border border-gray-100 shadow-sm"
          >
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {grouped.map((group) => {
                const isActive = activeSectionId === `category-${group.id}`;
                return (
                  <motion.button
                    key={group.id}
                    variants={tabItemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <div className="space-y-12">
            {grouped.map((group) => (
              <motion.section
                key={group.id}
                id={`category-${group.id}`}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
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
                <motion.div
                  variants={gridContainerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {group.items.map((pizza) => renderCard(pizza))}
                </motion.div>
              </motion.section>
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