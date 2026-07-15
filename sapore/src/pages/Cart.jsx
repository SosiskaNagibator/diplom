import { Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapPicker from '../components/MapPicker/MapPicker';
import BonusSlider from '../components/BonusSlider';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { InputMask } from '@react-input/mask';
import { useBonuses } from '../hooks/useProfile';
import { useSaveOrder } from '../hooks/useCart';
import CartItem from '../components/CartItem';

const MemoMapPicker = memo(MapPicker);

function Cart() {
  const navigate = useNavigate();
  const { userLogin, userProfile } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const isGuest = !userLogin;

  const { data: availableBonuses = 0 } = useBonuses(userLogin);

  const [useBonus, setUseBonus] = useState(false);
  const [bonusPercentage, setBonusPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const { mutateAsync: saveOrder, isPending: isSaving } = useSaveOrder();

  const total = useMemo(() => getTotal(), [cart, getTotal]);

  const maxBonusPercent = 20;
  const maxBonusAmount = Math.floor(total * (maxBonusPercent / 100));
  const maxUsableBonus = Math.min(availableBonuses, maxBonusAmount);
  const bonusUsed = useBonus ? Math.floor(maxUsableBonus * (bonusPercentage / 100)) : 0;
  const actualTotal = total - bonusUsed;

  const handleAddressSelect = useCallback((addr) => {
    setDeliveryAddress(addr);
  }, []);

  const handleBonusToggle = useCallback((checked) => {
    if (checked && maxUsableBonus > 0) {
      setUseBonus(true);
      setIsVisible(true);
      setBonusPercentage(50);
    } else {
      setBonusPercentage(0);
      setIsVisible(false);
      setTimeout(() => setUseBonus(false), 400);
    }
  }, [maxUsableBonus]);

  const handleSliderFinal = useCallback((value) => {
    setBonusPercentage(value);
  }, []);

  const handleUpdateQuantity = useCallback((id, newQuantity) => {
    updateQuantity(id, newQuantity);
  }, [updateQuantity]);

  const handleRemoveFromCart = useCallback((id) => {
    removeFromCart(id);
  }, [removeFromCart]);

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  const handleCheckout = useCallback(async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (isSaving || cart.length === 0) return false;

    if (isGuest) {
      if (!customerName.trim()) {
        alert('Пожалуйста, укажите имя');
        return false;
      }
      if (!customerPhone || !validatePhone(customerPhone)) {
        setPhoneError('Введите корректный номер телефона (минимум 10 цифр)');
        return false;
      } else {
        setPhoneError('');
      }
    }

    if (!deliveryAddress.trim()) {
      alert('Пожалуйста, укажите адрес доставки');
      return false;
    }

    let fullAddress = deliveryAddress.trim();
    if (apartment.trim()) {
      fullAddress += `, кв. ${apartment.trim()}`;
    }

    const payload = {
      action: 'save_order',
      userLogin: isGuest ? 'guest' : userLogin,
      items: cart,
      total: actualTotal,
      originalTotal: total,
      bonusUsed: bonusUsed,
      status: 'Принят',
      deliveryAddress: fullAddress,
      customerName: isGuest ? customerName.trim() : userProfile.fullName,
      customerPhone: isGuest ? customerPhone.trim() : userProfile.phone,
      customerEmail: isGuest ? customerEmail.trim() : userProfile.email,
    };

    try {
      const data = await saveOrder(payload);
      if (data.status === 'success') {
        const order = {
          id: data.orderId,
          orderNumber: data.orderNumber,
          items: cart,
          total: actualTotal,
          date: new Date().toLocaleString(),
          status: 'Принят',
          deliveryAddress: fullAddress,
          customerName: isGuest ? customerName.trim() : userProfile.fullName,
          customerPhone: isGuest ? customerPhone.trim() : userProfile.phone,
          customerEmail: isGuest ? customerEmail.trim() : userProfile.email,
        };
        const stored = localStorage.getItem('orders');
        let guestOrders = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.orders && Array.isArray(parsed.orders) && parsed.timestamp) {
              guestOrders = parsed.orders;
            } else {
              guestOrders = parsed;
            }
          } catch {
            guestOrders = [];
          }
        }
        guestOrders.unshift(order);
        localStorage.setItem('orders', JSON.stringify({ orders: guestOrders, timestamp: Date.now() }));
        clearCart();
        navigate('/tracking', { replace: true });
        return true;
      } else {
        alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
        return false;
      }
    } catch (err) {
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      return false;
    }
  }, [isSaving, cart, isGuest, customerName, customerPhone, customerEmail, deliveryAddress, apartment, actualTotal, total, bonusUsed, navigate, clearCart, userLogin, userProfile, saveOrder]);

  if (cart.length === 0) {
    return (
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Корзина</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4 animate-bounce-in">🍕</div>
          <div className="text-xl font-medium text-gray-800">Пока пусто</div>
          <div className="text-gray-500 mt-1">Добавьте что-нибудь из меню</div>
          <Link to="/catalog">
            <Button variant="primary">Перейти в меню</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Корзина</h1>

      <AnimatePresence mode="popLayout">
        {cart.map((item, index) => (
          <CartItem
            key={item.id}
            item={item}
            index={index}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveFromCart}
          />
        ))}
      </AnimatePresence>

      <motion.div
        className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
          <MemoMapPicker onAddressSelect={handleAddressSelect} initialAddress={deliveryAddress} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Квартира / офис (необязательно)</label>
          <input
            type="text"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            placeholder="Номер квартиры или офиса"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {isGuest ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Ваше имя"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
              <InputMask
                mask="+7 (___) ___-__-__"
                replacement={{ _: /\d/ }}
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setPhoneError('');
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="+7 (999) 999-99-99"
                required
              />
              {phoneError && <div className="mt-1 text-sm text-red-600">{phoneError}</div>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (необязательно)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="example@mail.ru"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-4">
            📋 Заказ будет оформлен на имя <strong>{userProfile.fullName || userLogin}</strong> (телефон: {userProfile.phone || 'не указан'})
            {userProfile.email && <span>, email: {userProfile.email}</span>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-800">Итого:</span>
            <motion.span
              key={total}
              className="text-2xl font-bold text-amber-600"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {total} ₽
            </motion.span>
          </div>

          {userLogin ? (
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-sm text-gray-600">🎁 Бонусы: <strong className="text-amber-600">{availableBonuses} ₽</strong></div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useBonus}
                    onChange={(e) => handleBonusToggle(e.target.checked)}
                    disabled={availableBonuses === 0 || total === 0 || maxUsableBonus === 0}
                    className="hidden"
                  />
                  <span className={`relative inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    useBonus ? 'bg-amber-500 border-amber-500' : 'bg-white border-gray-300 hover:border-amber-400'
                  } ${(availableBonuses === 0 || total === 0 || maxUsableBonus === 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {useBonus && (
                      <svg className="w-3 h-3 text-white animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  Использовать бонусы
                </label>
              </div>
              <div className="w-full sm:w-80 overflow-hidden">
                <div className={`transition-all duration-500 ease-out ${
                  isVisible && useBonus && maxUsableBonus > 0
                    ? 'opacity-100 translate-y-0 max-h-[300px]'
                    : 'opacity-0 translate-y-[-8px] max-h-0'
                }`}>
                  {useBonus && maxUsableBonus > 0 && (
                    <>
                      <BonusSlider
                        maxUsableBonus={maxUsableBonus}
                        bonusUsed={bonusUsed}
                        onFinalChange={handleSliderFinal}
                        initialValue={bonusPercentage}
                      />
                      <div className="text-sm text-gray-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        💰 Скидка: <strong className="text-amber-600">{bonusUsed} ₽</strong> → К оплате: <strong className="text-amber-600">{actualTotal} ₽</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Войдите в аккаунт, чтобы копить и использовать бонусы</div>
          )}

          <Button
            variant="primary"
            disabled={
              cart.length === 0 ||
              isSaving ||
              !deliveryAddress.trim() ||
              (isGuest && (!customerName.trim() || !customerPhone || !validatePhone(customerPhone)))
            }
            onClick={handleCheckout}
          >
            {isSaving ? 'Оформление...' : 'Оформить заказ'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default Cart;