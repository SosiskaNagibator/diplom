import { useRef, useEffect, useState } from 'react';

const WheelPicker = ({ items, value, onChange, disabled }) => {
  const containerRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const index = items.indexOf(value);
    return index !== -1 ? index : 0;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const index = items.indexOf(value);
    if (index !== -1) {
      const child = container.children[index];
      if (child) {
        const scrollTop = child.offsetTop - container.clientHeight / 2 + child.clientHeight / 2;
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [value, items]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const children = container.children;
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    let minDist = Infinity;
    let closestIndex = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childCenter = child.offsetTop + child.clientHeight / 2;
      const dist = Math.abs(containerTop + containerHeight / 2 - childCenter);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }
    if (closestIndex !== selectedIndex) {
      setSelectedIndex(closestIndex);
      const newValue = items[closestIndex];
      if (newValue !== undefined && onChange) {
        onChange(newValue);
      }
    }
  };

  return (
    <div
      className="relative w-full h-48 overflow-y-auto scroll-smooth snap-y snap-mandatory"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        .wheel-picker::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="flex flex-col items-center">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`snap-start h-12 flex items-center justify-center text-lg transition-all duration-200 ${
              idx === selectedIndex ? 'text-amber-600 font-bold text-2xl' : 'text-gray-400'
            }`}
            style={{ height: '48px', lineHeight: '48px', flexShrink: 0 }}
          >
            {String(item).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WheelPicker;