import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../hooks/useWishlist';
import { useQuery } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { Card, Button } from '../components/ui';
import WishlistButton from '../components/WishlistButton';
import WishlistSkeleton from '../components/skeletons/WishlistSkeleton';
import { FaHeart } from 'react-icons/fa';

const fetchPizzasByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const promises = ids.map(id => fetch(`${API_CATALOG}?id=${id}`).then(r => r.json()));
  const results = await Promise.all(promises);
  return results
    .filter(r => r && r.pizza && r.pizza.id)
    .map(r => r.pizza);
};

const Wishlist = () => {
  const { wishlistIds, isLoading: wishlistLoading } = useWishlist();
  const { data: pizzas, isLoading: pizzasLoading } = useQuery({
    queryKey: ['wishlistPizzas', wishlistIds],
    queryFn: () => fetchPizzasByIds(wishlistIds),
    enabled: wishlistIds.length > 0,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.06,
        duration: 0.5,
        ease: 'easeOut'
      }
    }),
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  if (wishlistLoading || pizzasLoading) return <WishlistSkeleton />;
  if (!wishlistIds.length) {
    return (
      <div className="text-center py-16">
        <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Избранное пусто</h2>
        <p className="text-gray-500 mt-2">Добавляйте пиццы, которые вам понравились</p>
        <Link to="/catalog"><Button variant="primary" className="mt-6">В каталог</Button></Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <FaHeart className="inline text-red-500 mr-2" /> Избранное
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {pizzas?.filter(pizza => pizza && pizza.id)?.map((pizza, index) => (
            <motion.div
              key={pizza.id}
              custom={index}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={cardVariants}
              layout
            >
              <Card hover className="overflow-hidden relative">
                <Link to={`/pizza/${pizza.id}`} className="block">
                  <img
                    src={getImageUrl(pizza.image, 'thumb')}
                    alt={pizza.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="p-4">
                    <div className="font-bold text-gray-800">{pizza.name}</div>
                    <div className="text-amber-600 font-bold mt-2">{pizza.price} ₽</div>
                  </div>
                </Link>
                <div className="absolute top-2 right-2">
                  <WishlistButton pizzaId={pizza.id} />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;