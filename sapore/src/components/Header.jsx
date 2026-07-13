import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Header() {
  const { role } = useAuth();
  const { getCount } = useCart();
  const cartCount = getCount();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="px-4 sm:px-8 lg:px-12 flex items-center justify-between h-20">
        <Link to="/" className="text-3xl font-bold text-amber-600 tracking-tight hover:text-amber-700 transition">
          Sapore
        </Link>
        <nav className="flex items-center gap-8 text-base font-medium">
          <Link to="/catalog" className="text-gray-600 hover:text-amber-600 transition">Меню</Link>
          <Link to="/constructor" className="text-gray-600 hover:text-amber-600 transition">Конструктор</Link>
          <Link to="/tracking" className="text-gray-600 hover:text-amber-600 transition">Заказы</Link>
          <Link to="/profile" className="text-gray-600 hover:text-amber-600 transition">Профиль</Link>
          {role === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-amber-600 transition">Админка</Link>
          )}
          <Link to="/contacts" className="text-gray-600 hover:text-amber-600 transition">Контакты</Link>
          <Link to="/cart" className="relative bg-amber-500 text-white px-5 py-2.5 rounded-full hover:bg-amber-600 transition flex items-center gap-1.5 shadow-sm hover:shadow-md">
            <span>Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;