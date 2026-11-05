'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns true only on the client after hydration has completed.
 * Guarantees zero SSR-CSR hydration mismatch and complies cleanly with React 19 rules.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
