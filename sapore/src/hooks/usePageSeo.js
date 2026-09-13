import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../constants/api';

export const usePageSeo = (pageKey) => {
  return useQuery({
    queryKey: ['pageSeo', pageKey],
    queryFn: async () => {
      if (!pageKey) return null;
      const res = await fetch(`${API_BASE}?action=get_page_seo&page=${encodeURIComponent(pageKey)}`);
      const data = await res.json();
      if (data.status === 'success') return data.data;
      return null;
    },
    enabled: !!pageKey,
    staleTime: 5 * 60 * 1000,
  });
};