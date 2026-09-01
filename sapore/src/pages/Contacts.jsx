import { useState } from 'react';
import { motion } from 'framer-motion';
import MapPicker from '../components/MapPicker/MapPicker';
import { Button, Input } from '../components/ui';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaTelegramPlane, FaVk, FaYoutube } from 'react-icons/fa';
import { API_BASE } from '../constants/api'; // FIXED: импорт константы

function Contacts() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const socialLink = 'https://vk.com/video7266823_78234740';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', text: 'Заполните все поля' });
      return;
    }

    setLoading(true);
    try {
      // FIXED: используем API_BASE вместо локальной константы
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'contact', ...formData }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setStatus({ type: 'success', text: '✅ Сообщение отправлено! Мы свяжемся с вами.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', text: '❌ ' + data.message });
      }
    } catch (err) {
      setStatus({ type: 'error', text: '❌ Ошибка соединения с сервером' });
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.5, ease: 'easeOut' },
    }),
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="fade-in max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Контакты
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Левая колонка */}
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={0} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Свяжитесь с нами</h2>
            <ul className="space-y-4 text-gray-700">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <FaPhone className="text-2xl text-amber-500" />
                <div>
                  <div className="font-medium">Телефон</div>
                  <a href="tel:+79999999999" className="text-amber-600 hover:underline">+7 (999) 999-99-99</a>
                </div>
              </motion.li>

              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <FaEnvelope className="text-2xl text-amber-500" />
                <div>
                  <div className="font-medium">Email</div>
                  <a href="mailto:info@sapore.ru" className="text-amber-600 hover:underline">info@sapore.ru</a>
                </div>
              </motion.li>

              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <FaMapMarkerAlt className="text-2xl text-amber-500" />
                <div>
                  <div className="font-medium">Адрес</div>
                  <div>г. Ростов-на-Дону, ул. Социалистическая, 141</div>
                </div>
              </motion.li>

              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <FaClock className="text-2xl text-amber-500" />
                <div>
                  <div className="font-medium">Часы работы</div>
                  <div>Пн–Вс: 10:00 – 23:00</div>
                </div>
              </motion.li>
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Мы в соцсетях</h3>
            <div className="flex gap-5 text-2xl text-gray-500">
              <a href={socialLink} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" aria-label="VK">
                <FaVk />
              </a>
              <a href={socialLink} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" aria-label="Telegram">
                <FaTelegramPlane />
              </a>
              <a href={socialLink} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors duration-200 hover:scale-110 transform" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Правая колонка – форма */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          custom={1}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Напишите нам</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Input
                type="text"
                name="name"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Input
                type="email"
                name="email"
                placeholder="Ваш Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <textarea
                name="message"
                placeholder="Ваше сообщение"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить сообщение'}
              </Button>
            </motion.div>
            {status.text && (
              <div className={`text-sm p-3 rounded-xl ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {status.text}
              </div>
            )}
          </form>
        </motion.div>
      </div>

      {/* Карта */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Мы на карте</h2>
        <div className="h-64 rounded-xl overflow-hidden">
          <MapPicker onAddressSelect={() => {}} initialAddress="г. Ростов-на-Дону, ул. Социалистическая, 141" />
        </div>
        <div className="mt-2 text-sm text-gray-500 text-center">
          📍 г. Ростов-на-Дону, ул. Социалистическая, 141
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Contacts;