import { FaCheck } from 'react-icons/fa';
import { CONSTRUCTOR_TOPPINGS_BASE } from '../../constants/api';

const ToppingCard = ({ topping, selected, isFree, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full h-full relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.97] ${
        selected
          ? 'border-amber-500 bg-amber-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-amber-300'
      }`}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
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
          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow">
            <FaCheck className="text-white text-xs" />
          </div>
        )}
      </div>
      <div className="p-2 pt-1.5 flex-1 flex flex-col justify-between">
        <div className={`text-xs font-medium leading-tight line-clamp-2 ${selected ? 'text-amber-700' : 'text-gray-800'}`}>
          {topping.name}
        </div>
        <div className={`text-sm font-bold mt-1 ${isFree ? 'text-green-600' : 'text-amber-600'}`}>
          {isFree ? 'Бесплатно' : `${topping.price} ₽`}
        </div>
      </div>
    </button>
  );
};

export default ToppingCard;