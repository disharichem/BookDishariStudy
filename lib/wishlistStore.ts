'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { Product } from '@/types';

export const WISHLIST_STORAGE_KEY = 'dishari_wishlist_ids';
export const WISHLIST_EVENT = 'dishari-wishlist-updated';

/**
 * Safely retrieve wishlist IDs from localStorage
 */
export function getStoredWishlistIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
    }
  } catch (err) {
    console.warn('Failed to parse wishlist from localStorage:', err);
  }
  return [];
}

/**
 * Save wishlist IDs to localStorage and broadcast update event
 */
export function saveStoredWishlistIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanIds = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim().length > 0)));
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(cleanIds));
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: { ids: cleanIds } }));
  } catch (err) {
    console.warn('Failed to save wishlist to localStorage:', err);
  }
}

/**
 * Toggle a product ID in wishlist.
 * Returns true if added, false if removed.
 */
export function toggleWishlistId(productId: string): boolean {
  if (!productId) return false;
  const current = getStoredWishlistIds();
  const exists = current.includes(productId);
  let updated: string[];
  if (exists) {
    updated = current.filter((id) => id !== productId);
  } else {
    updated = [productId, ...current];
  }
  saveStoredWishlistIds(updated);
  return !exists;
}

/**
 * Remove a specific product ID from wishlist
 */
export function removeFromWishlistId(productId: string): void {
  if (!productId) return;
  const current = getStoredWishlistIds();
  const updated = current.filter((id) => id !== productId);
  saveStoredWishlistIds(updated);
}

/**
 * Clear all items from wishlist
 */
export function clearWishlistStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: { ids: [] } }));
  } catch (err) {
    console.warn('Failed to clear wishlist storage:', err);
  }
}

function subscribeWishlist(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(WISHLIST_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(WISHLIST_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

let cachedSnapshot = '[]';
let cachedRaw: string | null = null;

function getWishlistSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = raw || '[]';
    }
    return cachedSnapshot;
  } catch {
    return '[]';
  }
}

function getServerWishlistSnapshot(): string {
  return '[]';
}

/**
 * React hook to access and manage persisted Wishlist across all components and pages.
 * Guarantees SSR hydration safety and cross-component instant sync.
 */
export function useWishlist(allProducts: Product[] = []): {
  wishlistIds: string[];
  wishlistCount: number;
  wishlistedProducts: Product[];
  toggleWishlist: (product: Product) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isWishlisted: (productId: string) => boolean;
  isReady: boolean;
} {
  const rawJson = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getServerWishlistSnapshot
  );

  const wishlistIds: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === 'string');
      }
    } catch {
      return [];
    }
    return [];
  }, [rawJson]);

  const toggleWishlist = useCallback((product: Product) => {
    return toggleWishlistId(product.id);
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    removeFromWishlistId(productId);
  }, []);

  const clearWishlist = useCallback(() => {
    clearWishlistStorage();
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => {
      return wishlistIds.includes(productId);
    },
    [wishlistIds]
  );

  const wishlistedProducts = useMemo(() => {
    return wishlistIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [wishlistIds, allProducts]);

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    wishlistedProducts,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isWishlisted,
    isReady: true,
  };
}
