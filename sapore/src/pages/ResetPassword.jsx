import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from '../components/ui';
import { API_BASE } from '../constants/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setMessage({ text: 'Неверная ссылка для сброса', type: 'error' });
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setMessage({ text: 'Пароль должен быть не менее 4 символов', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Пароли не совпадают', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'password_reset_confirm');
      formData.append('token', token);
      formData.append('email', email);
      formData.append('password', newPassword);
      const res = await fetch(API_BASE, { method: 'POST', body: formData });
      const data = await res.json();
      setMessage({ text: data.message, type: data.status === 'success' ? 'success' : 'error' });
      if (data.status === 'success') {
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch {
      setMessage({ text: 'Ошибка соединения', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return <div className="text-center py-12 text-red-500">Неверная ссылка</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-6">Новый пароль</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">
        <Input
          type="password"
          placeholder="Новый пароль (минимум 4 символа)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-3"
        />
        <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить пароль'}
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

export default ResetPassword;