import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../constants/api';

export const useLevels = () => {
    return useQuery({
        queryKey: ['levels'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}?action=get_levels`);
            const data = await res.json();
            if (data.status === 'success') return data.levels;
            throw new Error(data.message || 'Ошибка загрузки уровней');
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserLevel = (login) => {
    return useQuery({
        queryKey: ['userLevel', login],
        queryFn: async () => {
            if (!login) return null;
            const res = await fetch(`${API_BASE}?action=get_user_level&login=${encodeURIComponent(login)}`);
            const data = await res.json();
            if (data.status === 'success') return data;
            throw new Error(data.message || 'Ошибка загрузки уровня');
        },
        enabled: !!login,
        staleTime: 2 * 60 * 1000,
    });
};