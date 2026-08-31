import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center py-20 min-h-[60vh]"
    >
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="text-8xl font-bold text-gray-800 mb-4"
      >
        404
      </motion.h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Страница не найдена</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Кажется, вы забрели в неизведанный уголок. Возможно, пицца уже в пути, но страница потерялась.
      </p>
      <Link
        to="/"
        className="px-8 py-3 bg-amber-500 text-white rounded-full font-semibold hover:bg-amber-600 transition shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
      >
        На главную
      </Link>
    </motion.div>
  );
};

export default NotFound;