import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../constants/api';

export const useDeliveryRules = () => {
  return useQuery({
    queryKey: ['deliveryRules'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}?action=get_delivery_rules`);
      const data = await res.json();
      if (data.status === 'success') return data.rules || [];
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFreeDeliveryCheck = (userLogin) => {
  return useQuery({
    queryKey: ['freeDelivery', userLogin],
    queryFn: async () => {
      if (!userLogin) return { available: false, has_bonus: false };
      const res = await fetch(`${API_BASE}?action=check_free_delivery`);
      const data = await res.json();
      if (data.status === 'success') return data;
      return { available: false, has_bonus: false };
    },
    enabled: !!userLogin,
    staleTime: 60 * 1000,
  });
};

export const calculateDeliveryCost = (rules, total) => {
  if (!rules || rules.length === 0) return 0;
  const sorted = [...rules].sort((a, b) => b.min_amount - a.min_amount);
  for (const rule of sorted) {
    if (total >= rule.min_amount) return rule.cost;
  }
  return 0;
};