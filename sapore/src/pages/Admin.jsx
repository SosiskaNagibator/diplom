import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../constants/api';
import { ORDER_STATUSES } from '../constants/statuses';
import { STORAGE_KEYS } from '../constants/storage';
import { Button, Input, Card, Badge, LoadingSpinner } from '../components/ui';
import { getImageUrl } from '../utils/imageUtils'; // Новая утилита

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pizzas');
  const [pizzas, setPizzas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingPizza, setEditingPizza] = useState(null);
  const [pizzaForm, setPizzaForm] = useState({ name: '', category: '', description: '', price: '', image: '', sizes: '1,2,3' });
  const [selectedImageFile, setSelectedImageFile] = useState(null); // Новое состояние

  const [editingSize, setEditingSize] = useState(null);
  const [sizeForm, setSizeForm] = useState({ name: '', label: '', circle_size: '', price: '0', sort_order: '0' });

  const [editingSauce, setEditingSauce] = useState(null);
  const [sauceForm, setSauceForm] = useState({ name: '', icon: '', price: '0', sort_order: '0' });

  const [editingTopping, setEditingTopping] = useState(null);
  const [toppingForm, setToppingForm] = useState({ name: '', icon: '', price: '0', sort_order: '0' });

  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', sort_order: 0 });

  useEffect(() => {
    const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (role !== 'admin') {
      navigate('/profile');
      return;
    }
    const fetchAll = async () => {
      await Promise.all([
        fetchPizzas(),
        fetchOrders(),
        fetchUsers(),
        fetchSizes(),
        fetchSauces(),
        fetchToppings(),
        fetchCategories()
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // ---- Запросы к API ----
  const fetchPizzas = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_pizzas', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setPizzas(data.pizzas);
  };

  const fetchOrders = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_orders', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setOrders(data.orders);
  };

  const fetchUsers = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_users', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setUsers(data.users);
  };

  const fetchSizes = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_sizes', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setSizes(data.sizes);
  };

  const fetchSauces = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_sauces', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setSauces(data.sauces);
  };

  const fetchToppings = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_toppings', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setToppings(data.toppings);
  };

  const fetchCategories = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_categories', login_admin: 'admin' })
    });
    const data = await res.json();
    if (data.status === 'success') setCategories(data.categories);
  };

  // ---- Пиццы (с загрузкой файлов) ----
  const handlePizzaSubmit = async (e) => {
    e.preventDefault();
    const action = editingPizza ? 'admin_update_pizza' : 'admin_add_pizza';
    
    // Используем FormData для отправки файла
    const formData = new FormData();
    formData.append('action', action);
    formData.append('login_admin', 'admin');
    formData.append('name', pizzaForm.name);
    formData.append('category', pizzaForm.category);
    formData.append('description', pizzaForm.description);
    formData.append('price', pizzaForm.price);
    formData.append('sizes', pizzaForm.sizes);
    if (editingPizza) {
      formData.append('id', editingPizza.id);
    }
    if (selectedImageFile) {
      formData.append('image', selectedImageFile); // добавляем файл
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      body: formData, // браузер сам поставит Content-Type: multipart/form-data
    });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setPizzaForm({ name: '', category: '', description: '', price: '', image: '', sizes: '1,2,3' });
      setEditingPizza(null);
      setSelectedImageFile(null);
      fetchPizzas();
    }
  };

  const handleEditPizza = (p) => {
    setEditingPizza(p);
    setPizzaForm(p);
    setSelectedImageFile(null); // сбрасываем выбранный файл
  };

  const handleDeletePizza = async (id) => {
    if (!confirm('Удалить пиццу?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_pizza', login_admin: 'admin', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchPizzas();
  };

  // ---- Пользователи ----
  const handleUpdateUserBonus = async (login, newBalance) => {
    if (!confirm(`Изменить баланс пользователя ${login} на ${newBalance}?`)) return;
    const payload = new URLSearchParams({ action: 'admin_update_user_bonus', login_admin: 'admin', login, balance: newBalance });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchUsers();
  };

  const handleUpdateUser = async (login, fullName, phone, email, balance) => {
    if (!confirm(`Обновить данные пользователя ${login}?`)) return;
    try {
      const profilePayload = new URLSearchParams({
        action: 'admin_update_user',
        login_admin: 'admin',
        login,
        fullName,
        phone,
        email
      });
      await fetch(API_BASE, { method: 'POST', body: profilePayload });
      if (balance !== undefined && balance !== null) {
        const bonusPayload = new URLSearchParams({
          action: 'admin_update_user_bonus',
          login_admin: 'admin',
          login,
          balance
        });
        await fetch(API_BASE, { method: 'POST', body: bonusPayload });
      }
      alert('Данные обновлены');
      fetchUsers();
    } catch (err) {
      alert('Ошибка обновления');
    }
  };

  // ---- Размеры ----
  const handleSizeSubmit = async (e) => {
    e.preventDefault();
    const action = editingSize ? 'admin_update_size' : 'admin_add_size';
    const payload = new URLSearchParams({ action, login_admin: 'admin', ...sizeForm });
    if (editingSize) payload.append('id', editingSize.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setSizeForm({ name: '', label: '', circle_size: '', price: '0', sort_order: '0' });
      setEditingSize(null);
      fetchSizes();
    }
  };

  const handleEditSize = (s) => {
    setEditingSize(s);
    setSizeForm(s);
  };

  const handleDeleteSize = async (id) => {
    if (!confirm('Удалить размер?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_size', login_admin: 'admin', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchSizes();
  };

  // ---- Соусы ----
  const handleSauceSubmit = async (e) => {
    e.preventDefault();
    const action = editingSauce ? 'admin_update_sauce' : 'admin_add_sauce';
    const payload = new URLSearchParams({ action, login_admin: 'admin', ...sauceForm });
    if (editingSauce) payload.append('id', editingSauce.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setSauceForm({ name: '', icon: '', price: '0', sort_order: '0' });
      setEditingSauce(null);
      fetchSauces();
    }
  };

  const handleEditSauce = (s) => {
    setEditingSauce(s);
    setSauceForm(s);
  };

  const handleDeleteSauce = async (id) => {
    if (!confirm('Удалить соус?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_sauce', login_admin: 'admin', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchSauces();
  };

  // ---- Начинки ----
  const handleToppingSubmit = async (e) => {
    e.preventDefault();
    const action = editingTopping ? 'admin_update_topping' : 'admin_add_topping';
    const payload = new URLSearchParams({ action, login_admin: 'admin', ...toppingForm });
    if (editingTopping) payload.append('id', editingTopping.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setToppingForm({ name: '', icon: '', price: '0', sort_order: '0' });
      setEditingTopping(null);
      fetchToppings();
    }
  };

  const handleEditTopping = (t) => {
    setEditingTopping(t);
    setToppingForm(t);
  };

  const handleDeleteTopping = async (id) => {
    if (!confirm('Удалить начинку?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_topping', login_admin: 'admin', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchToppings();
  };

  // ---- Категории ----
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const action = editingCategory ? 'admin_update_category' : 'admin_add_category';
    const payload = new URLSearchParams({ action, login_admin: 'admin', ...categoryForm });
    if (editingCategory) payload.append('id', editingCategory.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setCategoryForm({ name: '', sort_order: 0 });
      setEditingCategory(null);
      fetchCategories();
    }
  };

  const handleEditCategory = (c) => {
    setEditingCategory(c);
    setCategoryForm(c);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Удалить категорию? Все пиццы с этой категорией потеряют связь.')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_category', login_admin: 'admin', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchCategories();
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const payload = new URLSearchParams({ action: 'admin_update_order_status', login_admin: 'admin', order_id: orderId, status: newStatus });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchOrders();
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER_LOGIN);
    navigate('/profile');
  };

  if (loading) return <LoadingSpinner text="Загрузка админ-панели..." />;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Админ-панель</h1>
        <Button variant="danger" onClick={handleLogout}>Выйти из админки</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['pizzas','orders','users','sizes','sauces','toppings','categories'].map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm"
          >
            {tab === 'pizzas' ? 'Пиццы' :
             tab === 'orders' ? 'Заказы' :
             tab === 'users' ? 'Пользователи' :
             tab === 'sizes' ? 'Размеры' :
             tab === 'sauces' ? 'Соусы' :
             tab === 'toppings' ? 'Начинки' :
             'Категории'}
          </Button>
        ))}
      </div>

      {/* === Пиццы (обновлено) === */}
      {activeTab === 'pizzas' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingPizza ? 'Редактировать пиццу' : 'Добавить пиццу'}</h2>
            <form onSubmit={handlePizzaSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={pizzaForm.name} onChange={e => setPizzaForm({...pizzaForm, name: e.target.value})} placeholder="Название" required />
              <Input name="category" value={pizzaForm.category} onChange={e => setPizzaForm({...pizzaForm, category: e.target.value})} placeholder="Категория" />
              <Input name="price" value={pizzaForm.price} onChange={e => setPizzaForm({...pizzaForm, price: e.target.value})} placeholder="Цена" type="number" required />
              <Input name="sizes" value={pizzaForm.sizes} onChange={e => setPizzaForm({...pizzaForm, sizes: e.target.value})} placeholder="ID размеров (через запятую)" />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSelectedImageFile(file);
                  }}
                  className="w-full p-2 border border-gray-200 rounded-xl"
                />
                {editingPizza && pizzaForm.image && !selectedImageFile && (
                  <div className="mt-2 text-sm text-gray-500">
                    Текущее изображение: {pizzaForm.image}
                  </div>
                )}
                {selectedImageFile && (
                  <div className="mt-2 text-sm text-green-600">
                    Выбран файл: {selectedImageFile.name}
                  </div>
                )}
              </div>
              <textarea name="description" value={pizzaForm.description} onChange={e => setPizzaForm({...pizzaForm, description: e.target.value})} placeholder="Описание" className="border p-2 rounded col-span-2" rows="2" />
              <Button type="submit" variant="primary" className="col-span-2">{editingPizza ? 'Обновить' : 'Добавить'}</Button>
              {editingPizza && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingPizza(null); setPizzaForm({ name: '', category: '', description: '', price: '', image: '', sizes: '1,2,3' }); setSelectedImageFile(null); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th className="p-3 text-left">ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Изображение</th><th>Действия</th></tr></thead>
              <tbody>{pizzas.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.price} ₽</td>
                  <td>
                    {p.image && (
                      <img src={getImageUrl(p.image)} alt={p.name} className="h-12 w-12 object-cover rounded-lg" />
                    )}
                  </td>
                  <td className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditPizza(p)} className="px-3 py-1 text-sm">✎</Button>
                    <Button variant="danger" onClick={() => handleDeletePizza(p.id)} className="px-3 py-1 text-sm">✕</Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* === Заказы === */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="p-3 text-left">№</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Адрес</th><th>Действие</th></tr></thead>
            <tbody>{orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.order_number}</td>
                <td>{o.user_login}</td>
                <td>{o.total} ₽</td>
                <td><Badge variant="primary">{o.status}</Badge></td>
                <td>{o.delivery_address || '—'}</td>
                <td>
                  <select value={o.status} onChange={e => handleUpdateOrderStatus(o.id, e.target.value)} className="border p-1 rounded">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* === Пользователи === */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr><th>Логин</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Бонусы</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.Login} className="border-t">
                  <td className="p-3">{u.Login}</td>
                  <td>
                    <Input type="text" defaultValue={u.full_name || ''} id={`name-${u.Login}`} className="w-32" />
                  </td>
                  <td>
                    <Input type="text" defaultValue={u.phone || ''} id={`phone-${u.Login}`} className="w-32" />
                  </td>
                  <td>
                    <Input type="email" defaultValue={u.email || ''} id={`email-${u.Login}`} className="w-32" />
                  </td>
                  <td>
                    <Input type="number" defaultValue={u.balance} id={`bonus-${u.Login}`} className="w-24" />
                  </td>
                  <td>
                    <Button variant="primary" onClick={() => {
                      const name = document.getElementById(`name-${u.Login}`).value;
                      const phone = document.getElementById(`phone-${u.Login}`).value;
                      const email = document.getElementById(`email-${u.Login}`).value;
                      const balance = parseInt(document.getElementById(`bonus-${u.Login}`).value);
                      if (!isNaN(balance)) handleUpdateUser(u.Login, name, phone, email, balance);
                    }} className="px-3 py-1 text-sm">Сохранить</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Размеры === */}
      {activeTab === 'sizes' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingSize ? 'Редактировать размер' : 'Добавить размер'}</h2>
            <form onSubmit={handleSizeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={sizeForm.name} onChange={e => setSizeForm({...sizeForm, name: e.target.value})} placeholder="Название (например, Маленькая)" required />
              <Input name="label" value={sizeForm.label} onChange={e => setSizeForm({...sizeForm, label: e.target.value})} placeholder="Метка (например, 25 см)" required />
              <Input name="circle_size" value={sizeForm.circle_size} onChange={e => setSizeForm({...sizeForm, circle_size: e.target.value})} placeholder="Диаметр круга (px)" type="number" required />
              <Input name="price" value={sizeForm.price} onChange={e => setSizeForm({...sizeForm, price: e.target.value})} placeholder="Доп. цена" type="number" />
              <Input name="sort_order" value={sizeForm.sort_order} onChange={e => setSizeForm({...sizeForm, sort_order: e.target.value})} placeholder="Порядок" type="number" />
              <Button type="submit" variant="primary" className="col-span-2">{editingSize ? 'Обновить' : 'Добавить'}</Button>
              {editingSize && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingSize(null); setSizeForm({ name: '', label: '', circle_size: '', price: '0', sort_order: '0' }); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th>ID</th><th>Название</th><th>Метка</th><th>Диаметр</th><th>Цена</th><th>Действия</th></tr></thead>
              <tbody>{sizes.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.label}</td>
                  <td>{s.circle_size}px</td>
                  <td>{s.price} ₽</td>
                  <td className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditSize(s)} className="px-3 py-1 text-sm">✎</Button>
                    <Button variant="danger" onClick={() => handleDeleteSize(s.id)} className="px-3 py-1 text-sm">✕</Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* === Соусы === */}
      {activeTab === 'sauces' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingSauce ? 'Редактировать соус' : 'Добавить соус'}</h2>
            <form onSubmit={handleSauceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={sauceForm.name} onChange={e => setSauceForm({...sauceForm, name: e.target.value})} placeholder="Название" required />
              <Input name="icon" value={sauceForm.icon} onChange={e => setSauceForm({...sauceForm, icon: e.target.value})} placeholder="Иконка (эмодзи)" required />
              <Input name="price" value={sauceForm.price} onChange={e => setSauceForm({...sauceForm, price: e.target.value})} placeholder="Доп. цена" type="number" />
              <Input name="sort_order" value={sauceForm.sort_order} onChange={e => setSauceForm({...sauceForm, sort_order: e.target.value})} placeholder="Порядок" type="number" />
              <Button type="submit" variant="primary" className="col-span-2">{editingSauce ? 'Обновить' : 'Добавить'}</Button>
              {editingSauce && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingSauce(null); setSauceForm({ name: '', icon: '', price: '0', sort_order: '0' }); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th>ID</th><th>Название</th><th>Иконка</th><th>Цена</th><th>Действия</th></tr></thead>
              <tbody>{sauces.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.icon}</td>
                  <td>{s.price} ₽</td>
                  <td className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditSauce(s)} className="px-3 py-1 text-sm">✎</Button>
                    <Button variant="danger" onClick={() => handleDeleteSauce(s.id)} className="px-3 py-1 text-sm">✕</Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* === Начинки === */}
      {activeTab === 'toppings' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingTopping ? 'Редактировать начинку' : 'Добавить начинку'}</h2>
            <form onSubmit={handleToppingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={toppingForm.name} onChange={e => setToppingForm({...toppingForm, name: e.target.value})} placeholder="Название" required />
              <Input name="icon" value={toppingForm.icon} onChange={e => setToppingForm({...toppingForm, icon: e.target.value})} placeholder="Иконка (эмодзи)" required />
              <Input name="price" value={toppingForm.price} onChange={e => setToppingForm({...toppingForm, price: e.target.value})} placeholder="Доп. цена" type="number" />
              <Input name="sort_order" value={toppingForm.sort_order} onChange={e => setToppingForm({...toppingForm, sort_order: e.target.value})} placeholder="Порядок" type="number" />
              <Button type="submit" variant="primary" className="col-span-2">{editingTopping ? 'Обновить' : 'Добавить'}</Button>
              {editingTopping && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingTopping(null); setToppingForm({ name: '', icon: '', price: '0', sort_order: '0' }); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th>ID</th><th>Название</th><th>Иконка</th><th>Цена</th><th>Действия</th></tr></thead>
              <tbody>{toppings.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.icon}</td>
                  <td>{t.price} ₽</td>
                  <td className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditTopping(t)} className="px-3 py-1 text-sm">✎</Button>
                    <Button variant="danger" onClick={() => handleDeleteTopping(t.id)} className="px-3 py-1 text-sm">✕</Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* === Категории === */}
      {activeTab === 'categories' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
            <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Название" required />
              <Input name="sort_order" value={categoryForm.sort_order} onChange={e => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value) || 0})} placeholder="Порядок" type="number" />
              <Button type="submit" variant="primary" className="col-span-2">{editingCategory ? 'Обновить' : 'Добавить'}</Button>
              {editingCategory && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', sort_order: 0 }); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th>ID</th><th>Название</th><th>Порядок</th><th>Действия</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.sort_order}</td>
                    <td className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEditCategory(c)} className="px-3 py-1 text-sm">✎</Button>
                      <Button variant="danger" onClick={() => handleDeleteCategory(c.id)} className="px-3 py-1 text-sm">✕</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;