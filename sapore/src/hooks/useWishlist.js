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
      const res = await fetch(`${API_BASE}?action=wishlist_get`);
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
      formData.append('pizza_id', pizzaId);
      const res = await fetch(API_BASE, { method: 'POST', body: formData });
      return res.json();
    },
    onMutate: async (pizzaId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', userLogin] });
      const previous = queryClient.getQueryData(['wishlist', userLogin]);
      queryClient.setQueryData(['wishlist', userLogin], (old = []) => {
        const idStr = String(pizzaId);
        return old.includes(idStr)
          ? old.filter(id => id !== idStr)
          : [...old, idStr];
      });
      return { previous };
    },
    onError: (err, pizzaId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['wishlist', userLogin], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userLogin] });
      queryClient.invalidateQueries({ queryKey: ['wishlistPizzas'] });
    },
  });

  const isInWishlist = (pizzaId) => wishlistIds.includes(String(pizzaId));
  const toggleWishlist = (pizzaId) => toggleMutation.mutate(pizzaId);

  return { wishlistIds, isInWishlist, toggleWishlist, isLoading };
};