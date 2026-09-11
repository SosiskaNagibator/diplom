import { useQuery } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';

const fetchProduct = async (slug) => {
  const res = await fetch(`${API_CATALOG}?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error('Ошибка загрузки');
  const data = await res.json();
  if (data.status !== 'success') throw new Error(data.message || 'Товар не найден');
  return data.pizza;
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};