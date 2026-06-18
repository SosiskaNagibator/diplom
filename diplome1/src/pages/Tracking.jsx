import { useState, useEffect } from 'react';
import '../styles/Tracking.css';

const statuses = ['Принят', 'Готовится', 'В пути', 'Доставлен'];

function Tracking() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(saved);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const updated = prevOrders.map(order => {
          if (order.status === 'Доставлен') return order;
          let currentIndex = statuses.indexOf(order.status);
          let nextIndex = Math.min(currentIndex + 1, statuses.length - 1);
          return { ...order, status: statuses[nextIndex] };
        });
        localStorage.setItem('orders', JSON.stringify(updated));
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const clearOrders = () => {
    localStorage.removeItem('orders');
    setOrders([]);
  };

  if (orders.length === 0) {
    return (
      <div>
        <h1>Отслеживание заказа</h1>
        <div className="placeholder">
          <div className="placeholder-text">Нет активных заказов</div>
          <div className="placeholder-sub">Сделайте первый заказ, чтобы отслеживать его статус</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Мои заказы</h1>
      <div className="orders-list">
        {orders.slice().reverse().map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Заказ №{order.id}</span>
              <span className="order-date">{order.date}</span>
            </div>
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                  <span>{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <div className="order-total">Итого: {order.total} ₽</div>
              <div className="order-status">
                Статус: <strong className={`status-${order.status.toLowerCase()}`}>{order.status}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={clearOrders} className="clear-orders-btn">Очистить историю</button>
    </div>
  );
}

export default Tracking;