import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userLogin, setUserLogin] = useState(null);
  const [role, setRole] = useState(null);
  const [bonuses, setBonuses] = useState(0);
  const [userProfile, setUserProfile] = useState({ fullName: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLogin = localStorage.getItem('userLogin');
    const savedRole = localStorage.getItem('userRole');
    if (savedLogin) {
      setUserLogin(savedLogin);
      setRole(savedRole || null);
      fetchUserData(savedLogin);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async (login) => {
    try {
      const res = await fetch(`http://localhost/api.php?action=get_user_profile&login=${encodeURIComponent(login)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setUserProfile({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          email: data.user.email || ''
        });
        setBonuses(data.bonuses || 0);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (login, password, isRegister = false, profileData = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('Login', login);
      formData.append('Password', password);
      formData.append('action', isRegister ? 'register' : 'login');
      if (isRegister) {
        formData.append('FullName', profileData.fullName || '');
        formData.append('Phone', profileData.phone || '');
        formData.append('Email', profileData.email || '');
        // ДОБАВЛЯЕМ ПЕРЕДАЧУ СОГЛАСИЙ
        formData.append('consent_personal_data', profileData.consentPersonal ? 'true' : 'false');
        formData.append('consent_offer', profileData.consentOffer ? 'true' : 'false');
      }

      const response = await fetch('http://localhost/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();

      if (data.status === 'success' || data.status === 'registered') {
        localStorage.setItem('userLogin', login);
        setUserLogin(login);
        if (data.role === 'admin') {
          localStorage.setItem('userRole', 'admin');
          setRole('admin');
        } else {
          localStorage.removeItem('userRole');
          setRole(null);
        }
        if (data.user) {
          setUserProfile({
            fullName: data.user.fullName || '',
            phone: data.user.phone || '',
            email: data.user.email || ''
          });
        }
        setBonuses(data.bonuses || 0);
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Ошибка входа' };
      }
    } catch (err) {
      return { success: false, message: 'Ошибка соединения с сервером' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userRole');
    setUserLogin(null);
    setRole(null);
    setBonuses(0);
    setUserProfile({ fullName: '', phone: '', email: '' });
  }, []);

  const updateBonuses = useCallback(async (login) => {
    await fetchUserData(login);
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ 
      userLogin, 
      role, 
      bonuses, 
      userProfile, 
      loading, 
      login, 
      logout, 
      updateBonuses 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};