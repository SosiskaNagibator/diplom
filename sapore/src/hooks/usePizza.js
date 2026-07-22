import { useQuery } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';

const fetchPizza = async (id) => {
  const response = await fetch(`${API_CATALOG}?id=${id}`);
  if (!response.ok) throw new Error('Ошибка загрузки пиццы');
  const data = await response.json();
  if (data.status !== 'success') throw new Error(data.message || 'Пицца не найдена');
  return data.pizza;
};

export const usePizza = (id) => {
  return useQuery({
    queryKey: ['pizza', id],
    queryFn: () => fetchPizza(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};