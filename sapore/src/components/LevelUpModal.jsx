import { motion, AnimatePresence } from 'framer-motion';
import { LEVELS_BASE } from '../constants/api';

const LevelUpModal = ({ level, onClose }) => {
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
                    <img
                        src={`${LEVELS_BASE}${level.image}`}
                        alt={level.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => { e.target.src = '/placeholder-city.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                        <h2 className="text-2xl font-bold drop-shadow-lg">Поздравляем! 🎉</h2>
                        <p className="text-lg font-semibold drop-shadow">Вы достигли уровня <strong>{level.region} – {level.name}</strong></p>
                        <p className="text-sm text-white/90 mt-2 drop-shadow">{level.fact}</p>
                        <p className="mt-3 bg-amber-500/80 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                            🎁 {level.bonus_description}
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 w-full py-3 bg-amber-500 text-white rounded-full font-semibold hover:bg-amber-600 transition shadow-lg"
                        >
                            Продолжить
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LevelUpModal;