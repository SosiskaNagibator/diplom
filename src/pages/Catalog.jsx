// Catalog.jsx
import { useState, useEffect } from 'react';

const API_CATALOG = 'http://localhost/catalog.php';
const categories = ['Все', 'Классика', 'Мясные', 'Вегетарианские', 'Острые', 'Сладкие', 'Рыбные'];

function Catalog({ addToCart }) {
  const [pizzas, setPizzas] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const url = activeCategory === 'Все'
          ? API_CATALOG
          : `${API_CATALOG}?category=${encodeURIComponent(activeCategory)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки');
        const data = await response.json();
        setPizzas(data.pizzas || []);
        setSizes(data.sizes || []);
        
        // Устанавливаем размер по умолчанию для каждой пиццы
        const defaultSizes = {};
        (data.pizzas || []).forEach(pizza => {
          if (pizza.available_sizes && pizza.available_sizes.length > 0) {
            defaultSizes[pizza.id] = pizza.available_sizes[0];
          }
        });
        setSelectedSizes(defaultSizes);
      } catch (err) {
        console.error(err);
        setPizzas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, [activeCategory]);

  const handleSizeChange = (pizzaId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [pizzaId]: size
    }));
  };

  const getPrice = (pizza) => {
    const selectedSize = selectedSizes[pizza.id];
    if (!selectedSize) return pizza.price;
    return Math.round(pizza.price * selectedSize.price_multiplier);
  };

  const handleAddToCart = (pizza) => {
    const selectedSize = selectedSizes[pizza.id];
    const price = getPrice(pizza);
    const pizzaWithSize = {
      ...pizza,
      price: price,
      name: `${pizza.name} (${selectedSize?.label || '25 см'})`,
      size: selectedSize?.name || 'Маленькая',
      size_label: selectedSize?.label || '25 см'
    };
    addToCart(pizzaWithSize);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Загрузка меню...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Меню</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              cat === activeCategory
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:text-amber-600'
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pizzas.map(pizza => (
          <div key={pizza.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">
            <img src={pizza.image} alt={pizza.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="font-semibold text-gray-800 text-lg">{pizza.name}</div>
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{pizza.description}</div>
              
              {/* Выбор размера */}
              {pizza.available_sizes && pizza.available_sizes.length > 0 && (
                <div className="mt-3 flex gap-1 flex-wrap">
                  {pizza.available_sizes.map(size => (
                    <button
                      key={size.id}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        selectedSizes[pizza.id]?.id === size.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => handleSizeChange(pizza.id, size)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-amber-600 font-bold text-xl">{getPrice(pizza)} ₽</span>
                <button
                  onClick={() => handleAddToCart(pizza)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-full transition"
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;