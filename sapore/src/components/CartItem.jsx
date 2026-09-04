import { memo } from 'react';
import { motion } from 'framer-motion';
import { QuantityButton, IconButton } from './ui';
import { getImageUrl } from '../utils/imageUtils';

const CartItem = memo(({ item, index, onUpdateQuantity, onRemove }) => {
  const { id, image, name, description, price, quantity } = item;

  const handleIncrement = () => onUpdateQuantity(id, quantity + 1);
  const handleDecrement = () => onUpdateQuantity(id, quantity - 1);

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
        src={getImageUrl(image)}
        alt={name}
        className="w-20 h-20 object-cover rounded-lg"
        loading="lazy"
        decoding="async"
      />
      <div className="flex-1 min-w-[120px]">
        <div className="font-semibold text-gray-800">{name}</div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
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
      <IconButton onClick={() => onRemove(id)}>✕</IconButton>
    </motion.div>
  );
});

export default CartItem;