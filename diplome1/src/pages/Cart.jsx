import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_ORDERS = 'http://localhost/orders.php';
const API_USER = 'http://localhost/api.php';

function Cart({ cart, removeFromCart, updateQuantity }) {
  const navigate = useNavigate();
  const [useBonus, setUseBonus] = useState(false);
  const [availableBonuses, setAvailableBonuses] = useState(0);
  const userLogin = localStorage.getItem('userLogin');

  useEffect(() => {
    if (userLogin) {
      fetch(`${API_USER}?action=get_bonuses&login=${encodeURIComponent(userLogin)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setAvailableBonuses(data.bonuses);
          }
        })
        .catch(console.error);
    } else {
      setAvailableBonuses(0);
    }
  }, [userLogin]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const maxBonus = Math.min(availableBonuses, total * 0.2);
  const bonusUsed = useBonus ? Math.floor(maxBonus) : 0;
  const actualTotal = total - bonusUsed;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_order',
          userLogin: userLogin || 'guest',
          items: cart,
          total: actualTotal,
          originalTotal: total,
          bonusUsed: bonusUsed,
          status: 'Принят'
        })
      });
      const data = await response.json();
      console.log('Ответ от сервера:', data);

      if (data.status === 'success') {
        const orderNumber = data.orderNumber;
        const order = {
          id: orderNumber,
          orderNumber: orderNumber,
          items: cart,
          total: actualTotal,
          date: new Date().toLocaleString(),
          status: 'Принят'
        };
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        if (data.newBalance !== null && data.newBalance !== undefined) {
          setAvailableBonuses(data.newBalance);
        } else if (userLogin) {
          const balRes = await fetch(`${API_USER}?action=get_bonuses&login=${encodeURIComponent(userLogin)}`);
          const balData = await balRes.json();
          if (balData.status === 'success') {
            setAvailableBonuses(balData.bonuses);
          }
        }
        console.log('✅ Заказ сохранен в БД с номером:', orderNumber);
      } else {
        console.warn('⚠️ Ошибка сохранения заказа в БД:', data.message);
        const tempId = Date.now();
        const tempOrder = {
          id: tempId,
          orderNumber: tempId,
          items: cart,
          total: actualTotal,
          date: new Date().toLocaleString(),
          status: 'Принят'
        };
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(tempOrder);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
      }
    } catch (err) {
      console.warn('⚠️ Не удалось сохранить заказ в БД:', err);
      const tempId = Date.now();
      const tempOrder = {
        id: tempId,
        orderNumber: tempId,
        items: cart,
        total: actualTotal,
        date: new Date().toLocaleString(),
        status: 'Принят'
      };
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(tempOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
    }

    cart.forEach(item => removeFromCart(item.id));
    navigate('/tracking');
  };

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Корзина</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">🍕</div>
          <div className="text-xl font-medium text-gray-800">Пока пусто</div>
          <div className="text-gray-500 mt-1">Добавьте что-нибудь из меню</div>
          <Link to="/catalog" className="inline-block mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-full transition">
            Перейти в меню
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Корзина</h1>
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1 min-w-[120px]">
              <div className="font-semibold text-gray-800">{item.name}</div>
              <div className="text-sm text-gray-500">{item.price} ₽</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-amber-500 hover:text-amber-500 flex items-center justify-center transition">−</button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-amber-500 hover:text-amber-500 flex items-center justify-center transition">+</button>
            </div>
            <div className="text-amber-600 font-bold min-w-[70px] text-right">{item.price * item.quantity} ₽</div>
            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition text-xl">✕</button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xl font-bold text-gray-800">Итого: {total} ₽</div>

          {userLogin ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm text-gray-600">🎁 Бонусы: <strong className="text-amber-600">{availableBonuses} ₽</strong></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBonus}
                  onChange={() => setUseBonus(!useBonus)}
                  disabled={availableBonuses === 0 || total === 0}
                  className="accent-amber-500"
                />
                Использовать (до {Math.floor(maxBonus)} ₽)
              </label>
              {useBonus && (
                <div className="text-sm text-gray-700">
                  Скидка: <strong className="text-amber-600">{bonusUsed} ₽</strong> → К оплате: <strong className="text-amber-600">{actualTotal} ₽</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Войдите в аккаунт, чтобы копить и использовать бонусы</div>
          )}

          <button
            onClick={handleCheckout}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition shadow-md hover:shadow-lg"
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;