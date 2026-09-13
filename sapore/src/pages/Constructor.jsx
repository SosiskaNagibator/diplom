import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaGift } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useUserLevel } from '../hooks/useLevels';
import { usePageSeo } from '../hooks/usePageSeo';
import { API_CONSTRUCTOR, CONSTRUCTOR_PREVIEW } from '../constants/api';
import PizzaPreview from '../components/constructor/PizzaPreview';
import SizeCard from '../components/constructor/SizeCard';
import ToppingCard from '../components/constructor/ToppingCard';
import ConstructorSkeleton from '../components/skeletons/ConstructorSkeleton';
import SEO from '../components/SEO';

const STORAGE_KEY = 'constructorDraft';
const BASE_PRICE = 350;

const sectionVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const sizesContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const sizeItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

const toppingsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const toppingItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

function Constructor({ addToCart }) {
  const navigate = useNavigate();
  const { userLogin } = useAuth();
  const { data: userLevelData } = useUserLevel(userLogin);
  const allLevels = userLevelData?.all_levels || [];
  const ordersSum = userLevelData?.orders_sum || 0;

  const { data: pageSeo } = usePageSeo('constructor');
  const seoTitle = pageSeo?.title || '';
  const seoDescription = pageSeo?.description || '';
  const seoH1 = pageSeo?.h1 || 'Собери свою пиццу';

  const achievedLevels = useMemo(
    () => allLevels.filter(level => Number(level.min_bonus) <= ordersSum),
    [allLevels, ordersSum]
  );

  const hasFreeTopping = useMemo(
    () => achievedLevels.some(level => level.bonus_type === 'free_topping'),
    [achievedLevels]
  );

  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [priceAnimation, setPriceAnimation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_CONSTRUCTOR);
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        const sizesData = data.sizes || [];
        const toppingsData = data.toppings || [];
        setSizes(sizesData);
        setToppings(toppingsData);

        let restoredSize = null;
        let restoredToppings = [];
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
          if (saved) {
            if (saved.sizeId) {
              restoredSize = sizesData.find(s => String(s.id) === String(saved.sizeId)) || null;
            }
            if (Array.isArray(saved.toppingIds)) {
              restoredToppings = toppingsData.filter(t =>
                saved.toppingIds.map(String).includes(String(t.id))
              );
            }
          }
        } catch {}

        if (!restoredSize && sizesData.length) {
          restoredSize = sizesData[0];
        }
        setSelectedSize(restoredSize);
        setSelectedToppings(restoredToppings);
      } catch (err) {
        console.error('Ошибка загрузки конструктора:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!selectedSize && selectedToppings.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sizeId: selectedSize?.id || null,
      toppingIds: selectedToppings.map(t => t.id),
    }));
  }, [selectedSize, selectedToppings, loading]);

  const triggerPriceAnimation = useCallback(() => {
    setPriceAnimation(true);
    setTimeout(() => setPriceAnimation(false), 400);
  }, []);

  const toggleTopping = useCallback((topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.id === topping.id);
      if (exists) return prev.filter(t => t.id !== topping.id);
      return [...prev, topping];
    });
    triggerPriceAnimation();
  }, [triggerPriceAnimation]);

  const removeTopping = useCallback((toppingId) => {
    setSelectedToppings(prev => prev.filter(t => t.id !== toppingId));
    triggerPriceAnimation();
  }, [triggerPriceAnimation]);

  const handleSelectSize = useCallback((size) => {
    setSelectedSize(size);
    triggerPriceAnimation();
  }, [triggerPriceAnimation]);

  const clearAll = useCallback(() => {
    setSelectedToppings([]);
    if (sizes.length > 0) setSelectedSize(sizes[0]);
    localStorage.removeItem(STORAGE_KEY);
    triggerPriceAnimation();
  }, [sizes, triggerPriceAnimation]);

  const totalPrice = useMemo(() => {
    const sizePrice = Number(selectedSize?.price || 0);
    const toppingsPrice = selectedToppings.reduce((sum, t, index) => {
      if (hasFreeTopping && index === 0) return sum;
      return sum + Number(t.price || 0);
    }, 0);
    return BASE_PRICE + sizePrice + toppingsPrice;
  }, [selectedSize, selectedToppings, hasFreeTopping]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const toppingNames = selectedToppings.map(t => t.name).join(', ');
    const description = `${selectedSize.label}${toppingNames ? ', ' + toppingNames : ''}`;

    addToCart({
      id: Date.now(),
      name: 'Пицца на заказ',
      price: totalPrice,
      image: CONSTRUCTOR_PREVIEW,
      description,
      size_label: selectedSize.label,
      size: selectedSize.name,
      toppings: toppingNames,
    });

    setShowSuccess(true);
  };

  const handleContinue = () => setShowSuccess(false);

  const handleBuildNew = () => {
    setShowSuccess(false);
    clearAll();
  };

  const handleGoToCart = () => {
    setShowSuccess(false);
    clearAll();
    navigate('/cart');
  };

  if (loading) return <ConstructorSkeleton />;

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <SEO title={seoTitle} description={seoDescription} url="/constructor" />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left"
      >
        {seoH1}
      </motion.h1>

      {hasFreeTopping && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-6 text-sm flex items-center gap-2"
        >
          <FaGift className="text-green-600 text-base flex-shrink-0" />
          У вас активна бесплатная начинка! Первая выбранная начинка — бесплатно.
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sticky top-24"
          >
            <PizzaPreview
              image={CONSTRUCTOR_PREVIEW}
              selectedSize={selectedSize}
              selectedToppings={selectedToppings}
              hasFreeTopping={hasFreeTopping}
              totalPrice={totalPrice}
              onRemoveTopping={removeTopping}
              onAddToCart={handleAddToCart}
              onClear={clearAll}
              priceAnimation={priceAnimation}
            />
          </motion.div>
        </div>

        <div className="space-y-6 pb-24 lg:pb-0">
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Размер</h2>
            <motion.div
              variants={sizesContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-3"
            >
              {sizes.map(size => (
                <motion.div key={size.id} variants={sizeItemVariants} className="h-full">
                  <SizeCard
                    size={size}
                    selected={selectedSize?.id === size.id}
                    onSelect={handleSelectSize}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Начинки</h2>
              <motion.span
                key={selectedToppings.length}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-500"
              >
                {selectedToppings.length > 0 ? `Выбрано: ${selectedToppings.length}` : 'Не выбрано'}
              </motion.span>
            </div>
            <motion.div
              variants={toppingsContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {toppings.map(topping => {
                const selected = !!selectedToppings.find(t => t.id === topping.id);
                const isFree = hasFreeTopping && selected && selectedToppings.findIndex(t => t.id === topping.id) === 0;
                return (
                  <motion.div key={topping.id} variants={toppingItemVariants} className="h-full">
                    <ToppingCard
                      topping={topping}
                      selected={selected}
                      isFree={isFree}
                      onToggle={() => toggleTopping(topping)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>
        </div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-4 py-3 shadow-lg"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Итого</div>
            <motion.div
              key={totalPrice}
              initial={{ scale: 1 }}
              animate={priceAnimation ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="text-xl font-bold text-amber-600"
            >
              {totalPrice} ₽
            </motion.div>
          </div>
          <div className="flex gap-2 items-center">
            {selectedToppings.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Очистить
              </button>
            )}
            <motion.button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 shadow-md disabled:opacity-50"
            >
              В корзину
            </motion.button>
          </div>
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
              onClick={handleContinue}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                  >
                    <FaCheck className="text-green-600 text-3xl" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800">Пицца добавлена в корзину</h3>
                  <p className="text-sm text-gray-500 mt-1">Что делаем дальше?</p>
                </div>

                <div className="mt-6 space-y-2">
                  <motion.button
                    type="button"
                    onClick={handleGoToCart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Перейти в корзину
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleBuildNew}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-full transition-all duration-200"
                  >
                    Собрать новую
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition"
                  >
                    Продолжить с этой
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default Constructor;