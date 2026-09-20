import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, CONSTRUCTOR_TOPPINGS_BASE } from '../constants/api';
import { ORDER_STATUSES } from '../constants/statuses';
import { STORAGE_KEYS } from '../constants/storage';
import { Button, Input, Badge, LoadingSpinner } from '../components/ui';
import { getImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';

const pluralize = (n, forms) => {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (lastDigit > 1 && lastDigit < 5) return forms[1];
  if (lastDigit === 1) return forms[0];
  return forms[2];
};

const formatExpires = (expiresAt) => {
  if (!expiresAt) {
    return { text: 'Бессрочный', color: 'text-gray-500' };
  }
  const now = new Date();
  const expires = new Date(expiresAt.replace(' ', 'T'));
  const diffMs = expires - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) {
    const absDays = Math.max(1, Math.ceil(Math.abs(diffHours) / 24));
    const w = pluralize(absDays, ['день', 'дня', 'дней']);
    return { text: `Истёк ${absDays} ${w} назад`, color: 'text-red-600' };
  }
  if (diffHours < 24) {
    const hours = Math.max(1, Math.round(diffHours));
    const w = pluralize(hours, ['час', 'часа', 'часов']);
    return { text: `Осталось ${hours} ${w}`, color: 'text-red-500' };
  }
  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays === 1) {
    return { text: 'Истекает завтра', color: 'text-amber-600' };
  }
  const w = pluralize(diffDays, ['день', 'дня', 'дней']);
  if (diffDays < 7) {
    return { text: `Осталось ${diffDays} ${w}`, color: 'text-amber-600' };
  }
  return { text: `До ${expires.toLocaleDateString('ru-RU')}`, color: 'text-gray-500' };
};

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
  const [promos, setPromos] = useState([]);
  const [deliveryRules, setDeliveryRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pizzaSearch, setPizzaSearch] = useState('');
  const [pizzaCategoryFilter, setPizzaCategoryFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [promoSearch, setPromoSearch] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState('');

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

  const emptyPromoForm = {
    code: '',
    discount_type: 'percent',
    discount_value: '',
    max_discount: '',
    min_order_amount: '0',
    expires_at: '',
    usage_limit: '',
    is_active: 1,
  };
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState(emptyPromoForm);

  const emptyDeliveryForm = { min_amount: '', cost: '', sort_order: '0' };
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState(emptyDeliveryForm);

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
        fetchPagesSeo(),
        fetchPromos(),
        fetchDeliveryRules()
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

  const fetchPromos = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_promos' })
    });
    const data = await res.json();
    if (data.status === 'success') setPromos(data.promos);
  };

  const fetchDeliveryRules = async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'admin_get_delivery_rules' })
    });
    const data = await res.json();
    if (data.status === 'success') setDeliveryRules(data.rules);
  };

  const filteredPizzas = useMemo(() => {
    return pizzas.filter(p => {
      const matchesSearch = !pizzaSearch || p.name?.toLowerCase().includes(pizzaSearch.toLowerCase());
      const matchesCategory = !pizzaCategoryFilter || String(p.category_id) === String(pizzaCategoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [pizzas, pizzaSearch, pizzaCategoryFilter]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase();
    return orders.filter(o => {
      const matchesSearch = !q ||
        String(o.order_number || '').includes(q) ||
        o.user_login?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q);
      const matchesStatus = !orderStatusFilter || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.Login?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredPromos = useMemo(() => {
    return promos.filter(p => {
      const matchesSearch = !promoSearch || p.code?.toLowerCase().includes(promoSearch.toLowerCase());
      const matchesStatus = !promoStatusFilter ||
        (promoStatusFilter === 'active' && Number(p.is_active) === 1) ||
        (promoStatusFilter === 'inactive' && Number(p.is_active) === 0);
      return matchesSearch && matchesStatus;
    });
  }, [promos, promoSearch, promoStatusFilter]);

  const applyPromoPreset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setPromoForm({ ...promoForm, expires_at: `${year}-${month}-${day}T${hours}:${minutes}` });
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

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    const action = editingPromo ? 'admin_update_promo' : 'admin_add_promo';
    const payload = new URLSearchParams({
      action,
      code: promoForm.code,
      discount_type: promoForm.discount_type,
      discount_value: promoForm.discount_value,
      max_discount: promoForm.max_discount || '',
      min_order_amount: promoForm.min_order_amount || '0',
      expires_at: promoForm.expires_at || '',
      usage_limit: promoForm.usage_limit || '',
      is_active: promoForm.is_active
    });
    if (editingPromo) payload.append('id', editingPromo.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setPromoForm(emptyPromoForm);
      setEditingPromo(null);
      fetchPromos();
    }
  };

  const handleEditPromo = (p) => {
    setEditingPromo(p);
    let expiresAtValue = '';
    if (p.expires_at) {
      expiresAtValue = p.expires_at.replace(' ', 'T').slice(0, 16);
    }
    setPromoForm({
      code: p.code || '',
      discount_type: p.discount_type || 'percent',
      discount_value: p.discount_value || '',
      max_discount: p.max_discount || '',
      min_order_amount: p.min_order_amount || '0',
      expires_at: expiresAtValue,
      usage_limit: p.usage_limit || '',
      is_active: Number(p.is_active)
    });
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('Удалить промокод?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_promo', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchPromos();
  };

  const handleTogglePromo = async (id) => {
    const payload = new URLSearchParams({ action: 'admin_toggle_promo', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    if (data.status === 'success') fetchPromos();
    else alert(data.message);
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    const action = editingDelivery ? 'admin_update_delivery_rule' : 'admin_add_delivery_rule';
    const payload = new URLSearchParams({ action, ...deliveryForm });
    if (editingDelivery) payload.append('id', editingDelivery.id);
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') {
      setDeliveryForm(emptyDeliveryForm);
      setEditingDelivery(null);
      fetchDeliveryRules();
    }
  };

  const handleEditDelivery = (r) => {
    setEditingDelivery(r);
    setDeliveryForm({
      min_amount: String(r.min_amount),
      cost: String(r.cost),
      sort_order: String(r.sort_order)
    });
  };

  const handleDeleteDelivery = async (id) => {
    if (!confirm('Удалить правило доставки?')) return;
    const payload = new URLSearchParams({ action: 'admin_delete_delivery_rule', id });
    const res = await fetch(API_BASE, { method: 'POST', body: payload });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') fetchDeliveryRules();
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
      <SEO
        title="Админ-панель"
        description="Панель администратора Sapore"
        url="/admin"
        noindex
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Админ-панель</h1>
        <Button variant="danger" onClick={handleLogout}>Выйти из админки</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['pizzas','orders','users','promos','delivery','sizes','toppings','categories','seo'].map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm"
          >
            {tab === 'pizzas' ? 'Товары' :
             tab === 'orders' ? 'Заказы' :
             tab === 'users' ? 'Пользователи' :
             tab === 'promos' ? 'Промокоды' :
             tab === 'delivery' ? 'Доставка' :
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
            <div className="text-xl font-semibold mb-4">{editingPizza ? 'Редактировать товар' : 'Добавить товар'}</div>
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

              <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                <div className="text-sm font-semibold text-gray-700 mb-3">SEO (мета-теги)</div>
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

          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <Input
              value={pizzaSearch}
              onChange={e => setPizzaSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="flex-1"
            />
            <select
              value={pizzaCategoryFilter}
              onChange={e => setPizzaCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Все категории</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th className="p-3 text-left">ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Изображение</th><th>Действия</th></tr></thead>
              <tbody>{filteredPizzas.map(p => (
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
            {filteredPizzas.length === 0 && (
              <div className="p-6 text-center text-gray-500">Ничего не найдено</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <Input
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder="Поиск по номеру, логину, имени, телефону..."
              className="flex-1"
            />
            <select
              value={orderStatusFilter}
              onChange={e => setOrderStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Все статусы</option>
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th className="p-3 text-left">№</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Адрес</th><th>Время</th><th>Промокод</th><th>Действие</th></tr></thead>
              <tbody>{filteredOrders.map(o => (
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
            {filteredOrders.length === 0 && (
              <div className="p-6 text-center text-gray-500">Ничего не найдено</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <Input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Поиск по логину, имени, телефону, email..."
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100"><tr><th>Логин</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Бонусы</th><th>Действия</th></tr></thead>
              <tbody>
                {filteredUsers.map(u => (
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
            {filteredUsers.length === 0 && (
              <div className="p-6 text-center text-gray-500">Ничего не найдено</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'promos' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="text-xl font-semibold mb-4">{editingPromo ? 'Редактировать промокод' : 'Добавить промокод'}</div>
            <form onSubmit={handlePromoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="code"
                value={promoForm.code}
                onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                placeholder="Код промокода (например, SAPORE20)"
                required
              />
              <select
                value={promoForm.discount_type}
                onChange={e => setPromoForm({...promoForm, discount_type: e.target.value})}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="percent">Процент (%)</option>
                <option value="fixed">Фиксированная (₽)</option>
              </select>
              <Input
                name="discount_value"
                value={promoForm.discount_value}
                onChange={e => setPromoForm({...promoForm, discount_value: e.target.value})}
                placeholder={promoForm.discount_type === 'percent' ? 'Размер скидки, %' : 'Размер скидки, ₽'}
                type="number"
                required
              />
              <Input
                name="max_discount"
                value={promoForm.max_discount}
                onChange={e => setPromoForm({...promoForm, max_discount: e.target.value})}
                placeholder="Макс. скидка, ₽ (необязательно)"
                type="number"
              />
              <Input
                name="min_order_amount"
                value={promoForm.min_order_amount}
                onChange={e => setPromoForm({...promoForm, min_order_amount: e.target.value})}
                placeholder="Мин. сумма заказа, ₽"
                type="number"
              />
              <Input
                name="usage_limit"
                value={promoForm.usage_limit}
                onChange={e => setPromoForm({...promoForm, usage_limit: e.target.value})}
                placeholder="Лимит использований (необязательно)"
                type="number"
              />

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Срок действия</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPromoForm({ ...promoForm, expires_at: '' })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      !promoForm.expires_at
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Не ограничен
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPromoPreset(1)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    +1 день
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPromoPreset(7)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    +7 дней
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPromoPreset(30)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    +30 дней
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPromoPreset(90)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    +90 дней
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={promoForm.expires_at}
                  onChange={e => setPromoForm({...promoForm, expires_at: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Если оставить пустым — промокод будет бессрочным
                </p>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="promo_active"
                  checked={Number(promoForm.is_active) === 1}
                  onChange={e => setPromoForm({...promoForm, is_active: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 accent-amber-500"
                />
                <label htmlFor="promo_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Активен
                </label>
              </div>

              <Button type="submit" variant="primary" className="col-span-2">{editingPromo ? 'Обновить' : 'Добавить'}</Button>
              {editingPromo && <Button variant="secondary" className="col-span-2" onClick={() => { setEditingPromo(null); setPromoForm(emptyPromoForm); }}>Отменить</Button>}
            </form>
          </div>

          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <Input
              value={promoSearch}
              onChange={e => setPromoSearch(e.target.value)}
              placeholder="Поиск по коду..."
              className="flex-1"
            />
            <select
              value={promoStatusFilter}
              onChange={e => setPromoStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th>Код</th>
                  <th>Скидка</th>
                  <th>Мин. сумма</th>
                  <th>Срок действия</th>
                  <th>Использован</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map(p => {
                  const isPersonal = !!p.user_login;
                  const usedInfo = p.usage_limit
                    ? `${p.used_count || 0} / ${p.usage_limit}`
                    : `${p.used_count || 0}`;
                  const discountText = p.discount_type === 'percent'
                    ? `${p.discount_value}%`
                    : `${p.discount_value} ₽`;
                  const expires = formatExpires(p.expires_at);
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">{p.id}</td>
                      <td className="font-mono font-medium">{p.code}</td>
                      <td>{discountText}</td>
                      <td>{p.min_order_amount} ₽</td>
                      <td className={`text-sm font-medium ${expires.color}`}>
                        {expires.text}
                      </td>
                      <td>{usedInfo}</td>
                      <td>
                        {isPersonal
                          ? <Badge variant="info">Личный</Badge>
                          : <Badge variant="default">Общий</Badge>}
                      </td>
                      <td>
                        {Number(p.is_active) === 1
                          ? <Badge variant="success">Активен</Badge>
                          : <Badge variant="danger">Выключен</Badge>}
                      </td>
                      <td className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={() => handleEditPromo(p)} className="px-3 py-1 text-sm">✎</Button>
                        <Button
                          variant={Number(p.is_active) === 1 ? 'secondary' : 'primary'}
                          onClick={() => handleTogglePromo(p.id)}
                          className="px-3 py-1 text-xs"
                        >
                          {Number(p.is_active) === 1 ? 'Выкл' : 'Вкл'}
                        </Button>
                        <Button variant="danger" onClick={() => handleDeletePromo(p.id)} className="px-3 py-1 text-sm">✕</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPromos.length === 0 && (
              <div className="p-6 text-center text-gray-500">Ничего не найдено</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="text-xl font-semibold mb-4">{editingDelivery ? 'Редактировать правило' : 'Добавить правило доставки'}</div>
            <p className="text-sm text-gray-500 mb-4">
              Стоимость доставки определяется по сумме заказа. Система выбирает правило с наибольшим порогом, который не превышает сумму.
            </p>
            <form onSubmit={handleDeliverySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="min_amount"
                value={deliveryForm.min_amount}
                onChange={e => setDeliveryForm({...deliveryForm, min_amount: e.target.value})}
                placeholder="Минимальная сумма, ₽"
                type="number"
                required
              />
              <Input
                name="cost"
                value={deliveryForm.cost}
                onChange={e => setDeliveryForm({...deliveryForm, cost: e.target.value})}
                placeholder="Стоимость доставки, ₽"
                type="number"
                required
              />
              <Input
                name="sort_order"
                value={deliveryForm.sort_order}
                onChange={e => setDeliveryForm({...deliveryForm, sort_order: e.target.value})}
                placeholder="Порядок"
                type="number"
              />
              <Button type="submit" variant="primary" className="col-span-1 md:col-span-3">{editingDelivery ? 'Обновить' : 'Добавить'}</Button>
              {editingDelivery && <Button variant="secondary" className="col-span-1 md:col-span-3" onClick={() => { setEditingDelivery(null); setDeliveryForm(emptyDeliveryForm); }}>Отменить</Button>}
            </form>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th>Мин. сумма</th>
                  <th>Стоимость доставки</th>
                  <th>Порядок</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {deliveryRules.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.id}</td>
                    <td>от {r.min_amount} ₽</td>
                    <td>{r.cost === 0 ? <span className="text-green-600 font-medium">Бесплатно</span> : `${r.cost} ₽`}</td>
                    <td>{r.sort_order}</td>
                    <td className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEditDelivery(r)} className="px-3 py-1 text-sm">✎</Button>
                      <Button variant="danger" onClick={() => handleDeleteDelivery(r.id)} className="px-3 py-1 text-sm">✕</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveryRules.length === 0 && (
              <div className="p-6 text-center text-gray-500">Правила не заданы</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sizes' && (
        <div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="text-xl font-semibold mb-4">{editingSize ? 'Редактировать размер' : 'Добавить размер'}</div>
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
            <div className="text-xl font-semibold mb-4">{editingTopping ? 'Редактировать начинку' : 'Добавить начинку'}</div>
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
            <div className="text-xl font-semibold mb-4">{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</div>
            <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Название" required />
              <Input name="sort_order" value={categoryForm.sort_order} onChange={e => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value) || 0})} placeholder="Порядок" type="number" />

              <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                <div className="text-sm font-semibold text-gray-700 mb-3">SEO (мета-теги)</div>
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
              <div className="text-xl font-semibold mb-4">Редактировать SEO: {editingPage.page_key}</div>
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
            <div className="text-xl font-semibold mb-4">SEO статических страниц</div>
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
            <div className="text-xl font-semibold mb-4">SEO категорий</div>
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