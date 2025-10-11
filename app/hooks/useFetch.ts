import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface FetchOptions {
  immediate?: boolean;
  dependencies?: any[];
}

export const useFetch = <T = any>(
  fetchFunction: () => Promise<{ data: T }>,
  options: FetchOptions = {}
): FetchState<T> => {
  const { immediate = true, dependencies = [] } = options;
  
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetchFunction();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...dependencies]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
};

export const useMutation = <TData = any, TVariables = any>(
  mutationFunction: (variables: TVariables) => Promise<{ data: TData }>
) => {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await mutationFunction(variables);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [mutationFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

export const usePagination = <T = any>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[], pagination: any }>,
  limit: number = 20
) => {
  const [state, setState] = useState<{
    data: T[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
  }>({
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
  });

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetchFunction(state.page, limit);
      const newData = response.data;
      const hasMore = newData.length === limit;

      setState(prev => ({
        data: prev.page === 1 ? newData : [...prev.data, ...newData],
        loading: false,
        error: null,
        hasMore,
        page: prev.page + 1,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [fetchFunction, state.page, state.loading, state.hasMore, limit]);

  const refresh = useCallback(async () => {
    setState(prev => ({
      ...prev,
      page: 1,
      hasMore: true,
      data: [],
    }));
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetchFunction(1, limit);
      const newData = response.data;
      const hasMore = newData.length === limit;

      setState({
        data: newData,
        loading: false,
        error: null,
        hasMore,
        page: 2,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [fetchFunction, limit]);

  useEffect(() => {
    loadMore();
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
  };
};