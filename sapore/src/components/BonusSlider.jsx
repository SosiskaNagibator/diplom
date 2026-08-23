import { useState, useEffect, memo } from 'react';
import { FaCoins } from 'react-icons/fa';

const BonusSlider = memo(({ maxUsableBonus, bonusUsed, onFinalChange, initialValue }) => {
  const [value, setValue] = useState(initialValue || 0);

  useEffect(() => {
    setValue(initialValue || 0);
  }, [initialValue]);

  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    setValue(val);
  };

  const handleEnd = () => {
    onFinalChange(value);
  };

  const percent = Math.min(100, value);

  return (
    <div className="pt-3 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>0 ₽</span>
        <span className="font-medium text-amber-600">
          {bonusUsed} ₽ из {maxUsableBonus} ₽ ({Math.round(percent)}%)
        </span>
        <span>{maxUsableBonus} ₽</span>
      </div>

      <div className="relative px-2.5 py-1">
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-visible">
          <div
            className="absolute h-full rounded-full"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(to right, #f59e0b, #d97706)',
              transition: 'none'
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleChange}
            onMouseUp={handleEnd}
            onTouchEnd={handleEnd}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: 2 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-amber-500 shadow-lg border-2 border-white pointer-events-none"
            style={{
              left: `calc(${percent}% - 10px)`,
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
              zIndex: 1,
              transition: 'none'
            }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400 px-2.5">
        <span>0%</span>
        <span>Максимум (20%)</span>
      </div>
    </div>
  );
});

export default BonusSlider;