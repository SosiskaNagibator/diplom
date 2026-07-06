import { useState, useEffect } from 'react';

const API_CONSTRUCTOR = 'http://localhost/constructor.php';

function Constructor({ addToCart }) {
  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [toppings, setToppings] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const basePrice = 350;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_CONSTRUCTOR);
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        setSizes(data.sizes || []);
        setSauces(data.sauces || []);
        setToppings(data.toppings || []);
        if (data.sizes && data.sizes.length) setSelectedSize(data.sizes[0]);
        if (data.sauces && data.sauces.length) setSelectedSauce(data.sauces[0]);
      } catch (err) {
        console.error('Ошибка загрузки конструктора:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTopping = (topping) => {
    setSelectedToppings(prev =>
      prev.find(t => t.id === topping.id)
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, topping]
    );
  };

const totalPrice = basePrice
  + Number(selectedSize?.price || 0)
  + Number(selectedSauce?.price || 0)
  + selectedToppings.reduce((sum, t) => sum + Number(t.price || 0), 0);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSauce) return;
    const toppingNames = selectedToppings.map(t => t.name).join(', ');
    const name = `Пицца ${selectedSize.name} ${selectedSauce.name}${toppingNames ? ' + ' + toppingNames : ''}`;
    const pizza = {
      id: Date.now(),
      name: name.slice(0, 40),
      price: totalPrice,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      description: `${selectedSize.label}, ${selectedSauce.name}${toppingNames ? ', ' + toppingNames : ''}`
    };
    addToCart(pizza);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Загрузка конструктора...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Собери пиццу</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Размер */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Размер</div>
          <div className="flex gap-3">
            {sizes.map(size => (
              <button
                key={size.id}
                className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition ${
                  selectedSize?.id === size.id
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSize(size)}
              >
                <div className="text-xl">{size.icon}</div>
                <div className="text-sm font-medium text-gray-800">{size.label}</div>
                {size.price > 0 && <div className="text-xs text-amber-600">+{size.price}₽</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Соус */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Соус</div>
          <div className="flex gap-3">
            {sauces.map(sauce => (
              <button
                key={sauce.id}
                className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition ${
                  selectedSauce?.id === sauce.id
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSauce(sauce)}
              >
                <div className="text-xl">{sauce.icon}</div>
                <div className="text-sm font-medium text-gray-800">{sauce.name}</div>
                {sauce.price > 0 && <div className="text-xs text-amber-600">+{sauce.price}₽</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Начинки */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Начинки</div>
          <div className="flex flex-wrap gap-2">
            {toppings.map(topping => {
              const selected = !!selectedToppings.find(t => t.id === topping.id);
              return (
                <button
                  key={topping.id}
                  className={`py-2 px-4 rounded-xl border-2 transition flex items-center gap-2 ${
                    selected
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleTopping(topping)}
                >
                  <span className="text-lg">{topping.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{topping.name}</span>
                  <span className="text-xs text-amber-600">+{topping.price}₽</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Итог и кнопка */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Итого</span>
            <div className="text-2xl font-bold text-amber-600">{totalPrice} ₽</div>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>В корзину</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Constructor;