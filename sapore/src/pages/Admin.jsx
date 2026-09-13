import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, CONSTRUCTOR_TOPPINGS_BASE } from '../constants/api';
import { ORDER_STATUSES } from '../constants/statuses';
import { STORAGE_KEYS } from '../constants/storage';
import { Button, Input, Badge, LoadingSpinner } from '../components/ui';
import { getImageUrl } from '../utils/imageUtils';

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pizzas');
  const [pizzas, setPizzas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagesSeo, setPagesSeo] = useState([]);
  const [loading, setLoading] = useState(true);

  const emptyPizzaForm = {
    name: '',
    category: '',
    category_id: '',
    description: '',
    price: '',
    image: '',
    sizes: '',
    seo_title: '',
    seo_description: '',
    seo_h1: '',
  };
  const [editingPizza, setEditingPizza] = useState(null);
  const [pizzaForm, setPizzaForm] = useState(emptyPizzaForm);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [editingSize, setEditingSize] = useState(null);
  const [sizeForm, setSizeForm] = useState({ name: '', label: '', circle_size: '', price: '0', sort_order: '0' });

  const emptyToppingForm = { name: '', image: '', price: '0', sort_order: '0' };
  const [editingTopping, setEditingTopping] = useState(null);
  const [toppingForm, setToppingForm] = useState(emptyToppingForm);
  const [selectedToppingFile, setSelectedToppingFile] = useState(null);

  const emptyCategoryForm = { name: '', sort_order: 0, seo_title: '', seo_description: '', seo_h1: '' };
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  const emptyPageForm = { page_key: '', seo_title: '', seo_description: '', seo_h1: '' };
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState(emptyPageForm);

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
        fetchToppings(),
        fetchCategories(),
        fetchPagesSeo()
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const fetchPizzas = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_pizzas' })
    });
    const data = await res.json();
    if (data.status === 'success') setPizzas(data.pizzas);
  };

  const fetchOrders = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_orders' })
    });
    const data = await res.json();
    if (data.status === 'success') setOrders(data.orders);
  };

  const fetchUsers = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_users' })
    });
    const data = await res.json();
    if (data.status === 'success') setUsers(data.users);
  };

  const fetchSizes = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_sizes' })
    });
    const data = await res.json();
    if (data.status === 'success') setSizes(data.sizes);
  };

  const fetchToppings = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_toppings' })
    });
    const data = await res.json();
    if (data.status === 'success') setToppings(data.toppings);
  };

  const fetchCategories = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_categories' })
    });
    const data = await res.json();
    if (data.status === 'success') setCategories(data.categories);
  };

  const fetchPagesSeo = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_pages_seo' })
    });
    const data = await res.json();
    if (data.status === 'success') setPagesSeo(data.pages);
  };

  const handlePizzaSubmit = async (e) => {
    e.preventDefault();
    const action = editingPizza ? 'admin_update_pizza' : 'admin_add_pizza';
    const formData = new FormData();
    formData.append('action', action);
    formData.append('name', pizzaForm.name);
    formData.append('category_id', pizzaForm.category_id);
    formData.append('description', pizzaForm.description);
    formData.append('price', pizzaForm.price);
    formData.append('sizes', pizzaForm.sizes || '');
    formData.append('seo_title', pizzaForm.seo_title || '');
    formData.append('seo_description', pizzaForm.seo_description || '');
    formData.append('seo_h1', pizzaForm.seo_h1 || '');
    if (editingPizza) {
      formData.append('id', editingPizza.id);
    }
    if (selectedImageFile) {
      formData.append('image', selectedImageFile);
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setPizzaForm(emptyPizzaForm);
      setEditingPizza(null);
      setSelectedImageFile(null);
      fetchPizzas();
    }
  };

  const handleEditPizza = (p) => {
    setEditingPizza(p);
    setPizzaForm({
      name: p.name || '',
      category: p.category || '',
      category_id: p.category_id || '',
      description: p.description || '',
      price: p.price || '',
      image: p.image || '',
      sizes: p.sizes || '',
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      seo_h1: p.seo_h1 || ''
    });
    setSelectedImageFile(null);
  };

  const handleDeletePizza = async (id) => {
    if (!confirm('Удалить товар?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_pizza', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchPizzas();
  };

  const handleUpdateUser = async (login, fullName, phone, email, balance) => {
    if (!confirm(`Обновить данные пользователя ${login}?`)) return;
    try {
      const profilePayload = new URLSearchParams({
        action: 'admin_update_user',
        login,
        fullName,
        phone,
        email
      });
      await fetch(API_BASE, { method: 'POST', body: profilePayload });
      if (balance !== undefined && balance !== null) {
        const bonusPayload = new URLSearchParams({
          action: 'admin_update_user_bonus',
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

  const handleSizeSubmit = async (e) => {
    e.preventDefault();
    const action = editingSize ? 'admin_update_size' : 'admin_add_size';
    const payload = new URLSearchParams({ action, ...sizeForm });
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
    const payload = new URLSearchParams({ action: 'admin_delete_size', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchSizes();
  };

  const handleToppingSubmit = async (e) => {
    e.preventDefault();
    const action = editingTopping ? 'admin_update_topping' : 'admin_add_topping';
    const formData = new FormData();
    formData.append('action', action);
    formData.append('name', toppingForm.name);
    formData.append('price', toppingForm.price);
    formData.append('sort_order', toppingForm.sort_order);
    if (editingTopping) formData.append('id', editingTopping.id);
    if (selectedToppingFile) formData.append('image', selectedToppingFile);

    const res = await fetch(API_BASE, { method: 'POST', body: formData });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setToppingForm(emptyToppingForm);
      setEditingTopping(null);
      setSelectedToppingFile(null);
      fetchToppings();
    }
  };

  const handleEditTopping = (t) => {
    setEditingTopping(t);
    setToppingForm({
      name: t.name || '',
      image: t.image || '',
      price: t.price || '0',
      sort_order: t.sort_order || '0'
    });
    setSelectedToppingFile(null);
  };

  const handleDeleteTopping = async (id) => {
    if (!confirm('Удалить начинку?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_topping', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchToppings();
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const action = editingCategory ? 'admin_update_category' : 'admin_add_category';
    const payload = new URLSearchParams({
      action,
      name: categoryForm.name,
      sort_order: categoryForm.sort_order,
      seo_title: categoryForm.seo_title || '',
      seo_description: categoryForm.seo_description || '',
      seo_h1: categoryForm.seo_h1 || ''
    });
    if (editingCategory) payload.append('id', editingCategory.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setCategoryForm(emptyCategoryForm);
      setEditingCategory(null);
      fetchCategories();
    }
  };

  const handleEditCategory = (c) => {
    setEditingCategory(c);
    setCategoryForm({
      name: c.name || '',
      sort_order: c.sort_order || 0,
      seo_title: c.seo_title || '',
      seo_description: c.seo_description || '',
      seo_h1: c.seo_h1 || ''
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Удалить категорию? Все товары с этой категорией потеряют связь.')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_category', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchCategories();
  };

  const handlePageSeoEdit = (p) => {
    setEditingPage(p);
    setPageForm({
      page_key: p.page_key,
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      seo_h1: p.seo_h1 || ''
    });
  };

  const handlePageSeoSubmit = async (e) => {
    e.preventDefault();
    const payload = new URLSearchParams({ action: 'admin_update_page_seo', ...pageForm });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setEditingPage(null);
      setPageForm(emptyPageForm);
      fetchPagesSeo();
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const payload = new URLSearchParams({ action: 'admin_update_order_status', order_id: orderId, status: newStatus });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchOrders();
  };

  const handleLogout = async () => {
    try {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'admin_logout' })
      });
    } catch (e) {
      console.error(e);
    }
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
        {['pizzas','orders','users','sizes','toppings','categories','seo'].map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm"
          >
            {tab === 'pizzas' ? 'Товары' :
             tab === 'orders' ? 'Заказы' :
             tab === 'users' ? 'Пользователи' :
             tab === 'sizes' ? 'Размеры' :
             tab === 'toppings' ? 'Начинки' :
             tab === 'categories' ? 'Категории' :
             'SEO'}
          </Button>
        ))}
      </div>

      {activeTab === 'pizzas' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingPizza ? 'Редактировать товар' : 'Добавить товар'}</h2>
            <form onSubmit={handlePizzaSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={pizzaForm.name} onChange={e => setPizzaForm({...pizzaForm, name: e.target.value})} placeholder="Название" required />
              <select
                value={pizzaForm.category_id || ''}
                onChange={e => {
                  const id = e.target.value;
                  const cat = categories.find(c => String(c.id) === String(id));
                  setPizzaForm({...pizzaForm, category_id: id, category: cat ? cat.name : ''});
                }}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">— выберите категорию —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Input name="price" value={pizzaForm.price} onChange={e => setPizzaForm({...pizzaForm, price: e.target.value})} placeholder="Цена" type="number" required />
              <Input name="sizes" value={pizzaForm.sizes} onChange={e => setPizzaForm({...pizzaForm, sizes: e.target.value})} placeholder="ID размеров через запятую (для пицц: 1,2,3)" />
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
                  <div className="mt-2 text-sm text-gray-500">Текущее изображение: {pizzaForm.image}</div>
                )}
                {selectedImageFile && (
                  <div className="mt-2 text-sm text-green-600">Выбран файл: {selectedImageFile.name}</div>
                )}
              </div>
              <textarea name="description" value={pizzaForm.description} onChange={e => setPizzaForm({...pizzaForm, description: e.target.value})} placeholder="Описание" className="border p-2 rounded col-span-2" rows="2" />

              <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO (мета-теги)</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Input
                    name="seo_title"
                    value={pizzaForm.seo_title}
                    onChange={e => setPizzaForm({...pizzaForm, seo_title: e.target.value})}
                    placeholder="SEO Title (если пусто — сгенерируется автоматически)"
                  />
                  <Input
                    name="seo_h1"
                    value={pizzaForm.seo_h1}
                    onChange={e => setPizzaForm({...pizzaForm, seo_h1: e.target.value})}
                    placeholder="SEO H1 (если пусто — возьмётся название)"
                  />
                  <textarea
                    name="seo_description"
                    value={pizzaForm.seo_description}
                    onChange={e => setPizzaForm({...pizzaForm, seo_description: e.target.value})}
                    placeholder="SEO Description (до 160 символов)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200"
                    rows="2"
                    maxLength={160}
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="col-span-2">{editingPizza ? 'Обновить' : 'Добавить'}</Button>
              {editingPizza && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingPizza(null); setPizzaForm(emptyPizzaForm); setSelectedImageFile(null); }}>Отменить</Button>}
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
                  <td>{p.image && <img src={getImageUrl(p.image)} alt={p.name} className="h-12 w-12 object-cover rounded-lg" />}</td>
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

      {activeTab === 'orders' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="p-3 text-left">№</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Адрес</th><th>Время</th><th>Промокод</th><th>Действие</th></tr></thead>
            <tbody>{orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.order_number}</td>
                <td>{o.user_login}</td>
                <td>{o.total} ₽</td>
                <td><Badge variant="primary">{o.status}</Badge></td>
                <td>{o.delivery_address || '—'}</td>
                <td>{o.delivery_time || '—'}</td>
                <td>{o.promo_code || '—'}</td>
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

      {activeTab === 'users' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th>Логин</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Бонусы</th><th>Действия</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.Login} className="border-t">
                  <td className="p-3">{u.Login}</td>
                  <td><Input type="text" defaultValue={u.full_name || ''} id={`name-${u.Login}`} className="w-32" /></td>
                  <td><Input type="text" defaultValue={u.phone || ''} id={`phone-${u.Login}`} className="w-32" /></td>
                  <td><Input type="email" defaultValue={u.email || ''} id={`email-${u.Login}`} className="w-32" /></td>
                  <td><Input type="number" defaultValue={u.balance} id={`bonus-${u.Login}`} className="w-24" /></td>
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

      {activeTab === 'sizes' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingSize ? 'Редактировать размер' : 'Добавить размер'}</h2>
            <form onSubmit={handleSizeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={sizeForm.name} onChange={e => setSizeForm({...sizeForm, name: e.target.value})} placeholder="Название" required />
              <Input name="label" value={sizeForm.label} onChange={e => setSizeForm({...sizeForm, label: e.target.value})} placeholder="Метка" required />
              <Input name="circle_size" value={sizeForm.circle_size} onChange={e => setSizeForm({...sizeForm, circle_size: e.target.value})} placeholder="Диаметр круга (px)" type="number" required />
              <Input name="price" value={sizeForm.price} onChange={e => setSizeForm({...sizeForm, price: e.target.value})} placeholder="Доп. цена" type="number" />
              <Input name="sort_order" value={sizeForm.sort_order} onChange={e => setSizeForm({...sizeForm, sort_order: e.target.value})} placeholder="Порядок" type="number" />
              <Button type="submit" variant="primary" className="col-span-2">{editingSize ? 'Обновить' : 'Добавить'}</Button>
              {editingSize && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingSize(null); setSizeForm({ name: '', label: '', circle_size: '', price: '0', sort_order: '0' }); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm"><thead className="bg-gray-100"><tr><th>ID</th><th>Название</th><th>Метка</th><th>Диаметр</th><th>Цена</th><th>Действия</th></tr></thead>
            <tbody>{sizes.map(s => (
              <tr key={s.id} className="border-t"><td className="p-3">{s.id}</td><td>{s.name}</td><td>{s.label}</td><td>{s.circle_size}px</td><td>{s.price} ₽</td><td className="flex gap-2"><Button variant="outline" onClick={() => handleEditSize(s)} className="px-3 py-1 text-sm">✎</Button><Button variant="danger" onClick={() => handleDeleteSize(s.id)} className="px-3 py-1 text-sm">✕</Button></td></tr>
            ))}</tbody></table>
          </div>
        </div>
      )}

      {activeTab === 'toppings' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingTopping ? 'Редактировать начинку' : 'Добавить начинку'}</h2>
            <form onSubmit={handleToppingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={toppingForm.name} onChange={e => setToppingForm({...toppingForm, name: e.target.value})} placeholder="Название" required />
              <Input name="price" value={toppingForm.price} onChange={e => setToppingForm({...toppingForm, price: e.target.value})} placeholder="Цена" type="number" />
              <Input name="sort_order" value={toppingForm.sort_order} onChange={e => setToppingForm({...toppingForm, sort_order: e.target.value})} placeholder="Порядок" type="number" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedToppingFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-200 rounded-xl"
                />
                {editingTopping && toppingForm.image && !selectedToppingFile && (
                  <div className="mt-1 text-xs text-gray-500">Текущее: {toppingForm.image}</div>
                )}
                {selectedToppingFile && (
                  <div className="mt-1 text-xs text-green-600">Выбран: {selectedToppingFile.name}</div>
                )}
              </div>
              <Button type="submit" variant="primary" className="col-span-2">{editingTopping ? 'Обновить' : 'Добавить'}</Button>
              {editingTopping && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingTopping(null); setToppingForm(emptyToppingForm); setSelectedToppingFile(null); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr><th className="p-3 text-left">ID</th><th>Фото</th><th>Название</th><th>Цена</th><th>Действия</th></tr>
              </thead>
              <tbody>
                {toppings.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="p-3">{t.id}</td>
                    <td>
                      {t.image && (
                        <img
                          src={`${CONSTRUCTOR_TOPPINGS_BASE}${t.image}`}
                          alt={t.name}
                          className="h-12 w-12 object-contain rounded-lg bg-gray-50"
                        />
                      )}
                    </td>
                    <td>{t.name}</td>
                    <td>{t.price} ₽</td>
                    <td className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEditTopping(t)} className="px-3 py-1 text-sm">✎</Button>
                      <Button variant="danger" onClick={() => handleDeleteTopping(t.id)} className="px-3 py-1 text-sm">✕</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
            <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Название" required />
              <Input name="sort_order" value={categoryForm.sort_order} onChange={e => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value) || 0})} placeholder="Порядок" type="number" />

              <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO (мета-теги)</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Input
                    name="seo_title"
                    value={categoryForm.seo_title}
                    onChange={e => setCategoryForm({...categoryForm, seo_title: e.target.value})}
                    placeholder="SEO Title"
                  />
                  <Input
                    name="seo_h1"
                    value={categoryForm.seo_h1}
                    onChange={e => setCategoryForm({...categoryForm, seo_h1: e.target.value})}
                    placeholder="SEO H1"
                  />
                  <textarea
                    name="seo_description"
                    value={categoryForm.seo_description}
                    onChange={e => setCategoryForm({...categoryForm, seo_description: e.target.value})}
                    placeholder="SEO Description (до 160 символов)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200"
                    rows="2"
                    maxLength={160}
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="col-span-2">{editingCategory ? 'Обновить' : 'Добавить'}</Button>
              {editingCategory && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingCategory(null); setCategoryForm(emptyCategoryForm); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr><th>ID</th><th>Название</th><th>Порядок</th><th>SEO Title</th><th>Действия</th></tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.sort_order}</td>
                    <td className="text-xs max-w-xs truncate">{c.seo_title || '—'}</td>
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

      {activeTab === 'seo' && (
        <div>
          {editingPage && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Редактировать SEO: {editingPage.page_key}</h2>
              <form onSubmit={handlePageSeoSubmit} className="grid grid-cols-1 gap-3">
                <Input
                  name="seo_title"
                  value={pageForm.seo_title}
                  onChange={e => setPageForm({...pageForm, seo_title: e.target.value})}
                  placeholder="SEO Title"
                />
                <Input
                  name="seo_h1"
                  value={pageForm.seo_h1}
                  onChange={e => setPageForm({...pageForm, seo_h1: e.target.value})}
                  placeholder="SEO H1"
                />
                <textarea
                  name="seo_description"
                  value={pageForm.seo_description}
                  onChange={e => setPageForm({...pageForm, seo_description: e.target.value})}
                  placeholder="SEO Description (до 160 символов)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200"
                  rows="2"
                  maxLength={160}
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary">Сохранить</Button>
                  <Button variant="secondary" onClick={() => { setEditingPage(null); setPageForm(emptyPageForm); }}>Отменить</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">SEO статических страниц</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Страница</th>
                    <th>Title</th>
                    <th>H1</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {pagesSeo.map(p => (
                    <tr key={p.page_key} className="border-t">
                      <td className="p-3 font-medium">{p.page_key}</td>
                      <td className="p-3 text-xs max-w-xs truncate">{p.seo_title || '—'}</td>
                      <td className="p-3 text-xs max-w-xs truncate">{p.seo_h1 || '—'}</td>
                      <td className="p-3">
                        <Button variant="outline" onClick={() => handlePageSeoEdit(p)} className="px-3 py-1 text-sm">✎</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">SEO категорий</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Категория</th>
                    <th>Title</th>
                    <th>H1</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} className="border-t">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-xs max-w-xs truncate">{c.seo_title || '—'}</td>
                      <td className="p-3 text-xs max-w-xs truncate">{c.seo_h1 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">Для редактирования SEO категории — перейдите во вкладку «Категории».</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;