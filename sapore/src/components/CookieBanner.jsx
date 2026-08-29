import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCookieBite, FaCheckCircle } from 'react-icons/fa';

const COOKIE_CONSENT_KEY = 'cookieConsent';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden md:flex md:items-center md:justify-between md:p-6 p-4"
        >
          <div className="flex items-start gap-4 md:items-center">
            <div className="hidden md:flex text-amber-500 text-4xl flex-shrink-0">
              <FaCookieBite />
            </div>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-800 flex items-center gap-2 text-base">
                <span className="md:hidden text-amber-500 text-xl">🍪</span>
                Мы используем файлы cookie
              </p>
              <p className="mt-1 leading-relaxed">
                Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента.
                Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-amber-600 hover:text-amber-800 font-medium underline-offset-2 hover:underline transition"
                >
                  Политикой конфиденциальности
                </Link>
                . Вы можете настроить использование cookie в настройках браузера или отклонить их.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-6 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
            >
              Отклонить
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium text-white bg-amber-500 rounded-full hover:bg-amber-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <FaCheckCircle className="text-white" />
              Принять все
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;