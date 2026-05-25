import './Cart.css'

function Cart() {
  return (
    <div>
      <h1>Корзина</h1>
      <div className="placeholder">
        <div className="placeholder-icon">🍕</div>
        <div className="placeholder-text">Пока пусто</div>
        <div className="placeholder-sub">Добавьте что-нибудь из меню</div>
      </div>
    </div>
  )
}

export default Cart;