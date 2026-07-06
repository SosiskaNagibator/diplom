import { useState, useEffect } from 'react';

const API_ORDERS = 'http://localhost/orders.php';
const statuses = ['Принят', 'Готовится', 'В пути', 'Доставлен'];

function Tracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userLogin = localStorage.getItem('userLogin');

  const loadOrders = async () => {
    if (!userLogin) {
      const saved = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(saved);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ORDERS}?action=get_orders&login=${encodeURIComponent(userLogin)}`);
      const data = await response.json();
      if (data.status === 'success' && data.orders) {
        const formattedOrders = data.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          items: order.items || [],
          total: order.total,
          date: order.date || new Date().toLocaleString(),
          status: order.status || 'Принят'
        }));
        setOrders(formattedOrders);
        localStorage.setItem('orders', JSON.stringify(formattedOrders));
      } else {
        const saved = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(saved);
      }
    } catch (err) {
      console.warn('Ошибка загрузки заказов:', err);
      const saved = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(saved);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const updated = prevOrders.map(order => {
          if (order.status === 'Доставлен') return order;
          let currentIndex = statuses.indexOf(order.status);
          let nextIndex = Math.min(currentIndex + 1, statuses.length - 1);
          const newStatus = statuses[nextIndex];
          if (userLogin && newStatus !== order.status) {
            fetch(API_ORDERS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_status',
                orderId: order.id,
                status: newStatus
              })
            }).catch(err => console.warn('Ошибка обновления статуса:', err));
          }
          return { ...order, status: newStatus };
        });
        localStorage.setItem('orders', JSON.stringify(updated));
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [orders.length, userLogin]);

  const clearOrders = () => {
    localStorage.removeItem('orders');
    setOrders([]);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Загрузка заказов...</div>;
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Отслеживание заказа</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-lg">Нет активных заказов</div>
          <div className="text-gray-400 mt-1">Сделайте первый заказ, чтобы отслеживать его статус</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Мои заказы</h1>
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
              <span className="font-bold text-amber-600">Заказ №{order.orderNumber || order.id}</span>
              <span className="text-sm text-gray-500">{order.date}</span>
            </div>
            <div className="space-y-2 text-sm">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                  <span className="font-medium">{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="text-lg font-bold text-amber-600">Итого: {order.total} ₽</div>
              <div className="text-sm">
                Статус: <strong className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'Принят' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'Готовится' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'В пути' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-green-100 text-green-700'
                }`}>{order.status}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={clearOrders} className="mt-8 text-sm text-gray-400 hover:text-red-500 transition border border-gray-200 hover:border-red-300 px-4 py-2 rounded-full">
        Очистить историю
      </button>
    </div>
  );
}

export default Tracking;