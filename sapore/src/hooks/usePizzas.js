import { useQuery } from '@tanstack/react-query';
import { API_CATALOG } from '../constants/api';

const fetchPizzas = async (categoryId, page = 1, limit = 9) => {
  const url = new URL(API_CATALOG);
  if (categoryId && categoryId > 0) {
    url.searchParams.append('category_id', categoryId);
  }
  url.searchParams.append('page', page);
  url.searchParams.append('limit', limit);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка загрузки пицц');
  return response.json();
};

export const usePizzas = (categoryId, page = 1, limit = 9) => {
  return useQuery({
    queryKey: ['pizzas', categoryId, page, limit],
    queryFn: () => fetchPizzas(categoryId, page, limit),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true, 
  });
};