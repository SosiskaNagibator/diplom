import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ORDERS } from '../constants/api';

export const useOrders = (login) => {
  return useQuery({
    queryKey: ['orders', login],
    queryFn: async () => {
      if (!login) return [];
      const response = await fetch(`${API_ORDERS}?action=get_orders`);
      if (!response.ok) throw new Error('Ошибка загрузки заказов');
      const data = await response.json();
      if (data.status === 'success') {
        return data.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          items: order.items || [],
          total: order.total,
          date: order.date || new Date().toLocaleString(),
          status: order.status || 'Принят',
          deliveryAddress: order.deliveryAddress || '',
          created_at: order.created_at || new Date().toISOString()
        }));
      }
      return [];
    },
    enabled: !!login,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const response = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orderId,
          status: newStatus
        })
      });
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'Ошибка обновления');
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};