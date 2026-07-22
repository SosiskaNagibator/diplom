import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useAuth();
  const { getCount } = useCart();
  const cartCount = getCount();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { to: '/catalog', label: 'Меню' },
    { to: '/constructor', label: 'Конструктор' },
    { to: '/tracking', label: 'Заказы' },
    { to: '/profile', label: 'Профиль' },
    { to: '/wishlist', label: 'Избранное' },
    { to: '/contacts', label: 'Контакты' },
  ];

  return (
    <>
      <button
        onClick={toggleMenu}
        className="lg:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 transition-all duration-300 hover:scale-105"
        aria-label="Меню"
      >
        <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-50 shadow-lg overflow-y-auto">
          <nav className="flex flex-col items-center gap-6 py-8 px-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={toggleMenu}
                className="text-gray-700 hover:text-amber-600 font-medium text-lg transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
            {role === 'admin' && (
              <Link
                to="/admin"
                onClick={toggleMenu}
                className="text-gray-700 hover:text-amber-600 font-medium text-lg transition-colors duration-200"
              >
                Админка
              </Link>
            )}
            <Link
              to="/cart"
              onClick={toggleMenu}
              className="relative bg-amber-500 text-white px-6 py-3 rounded-full hover:bg-amber-600 transition flex items-center gap-2 mt-4"
            >
              <span>Корзина</span>
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileMenu;