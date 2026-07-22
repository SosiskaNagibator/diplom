import { useState } from 'react';
import { Button, Input } from '../components/ui';
import { API_BASE } from '../constants/api';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'password_reset_request');
      formData.append('email', email);
      const res = await fetch(API_BASE, { method: 'POST', body: formData });
      const data = await res.json();
      setMessage({ text: data.message, type: data.status === 'success' ? 'success' : 'error' });
      if (data.status === 'success') setEmail('');
    } catch {
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-6">Восстановление пароля</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">
        <Input
          type="email"
          placeholder="Ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
          {loading ? 'Отправка...' : 'Отправить ссылку'}
        </Button>
        {message.text && (
          <div className={`mt-4 text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default ForgotPassword;