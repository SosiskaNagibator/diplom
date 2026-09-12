import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const PizzaPreview = ({
  image,
  selectedSize,
  selectedToppings,
  hasFreeTopping,
  totalPrice,
  onRemoveTopping,
  onAddToCart,
  onClear,
  priceAnimation,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
        <img
          src={image}
          alt="Пицца"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {selectedSize && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">{selectedSize.label}</span>
          <span className="text-gray-400 mx-2">·</span>
          <span>{selectedSize.name}</span>
        </div>
      )}

      {selectedToppings.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {selectedToppings.map((t, index) => {
            const isFree = hasFreeTopping && index === 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onRemoveTopping(t.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  isFree
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span>{t.name}{isFree && ' 🎁'}</span>
                <FaTimes className="text-xs opacity-60" />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-baseline justify-between mb-4 pt-4 border-t border-gray-100">
        <span className="text-gray-600">Итого</span>
        <motion.span
          key={totalPrice}
          initial={{ scale: 1 }}
          animate={priceAnimation ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-amber-600"
        >
          {totalPrice} ₽
        </motion.span>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        disabled={!selectedSize}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
      >
        В корзину
      </button>

      <button
        type="button"
        onClick={onClear}
        className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 transition py-1"
      >
        Очистить всё
      </button>
    </div>
  );
};

export default PizzaPreview;