import { useState, useEffect } from 'react';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaStar, FaTrash, FaCheck, FaEdit } from 'react-icons/fa';

const ADDRESS_STORAGE_KEY = 'selectedDeliveryAddress';

const AddressSelector = ({ onSelect }) => {
  const { userLogin } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const fetchAddresses = async () => {
    if (!userLogin) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?action=get_user_addresses&login=${userLogin}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAddresses(data.addresses);
        const savedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY);
        if (savedAddress) {
          const found = data.addresses.find(a => a.address === savedAddress);
          if (found) {
            setSelectedId(found.id);
            onSelect(found.address);
            setLoading(false);
            return;
          }
        }
        const defaultAddr = data.addresses.find(a => a.is_default === 1);
        if (defaultAddr) {
          setSelectedId(defaultAddr.id);
          onSelect(defaultAddr.address);
          localStorage.setItem(ADDRESS_STORAGE_KEY, defaultAddr.address);
        }
      }
    } catch (e) {
      console.error('Ошибка загрузки адресов', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userLogin]);

  const handleSelect = (addr) => {
    setSelectedId(addr.id);
    localStorage.setItem(ADDRESS_STORAGE_KEY, addr.address);
    onSelect(addr.address);
  };

  const handleSetDefault = async (id) => {
    if (!confirm('Сделать этот адрес основным?')) return;
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'set_default_address');
      formData.append('id', id);
      formData.append('login', userLogin);
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        const selectedAddr = addresses.find(a => a.id === id);
        if (selectedAddr) {
          localStorage.setItem(ADDRESS_STORAGE_KEY, selectedAddr.address);
          onSelect(selectedAddr.address);
          setSelectedId(id);
        }
        fetchAddresses();
      } else {
        alert(data.message || 'Ошибка');
      }
    } catch (e) {
      console.error('Ошибка установки адреса по умолчанию', e);
      alert('Ошибка при установке адреса');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот адрес?')) return;
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'delete_user_address');
      formData.append('id', id);
      formData.append('login', userLogin); // <-- обязательно передаём логин
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (selectedId === id) {
          setSelectedId(null);
          localStorage.removeItem(ADDRESS_STORAGE_KEY);
        }
        fetchAddresses();
      } else {
        alert(data.message || 'Ошибка удаления');
      }
    } catch (e) {
      console.error('Ошибка удаления адреса', e);
      alert('Ошибка при удалении адреса');
    }
  };

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setEditLabel(addr.label || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const saveLabel = async (id) => {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'update_address_label');
      formData.append('id', id);
      formData.append('label', editLabel.trim());
      formData.append('login', userLogin);
      const res = await fetch(API_BASE, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEditingId(null);
        setEditLabel('');
        fetchAddresses();
      } else {
        alert(data.message || 'Ошибка обновления метки');
      }
    } catch (e) {
      console.error('Ошибка сохранения метки', e);
      alert('Ошибка при сохранении метки');
    }
  };

  if (!userLogin || loading) return null;
  if (addresses.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Мои адреса</label>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {addresses.map((addr) => {
          const isSelected = selectedId === addr.id;
          const isDefault = addr.is_default === 1;
          const isEditing = editingId === addr.id;
          return (
            <div
              key={addr.id}
              className={`relative flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3" onClick={() => handleSelect(addr)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FaHome className={`text-sm flex-shrink-0 ${isSelected ? 'text-amber-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700 break-words">
                      {addr.address}
                    </span>
                    {isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        <FaStar className="text-amber-500 text-xs" /> Основной
                      </span>
                    )}
                  </div>
                  {!isEditing && addr.label && (
                    <div className="text-xs text-gray-500 mt-0.5">{addr.label}</div>
                  )}
                  {isEditing && (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Название (например, Дом, Работа)"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveLabel(addr.id)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isEditing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(addr); }}
                      className="text-gray-400 hover:text-amber-500 transition"
                      title="Редактировать метку"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                  )}
                  {!isDefault && !isEditing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                      className="text-amber-600 hover:text-amber-800 transition"
                      title="Сделать основным"
                    >
                      <FaStar className="text-sm" />
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                      className="text-red-400 hover:text-red-600 transition"
                      title="Удалить"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  )}
                  {isSelected && !isEditing && (
                    <FaCheck className="text-amber-500 text-sm" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddressSelector;