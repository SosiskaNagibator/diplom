import { motion } from 'framer-motion';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const WishlistButton = ({ pizzaId, className = '' }) => {
  const { userLogin } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(pizzaId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userLogin) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }
    toggleWishlist(pizzaId);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors duration-200 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} ${className}`}
      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      whileTap={{ scale: 0.7 }}
      animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </motion.button>
  );
};

export default WishlistButton;