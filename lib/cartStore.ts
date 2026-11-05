'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { useMounted } from './useMounted';
import { Product, CartItem } from '@/types';

export const CART_STORAGE_KEY = 'dishari_cart_items';
export const CART_EVENT = 'dishari-cart-updated';

export interface StoredCartEntry {
  productId: string;
  quantity: number;
}

/**
 * Safely retrieve cart items from localStorage
 */
export function getStoredCartEntries(): StoredCartEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sanitized: StoredCartEntry[] = [];
      for (const item of parsed) {
        if (!item) continue;
        // Supports { productId, quantity } or legacy { product: { id }, quantity }
        const productId = typeof item.productId === 'string'
          ? item.productId
          : typeof item.product?.id === 'string'
          ? item.product.id
          : null;
        const quantity = typeof item.quantity === 'number' && item.quantity > 0
          ? Math.floor(item.quantity)
          : 1;

        if (productId) {
          const existing = sanitized.find((s) => s.productId === productId);
          if (existing) {
            existing.quantity += quantity;
          } else {
            sanitized.push({ productId, quantity });
          }
        }
      }
      return sanitized;
    }
  } catch (err) {
    console.warn('Failed to parse cart from localStorage:', err);
  }
  return [];
}

/**
 * Save cart items to localStorage and broadcast update event
 */
export function saveStoredCartEntries(entries: StoredCartEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const valid = entries.filter((e) => Boolean(e.productId) && e.quantity > 0);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(valid));
    window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { items: valid } }));
  } catch (err) {
    console.warn('Failed to save cart to localStorage:', err);
  }
}

/**
 * Add a product to the cart (or increment quantity if already present)
 */
export function addProductToCart(productId: string, quantity = 1): void {
  if (!productId || quantity <= 0) return;
  const current = getStoredCartEntries();
  const existingIndex = current.findIndex((item) => item.productId === productId);
  if (existingIndex !== -1) {
    current[existingIndex].quantity += quantity;
  } else {
    current.push({ productId, quantity });
  }
  saveStoredCartEntries(current);
}

/**
 * Ensure product is in cart for direct order (if already present, keeps quantity)
 */
export function ensureInCartForOrder(productId: string): void {
  if (!productId) return;
  const current = getStoredCartEntries();
  const exists = current.some((item) => item.productId === productId);
  if (!exists) {
    current.push({ productId, quantity: 1 });
    saveStoredCartEntries(current);
  }
}

/**
 * Update the quantity of a product in the cart
 */
export function updateCartItemQuantity(productId: string, quantity: number): void {
  if (!productId) return;
  const current = getStoredCartEntries();
  if (quantity <= 0) {
    const updated = current.filter((item) => item.productId !== productId);
    saveStoredCartEntries(updated);
  } else {
    const existing = current.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity = Math.floor(quantity);
      saveStoredCartEntries(current);
    }
  }
}

/**
 * Remove a product from the cart completely
 */
export function removeProductFromCart(productId: string): void {
  if (!productId) return;
  const current = getStoredCartEntries();
  const updated = current.filter((item) => item.productId !== productId);
  saveStoredCartEntries(updated);
}

/**
 * Clear the entire cart
 */
export function clearCartStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { items: [] } }));
  } catch (err) {
    console.warn('Failed to clear cart storage:', err);
  }
}

/**
 * Add all items from wishlist to cart
 */
export function addMultipleToCart(productIds: string[]): void {
  if (!productIds || productIds.length === 0) return;
  const current = getStoredCartEntries();
  productIds.forEach((pid) => {
    const existing = current.find((item) => item.productId === pid);
    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ productId: pid, quantity: 1 });
    }
  });
  saveStoredCartEntries(current);
}

function subscribeCart(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

let cachedCartSnapshot = '[]';
let cachedCartRaw: string | null = null;

function getCartSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw !== cachedCartRaw) {
      cachedCartRaw = raw;
      cachedCartSnapshot = raw || '[]';
    }
    return cachedCartSnapshot;
  } catch {
    return '[]';
  }
}

function getServerCartSnapshot(): string {
  return '[]';
}

/**
 * React hook to access and manage the persistent Shopping Cart across all pages and tabs.
 */
export function useCart(allProducts: Product[] = []): {
  cartItems: CartItem[];
  totalCartCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  directOrder: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addAllFromWishlist: (productsToAdd: Product[]) => void;
  isReady: boolean;
} {
  const mounted = useMounted();

  const rawJson = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const entries: StoredCartEntry[] = useMemo(() => {
    if (!mounted) return [];
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        const sanitized: StoredCartEntry[] = [];
        for (const item of parsed) {
          if (!item) continue;
          const productId = typeof item.productId === 'string'
            ? item.productId
            : typeof item.product?.id === 'string'
            ? item.product.id
            : null;
          const quantity = typeof item.quantity === 'number' && item.quantity > 0
            ? Math.floor(item.quantity)
            : 1;

          if (productId) {
            const existing = sanitized.find((s) => s.productId === productId);
            if (existing) {
              existing.quantity += quantity;
            } else {
              sanitized.push({ productId, quantity });
            }
          }
        }
        return sanitized;
      }
    } catch {
      return [];
    }
    return [];
  }, [rawJson, mounted]);

  // Map entries to hydrated CartItem array
  const cartItems: CartItem[] = useMemo(() => {
    if (!mounted) return [];
    return entries
      .map((entry) => {
        const product = allProducts.find((p) => p.id === entry.productId);
        if (!product) return null;
        return {
          product,
          quantity: entry.quantity,
        };
      })
      .filter((item): item is CartItem => item !== null);
  }, [entries, allProducts, mounted]);

  const totalCartCount = useMemo(() => {
    if (!mounted) return 0;
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems, mounted]);

  const subtotal = useMemo(() => {
    if (!mounted) return 0;
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cartItems, mounted]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    addProductToCart(product.id, quantity);
  }, []);

  const directOrder = useCallback((product: Product) => {
    ensureInCartForOrder(product.id);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    removeProductFromCart(productId);
  }, []);

  const clearCart = useCallback(() => {
    clearCartStorage();
  }, []);

  const addAllFromWishlist = useCallback((productsToAdd: Product[]) => {
    addMultipleToCart(productsToAdd.map((p) => p.id));
  }, []);

  return {
    cartItems,
    totalCartCount,
    subtotal,
    addToCart,
    directOrder,
    updateQuantity,
    removeFromCart,
    clearCart,
    addAllFromWishlist,
    isReady: mounted,
  };
}
