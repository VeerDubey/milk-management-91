
import { useEffect, useState, useRef, useCallback } from 'react';

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Custom hook for debounced value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Custom hook for throttling
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0);
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        func(...args);
        lastRan.current = now;
      }
    },
    [func, delay]
  );
}

// Custom hook for detecting if component is visible in viewport
export function useOnScreen(ref: React.RefObject<HTMLElement>, rootMargin: string = '0px') {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, rootMargin]);
  
  return isIntersecting;
}

// Virtual scrolling utility for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  visibleItems: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + visibleItems * itemHeight) / itemHeight)
  );
  
  const visibleData = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    []
  );
  
  return {
    visibleData,
    totalHeight,
    offsetY,
    onScroll,
    startIndex,
    endIndex
  };
}

// Web worker utility for heavy computations
export function createWorker(workerFunction: Function) {
  const blob = new Blob(['self.onmessage = ', workerFunction.toString()], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  
  return {
    worker,
    cleanup: () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    }
  };
}

// Cache utility for expensive operations
export function createCache<T extends object, R>(
  fn: (arg: T) => R,
  keyFn: (arg: T) => string = JSON.stringify
) {
  const cache: { [key: string]: { result: R; timestamp: number } } = {};
  const MAX_CACHE_SIZE = 100;
  const TTL = 1000 * 60 * 5; // 5 minutes
  
  return {
    execute: (arg: T): R => {
      const key = keyFn(arg);
      const cached = cache[key];
      const now = Date.now();
      
      // If we have a valid cache hit
      if (cached && now - cached.timestamp < TTL) {
        return cached.result;
      }
      
      // Compute new result
      const result = fn(arg);
      
      // Clean up cache if too large
      const cacheKeys = Object.keys(cache);
      if (cacheKeys.length >= MAX_CACHE_SIZE) {
        const oldestKey = cacheKeys.reduce((oldest, key) => {
          return cache[key].timestamp < cache[oldest].timestamp ? key : oldest;
        }, cacheKeys[0]);
        
        delete cache[oldestKey];
      }
      
      // Store in cache
      cache[key] = {
        result,
        timestamp: now
      };
      
      return result;
    },
    
    invalidate: (arg: T) => {
      const key = keyFn(arg);
      delete cache[key];
    },
    
    clear: () => {
      Object.keys(cache).forEach(key => {
        delete cache[key];
      });
    }
  };
}

// Memoization utility for pure functions
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  const memoized = function(...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  
  return memoized as T;
}

// IndexedDB helper for offline data persistence
export const offlineDB = {
  async connect(dbName: string, version: number = 1) {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Define stores based on application data types
        if (!db.objectStoreNames.contains('trackSheets')) {
          db.createObjectStore('trackSheets', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
      };
    });
  },
  
  async get<T>(db: IDBDatabase, storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },
  
  async getAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },
  
  async put<T>(db: IDBDatabase, storeName: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },
  
  async delete(db: IDBDatabase, storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
};
