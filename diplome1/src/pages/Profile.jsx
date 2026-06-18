import { useState, useEffect } from 'react';
import '../styles/Profile.css';

const API_URL = 'http://localhost/api.php';

function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLogin, setUserLogin] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const savedLogin = localStorage.getItem('userLogin');
    if (savedLogin) {
      setUserLogin(savedLogin);
      setIsLoggedIn(true);
    }
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!login.trim() || !password.trim()) {
      showMessage('Заполните все поля', 'error');
      return;
    }
    if (login.length < 3) {
      showMessage('Логин должен быть не менее 3 символов', 'error');
      return;
    }
    if (password.length < 4) {
      showMessage('Пароль должен быть не менее 4 символов', 'error');
      return;
    }
    if (isRegister && confirmPassword !== password) {
      showMessage('Пароли не совпадают', 'error');
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('Login', login);
      formData.append('Password', password);
      const action = isRegister ? 'register' : 'login';
      formData.append('action', action);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (data.status === 'success') {
        localStorage.setItem('userLogin', login);
        setUserLogin(login);
        setIsLoggedIn(true);
        showMessage(`Добро пожаловать, ${login}!`, 'success');
        setLogin('');
        setPassword('');
        setConfirmPassword('');
      } 
      else if (data.status === 'registered') {
        localStorage.setItem('userLogin', login);
        setUserLogin(login);
        setIsLoggedIn(true);
        showMessage(`Регистрация успешна! Добро пожаловать, ${login}`, 'success');
        setLogin('');
        setPassword('');
        setConfirmPassword('');
      } 
      else if (data.status === 'not_found') {
        showMessage('Такого аккаунта нет. Пожалуйста, зарегистрируйтесь!', 'error');
        setIsRegister(true);
        setPassword('');
        setConfirmPassword('');
      } 
      else if (data.status === 'error') {
        showMessage(data.message || 'Ошибка сервера', 'error');
      } else {
        showMessage('Неизвестная ошибка', 'error');
      }
    } catch (err) {
      showMessage('Не удалось соединиться с сервером.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userLogin');
    setIsLoggedIn(false);
    setUserLogin('');
    showMessage('Вы вышли из аккаунта', 'success');
  };

  if (isLoggedIn) {
    return (
      <div>
        <h1>Профиль</h1>
        <div className="profile-info">
          <div className="profile-avatar">👤</div>
          <p className="profile-welcome">Добро пожаловать, <strong>{userLogin}</strong>!</p>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>{isRegister ? 'Регистрация' : 'Вход'}</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        {message.text && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </div>
        )}
        <button type="submit" className="submit-btn">
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage({ text: '', type: '' });
            setPassword('');
            setConfirmPassword('');
          }}
          className="switch-btn"
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
}

export default Profile;





{/* <div>
      <form action="http://localhost/api.php" method='post'>
        <label>Логин</label>                             <br />
        <input type="text" name="Login"/>                  <br />
        <label>Пароль</label>                               <br />
        <input type="text" name="Password"/>                 <br />
        <button type='submit'>Войти</button>                  <br />
      </form>
    </div> */}