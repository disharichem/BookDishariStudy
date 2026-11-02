'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { Product } from '@/types';

export const RECENTLY_VIEWED_STORAGE_KEY = 'dishari_recently_viewed';
export const RECENTLY_VIEWED_EVENT = 'dishari-recently-viewed-updated';
const MAX_RECENT_ITEMS = 5;

/**
 * Safely retrieve recently viewed product IDs from localStorage
 */
export function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_RECENT_ITEMS);
    }
  } catch (err) {
    console.warn('Failed to parse recently viewed items from localStorage:', err);
  }
  return [];
}

/**
 * Record a product as recently viewed.
 * Moves the product to the front of the list, dedupes, caps to 5 items,
 * and emits a custom event for live cross-component sync.
 */
export function addRecentlyViewed(productId: string): void {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const current = getRecentlyViewedIds();
    const updated = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT, { detail: { updatedIds: updated, addedId: productId } }));
  } catch (err) {
    console.warn('Failed to save recently viewed product to localStorage:', err);
  }
}

/**
 * Remove a specific product ID from recently viewed list.
 */
export function removeRecentlyViewed(productId: string): void {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const current = getRecentlyViewedIds();
    const updated = current.filter((id) => id !== productId);
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT, { detail: { updatedIds: updated } }));
  } catch (err) {
    console.warn('Failed to remove recently viewed product:', err);
  }
}

/**
 * Clear the recently viewed history completely.
 */
export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT, { detail: { updatedIds: [] } }));
  } catch (err) {
    console.warn('Failed to clear recently viewed products:', err);
  }
}

function subscribeRecentlyViewed(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(RECENTLY_VIEWED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(RECENTLY_VIEWED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

let cachedSnapshot = '[]';
let cachedRaw: string | null = null;

function getRecentlyViewedSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = raw || '[]';
    }
    return cachedSnapshot;
  } catch {
    return '[]';
  }
}

function getServerRecentlyViewedSnapshot(): string {
  return '[]';
}

/**
 * React hook to access and subscribe to recently viewed products.
 * Uses useSyncExternalStore for pristine SSR/hydration safety and reactive updates.
 */
export function useRecentlyViewed(allProducts: Product[]): {
  recentProducts: Product[];
  clearHistory: () => void;
  removeProduct: (id: string) => void;
  isReady: boolean;
} {
  const rawIds = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewedSnapshot,
    getServerRecentlyViewedSnapshot
  );

  const recentIds: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawIds);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_RECENT_ITEMS);
      }
    } catch {
      return [];
    }
    return [];
  }, [rawIds]);

  const clearHistory = useCallback(() => {
    clearRecentlyViewed();
  }, []);

  const removeProduct = useCallback((id: string) => {
    removeRecentlyViewed(id);
  }, []);

  // Map IDs to actual Product items in the order they were viewed
  const recentProducts: Product[] = useMemo(() => {
    return recentIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentIds, allProducts]);

  return {
    recentProducts,
    clearHistory,
    removeProduct,
    isReady: true,
  };
}
