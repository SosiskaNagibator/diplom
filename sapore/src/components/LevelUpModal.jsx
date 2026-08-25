import { motion, AnimatePresence } from 'framer-motion';
import { LEVELS_BASE } from '../constants/api';
import { FaGift, FaChartLine } from 'react-icons/fa';

const LevelUpModal = ({ level, onClose, ordersSum }) => {
    if (!level) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative">
                        <img
                            src={`${LEVELS_BASE}${level.image}`}
                            alt={level.name}
                            className="w-full h-56 object-cover"
                            onError={(e) => { e.target.src = '/placeholder-city.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="relative -mt-12 px-6 pb-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800">Поздравляем! 🎉</h2>
                            <p className="text-lg text-gray-700">
                                Вы открыли <strong>{level.region} – {level.name}</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                <FaChartLine className="text-amber-600" />
                                Сумма заказов достигла <strong>{ordersSum} ₽</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-2">{level.fact}</p>
                            <p className="mt-3 bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                <FaGift className="text-amber-600 text-lg" />
                                {level.bonus_description}
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 w-full py-3 bg-amber-500 text-white rounded-full font-semibold hover:bg-amber-600 transition shadow-md"
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LevelUpModal;