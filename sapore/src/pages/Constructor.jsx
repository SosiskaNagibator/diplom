import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserLevel } from '../hooks/useLevels';
import { useAuth } from '../contexts/AuthContext';

const API_CONSTRUCTOR = 'http://localhost/constructor.php';

function Constructor({ addToCart }) {
  const { userLogin } = useAuth();
  const { data: userLevelData } = useUserLevel(userLogin);
  const allLevels = userLevelData?.all_levels || [];
  const ordersSum = userLevelData?.orders_sum || 0;

  const achievedLevels = useMemo(() => {
    return allLevels.filter(level => Number(level.min_bonus) <= ordersSum);
  }, [allLevels, ordersSum]);

  // Проверяем наличие бесплатной начинки по структурированным данным
  const hasFreeTopping = useMemo(() => {
    return achievedLevels.some(level => level.bonus_type === 'free_topping');
  }, [achievedLevels]);

  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [toppings, setToppings] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [priceAnimation, setPriceAnimation] = useState(false);

  const basePrice = 350;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_CONSTRUCTOR);
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        setSizes(data.sizes || []);
        setSauces(data.sauces || []);
        setToppings(data.toppings || []);
        if (data.sizes && data.sizes.length) setSelectedSize(data.sizes[0]);
        if (data.sauces && data.sauces.length) setSelectedSauce(data.sauces[0]);
      } catch (err) {
        console.error('Ошибка загрузки конструктора:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTopping = (topping) => {
    setSelectedToppings(prev =>
      prev.find(t => t.id === topping.id)
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, topping]
    );
    triggerPriceAnimation();
  };

  const triggerPriceAnimation = () => {
    setPriceAnimation(true);
    setTimeout(() => setPriceAnimation(false), 400);
  };

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    triggerPriceAnimation();
  };

  const handleSelectSauce = (sauce) => {
    setSelectedSauce(sauce);
    triggerPriceAnimation();
  };

  const totalPrice = basePrice
    + Number(selectedSize?.price || 0)
    + Number(selectedSauce?.price || 0)
    + selectedToppings.reduce((sum, t, index) => {
        if (hasFreeTopping && index === 0) return sum;
        return sum + Number(t.price || 0);
      }, 0);

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!selectedSize || !selectedSauce) return;
    
    const toppingNames = selectedToppings.map(t => t.name).join(', ');
    const name = 'Пицца на заказ';
    const description = `${selectedSize.label}, ${selectedSauce.name}${toppingNames ? ', ' + toppingNames : ''}`;
    
    const pizza = {
      id: Date.now(),
      name: name,
      price: totalPrice,
      image: 'https://img.magnific.com/free-photo/top-view-mixed-pizza-with-tomato-black-olive-melted-cheese_140725-10787.jpg?uid=R248183524&ga=GA1.1.351724662.1783944876&w=740&q=80',
      description: description,
      size_label: selectedSize.label,
      size: selectedSize.name,
      sauce: selectedSauce.name,
      toppings: selectedToppings.map(t => t.name).join(', ')
    };
    addToCart(pizza);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.4, ease: 'easeOut' }
    })
  };

  const buttonHover = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin text-4xl">🍕</div>
        <div className="text-gray-500 mt-4">Загрузка конструктора...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-6 text-center"
      >
        Собери пиццу
      </motion.h1>

      {hasFreeTopping && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm flex items-center gap-2">
          <span className="text-lg">🎁</span>
          У вас активна бесплатная начинка! Первая выбранная начинка — бесплатно.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0.1}
        >
          <div className="text-sm font-medium text-gray-500 mb-2">Размер</div>
          <div className="flex gap-3">
            {sizes.map((size, index) => (
              <motion.button
                key={size.id}
                type="button"
                className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
                  selectedSize?.id === size.id
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ animationDelay: `${index * 80 + 150}ms` }}
                onClick={() => handleSelectSize(size)}
              >
                <div className="text-xl">{size.icon}</div>
                <div className="text-sm font-medium text-gray-800">{size.label}</div>
                {size.price > 0 && <div className="text-xs text-amber-600">+{size.price}₽</div>}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0.2}
        >
          <div className="text-sm font-medium text-gray-500 mb-2">Соус</div>
          <div className="flex gap-3">
            {sauces.map((sauce, index) => (
              <motion.button
                key={sauce.id}
                type="button"
                className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
                  selectedSauce?.id === sauce.id
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ animationDelay: `${index * 80 + 250}ms` }}
                onClick={() => handleSelectSauce(sauce)}
              >
                <div className="text-xl">{sauce.icon}</div>
                <div className="text-sm font-medium text-gray-800">{sauce.name}</div>
                {sauce.price > 0 && <div className="text-xs text-amber-600">+{sauce.price}₽</div>}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0.3}
        >
          <div className="text-sm font-medium text-gray-500 mb-2">Начинки</div>
          <div className="flex flex-wrap gap-2">
            {toppings.map((topping, index) => {
              const selected = !!selectedToppings.find(t => t.id === topping.id);
              const isFree = hasFreeTopping && selected && selectedToppings.findIndex(t => t.id === topping.id) === 0;
              return (
                <motion.button
                  key={topping.id}
                  type="button"
                  className={`py-2 px-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                    selected
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ animationDelay: `${index * 40 + 350}ms` }}
                  onClick={() => toggleTopping(topping)}
                >
                  <span className="text-lg">{topping.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{topping.name}</span>
                  <span className={`text-xs ${isFree ? 'text-green-600' : 'text-amber-600'}`}>
                    {isFree ? 'Бесплатно' : `+${topping.price}₽`}
                  </span>
                  {selected && <span className="text-green-500 text-xs">✓</span>}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0.4}
          className="pt-4 border-t border-gray-100 flex items-center justify-between"
        >
          <div>
            <span className="text-sm text-gray-500">Итого</span>
            <motion.div
              className={`text-2xl font-bold text-amber-600 transition-all duration-300 ${priceAnimation ? 'price-pop' : ''}`}
              animate={priceAnimation ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {totalPrice} ₽
            </motion.div>
          </div>
          <motion.button
            type="button"
            onClick={handleAddToCart}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            whileHover="hover"
            whileTap="tap"
            variants={buttonHover}
          >
            <span>В корзину</span>
            <span>→</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Constructor;