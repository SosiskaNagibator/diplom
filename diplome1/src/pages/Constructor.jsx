import { useState } from 'react';
import '../styles/Constructor.css';

function Constructor({ addToCart }) {
  const [size, setSize] = useState('Маленькая');
  const [sauce, setSauce] = useState('Томатный');
  const [toppings, setToppings] = useState([]);

  const sizes = {
    'Маленькая': 0,
    'Средняя': 50,
    'Большая': 100
  };
  const sauces = {
    'Томатный': 0,
    'Сливочный': 30
  };
  const toppingsList = [
    { name: 'Пепперони', price: 50 },
    { name: 'Грибы', price: 40 },
    { name: 'Сыр', price: 30 },
    { name: 'Помидоры', price: 20 },
    { name: 'Оливки', price: 25 }
  ];

  const basePrice = 350;
  const totalPrice = basePrice + sizes[size] + sauces[sauce] + toppings.reduce((sum, t) => sum + t.price, 0);

  const toggleTopping = (topping) => {
    setToppings(prev =>
      prev.find(t => t.name === topping.name)
        ? prev.filter(t => t.name !== topping.name)
        : [...prev, topping]
    );
  };

  const handleAddToCart = () => {
    const toppingNames = toppings.map(t => t.name).join(', ');
    const name = `Пицца (${size}, ${sauce}${toppingNames ? ', ' + toppingNames : ''})`;
    const pizza = {
      id: Date.now(),
      name: name.length > 40 ? name.slice(0, 40) + '…' : name,
      price: totalPrice,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      description: `${size} основа, ${sauce.toLowerCase()} соус${toppingNames ? ', добавки: ' + toppingNames : ''}`
    };
    addToCart(pizza);
  };

  return (
    <div>
      <h1>Собери свою пиццу</h1>
      <div className="constructor">
        <div className="constructor-section">
          <h3>Размер</h3>
          <div className="options">
            {Object.keys(sizes).map(s => (
              <label key={s}>
                <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} />
                {s} {sizes[s] > 0 ? `(+${sizes[s]}₽)` : ''}
              </label>
            ))}
          </div>
        </div>

        <div className="constructor-section">
          <h3>Соус</h3>
          <div className="options">
            {Object.keys(sauces).map(s => (
              <label key={s}>
                <input type="radio" name="sauce" value={s} checked={sauce === s} onChange={() => setSauce(s)} />
                {s} {sauces[s] > 0 ? `(+${sauces[s]}₽)` : ''}
              </label>
            ))}
          </div>
        </div>

        <div className="constructor-section">
          <h3>Начинки</h3>
          <div className="options">
            {toppingsList.map(t => (
              <label key={t.name}>
                <input type="checkbox" checked={!!toppings.find(to => to.name === t.name)} onChange={() => toggleTopping(t)} />
                {t.name} (+{t.price}₽)
              </label>
            ))}
          </div>
        </div>

        <div className="constructor-total">
          Итого: {totalPrice} ₽
        </div>
        <button className="constructor-add-btn" onClick={handleAddToCart}>
          Добавить в корзину
        </button>
      </div>
    </div>
  );
}

export default Constructor;