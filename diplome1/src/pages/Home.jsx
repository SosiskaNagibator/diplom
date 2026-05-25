import { Link } from 'react-router-dom'
import { pizzas } from '../data/pizzas'
import './Home.css'

function Home({ addToCart }) {
  const popularPizzas = pizzas.slice(0, 4)

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">Sapore — вкус Италии</h1>
        <p className="hero-sub">Настоящая итальянская пицца с доставкой</p>
        <Link to="/constructor">
          <button className="hero-btn">Собрать свою пиццу</button>
        </Link>
      </div>

      <h2>Популярное</h2>
      <div className="pizza-grid">
        {popularPizzas.map(pizza => (
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

export default Home