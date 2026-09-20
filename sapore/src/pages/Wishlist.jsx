import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../hooks/useWishlist';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { Card, Button } from '../components/ui';
import WishlistButton from '../components/WishlistButton';
import WishlistSkeleton from '../components/skeletons/WishlistSkeleton';
import { FaHeart } from 'react-icons/fa';
import SEO from '../components/SEO';

const gridStyle = { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' };

const fetchPizzasByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const res = await fetch(`${API_CATALOG}?ids=${ids.join(',')}`);
  if (!res.ok) throw new Error('Ошибка загрузки избранного');
  const data = await res.json();
  return data.pizzas || [];
};

const Wishlist = () => {
  const { wishlistIds, isLoading: wishlistLoading } = useWishlist();
  const { data: pizzas, isLoading: pizzasLoading } = useQuery({
    queryKey: ['wishlistPizzas', wishlistIds],
    queryFn: () => fetchPizzasByIds(wishlistIds),
    enabled: wishlistIds.length > 0,
    placeholderData: keepPreviousData,
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
        <SEO
          title="Избранное"
          description="Ваши любимые пиццы в Sapore"
          url="/wishlist"
          noindex
        />
        <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
        <div className="text-2xl font-bold text-gray-800">Избранное пусто</div>
        <p className="text-gray-500 mt-2">Добавляйте пиццы, которые вам понравились</p>
        <Link to="/catalog"><Button variant="primary" className="mt-6">В каталог</Button></Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SEO
        title="Избранное"
        description="Ваши любимые пиццы в Sapore"
        url="/wishlist"
        noindex
      />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <FaHeart className="inline text-red-500 mr-2" /> Избранное
      </h1>
      <div className="grid gap-6" style={gridStyle}>
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
                <Link to={`/product/${pizza.slug}`} className="block">
                  <div className="relative aspect-square bg-gray-50">
                    <img
                      src={getImageUrl(pizza.image, 'thumb')}
                      alt={pizza.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
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