import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import { QuantityButton, IconButton } from './ui';
import { getImageUrl } from '../utils/imageUtils';

const CartItem = memo(({ item, index, onUpdateQuantity, onRemove }) => {
  const { cartKey, image, name, description, price, quantity, size_label, toppings } = item;

  const handleIncrement = () => onUpdateQuantity(cartKey, quantity + 1);
  const handleDecrement = () => onUpdateQuantity(cartKey, quantity - 1);

  const toppingsList = Array.isArray(toppings)
    ? toppings.map(t => (typeof t === 'object' ? t.name : t))
    : [];

  const hasToppings = toppingsList.length > 0;

  const itemVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 250,
        delay: index * 0.08,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: -30,
      transition: { duration: 0.35, ease: 'easeInOut' }
    }
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
    >
      <img
        src={getImageUrl(image, 'thumb')}
        alt={name}
        className="w-20 h-20 object-cover rounded-lg"
        loading="lazy"
        decoding="async"
      />

      <div className="flex-1 min-w-[120px]">
        <div className="font-semibold text-gray-800">
          {name}
          {size_label && <span className="text-sm text-gray-400 font-normal"> · {size_label}</span>}
        </div>

        {hasToppings && (
          <div className="mt-1 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
            <FaPlus className="text-amber-600 text-xs mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700 leading-snug">
              <span className="font-medium">Доп. начинки:</span>{' '}
              {toppingsList.join(', ')}
            </div>
          </div>
        )}

        {!hasToppings && description && (
          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</div>
        )}

        <motion.div
          className="text-sm text-amber-600 font-medium mt-1"
          key={price}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {price} ₽
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <QuantityButton onClick={handleDecrement}>−</QuantityButton>
        <motion.span
          key={quantity}
          className="w-8 text-center font-medium"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {quantity}
        </motion.span>
        <QuantityButton onClick={handleIncrement}>+</QuantityButton>
      </div>

      <motion.div
        className="text-amber-600 font-bold min-w-[70px] text-right"
        key={price * quantity}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {price * quantity} ₽
      </motion.div>

      <IconButton onClick={() => onRemove(cartKey)}>✕</IconButton>
    </motion.div>
  );
});

export default CartItem;