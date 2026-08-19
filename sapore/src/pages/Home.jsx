import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPizzaSlice, FaUtensils, FaRocket, FaLeaf } from 'react-icons/fa';
import { API_CATALOG } from '../constants/api';
import { getPriceWithSize } from '../utils/priceUtils';
import { Button, Card } from '../components/ui';
import { getImageUrl } from '../utils/imageUtils';
import WishlistButton from '../components/WishlistButton';
import HomeSkeleton from '../components/skeletons/HomeSkeleton';

function Home({ addToCart }) {
  const [popularPizzas, setPopularPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [priceAnimations, setPriceAnimations] = useState({});

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(API_CATALOG);
        if (!response.ok) throw new Error('Ошибка загрузки');
        const data = await response.json();
        const pizzas = data.pizzas ? data.pizzas.slice(0, 4) : [];
        setPopularPizzas(pizzas);
        const defaultSizes = {};
        pizzas.forEach(pizza => {
          if (pizza.available_sizes && pizza.available_sizes.length > 0) {
            defaultSizes[pizza.id] = pizza.available_sizes[0];
          }
        });
        setSelectedSizes(defaultSizes);
      } catch (err) {
        console.error(err);
        setPopularPizzas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

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

  if (loading) return <HomeSkeleton />;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.5, ease: 'easeOut' }
    })
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.08,
        duration: 0.4,
        ease: 'easeOut'
      }
    })
  };

  return (
    <div className="fade-in">
      {/* Hero-секция с иконкой пиццы */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-xl mb-16"
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="20" cy="20" r="30" fill="#f59e0b" />
            <circle cx="80" cy="80" r="40" fill="#f59e0b" />
            <circle cx="60" cy="10" r="20" fill="#f59e0b" />
          </svg>
        </div>
        <div className="relative px-6 py-12 sm:py-16 md:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <FaPizzaSlice className="text-7xl text-amber-600 animate-bounce-in" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
              Sapore — <span className="text-amber-600">вкус Италии</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Настоящая итальянская пицца из печи на дровах. Свежие ингредиенты, доставка за 30 минут.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/constructor">
                <Button variant="primary" className="text-lg">Собрать свою пиццу →</Button>
              </Link>
              <Link to="/catalog">
                <Button variant="secondary" className="text-lg">Посмотреть меню</Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">⭐ 4.8 из 5 на основе 1200+ отзывов</div>
          </div>
        </div>
      </motion.section>

      {/* Почему мы — с иконками в кружках */}
      <section className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold text-gray-800 text-center mb-8"
        >
          Почему выбирают нас
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: <FaUtensils className="text-3xl text-amber-600" />,
              title: 'Итальянские рецепты',
              desc: 'Готовим по традиционным рецептам с любовью'
            },
            {
              icon: <FaRocket className="text-3xl text-amber-600" />,
              title: 'Быстрая доставка',
              desc: 'Привезём горячую пиццу за 30 минут'
            },
            {
              icon: <FaLeaf className="text-3xl text-amber-600" />,
              title: 'Свежие продукты',
              desc: 'Только натуральные ингредиенты высокого качества'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Популярное */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-gray-800"
          >
            Популярное
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link to="/catalog" className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1 transition-colors duration-150">
              Все пиццы <span>→</span>
            </Link>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularPizzas.map((pizza, index) => (
            <motion.div
              key={pizza.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Link to={`/pizza/${pizza.id}`} className="block">
                <Card hover className="overflow-hidden border border-gray-100 relative">
                  <div className="relative overflow-hidden">
                    <img
                      src={getImageUrl(pizza.image)}
                      alt={pizza.name}
                      className="w-full h-52 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {index === 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Хит
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-gray-800 text-lg">{pizza.name}</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{pizza.description}</div>
                    {pizza.available_sizes && pizza.available_sizes.length > 0 && (
                      <div className="mt-3 flex gap-1 flex-wrap">
                        {pizza.available_sizes.map(size => (
                          <button
                            key={size.id}
                            type="button"
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                              selectedSizes[pizza.id]?.id === size.id
                                ? 'bg-amber-500 text-white scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={(e) => { e.preventDefault(); handleSizeChange(pizza.id, size); }}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className={`text-amber-600 font-bold text-xl transition-all duration-300 ${priceAnimations[pizza.id] || ''}`}>
                        {getPrice(pizza)} ₽
                      </span>
                      <Button variant="primary" onClick={(e) => handleAddToCart(e, pizza)}>
                        + В корзину
                      </Button>
                    </div>
                  </div>
                  <WishlistButton pizzaId={pizza.id} className="absolute top-2 right-2" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;