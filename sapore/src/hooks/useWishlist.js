import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export const useWishlist = () => {
  const { userLogin } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistIds = [], isLoading } = useQuery({
    queryKey: ['wishlist', userLogin],
    queryFn: async () => {
      if (!userLogin) return [];
      const res = await fetch(`${API_BASE}?action=wishlist_get&login=${userLogin}`);
      const data = await res.json();
      if (data.status === 'success') {
        return data.ids.map(id => String(id));
      }
      return [];
    },
    enabled: !!userLogin,
    staleTime: 2 * 60 * 1000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (pizzaId) => {
      const formData = new URLSearchParams();
      formData.append('action', 'wishlist_toggle');
      formData.append('login', userLogin);
      formData.append('pizza_id', pizzaId);
      const res = await fetch(API_BASE, { method: 'POST', body: formData });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist', userLogin]);
    },
  });

  const isInWishlist = (pizzaId) => wishlistIds.includes(String(pizzaId));
  const toggleWishlist = (pizzaId) => toggleMutation.mutate(pizzaId);

  return { wishlistIds, isInWishlist, toggleWishlist, isLoading };
};