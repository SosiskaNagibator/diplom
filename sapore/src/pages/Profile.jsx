import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../constants/api';
import { STORAGE_KEYS } from '../constants/storage';
import { getLevel, getNextLevel } from '../utils/bonusUtils';
import { Button, Input, Card, Badge, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useBonuses, useBonusHistory } from '../hooks/useProfile';
import { useLevels, useUserLevel } from '../hooks/useLevels';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import { useQuery } from '@tanstack/react-query';
import { FaPhone, FaEnvelope, FaUsers, FaGift } from 'react-icons/fa';
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

function Profile() {
  const navigate = useNavigate();
  const { userLogin, userProfile, login, logout, loading: authLoading } = useAuth();

  const { data: bonuses = 0, isLoading: isBonusesLoading } = useBonuses(userLogin);
  const { data: bonusHistory = [], isLoading: isHistoryLoading } = useBonusHistory(userLogin);
  const { data: referralInfo } = useReferralInfo(userLogin);

  const { data: levelsData } = useLevels();
  const { data: userLevelData, refetch: refetchUserLevel } = useUserLevel(userLogin);
  const allLevels = levelsData?.levels || [];
  const currentLevelData = userLevelData?.current_level;
  const nextLevelData = userLevelData?.next_level;
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

  const level = getLevel(bonuses);
  const nextLevel = getNextLevel(bonuses);

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
                      <Badge variant="primary" className={level.bg + ' ' + level.color}>
                        {level.name}
                      </Badge>
                      {userProfile.fullName && (
                        <span className="text-sm text-white/80">({userProfile.fullName})</span>
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
                {/* Карточка уровня с иконкой FaGift */}
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
                        <div className="flex justify-between text-sm">
                          <span className="drop-shadow">Бонусы: {userBonuses}</span>
                          <span className="drop-shadow">До {nextLevelData?.name || 'максимума'}: {nextLevelData ? nextLevelData.min_bonus - userBonuses : 0} бонусов</span>
                        </div>
                        <div className="w-full h-2 bg-white/30 rounded-full mt-1">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{width: `${Math.min(progress, 100)}%`}} />
                        </div>
                      </div>
                      <div className="mt-3 text-sm bg-amber-500/40 backdrop-blur-sm px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow">
                        <FaGift className="text-white text-base" />
                        {currentLevelData.bonus_description}
                      </div>
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
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
                    transition={{ delay: 0.6 }}
                    className="border-t border-gray-100 pt-4 mt-4"
                  >
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                      <FaUsers /> Реферальная программа
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-sm text-gray-600">Ваш реферальный код:</div>
                          <div className="text-xl font-mono font-bold text-amber-600 select-all">{referralInfo.referral_code}</div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(referralInfo.referral_link);
                            alert('Ссылка скопирована!');
                          }}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                        >
                          Скопировать ссылку
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
                  transition={{ delay: 0.7 }}
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
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={consentPersonal}
                    onChange={(e) => setConsentPersonal(e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <span>
                    Я согласен на <Link to="/privacy" target="_blank" className="text-amber-600 underline hover:text-amber-700">обработку персональных данных</Link>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={consentOffer}
                    onChange={(e) => setConsentOffer(e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <span>
                    Я принимаю <Link to="/offer" target="_blank" className="text-amber-600 underline hover:text-amber-700">пользовательское соглашение и оферту</Link>
                  </span>
                </label>
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