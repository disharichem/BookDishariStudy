'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { useMounted } from './useMounted';
import { CompletedOrder } from '@/types';

export const RECENT_ORDERS_STORAGE_KEY = 'dishari_recent_orders';
export const RECENT_ORDERS_EVENT = 'dishari-recent-orders-updated';

export function getStoredRecentOrders(): CompletedOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse recent orders from localStorage:', e);
  }
  return [];
}

export function saveStoredRecentOrder(order: CompletedOrder): void {
  if (typeof window === 'undefined' || !order) return;
  try {
    const current = getStoredRecentOrders();
    const updated = [order, ...current.filter((o) => o.orderId !== order.orderId)].slice(0, 10);
    localStorage.setItem(RECENT_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENT_ORDERS_EVENT, { detail: { orders: updated } }));
  } catch (e) {
    console.warn('Failed to save recent order to localStorage:', e);
  }
}

function subscribeOrders(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(RECENT_ORDERS_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(RECENT_ORDERS_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

let cachedOrdersSnapshot = '[]';
let cachedOrdersRaw: string | null = null;

function getOrdersSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    const raw = localStorage.getItem(RECENT_ORDERS_STORAGE_KEY);
    if (raw !== cachedOrdersRaw) {
      cachedOrdersRaw = raw;
      cachedOrdersSnapshot = raw || '[]';
    }
    return cachedOrdersSnapshot;
  } catch {
    return '[]';
  }
}

function getServerOrdersSnapshot(): string {
  return '[]';
}

export function useRecentOrders(): {
  recentOrders: CompletedOrder[];
  addRecentOrder: (order: CompletedOrder) => void;
  isReady: boolean;
} {
  const mounted = useMounted();

  const rawJson = useSyncExternalStore(
    subscribeOrders,
    getOrdersSnapshot,
    getServerOrdersSnapshot
  );

  const recentOrders = useMemo(() => {
    if (!mounted) return [];
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        return parsed as CompletedOrder[];
      }
    } catch {
      return [];
    }
    return [];
  }, [rawJson, mounted]);

  const addRecentOrder = useCallback((order: CompletedOrder) => {
    saveStoredRecentOrder(order);
  }, []);

  return {
    recentOrders,
    addRecentOrder,
    isReady: mounted,
  };
}
