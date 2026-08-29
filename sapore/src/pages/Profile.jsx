import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../constants/api';
import { STORAGE_KEYS } from '../constants/storage';
import { Button, Input, Card, Badge, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useBonuses, useBonusHistory } from '../hooks/useProfile';
import { useUserLevel } from '../hooks/useLevels';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ConsentCheckbox from '../components/ConsentCheckbox';
import {
    FaPhone, FaEnvelope, FaUsers, FaGift, FaChartLine, FaCoins, FaInfoCircle, FaGem,
    FaPercent, FaPlus, FaTruck, FaUtensils, FaStar, FaChevronRight, FaCheckCircle,
    FaLock, FaPizzaSlice, FaAward, FaMapMarkerAlt, FaTag
} from 'react-icons/fa';
import { LEVELS_BASE } from '../constants/api';

const useReferralInfo = (login) => {
  return useQuery({
    queryKey: ['referral', login],
    queryFn: async () => {
      if (!login) return null;
      const res = await fetch(`${API_BASE}?action=get_referral_info&login=${login}`);
      const data = await res.json();
      if (data.status === 'success') return data;
      return null;
    },
    enabled: !!login,
    staleTime: 5 * 60 * 1000,
  });
};

const usePromoCode = (login) => {
  return useQuery({
    queryKey: ['promo', login],
    queryFn: async () => {
      if (!login) return null;
      const res = await fetch(`${API_BASE}?action=generate_promo&login=${encodeURIComponent(login)}`);
      const data = await res.json();
      if (data.status === 'success') return data.code;
      return null;
    },
    enabled: !!login,
    staleTime: 5 * 60 * 1000,
  });
};

function Profile() {
  const navigate = useNavigate();
  const { userLogin, userProfile, login, logout, loading: authLoading } = useAuth();

  const { data: bonuses = 0, isLoading: isBonusesLoading } = useBonuses(userLogin);
  const { data: bonusHistory = [], isLoading: isHistoryLoading } = useBonusHistory(userLogin);
  const { data: referralInfo } = useReferralInfo(userLogin);

  const { data: userLevelData, refetch: refetchUserLevel } = useUserLevel(userLogin);
  const { data: promoCode } = usePromoCode(userLogin);
  
  const allLevels = userLevelData?.all_levels || [];
  const currentLevelData = userLevelData?.current_level;
  const nextLevelData = userLevelData?.next_level;
  const ordersSum = userLevelData?.orders_sum || 0;
  const userBonuses = userLevelData?.bonuses || bonuses;
  const progress = userLevelData?.progress || 0;

  const [isLoggedIn, setIsLoggedIn] = useState(!!userLogin);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consentPersonal, setConsentPersonal] = useState(false);
  const [consentOffer, setConsentOffer] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showBonusTooltip, setShowBonusTooltip] = useState(false);

  const levelRefs = useRef({});
  const travelContainerRef = useRef(null);

  useEffect(() => {
    if (currentLevelData && levelRefs.current[currentLevelData.id]) {
      const element = levelRefs.current[currentLevelData.id];
      const container = travelContainerRef.current;
      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top - container.clientHeight / 2 + elementRect.height / 2;
        container.scrollTo({ top: container.scrollTop + offset, behavior: 'smooth' });
      }
    }
  }, [currentLevelData, allLevels]);

  useEffect(() => {
    setIsLoggedIn(!!userLogin);
  }, [userLogin]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!loginInput.trim() || !password.trim()) {
      showMessage('Заполните все поля', 'error');
      return;
    }
    if (loginInput.length < 3) {
      showMessage('Логин должен быть не менее 3 символов', 'error');
      return;
    }
    if (password.length < 4) {
      showMessage('Пароль должен быть не менее 4 символов', 'error');
      return;
    }
    if (isRegister) {
      if (confirmPassword !== password) {
        showMessage('Пароли не совпадают', 'error');
        return;
      }
      if (!fullName.trim()) {
        showMessage('Введите имя', 'error');
        return;
      }
      if (!phone || !validatePhone(phone)) {
        showMessage('Введите корректный номер телефона (минимум 10 цифр)', 'error');
        return;
      }
      if (!consentPersonal || !consentOffer) {
        showMessage('Необходимо принять условия обработки данных и пользовательское соглашение', 'error');
        return;
      }
    }

    try {
      const result = await login(
        loginInput,
        password,
        isRegister,
        { fullName, phone, email, consentPersonal, consentOffer },
        referralCodeInput
      );

      if (result.success) {
        showMessage(`Добро пожаловать, ${loginInput}!`, 'success');
        setLoginInput('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
        setEmail('');
        setConsentPersonal(false);
        setConsentOffer(false);
        setReferralCodeInput('');
        if (result.data?.role === 'admin') {
          navigate('/admin');
        }
      } else {
        showMessage(result.message || 'Ошибка входа', 'error');
      }
    } catch (err) {
      showMessage('Не удалось соединиться с сервером.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showMessage('Вы вышли из аккаунта', 'success');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.4, ease: 'easeOut' }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const isLoading = authLoading || isBonusesLoading || isHistoryLoading;

  if (isLoading) return <ProfileSkeleton />;

  if (isLoggedIn) {
    return (
      <div className="fade-in py-8">
        <div className="max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-gray-800 mb-6"
          >
            Профиль
          </motion.h1>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <Card>
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold"
                  >
                    {userLogin ? userLogin.charAt(0).toUpperCase() : '?'}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-2xl font-bold">{userLogin}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {userProfile.fullName && (
                        <span className="text-sm text-white/80">{userProfile.fullName}</span>
                      )}
                    </div>
                    {userProfile.phone && (
                      <div className="text-sm text-white/70 flex items-center gap-1">
                        <FaPhone className="text-white/70" /> {userProfile.phone}
                      </div>
                    )}
                    {userProfile.email && (
                      <div className="text-sm text-white/70 flex items-center gap-1">
                        <FaEnvelope className="text-white/70" /> {userProfile.email}
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {currentLevelData && (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
                    <img
                      src={`${LEVELS_BASE}${currentLevelData.image}`}
                      alt={currentLevelData.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => { e.target.src = '/placeholder-city.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <h2 className="text-3xl font-bold drop-shadow-lg">{currentLevelData.region} – {currentLevelData.name}</h2>
                      <p className="text-sm opacity-95 drop-shadow">{currentLevelData.fact}</p>
                      
                      <div className="mt-3">
                        <div className="flex items-center gap-1 text-sm">
                          <FaGem className="text-amber-300" />
                          <span className="drop-shadow">
                            <strong>Очки странствий:</strong> {ordersSum}
                          </span>
                          <button
                            className="relative inline-flex items-center justify-center transition hover:text-amber-200 ml-0.5 self-center"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            onClick={() => setShowTooltip(!showTooltip)}
                          >
                            <FaInfoCircle className="text-white text-xs" />
                            {showTooltip && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                Очки странствий начисляются за каждый заказ и определяют ваш прогресс в путешествии по Италии. 
                                Бонусы можно тратить на скидки — они не влияют на очки странствий.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                              </div>
                            )}
                          </button>
                        </div>
                        <div className="flex justify-between text-xs opacity-90">
                          <span>До {nextLevelData?.name || 'максимума'}:</span>
                          <span>{nextLevelData ? nextLevelData.min_bonus - ordersSum : 0}</span>
                        </div>
                        <div className="w-full h-2 bg-white/30 rounded-full mt-1">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{width: `${Math.min(progress, 100)}%`}} />
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-white/80 flex items-center gap-2">
                        <FaCoins className="text-amber-300" />
                        <span>Бонусный баланс: <strong>{userBonuses}</strong> ₽</span>
                      </div>

                      <div className="mt-2 text-sm bg-amber-500/40 backdrop-blur-sm px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow">
                        <FaGift className="text-white text-base" />
                        {currentLevelData.bonus_description}
                      </div>
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border-t border-gray-100 pt-4"
                >
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FaGift className="text-amber-500" />
                      Ваши активные бонусы
                    </h3>
                    <button
                      className="relative inline-flex items-center justify-center transition hover:text-amber-500 ml-0.5 self-center"
                      onMouseEnter={() => setShowBonusTooltip(true)}
                      onMouseLeave={() => setShowBonusTooltip(false)}
                      onClick={() => setShowBonusTooltip(!showBonusTooltip)}
                    >
                      <FaInfoCircle className="text-gray-400 text-sm" />
                      {showBonusTooltip && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                          Все перечисленные бонусы активны и действуют одновременно. 
                          Для каждого типа показан максимальный доступный бонус.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const achieved = allLevels.filter(level => level.min_bonus <= ordersSum);
                      const bestBonuses = {};
                      achieved.forEach(level => {
                        const type = level.bonus_type;
                        const value = parseFloat(level.bonus_value) || 0;
                        if (['discount', 'cashback', 'referral_extra', 'review_extra'].includes(type)) {
                          if (!bestBonuses[type] || value > bestBonuses[type].value) {
                            bestBonuses[type] = { level, value };
                          }
                        } else {
                          if (!bestBonuses[type]) {
                            bestBonuses[type] = { level, value: 1 };
                          }
                        }
                      });
                      const filteredLevels = Object.values(bestBonuses).map(item => item.level);
                      return filteredLevels.map(level => {
                        const isCurrent = level.id === currentLevelData?.id;
                        let icon = <FaGift className="text-amber-500" />;
                        const desc = level.bonus_description;
                        if (desc.includes('скидка') || desc.includes('%')) icon = <FaPercent className="text-green-500" />;
                        else if (desc.includes('+')) icon = <FaPlus className="text-blue-500" />;
                        else if (desc.includes('доставка')) icon = <FaTruck className="text-indigo-500" />;
                        else if (desc.includes('начинка')) icon = <FaUtensils className="text-red-500" />;
                        else if (desc.includes('кэшбэк')) icon = <FaCoins className="text-yellow-500" />;
                        return (
                          <div 
                            key={level.id}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              isCurrent 
                                ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-400/30' 
                                : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 text-lg">{icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between w-full">
                                  <span className={`font-medium text-gray-800 ${isCurrent ? 'text-amber-700' : ''}`}>
                                    {level.region} – {level.name}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                      Текущий уровень
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 truncate">{level.bonus_description}</div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-gray-100 pt-4"
                >
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-amber-500" />
                    Карта путешествия
                  </h3>
                  <div 
                    ref={travelContainerRef}
                    className="space-y-2 max-h-60 overflow-y-auto overflow-x-visible px-3 py-2 custom-scrollbar"
                  >
                    {allLevels.map((level, idx) => {
                      const isUnlocked = level.min_bonus <= ordersSum;
                      const isCurrent = level.id === currentLevelData?.id;
                      const isNext = !isUnlocked && (idx === 0 || allLevels[idx-1]?.min_bonus <= ordersSum);
                      const isLocked = !isUnlocked && !isNext;
                      
                      let statusIcon, statusColor, statusBg;
                      if (isUnlocked) {
                        statusIcon = <FaCheckCircle className="text-green-500" />;
                        statusColor = 'text-green-600';
                        statusBg = 'bg-green-50 border-green-200';
                      } else if (isNext) {
                        statusIcon = <FaChevronRight className="text-amber-500 animate-pulse" />;
                        statusColor = 'text-amber-600';
                        statusBg = 'bg-amber-50 border-amber-200';
                      } else {
                        statusIcon = <FaLock className="text-gray-400" />;
                        statusColor = 'text-gray-400';
                        statusBg = 'bg-gray-50 border-gray-200 opacity-60';
                      }

                      return (
                        <div 
                          key={level.id}
                          ref={el => levelRefs.current[level.id] = el}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${statusBg} ${
                            isCurrent ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-white' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white shadow-sm flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                                {level.region} – {level.name}
                              </span>
                              {isCurrent && (
                                <Badge variant="primary" className="text-[10px] px-2 py-0.5">Вы здесь</Badge>
                              )}
                              {isNext && (
                                <Badge variant="warning" className="text-[10px] px-2 py-0.5">Следующий</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 truncate">{level.bonus_description}</div>
                            <div className="text-xs text-gray-400">Порог: {level.min_bonus} очков</div>
                          </div>
                          <div className="flex items-center gap-1 text-sm flex-shrink-0">
                            {statusIcon}
                            <span className={`text-xs font-medium ${statusColor}`}>
                              {isUnlocked ? 'Достигнут' : isNext ? 'Скоро' : 'Закрыт'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {currentLevelData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="border-t border-gray-100 pt-4 mt-4"
                  >
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaTag className="text-amber-500" />
                      Ваш промокод на скидку
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-sm text-gray-600">Скидка {currentLevelData.bonus_value}%:</div>
                          <div 
                            className="text-xl font-mono font-bold text-amber-600 select-all cursor-pointer hover:text-amber-700 transition"
                            onClick={() => {
                              const code = promoCode || '';
                              navigator.clipboard?.writeText(code).then(() => {
                                toast.success('Промокод скопирован!');
                              }).catch(() => {
                                toast.error('Не удалось скопировать');
                              });
                            }}
                          >
                            {promoCode || 'Загрузка...'}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const code = promoCode || '';
                            navigator.clipboard?.writeText(code).then(() => {
                              toast.success('Промокод скопирован!');
                            }).catch(() => {
                              toast.error('Не удалось скопировать');
                            });
                          }}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                        >
                          Скопировать
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Действует 30 дней. Можно использовать один раз.
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border-t border-gray-100 pt-4"
                >
                  <h3 className="font-semibold text-gray-700 mb-3">История бонусов</h3>
                  {bonusHistory.length === 0 ? (
                    <div className="text-sm text-gray-500">История бонусов пуста</div>
                  ) : (
                    <div 
                      className="space-y-2 max-h-60 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar"
                      style={{ scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}
                    >
                      {bonusHistory.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.6 }}
                          className="flex justify-between items-center py-2 border-b border-gray-50 text-sm"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-medium text-gray-700 truncate">{item.description}</div>
                            <div className="text-xs text-gray-400">{item.created_at.replace('T', ' ').slice(0, 16)}</div>
                          </div>
                          <span className={`font-semibold whitespace-nowrap ${item.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {item.amount > 0 ? '+' : ''}{item.amount} ₽
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {referralInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="border-t border-gray-100 pt-4 mt-4"
                  >
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                      <FaUsers /> Реферальная программа
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-sm text-gray-600">Ваш реферальный код:</div>
                          <div 
                            className="text-xl font-mono font-bold text-amber-600 select-all cursor-pointer hover:text-amber-700 transition"
                            onClick={() => {
                              const code = referralInfo.referral_code || '';
                              navigator.clipboard?.writeText(code).then(() => {
                                toast.success('Код скопирован!');
                              }).catch(() => {
                                toast.error('Не удалось скопировать');
                              });
                            }}
                          >
                            {referralInfo.referral_code}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const code = referralInfo.referral_code || '';
                            navigator.clipboard?.writeText(code).then(() => {
                              toast.success('Код скопирован!');
                            }).catch(() => {
                              toast.error('Не удалось скопировать');
                            });
                          }}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                        >
                          Скопировать код
                        </button>
                      </div>
                      <div className="mt-3 flex gap-6 text-sm">
                        <span>Приглашено: <strong>{referralInfo.total_referrals}</strong></span>
                        <span>Завершено: <strong>{referralInfo.completed_referrals}</strong></span>
                        <span>Бонус за реферала: <strong>{referralInfo.bonus_per_referral} ₽</strong></span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button variant="danger" onClick={handleLogout} className="w-full justify-center">
                    Выйти из аккаунта
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in py-8">
      <div className="max-w-sm mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
        >
          {isRegister ? 'Регистрация' : 'Вход'}
        </motion.h1>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4"
        >
          <Input
            type="text"
            placeholder="Логин"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className="slide-in-right"
            style={{ animationDelay: '0.1s' }}
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="slide-in-right"
            style={{ animationDelay: '0.2s' }}
          />

          {!isRegister && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 hover:underline transition">
                Забыли пароль?
              </Link>
            </div>
          )}

          {isRegister && (
            <>
              <Input
                type="password"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="slide-in-right"
                style={{ animationDelay: '0.25s' }}
              />
              <Input
                type="text"
                placeholder="Ваше имя *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="slide-in-right"
                style={{ animationDelay: '0.3s' }}
                required
              />
              <Input
                type="tel"
                placeholder="+7 999 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="slide-in-right"
                style={{ animationDelay: '0.35s' }}
                required
              />
              <Input
                type="email"
                placeholder="Email (необязательно)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="slide-in-right"
                style={{ animationDelay: '0.4s' }}
              />
              <Input
                type="text"
                placeholder="Реферальный код (необязательно)"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                className="slide-in-right"
                style={{ animationDelay: '0.45s' }}
              />
              <div className="space-y-2 pt-2">
                <ConsentCheckbox
                  type="personal"
                  checked={consentPersonal}
                  onChange={setConsentPersonal}
                />
                <ConsentCheckbox
                  type="offer"
                  checked={consentOffer}
                  onChange={setConsentOffer}
                />
              </div>
            </>
          )}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-sm text-center py-2 rounded-xl transition-all duration-300 ${
                message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}
            >
              {message.text}
            </motion.div>
          )}
          <Button type="submit" variant="primary" className="w-full justify-center">
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage({ text: '', type: '' });
              setPassword('');
              setConfirmPassword('');
              setFullName('');
              setPhone('');
              setEmail('');
              setConsentPersonal(false);
              setConsentOffer(false);
              setReferralCodeInput('');
            }}
            className="w-full text-sm text-gray-500 hover:text-amber-600 transition-all duration-200 hover:scale-105"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default Profile;