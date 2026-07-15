import { Link } from 'react-router-dom';
import { FaTelegramPlane, FaVk, FaYoutube, FaInstagram } from 'react-icons/fa';
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from 'react-icons/md';

function Footer() {
  const currentYear = new Date().getFullYear();
  const socialLink = 'https://vk.com/video7266823_78234740';

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 shadow-inner">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-amber-600 mb-4">Sapore</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Настоящая итальянская пицца из печи на дровах. Свежие ингредиенты, доставка за 30 минут.
            </p>
            <div className="flex gap-5 mt-4 text-2xl text-gray-500">
              <a 
                href={socialLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" 
                aria-label="VK"
              >
                <FaVk />
              </a>
              <a 
                href={socialLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" 
                aria-label="Telegram"
              >
                <FaTelegramPlane />
              </a>
              <a 
                href={socialLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" 
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
              <a 
                href={socialLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" 
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Меню</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="text-gray-600 hover:text-amber-500 transition-colors">Каталог пицц</Link></li>
              <li><Link to="/constructor" className="text-gray-600 hover:text-amber-500 transition-colors">Конструктор</Link></li>
              <li><Link to="/tracking" className="text-gray-600 hover:text-amber-500 transition-colors">Отслеживание заказа</Link></li>
              <li><Link to="/contacts" className="text-gray-600 hover:text-amber-500 transition-colors">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <MdPhone className="text-amber-500 text-lg" />
                <a href="tel:+79999999999" className="hover:text-amber-500 transition-colors">+7 (999) 999-99-99</a>
              </li>
              <li className="flex items-center gap-2">
                <MdEmail className="text-amber-500 text-lg" />
                <a href="mailto:info@sapore.ru" className="hover:text-amber-500 transition-colors">info@sapore.ru</a>
              </li>
              <li className="flex items-center gap-2">
                <MdLocationOn className="text-amber-500 text-lg" />
                <span>г. Ростов-на-Дону, ул. Социалистическая, 141</span>
              </li>
              <li className="flex items-center gap-2">
                <MdAccessTime className="text-amber-500 text-lg" />
                <span>Пн–Вс: 10:00 – 23:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Доставка</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>🚀 Бесплатная доставка</li>
              <li>⏱️ Среднее время доставки: 30–45 мин</li>
              <li>💳 Оплата картой или наличными</li>
              <li className="mt-3">
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Работаем с 2015 года
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 text-center text-sm text-gray-500">
          © {currentYear} Sapore. Все права защищены.
        </div>
      </div>
    </footer>
  );
}

export default Footer;