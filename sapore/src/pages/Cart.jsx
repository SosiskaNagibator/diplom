import { Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapPicker from '../components/MapPicker/MapPicker';
import AddressSelector from '../components/AddressSelector';
import BonusSlider from '../components/BonusSlider';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { InputMask } from '@react-input/mask';
import { useBonuses } from '../hooks/useProfile';
import { useSaveOrder } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import { API_ORDERS } from '../constants/api';
import { FaBolt, FaClock, FaPizzaSlice, FaClipboardList, FaGift, FaCoins, FaCheck } from 'react-icons/fa';

const MemoMapPicker = memo(MapPicker);

const TimeWheel = ({ value, onChange, options }) => {
  const containerRef = useRef(null);
  const itemHeight = 44;
  const isDraggingRef = useRef(false);
  const isProgrammaticRef = useRef(false);
  const lastNotifiedValueRef = useRef(value);

  useEffect(() => {
    if (!containerRef.current || value === undefined || value === null) return;
    const index = options.indexOf(value);
    if (index === -1) return;
    const targetScroll = index * itemHeight;
    if (Math.abs(containerRef.current.scrollTop - targetScroll) > 1) {
      isProgrammaticRef.current = true;
      containerRef.current.scrollTop = targetScroll;
      requestAnimationFrame(() => {
        isProgrammaticRef.current = false;
      });
    }
  }, [value, options]);

  const handleScroll = () => {
    if (isProgrammaticRef.current) return;
    if (isDraggingRef.current) return;
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const newValue = options[index];
    if (newValue !== undefined && newValue !== lastNotifiedValueRef.current) {
      lastNotifiedValueRef.current = newValue;
      onChange(newValue);
    }
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    const startY = e.clientY;
    const startScrollTop = containerRef.current.scrollTop;

    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const delta = (startY - e.clientY) * 0.8;
      containerRef.current.scrollTop = startScrollTop + delta;
    };

    const onUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const newValue = options[index];
      if (newValue !== undefined && newValue !== lastNotifiedValueRef.current) {
        lastNotifiedValueRef.current = newValue;
        onChange(newValue);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (options.length === 0) {
    return <div className="w-20 h-44 flex items-center justify-center text-gray-300 select-none">—</div>;
  }

  return (
    <div
      className="relative w-20 h-44 overflow-hidden rounded-xl select-none"
      style={{ cursor: 'grab' }}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll no-scrollbar"
        onScroll={handleScroll}
      >
        <div className="py-[72px]">
          {options.map((opt) => (
            <div
              key={opt}
              className="h-11 flex items-center justify-center text-xl font-medium transition-colors duration-150"
              style={{
                color: opt === value ? '#d97706' : '#9ca3af',
                transform: opt === value ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {String(opt).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-[72px] bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-gradient-to-t from-white to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-0 right-0 h-11 -translate-y-1/2 border-y-2 border-amber-300/50 pointer-events-none" />
    </div>
  );
};

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

  const [deliveryMode, setDeliveryMode] = useState('asap');
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const { mutateAsync: saveOrder, isPending: isSaving } = useSaveOrder();

  const total = useMemo(() => getTotal(), [cart, getTotal]);

  const maxBonusPercent = 20;
  const maxBonusAmount = Math.floor(total * (maxBonusPercent / 100));
  const maxUsableBonus = Math.min(availableBonuses, maxBonusAmount);
  const bonusUsed = useBonus ? Math.floor(maxUsableBonus * (bonusPercentage / 100)) : 0;
  const totalAfterBonus = total - bonusUsed;
  const finalTotal = totalAfterBonus - promoDiscount;

  useEffect(() => {
    if (appliedPromo) {
      setUseBonus(false);
      setBonusPercentage(0);
      setIsVisible(false);
    }
  }, [appliedPromo]);

  const maxHour = 22;
  const now = new Date();
  const minTime = new Date(now.getTime() + 30 * 60000);
  const startHour = minTime.getHours();
  const startMinute = minTime.getMinutes();
  const roundedStartMinute = Math.ceil(startMinute / 10) * 10;

  const availableHours = [];
  for (let h = startHour; h <= maxHour; h++) {
    availableHours.push(h);
  }

  const allMinutes = [0, 10, 20, 30, 40, 50];

  const getAvailableMinutes = (hour) => {
    if (hour === null || hour === undefined) return [];
    if (hour === startHour) {
      return allMinutes.filter(m => m >= roundedStartMinute);
    }
    return allMinutes;
  };

  useEffect(() => {
    if (selectedHour !== null) {
      const validMinutes = getAvailableMinutes(selectedHour);
      if (selectedMinute !== null && !validMinutes.includes(selectedMinute)) {
        setSelectedMinute(null);
      }
      if (selectedMinute === null && validMinutes.length > 0) {
        setSelectedMinute(validMinutes[0]);
      }
    }
  }, [selectedHour]);

  useEffect(() => {
    if (deliveryMode === 'asap') {
      setSelectedHour(null);
      setSelectedMinute(null);
    }
  }, [deliveryMode]);

  const handleHourChange = (hour) => {
    setSelectedHour(hour);
    if (deliveryMode === 'asap') setDeliveryMode('choose');
  };

  const handleMinuteChange = (minute) => {
    setSelectedMinute(minute);
    if (deliveryMode === 'asap') setDeliveryMode('choose');
  };

  const handleAddressSelect = useCallback((addr) => {
    setDeliveryAddress(addr);
  }, []);

  const handleAddressSelectFromList = useCallback((addr) => {
    setDeliveryAddress(addr);
  }, []);

  const handleBonusToggle = useCallback((checked) => {
    if (checked && maxUsableBonus > 0 && !appliedPromo) {
      setUseBonus(true);
      setIsVisible(true);
      setBonusPercentage(50);
    } else {
      setBonusPercentage(0);
      setIsVisible(false);
      setTimeout(() => setUseBonus(false), 400);
    }
  }, [maxUsableBonus, appliedPromo]);

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

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoMessage('');
    try {
      const response = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_promo',
          code: promoCode,
          login: userLogin || 'guest',
          orderTotal: totalAfterBonus
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setPromoDiscount(data.discount);
        setAppliedPromo(promoCode);
        setPromoMessage('Промокод применён! Скидка: ' + data.discount + ' ₽');
      } else {
        setPromoMessage('Ошибка: ' + data.message);
        setPromoDiscount(0);
        setAppliedPromo('');
      }
    } catch {
      setPromoMessage('Ошибка при проверке промокода');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoDiscount(0);
    setPromoMessage('');
    setPromoCode('');
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

    if (deliveryMode === 'choose' && (selectedHour === null || selectedMinute === null)) {
      alert('Пожалуйста, выберите время доставки');
      return false;
    }

    let fullAddress = deliveryAddress.trim();
    if (apartment.trim()) {
      fullAddress += `, кв. ${apartment.trim()}`;
    }

    // Формируем время доставки
    let deliveryTimeValue;
    if (deliveryMode === 'asap') {
      deliveryTimeValue = 'ASAP';
    } else {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      deliveryTimeValue = `${dateStr}T${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    }

    const payload = {
      action: 'save_order',
      userLogin: isGuest ? 'guest' : userLogin,
      items: cart,
      total: totalAfterBonus,
      originalTotal: total,
      bonusUsed: bonusUsed,
      status: 'Принят',
      deliveryAddress: fullAddress,
      deliveryTime: deliveryTimeValue,
      promoCode: appliedPromo,
      discountAmount: promoDiscount,
      finalTotal: finalTotal,
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
          total: finalTotal,
          date: new Date().toLocaleString(),
          status: 'Принят',
          deliveryAddress: fullAddress,
          deliveryTime: deliveryTimeValue,
          promoCode: appliedPromo,
          discountAmount: promoDiscount,
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
  }, [isSaving, cart, isGuest, customerName, customerPhone, customerEmail, deliveryAddress, apartment, deliveryMode, selectedHour, selectedMinute, total, totalAfterBonus, bonusUsed, finalTotal, promoDiscount, appliedPromo, navigate, clearCart, userLogin, userProfile, saveOrder]);

  // ---------- ЕСЛИ КОРЗИНА ПУСТАЯ ----------
  if (cart.length === 0) {
    return (
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Корзина</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            <FaPizzaSlice className="text-6xl text-amber-500 animate-bounce-in" />
          </div>
          <div className="text-xl font-medium text-gray-800">Пока пусто</div>
          <div className="text-gray-500 mt-1">Добавьте что-нибудь из меню</div>
          <Link to="/catalog">
            <Button variant="primary">Перейти в меню</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---------- ОСНОВНОЙ РЕНДЕР ----------
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Корзина</h1>
      <AnimatePresence mode="popLayout">
        {cart.map((item, index) => (
          <CartItem key={item.id} item={item} index={index} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveFromCart} />
        ))}
      </AnimatePresence>

      <motion.div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <AddressSelector onSelect={handleAddressSelectFromList} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
          <MemoMapPicker onAddressSelect={handleAddressSelect} initialAddress={deliveryAddress} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Квартира / офис (необязательно)</label>
          <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="Номер квартиры или офиса" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Время доставки</label>
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setDeliveryMode('asap')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-medium transition-all duration-200 cursor-pointer ${
                deliveryMode === 'asap'
                  ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <FaBolt className="text-lg" />
              Как можно быстрее
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode('choose')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-medium transition-all duration-200 cursor-pointer ${
                deliveryMode === 'choose'
                  ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <FaClock className="text-lg" />
              Выбрать время
            </button>
          </div>

          <AnimatePresence>
            {deliveryMode === 'choose' && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <TimeWheel value={selectedHour} onChange={handleHourChange} options={availableHours} />
                <span className="text-2xl font-light text-gray-400">:</span>
                <TimeWheel value={selectedMinute} onChange={handleMinuteChange} options={selectedHour !== null ? getAvailableMinutes(selectedHour) : []} />
                <div className="text-sm text-gray-500 ml-2">
                  {selectedHour !== null && selectedMinute !== null
                    ? `Доставка ${new Date().toLocaleDateString('ru-RU')} в ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
                    : 'Выберите часы и минуты'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {deliveryMode === 'asap' && (
            <div className="text-sm text-gray-500 mt-1">Доставка в ближайшее время</div>
          )}
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Промокод</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Введите промокод"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                disabled={!!appliedPromo}
              />
              <Button
                variant="primary"
                onClick={handleApplyPromo}
                disabled={isApplyingPromo || !!appliedPromo || !promoCode.trim()}
                className="whitespace-nowrap"
              >
                {isApplyingPromo ? 'Проверка...' : 'Применить'}
              </Button>
            </div>
            {promoMessage && (
              <div className={`text-sm mt-1 ${promoMessage.includes('Скидка') ? 'text-green-600' : 'text-red-600'}`}>
                {promoMessage}
              </div>
            )}
            {appliedPromo && (
              <button onClick={handleRemovePromo} className="text-sm text-gray-500 hover:text-gray-700 mt-1 transition">
                Удалить промокод
              </button>
            )}
          </div>
        </div>

        {isGuest ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Ваше имя" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
              <InputMask mask="+7 (___) ___-__-__" replacement={{ _: /\d/ }} value={customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); setPhoneError(''); }} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="+7 (999) 999-99-99" required />
              {phoneError && <div className="mt-1 text-sm text-red-600">{phoneError}</div>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (необязательно)</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="example@mail.ru" />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <FaClipboardList className="text-amber-500 flex-shrink-0" />
            <span>
              Заказ будет оформлен на имя <strong>{userProfile.fullName || userLogin}</strong>
              {userProfile.phone && <span> (телефон: {userProfile.phone})</span>}
              {userProfile.email && <span>, email: {userProfile.email}</span>}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-bold text-gray-800">Итого к оплате:</span>
              <motion.span key={finalTotal} className="text-2xl font-bold text-amber-600">
                {finalTotal} ₽
              </motion.span>
              {promoDiscount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {totalAfterBonus} ₽
                </span>
              )}
            </div>
            {promoDiscount > 0 && (
              <div className="text-sm text-amber-600 mt-1">Скидка по промокоду: -{promoDiscount} ₽</div>
            )}
            {bonusUsed > 0 && (
              <div className="text-sm text-amber-600">Списано бонусов: -{bonusUsed} ₽</div>
            )}
          </div>

          {userLogin ? (
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <FaGift className="text-amber-500 flex-shrink-0" />
                  <span>Бонусы: <strong className="text-amber-600">{availableBonuses} ₽</strong></span>
                </div>
                <label className={`flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none ${appliedPromo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={useBonus}
                    onChange={(e) => handleBonusToggle(e.target.checked)}
                    disabled={availableBonuses === 0 || total === 0 || maxUsableBonus === 0 || !!appliedPromo}
                    className="hidden"
                  />
                  <span className={`relative inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    useBonus ? 'bg-amber-500 border-amber-500' : 'bg-white border-gray-300 hover:border-amber-400'
                  } ${(availableBonuses === 0 || total === 0 || maxUsableBonus === 0 || appliedPromo) ? 'opacity-50' : 'cursor-pointer'}`}>
                    {useBonus && <FaCheck className="w-3 h-3 text-white animate-checkmark" />}
                  </span>
                  <span>Использовать бонусы</span>
                  {appliedPromo && <span className="text-xs text-gray-400 ml-1">(недоступно при промокоде)</span>}
                </label>
              </div>
              <div className="w-full sm:w-80 overflow-hidden">
                <div className={`transition-all duration-500 ease-out ${
                  isVisible && useBonus && maxUsableBonus > 0 && !appliedPromo
                    ? 'opacity-100 translate-y-0 max-h-[300px]'
                    : 'opacity-0 translate-y-[-8px] max-h-0'
                }`}>
                  {useBonus && maxUsableBonus > 0 && !appliedPromo && (
                    <>
                      <BonusSlider maxUsableBonus={maxUsableBonus} bonusUsed={bonusUsed} onFinalChange={handleSliderFinal} initialValue={bonusPercentage} />
                      <div className="text-sm text-gray-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1">
                        <FaCoins className="text-amber-600 flex-shrink-0" />
                        <span>Скидка: <strong className="text-amber-600">{bonusUsed} ₽</strong> → К оплате: <strong className="text-amber-600">{finalTotal} ₽</strong></span>
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
            disabled={cart.length === 0 || isSaving || !deliveryAddress.trim() || (deliveryMode === 'choose' && (selectedHour === null || selectedMinute === null)) || (isGuest && (!customerName.trim() || !customerPhone || !validatePhone(customerPhone)))}
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