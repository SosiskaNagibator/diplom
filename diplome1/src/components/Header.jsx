import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Sapore<span className="header-logo-accent">.</span>
      </Link>
      <nav className="header-nav">
        <Link to="/catalog" className="header-link">Меню</Link>
        <Link to="/constructor" className="header-link">Конструктор</Link>
        <Link to="/tracking" className="header-link">Заказы</Link>
        <Link to="/profile" className="header-link">Профиль</Link>
        <Link to="/cart" className="header-cart">Корзина</Link>
      </nav>
    </header>
  )
}

export default Header;