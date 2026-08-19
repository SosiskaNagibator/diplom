import { useQuery } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';

const fetchPizzas = async (categoryId, page, limit, search) => {
  const url = new URL(API_CATALOG);
  if (categoryId && categoryId > 0) url.searchParams.append('category_id', categoryId);
  if (search) url.searchParams.append('search', search);
  url.searchParams.append('page', page);
  url.searchParams.append('limit', limit);
  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка загрузки пицц');
  return response.json();
};

export const usePizzas = (categoryId, page = 1, limit = 9, search = '') => {
  return useQuery({
    queryKey: ['pizzas', categoryId, page, limit, search],
    queryFn: () => fetchPizzas(categoryId, page, limit, search),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};