import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFire, FaDumbbell, FaBacon, FaBreadSlice, FaInfoCircle } from 'react-icons/fa';

const NutritionModal = ({ isOpen, onClose, name, calories, protein, fat, carbs, description }) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
            <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="text-amber-500" />
              Пищевая ценность
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Закрыть"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm text-gray-500 mb-4">{name}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
                <FaFire className="text-amber-500 text-xl flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-amber-600 leading-none">{calories}</div>
                  <div className="text-xs text-gray-500 mt-1">ккал</div>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
                <FaDumbbell className="text-red-500 text-xl flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-red-600 leading-none">{protein} г</div>
                  <div className="text-xs text-gray-500 mt-1">Белки</div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-3 flex items-center gap-3">
                <FaBacon className="text-yellow-600 text-xl flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-yellow-700 leading-none">{fat} г</div>
                  <div className="text-xs text-gray-500 mt-1">Жиры</div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
                <FaBreadSlice className="text-green-600 text-xl flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-green-700 leading-none">{carbs} г</div>
                  <div className="text-xs text-gray-500 mt-1">Углеводы</div>
                </div>
              </div>
            </div>

            {description && (
              <div className="mt-5">
                <div className="text-sm font-semibold text-gray-700 mb-2">Состав</div>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              * Пищевая ценность указана без учёта дополнительных начинок
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default NutritionModal;