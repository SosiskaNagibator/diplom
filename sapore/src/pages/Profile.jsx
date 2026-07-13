import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../constants/api';
import { STORAGE_KEYS } from '../constants/storage';
import { getLevel, getNextLevel } from '../utils/bonusUtils';
import { Button, Input, Card, Badge, LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useBonuses, useBonusHistory } from '../hooks/useProfile';

function Profile() {
  const navigate = useNavigate();
  const { userLogin, userProfile, login, logout, loading: authLoading } = useAuth();

  // Используем React Query для бонусов
  const { data: bonuses = 0, isLoading: isBonusesLoading } = useBonuses(userLogin);
  const { data: bonusHistory = [], isLoading: isHistoryLoading } = useBonusHistory(userLogin);

  const [isLoggedIn, setIsLoggedIn] = useState(!!userLogin);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

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
    }

    try {
      const result = await login(
        loginInput,
        password,
        isRegister,
        { fullName, phone, email }
      );

      if (result.success) {
        showMessage(`Добро пожаловать, ${loginInput}!`, 'success');
        setLoginInput('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
        setEmail('');
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

  // Анимации
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

  if (isLoading) return <LoadingSpinner text="Загрузка профиля..." />;

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
                    className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-4xl animate-bounce-in"
                  >
                    {level.emoji}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-2xl font-bold">{userLogin}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary" className={level.bg + ' ' + level.color}>
                        {level.emoji} {level.name}
                      </Badge>
                      {userProfile.fullName && (
                        <span className="text-sm text-white/80">({userProfile.fullName})</span>
                      )}
                    </div>
                    {userProfile.phone && (
                      <div className="text-sm text-white/70">📞 {userProfile.phone}</div>
                    )}
                    {userProfile.email && (
                      <div className="text-sm text-white/70">✉️ {userProfile.email}</div>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="scale-in"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">🎁 Бонусный баланс</span>
                    <motion.span
                      className="text-2xl font-bold text-amber-600"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      key={bonuses} // Реагирует на изменение бонусов
                    >
                      {bonuses} ₽
                    </motion.span>
                  </div>
                  {nextLevel && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>До {nextLevel.name}</span>
                        <span>{nextLevel.need} ₽</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                          className="bg-amber-500 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (bonuses / (bonuses + nextLevel.need)) * 100)}%` }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          key={bonuses}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

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

  // Форма входа / регистрации (без изменений)
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