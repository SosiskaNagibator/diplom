import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { ORDER_STATUSES } from '../constants/statuses';
import { getStatusIndex } from '../utils/statusUtils';
import { Button, LoadingSpinner } from '../components/ui';

function Tracking() {
  const navigate = useNavigate();
  const { userLogin } = useAuth();
  const isGuest = !userLogin;

  const [expandedItems, setExpandedItems] = useState({});
  const intervalRef = useRef(null);
  const guestIntervalRef = useRef(null);

  const { data: orders = [], isLoading, error } = useOrders(userLogin);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const [guestOrders, setGuestOrders] = useState([]);
  const [loadingGuest, setLoadingGuest] = useState(true);

  useEffect(() => {
    if (!isGuest) {
      setLoadingGuest(false);
      return;
    }
    const saved = localStorage.getItem('orders');
    let localOrders = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.orders && Array.isArray(parsed.orders) && parsed.timestamp) {
          if (Date.now() - parsed.timestamp < 86400000) {
            localOrders = parsed.orders;
          } else {
            localStorage.removeItem('orders');
          }
        } else {
          localOrders = parsed;
        }
      } catch (e) {
        console.warn('Ошибка парсинга localStorage', e);
      }
    }
    setGuestOrders(localOrders);
    setLoadingGuest(false);
  }, [isGuest]);

  useEffect(() => {
    if (!isGuest || guestOrders.length === 0) return;
    if (guestIntervalRef.current) clearInterval(guestIntervalRef.current);
    guestIntervalRef.current = setInterval(() => {
      console.log('Автообновление статуса для гостя (заглушка)');
    }, 10000);
    return () => clearInterval(guestIntervalRef.current);
  }, [isGuest, guestOrders]);

  useEffect(() => {
    if (!userLogin || orders.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      orders.forEach(order => {
        if (order.status === 'Доставлен') return;
        const currentIndex = getStatusIndex(order.status);
        const nextIndex = Math.min(currentIndex + 1, ORDER_STATUSES.length - 1);
        const newStatus = ORDER_STATUSES[nextIndex];
        if (newStatus !== order.status) {
          updateStatus({ orderId: order.id, newStatus });
        }
      });
    }, 10000);
    return () => clearInterval(intervalRef.current);
  }, [userLogin, orders, updateStatus]);

  const toggleExpand = (orderId, itemId) => {
    const key = `${orderId}-${itemId}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isCustomPizza = (item) => {
    return item.name === 'Пицца на заказ';
  };

  // Анимации – более плавные, с большей задержкой
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.15,
        duration: 0.5,
        ease: 'easeOut'
      }
    }),
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const expandVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  };

  const renderOrderCard = (order, index = 0) => {
    const currentStep = getStatusIndex(order.status);
    return (
      <motion.div
        key={order.id || `order-${index}`}
        custom={index}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
        layout
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
            <span className="font-bold text-amber-600 text-lg">Заказ №{order.orderNumber || order.id}</span>
            <span className="text-sm text-gray-500">{order.date}</span>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            {order.items.map((item, itemIndex) => {
              const key = `${order.id || 'order'}-${item.id || itemIndex}`;
              const isExpanded = expandedItems[key];
              const isCustom = isCustomPizza(item);
              return (
                <div key={item.id || itemIndex} className="border-b border-gray-50 last:border-0 py-1">
                  <div className="flex justify-between items-center">
                    <div 
                      className={`flex items-center gap-1 ${isCustom ? 'cursor-pointer hover:text-amber-600' : ''}`}
                      onClick={() => isCustom && toggleExpand(order.id || 'order', item.id || itemIndex)}
                    >
                      <span className="font-medium text-gray-700">{item.name}</span>
                      {isCustom && (
                        <motion.span
                          className="inline-flex items-center transition-transform duration-300"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg 
                            className="w-4 h-4 text-amber-500" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </motion.span>
                      )}
                      {!isCustom && item.size_label && (
                        <span className="text-xs text-gray-400">({item.size_label})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="font-medium text-amber-600">{item.price * item.quantity} ₽</span>
                    </div>
                  </div>
                  {isCustom && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={expandVariants}
                          className="mt-1 text-xs text-gray-500 bg-amber-50 p-2 rounded border border-amber-200"
                        >
                          {item.description || (item.toppings && `Состав: ${item.toppings}`) || 'Состав не указан'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">Статус заказа</span>
            </div>
            <div className="relative flex items-center justify-between w-full">
              {ORDER_STATUSES.map((status, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const isLast = idx === ORDER_STATUSES.length - 1;
                return (
                  <div key={idx} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                      <motion.div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isActive 
                            ? 'border-amber-500 bg-amber-500 text-white' 
                            : 'border-gray-300 bg-white'
                        } ${isCurrent ? 'ring-4 ring-amber-200' : ''}`}
                        initial={false}
                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isActive && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </motion.div>
                      <span className={`text-xs mt-1 whitespace-nowrap ${isActive ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                        {status}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${isActive && idx < currentStep ? 'bg-amber-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {order.deliveryAddress && (
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span> {order.deliveryAddress}
            </div>
          )}
          {order.customerName && (
            <div className="mt-1 text-sm text-gray-500 flex items-center gap-1">
              <span>👤</span> {order.customerName} {order.customerPhone && `(${order.customerPhone})`}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // --- Рендер для гостя ---
  if (isGuest) {
    return (
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Мои заказы</h1>
        {loadingGuest ? (
          <LoadingSpinner text="Загрузка заказов..." />
        ) : guestOrders.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={emptyStateVariants}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="text-6xl mb-4 animate-bounce-in">📦</div>
            <div className="text-gray-500 text-lg">Нет активных заказов</div>
            <div className="text-gray-400 mt-1">Сделайте первый заказ, чтобы отслеживать его статус</div>
            <Button variant="primary" onClick={() => navigate('/catalog')} className="mt-8">
              Перейти в меню
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-8">
              <AnimatePresence>
                {guestOrders.map((order, index) => renderOrderCard(order, index))}
              </AnimatePresence>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="danger" onClick={() => {
                localStorage.removeItem('orders');
                setGuestOrders([]);
              }}>
                Очистить историю
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- Рендер для авторизованного ---
  if (isLoading) return <LoadingSpinner text="Загрузка заказов..." />;
  if (error) return <div className="text-center py-12 text-red-500">Ошибка загрузки: {error.message}</div>;

  if (orders.length === 0) {
    return (
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Мои заказы</h1>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={emptyStateVariants}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="text-6xl mb-4 animate-bounce-in">📦</div>
          <div className="text-gray-500 text-lg">Нет активных заказов</div>
          <div className="text-gray-400 mt-1">Сделайте первый заказ, чтобы отслеживать его статус</div>
          <Button variant="primary" onClick={() => navigate('/catalog')} className="mt-8">
            Перейти в меню
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Мои заказы</h1>
      <div className="space-y-8">
        <AnimatePresence>
          {orders.map((order, index) => renderOrderCard(order, index))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Tracking;