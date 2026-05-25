import { useState } from 'react'
import { pizzas, categories } from '../data/pizzas'
import './Catalog.css'

function Catalog({ addToCart }) {
  const [activeCategory, setActiveCategory] = useState('Все')

  const filtered = activeCategory === 'Все'
    ? pizzas
    : pizzas.filter(p => p.category === activeCategory)

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
        {filtered.map(pizza => (
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
  )
}

export default Catalog