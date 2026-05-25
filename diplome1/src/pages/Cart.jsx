import { Link } from 'react-router-dom'
import './Cart.css'

function Cart({ cart, removeFromCart, updateQuantity }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div>
        <h1>Корзина</h1>
        <div className="placeholder">
          <div className="placeholder-icon">🍕</div>
          <div className="placeholder-text">Пока пусто</div>
          <div className="placeholder-sub">Добавьте что-нибудь из меню</div>
          <Link to="/catalog" className="go-to-menu">Перейти в меню</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Корзина</h1>
      <div className="cart-list">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-img" />
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">{item.price} ₽</div>
            </div>
            <div className="cart-item-quantity">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-item-total">{item.price * item.quantity} ₽</div>
            <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="cart-total">Итого: {total} ₽</div>
        <Link to="/checkout">
          <button className="checkout-btn">Оформить заказ</button>
        </Link>
      </div>
    </div>
  )
}

export default Cart;