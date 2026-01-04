import { useState, useEffect, useCallback, useRef } from 'react';

type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: Error | null;
};

type UseAsyncReturn<T, P extends any[]> = AsyncState<T> & {
    execute: (...params: P) => Promise<T | null>;
    reset: () => void;
    setData: (data: T | null) => void;
};

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync<T, P extends any[] = []>(
    asyncFn: (...params: P) => Promise<T>,
    options: {
        immediate?: boolean;
        params?: P;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
    } = {}
): UseAsyncReturn<T, P> {
    const { immediate = false, params, onSuccess, onError } = options;

    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null
    });

    const mountedRef = useRef(true);
    const latestRequestRef = useRef(0);

    const execute = useCallback(async (...executeParams: P): Promise<T | null> => {
        const requestId = ++latestRequestRef.current;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await asyncFn(...executeParams);

            // Only update state if this is the latest request and component is mounted
            if (mountedRef.current && requestId === latestRequestRef.current) {
                setState({ data: result, loading: false, error: null });
                onSuccess?.(result);
                return result;
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            if (mountedRef.current && requestId === latestRequestRef.current) {
                setState({ data: null, loading: false, error: err });
                onError?.(err);
            }
        }

        return null;
    }, [asyncFn, onSuccess, onError]);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    const setData = useCallback((data: T | null) => {
        setState(prev => ({ ...prev, data }));
    }, []);

    // Execute immediately if requested
    useEffect(() => {
        if (immediate && params) {
            execute(...params);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        ...state,
        execute,
        reset,
        setData
    };
}

/**
 * Hook for data fetching with automatic refresh capability
 */
export function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: {
        refreshInterval?: number;
        enabled?: boolean;
        dependencies?: any[];
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
    } = {}
) {
    const {
        refreshInterval,
        enabled = true,
        dependencies = [],
        onSuccess,
        onError
    } = options;

    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: enabled,
        error: null
    });

    const mountedRef = useRef(true);
    const fetchCountRef = useRef(0);

    const fetch = useCallback(async () => {
        const fetchId = ++fetchCountRef.current;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await fetchFn();

            if (mountedRef.current && fetchId === fetchCountRef.current) {
                setState({ data: result, loading: false, error: null });
                onSuccess?.(result);
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            if (mountedRef.current && fetchId === fetchCountRef.current) {
                setState({ data: null, loading: false, error: err });
                onError?.(err);
            }
        }
    }, [fetchFn, onSuccess, onError]);

    const refetch = useCallback(() => {
        if (enabled) {
            fetch();
        }
    }, [enabled, fetch]);

    // Initial fetch and dependency changes
    useEffect(() => {
        if (enabled) {
            fetch();
        }
    }, [enabled, ...dependencies]);

    // Refresh interval
    useEffect(() => {
        if (refreshInterval && enabled) {
            const interval = setInterval(fetch, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, enabled, fetch]);

    // Cleanup
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        ...state,
        refetch,
        setData: (data: T | null) => setState(prev => ({ ...prev, data }))
    };
}

/**
 * Hook for mutation operations (create, update, delete)
 */
export function useMutation<T, P extends any[] = []>(
    mutationFn: (...params: P) => Promise<T>,
    options: {
        onSuccess?: (data: T, params: P) => void;
        onError?: (error: Error, params: P) => void;
        onSettled?: () => void;
    } = {}
) {
    const { onSuccess, onError, onSettled } = options;

    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const mountedRef = useRef(true);

    const mutate = useCallback(async (...params: P): Promise<T | null> => {
        setState({ data: null, loading: true, error: null });

        try {
            const result = await mutationFn(...params);

            if (mountedRef.current) {
                setState({ data: result, loading: false, error: null });
                onSuccess?.(result, params);
            }
            return result;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            if (mountedRef.current) {
                setState({ data: null, loading: false, error: err });
                onError?.(err, params);
            }
            return null;
        } finally {
            if (mountedRef.current) {
                onSettled?.();
            }
        }
    }, [mutationFn, onSuccess, onError, onSettled]);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        ...state,
        mutate,
        reset,
        isIdle: !state.loading && !state.error && !state.data
    };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T, P extends any[]>(
    mutationFn: (...params: P) => Promise<T>,
    options: {
        currentData: T | null;
        getOptimisticData: (current: T | null, params: P) => T;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
        onRollback?: (previousData: T | null) => void;
    }
) {
    const { currentData, getOptimisticData, onSuccess, onError, onRollback } = options;
    const [optimisticData, setOptimisticData] = useState<T | null>(currentData);
    const [isUpdating, setIsUpdating] = useState(false);
    const previousDataRef = useRef<T | null>(null);

    const mutate = useCallback(async (...params: P) => {
        previousDataRef.current = optimisticData;
        const newData = getOptimisticData(optimisticData, params);
        setOptimisticData(newData);
        setIsUpdating(true);

        try {
            const result = await mutationFn(...params);
            setOptimisticData(result);
            onSuccess?.(result);
            return result;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            setOptimisticData(previousDataRef.current);
            onRollback?.(previousDataRef.current);
            onError?.(err);
            return null;
        } finally {
            setIsUpdating(false);
        }
    }, [optimisticData, getOptimisticData, mutationFn, onSuccess, onError, onRollback]);

    // Sync with external data changes
    useEffect(() => {
        if (!isUpdating) {
            setOptimisticData(currentData);
        }
    }, [currentData, isUpdating]);

    return {
        data: optimisticData,
        isUpdating,
        mutate
    };
}

export default useAsync;
