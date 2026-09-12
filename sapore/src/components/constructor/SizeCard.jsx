import { motion } from 'framer-motion';

const SizeCard = ({ size, selected, onSelect }) => {
  const circleSize = Math.min(Number(size.circle_size) || 40, 70);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(size)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? 'border-amber-500 bg-amber-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-center h-16 mb-2">
        <div
          className={`rounded-full transition-all duration-300 ${
            selected ? 'bg-amber-500' : 'bg-gray-300'
          }`}
          style={{ width: circleSize, height: circleSize }}
        />
      </div>
      <div className={`text-sm font-medium ${selected ? 'text-amber-700' : 'text-gray-700'}`}>
        {size.name}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{size.label}</div>
    </motion.button>
  );
};

export default SizeCard;