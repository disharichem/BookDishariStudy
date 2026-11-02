'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dishari_theme';

export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return getSystemTheme();
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Could not store theme in localStorage:', e);
  }
  window.dispatchEvent(new CustomEvent('dishari-theme-change', { detail: { theme } }));
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('dishari-theme-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('dishari-theme-change', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): ThemeMode {
  return getStoredTheme();
}

function getServerSnapshot(): ThemeMode {
  return 'light';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    applyTheme(newTheme);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
}
