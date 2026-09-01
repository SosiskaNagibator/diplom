import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../constants/api';

export const useBonuses = (login) => {
  return useQuery({
    queryKey: ['bonuses', login],
    queryFn: async () => {
      if (!login) return 0;
      const response = await fetch(`${API_BASE}?action=get_bonuses`);
      if (!response.ok) throw new Error('Ошибка загрузки бонусов');
      const data = await response.json();
      if (data.status === 'success') return data.bonuses;
      return 0;
    },
    enabled: !!login,
    staleTime: 3 * 60 * 1000,
  });
};

export const useBonusHistory = (login) => {
  return useQuery({
    queryKey: ['bonusHistory', login],
    queryFn: async () => {
      if (!login) return [];
      const response = await fetch(`${API_BASE}?action=get_bonus_history`);
      if (!response.ok) throw new Error('Ошибка загрузки истории');
      const data = await response.json();
      if (data.status === 'success') return data.history;
      return [];
    },
    enabled: !!login,
    staleTime: 5 * 60 * 1000,
  });
};