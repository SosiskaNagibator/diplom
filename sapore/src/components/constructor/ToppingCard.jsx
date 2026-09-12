import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { CONSTRUCTOR_TOPPINGS_BASE } from '../../constants/api';

const ToppingCard = ({ topping, selected, isFree, onToggle }) => {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-200 text-left ${
        selected
          ? 'border-amber-500 bg-amber-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-amber-300'
      }`}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={`${CONSTRUCTOR_TOPPINGS_BASE}${topping.image}`}
          alt={topping.name}
          className="absolute inset-0 w-full h-full object-contain p-2"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.classList.add('bg-amber-50');
          }}
        />
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow"
          >
            <FaCheck className="text-white text-xs" />
          </motion.div>
        )}
      </div>
      <div className="p-2 pt-1.5">
        <div className={`text-xs font-medium leading-tight line-clamp-2 ${selected ? 'text-amber-700' : 'text-gray-800'}`}>
          {topping.name}
        </div>
        <div className={`text-sm font-bold mt-1 ${isFree ? 'text-green-600' : 'text-amber-600'}`}>
          {isFree ? 'Бесплатно' : `${topping.price} ₽`}
        </div>
      </div>
    </motion.button>
  );
};

export default ToppingCard;