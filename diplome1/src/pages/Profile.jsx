import { useState, useEffect } from 'react'

const API_URL = 'http://localhost/api.php'

function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userLogin, setUserLogin] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [bonuses, setBonuses] = useState(0)

  const fetchBonuses = async (login) => {
    try {
      const res = await fetch(`${API_URL}?action=get_bonuses&login=${encodeURIComponent(login)}`)
      const data = await res.json()
      if (data.status === 'success') {
        setBonuses(data.bonuses)
      }
    } catch (err) {
      console.error('Ошибка загрузки бонусов:', err)
    }
  }

  useEffect(() => {
    const savedLogin = localStorage.getItem('userLogin')
    if (savedLogin) {
      setUserLogin(savedLogin)
      setIsLoggedIn(true)
      fetchBonuses(savedLogin)
    }
  }, [])

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })

    if (!login.trim() || !password.trim()) {
      showMessage('Заполните все поля', 'error')
      return
    }
    if (login.length < 3) {
      showMessage('Логин должен быть не менее 3 символов', 'error')
      return
    }
    if (password.length < 4) {
      showMessage('Пароль должен быть не менее 4 символов', 'error')
      return
    }
    if (isRegister && confirmPassword !== password) {
      showMessage('Пароли не совпадают', 'error')
      return
    }

    try {
      const formData = new URLSearchParams()
      formData.append('Login', login)
      formData.append('Password', password)
      const action = isRegister ? 'register' : 'login'
      formData.append('action', action)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })

      const data = await response.json()

      if (data.status === 'success' || data.status === 'registered') {
        localStorage.setItem('userLogin', login)
        setUserLogin(login)
        setIsLoggedIn(true)
        setBonuses(data.bonuses || 0)
        showMessage(`Добро пожаловать, ${login}!`, 'success')
        setLogin('')
        setPassword('')
        setConfirmPassword('')
      } else if (data.status === 'not_found') {
        showMessage('Такого аккаунта нет. Пожалуйста, зарегистрируйтесь!', 'error')
        setIsRegister(true)
        setPassword('')
        setConfirmPassword('')
      } else if (data.status === 'error') {
        showMessage(data.message || 'Ошибка сервера', 'error')
      } else {
        showMessage('Неизвестная ошибка', 'error')
      }
    } catch (err) {
      showMessage('Не удалось соединиться с сервером.', 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userLogin')
    setIsLoggedIn(false)
    setUserLogin('')
    setBonuses(0)
    showMessage('Вы вышли из аккаунта', 'success')
  }

  // Определение уровня по бонусам
  const getLevel = (points) => {
    if (points >= 1000) return { name: 'Золотой', emoji: '👑', color: 'text-yellow-500', bg: 'bg-yellow-100' }
    if (points >= 500) return { name: 'Серебряный', emoji: '🥈', color: 'text-gray-400', bg: 'bg-gray-100' }
    if (points >= 100) return { name: 'Бронзовый', emoji: '🥉', color: 'text-amber-700', bg: 'bg-amber-100' }
    return { name: 'Новичок', emoji: '🌱', color: 'text-green-500', bg: 'bg-green-100' }
  }

  const level = getLevel(bonuses)
  const nextLevel = bonuses < 100 ? { name: 'Бронзовый', need: 100 - bonuses } :
                   bonuses < 500 ? { name: 'Серебряный', need: 500 - bonuses } :
                   bonuses < 1000 ? { name: 'Золотой', need: 1000 - bonuses } : null

  if (isLoggedIn) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Профиль</h1>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-4xl">
                {level.emoji}
              </div>
              <div>
                <div className="text-2xl font-bold">{userLogin}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-0.5 rounded-full text-sm font-semibold ${level.bg} ${level.color}`}>
                    {level.emoji} {level.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">🎁 Бонусный баланс</span>
                <span className="text-2xl font-bold text-amber-600">{bonuses} ₽</span>
              </div>
              {nextLevel && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>До {nextLevel.name}</span>
                    <span>{nextLevel.need} ₽</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (bonuses / (bonuses + nextLevel.need)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">История бонусов</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span>Заказ #1001</span>
                  <span className="text-green-600">+50 ₽</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span>Заказ #1002</span>
                  <span className="text-green-600">+30 ₽</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Списано за заказ #1003</span>
                  <span className="text-red-500">-20 ₽</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{isRegister ? 'Регистрация' : 'Вход'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-sm mx-auto space-y-4">
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        )}
        {message.text && (
          <div className={`text-sm text-center py-2 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message.text}
          </div>
        )}
        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg">
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister)
            setMessage({ text: '', type: '' })
            setPassword('')
            setConfirmPassword('')
          }}
          className="w-full text-sm text-gray-500 hover:text-amber-600 transition underline"
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}

export default Profile




{/* <div>
      <form action="http://localhost/api.php" method='post'>
        <label>Логин</label>                             <br />
        <input type="text" name="Login"/>                  <br />
        <label>Пароль</label>                               <br />
        <input type="text" name="Password"/>                 <br />
        <button type='submit'>Войти</button>                  <br />
      </form>
    </div> */}