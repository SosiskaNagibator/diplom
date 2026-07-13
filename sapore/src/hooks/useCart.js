import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ORDERS } from '../constants/api';

export const useSaveOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Ошибка сохранения заказа');
      return data;
    },
    onSuccess: (data, variables) => {
      // Обновляем бонусы и заказы в кеше
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};