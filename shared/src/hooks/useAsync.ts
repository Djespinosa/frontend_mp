import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: unknown;
}

interface UseAsyncResult<T, Args extends unknown[]> extends UseAsyncState<T> {
  run: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Envuelve una función async (típicamente una llamada a un service) en un
 * ciclo de estado idle -> loading -> success|error. `run` mantiene una
 * identidad estable entre renders (vía ref) para poder usarse de forma
 * segura como dependencia de useEffect sin causar loops.
 */
export function useAsync<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>
): UseAsyncResult<T, Args> {
  const [state, setState] = useState<UseAsyncState<T>>({ status: 'idle', data: null, error: null });
  const isMountedRef = useRef(true);
  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (...args: Args) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await asyncFnRef.current(...args);
      if (isMountedRef.current) {
        setState({ status: 'success', data, error: null });
      }
      return data;
    } catch (error) {
      if (isMountedRef.current) {
        setState({ status: 'error', data: null, error });
      }
      return undefined;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle', data: null, error: null }), []);

  return { ...state, run, reset };
}
