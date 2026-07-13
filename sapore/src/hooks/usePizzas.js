import { useQuery } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';

const fetchPizzas = async (categoryId) => {
  const url = categoryId && categoryId > 0
    ? `${API_CATALOG}?category_id=${categoryId}`
    : API_CATALOG;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка загрузки пицц');
  return response.json();
};

export const usePizzas = (categoryId) => {
  return useQuery({
    queryKey: ['pizzas', categoryId],
    queryFn: () => fetchPizzas(categoryId),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};