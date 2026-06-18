import { useState, useEffect } from 'react';
import '../styles/Catalog.css';

const API_CATALOG = 'http://localhost/catalog.php';

const categories = ['Все', 'Классика', 'Мясные', 'Вегетарианские', 'Острые', 'Сладкие', 'Рыбные'];

function Catalog({ addToCart }) {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Все');

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
        setPizzas(data);
      } catch (err) {
        console.error(err);
        setPizzas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [activeCategory]);

  if (loading) {
    return <div className="loading">Загрузка меню...</div>;
  }

  return (
    <div>
      <h1>Меню</h1>

      <div className="filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${cat === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="pizza-grid">
        {pizzas.map(pizza => (
          <div key={pizza.id} className="pizza-card">
            <img src={pizza.image} alt={pizza.name} className="pizza-card-img" />
            <div className="pizza-card-body">
              <div className="pizza-card-title">{pizza.name}</div>
              <div className="pizza-card-desc">{pizza.description}</div>
              <div className="pizza-card-bottom">
                <span className="pizza-card-price">{pizza.price} ₽</span>
                <button className="pizza-card-btn" onClick={() => addToCart(pizza)}>
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