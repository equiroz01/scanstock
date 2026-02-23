import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that debounces a value
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that provides a debounced callback function
 * @param callback The callback to debounce
 * @param delay Delay in milliseconds (default: 300ms)
 * @returns Object with the debounced function, cancel method, and pending state
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  isPending: boolean;
} {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      setIsPending(true);

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        setIsPending(false);
        timeoutRef.current = null;
      }, delay);
    },
    [delay, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedCallback, cancel, isPending };
}

/**
 * Hook for search input with debounce
 * Returns local value for immediate UI feedback and debounced value for API calls
 */
export function useDebouncedSearch(
  initialValue: string = '',
  delay: number = 300
): {
  value: string;
  debouncedValue: string;
  setValue: (value: string) => void;
  clear: () => void;
  isSearching: boolean;
} {
  const [value, setValueInternal] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback((newValue: string) => {
    setValueInternal(newValue);

    // Show searching indicator immediately if value is different
    if (newValue !== debouncedValue) {
      setIsSearching(true);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced value
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
      setIsSearching(false);
      timeoutRef.current = null;
    }, delay);
  }, [delay, debouncedValue]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setValueInternal('');
    setDebouncedValue('');
    setIsSearching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { value, debouncedValue, setValue, clear, isSearching };
}
