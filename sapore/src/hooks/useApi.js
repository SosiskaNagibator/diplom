import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost/api.php';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(API_BASE);
      if (endpoint) url.searchParams.append('action', endpoint);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    if (options.auto) {
      execute(options.params);
    }
  }, []);

  return { data, loading, error, execute };
};

export const useApiPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (action, payload) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('action', action);
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key]);
        }
      });

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('API Post Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};