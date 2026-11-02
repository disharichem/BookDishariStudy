'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '@/types';
import { Sparkles, Tag, TrendingDown, X, ArrowRight, BellRing, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface PriceAlert {
  id: string;
  productId: string;
  title: string;
  oldPrice?: number;
  newPrice: number;
  originalPrice?: number;
  type: 'price_drop' | 'new_discount' | 'price_change';
  discountPercent?: number;
  timestamp: number;
  customMessage?: string;
}

const STORAGE_KEY = 'dishari_product_price_cache_v2';

// Helper to trigger price alert event globally
export function broadcastPriceAlert(alert: Omit<PriceAlert, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const fullAlert: PriceAlert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  window.dispatchEvent(new CustomEvent('dishari:price-alert', { detail: fullAlert }));
}

interface PriceAlertToastProps {
  products: Product[];
  onOpenProduct?: (product: Product) => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({ products, onOpenProduct }) => {
  const router = useRouter();
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const hasInitializedRef = useRef(false);

  const removeAlert = useCallback((id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addAlert = useCallback((alert: PriceAlert) => {
    setActiveAlerts((prev) => {
      // Avoid duplicate alert for same product within 5 seconds
      const exists = prev.some(
        (a) => a.productId === alert.productId && Date.now() - a.timestamp < 5000
      );
      if (exists) return prev;
      return [alert, ...prev.slice(0, 2)]; // Keep max 3 alerts at a time
    });

    // Auto dismiss after 7 seconds
    setTimeout(() => {
      removeAlert(alert.id);
    }, 7000);
  }, [removeAlert]);

  // Listen to custom window events for price alerts (dispatched by admin manager or live updates)
  useEffect(() => {
    const handleCustomAlert = (event: Event) => {
      const customEvent = event as CustomEvent<PriceAlert>;
      if (customEvent.detail) {
        addAlert(customEvent.detail);
      }
    };

    window.addEventListener('dishari:price-alert', handleCustomAlert);
    return () => {
      window.removeEventListener('dishari:price-alert', handleCustomAlert);
    };
  }, [addAlert]);

  // Monitor products array and compare with cached prices in localStorage
  useEffect(() => {
    if (!products || products.length === 0) return;

    try {
      const rawCache = localStorage.getItem(STORAGE_KEY);
      const cachedPrices: Record<string, { price: number; originalPrice?: number }> = rawCache
        ? JSON.parse(rawCache)
        : {};

      if (!hasInitializedRef.current) {
        // If first visit, record baseline prices and check if any product has an active discount
        // We can show one introductory highlight if discount exists
        const updatedCache: Record<string, { price: number; originalPrice?: number }> = {};
        products.forEach((p) => {
          updatedCache[p.id] = { price: p.price, originalPrice: p.originalPrice };
        });

        if (!rawCache) {
          // Find first discounted product to show a welcome discount alert to user
          const discountedProduct = products.find(
            (p) => p.originalPrice && p.originalPrice > p.price
          );
          if (discountedProduct && discountedProduct.originalPrice) {
            const savings = discountedProduct.originalPrice - discountedProduct.price;
            const pct = Math.round((savings / discountedProduct.originalPrice) * 100);
            const initialAlert: PriceAlert = {
              id: `welcome-discount-${discountedProduct.id}`,
              productId: discountedProduct.id,
              title: discountedProduct.titleBn,
              newPrice: discountedProduct.price,
              oldPrice: discountedProduct.originalPrice,
              originalPrice: discountedProduct.originalPrice,
              discountPercent: pct,
              type: 'new_discount',
              timestamp: Date.now(),
              customMessage: `বিশেষ অফার চালু রয়েছে! ৳${savings} সাশ্রয়ে এখনই সংগ্রহ করুন।`,
            };
            setTimeout(() => addAlert(initialAlert), 1500);
          }
        } else {
          // Check for price changes against existing cache
          products.forEach((p) => {
            const prev = cachedPrices[p.id];
            if (prev) {
              const priceChanged = prev.price !== p.price;
              const hasNewDiscount =
                p.originalPrice &&
                p.originalPrice > p.price &&
                (!prev.originalPrice || prev.originalPrice <= prev.price);

              if (priceChanged || hasNewDiscount) {
                let alertType: 'price_drop' | 'new_discount' | 'price_change' = 'price_change';
                let msg = '';
                let pct: number | undefined = undefined;

                if (hasNewDiscount && p.originalPrice) {
                  alertType = 'new_discount';
                  pct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                  msg = `নতুন বিশেষ ডিসকাউন্ট যোগ হয়েছে! পূর্বের মূল্য ৳${p.originalPrice} থেকে এখন মাত্র ৳${p.price}!`;
                } else if (p.price < prev.price) {
                  alertType = 'price_drop';
                  const dropAmount = prev.price - p.price;
                  msg = `দাম কমেছে! ৳${dropAmount} মূল্যছাড়ে বর্তমান মূল্য ৳${p.price}।`;
                } else if (priceChanged) {
                  msg = `পণ্যের মূল্য পরিবর্তিত হয়ে এখন ৳${p.price} হয়েছে।`;
                }

                const alert: PriceAlert = {
                  id: `change-${p.id}-${Date.now()}`,
                  productId: p.id,
                  title: p.titleBn,
                  oldPrice: prev.price,
                  newPrice: p.price,
                  originalPrice: p.originalPrice,
                  discountPercent: pct,
                  type: alertType,
                  timestamp: Date.now(),
                  customMessage: msg,
                };
                addAlert(alert);
              }
            }
          });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCache));
        hasInitializedRef.current = true;
      } else {
        // Subsequent updates during active session (e.g. admin edit or Firestore sync)
        const updatedCache = { ...cachedPrices };
        products.forEach((p) => {
          const prev = cachedPrices[p.id];
          if (prev && (prev.price !== p.price || prev.originalPrice !== p.originalPrice)) {
            const isDiscountAdded =
              p.originalPrice &&
              p.originalPrice > p.price &&
              (!prev.originalPrice || prev.originalPrice <= prev.price);

            const isPriceDrop = p.price < prev.price;
            const pct =
              p.originalPrice && p.originalPrice > p.price
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : undefined;

            let type: 'price_drop' | 'new_discount' | 'price_change' = 'price_change';
            let message = '';

            if (isDiscountAdded) {
              type = 'new_discount';
              message = `🎉 নতুন ডিসকাউন্ট যুক্ত হয়েছে! ৳${p.originalPrice} এর বই এখন মাত্র ৳${p.price} (${pct}% ছাড়)!`;
            } else if (isPriceDrop) {
              type = 'price_drop';
              message = `📉 দারুণ মূল্যহ্রাস! "${p.titleBn}" এর দাম কমে এখন মাত্র ৳${p.price}!`;
            } else {
              message = `📢 মূল্য আপডেট: "${p.titleBn}" এর নতুন মূল্য ৳${p.price} নির্ধারিত হয়েছে।`;
            }

            addAlert({
              id: `alert-change-${p.id}-${Date.now()}`,
              productId: p.id,
              title: p.titleBn,
              oldPrice: prev.price,
              newPrice: p.price,
              originalPrice: p.originalPrice,
              discountPercent: pct,
              type,
              customMessage: message,
              timestamp: Date.now(),
            });

            updatedCache[p.id] = { price: p.price, originalPrice: p.originalPrice };
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCache));
      }
    } catch (e) {
      console.warn('Price tracker error:', e);
    }
  }, [products, addAlert]);

  if (activeAlerts.length === 0) return null;

  return (
    <aside 
      aria-label="মূল্য ও ডিসকাউন্ট নোটিফিকেশন"
      className="fixed top-20 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 space-y-3 pointer-events-none"
    >
      {activeAlerts.map((alert) => {
        const isDiscount = alert.type === 'new_discount';
        const isDrop = alert.type === 'price_drop';

        return (
          <div
            key={alert.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-cyan-500/40 animate-in slide-in-from-top-3 fade-in duration-300 relative overflow-hidden group"
          >
            {/* Top Accent Gradient Line */}
            <div className={`absolute top-0 inset-x-0 h-1 ${
              isDiscount ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400' :
              isDrop ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400' :
              'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400'
            }`} />

            <div className="flex items-start gap-3">
              {/* Icon Badge */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isDiscount
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  : isDrop
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
              }`}>
                {isDiscount ? (
                  <Percent className="w-4 h-4 animate-pulse" />
                ) : isDrop ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <BellRing className="w-4 h-4" />
                )}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isDiscount
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : isDrop
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                  }`}>
                    {isDiscount ? '🔥 নতুন অফার / ডিসকাউন্ট' : isDrop ? '📉 দারুণ মূল্যহ্রাস' : '📢 মূল্য আপডেট'}
                  </span>
                  {alert.discountPercent && (
                    <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-400/30 px-1.5 py-0.5 rounded">
                      -{alert.discountPercent}% ছাড়
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 leading-snug">
                  {alert.title}
                </h4>

                <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                  {alert.customMessage || (
                    <>
                      {alert.oldPrice && alert.oldPrice !== alert.newPrice && (
                        <span className="line-through text-slate-400 mr-1.5 tabular-nums">
                          ৳{alert.oldPrice}
                        </span>
                      )}
                      <span className="text-cyan-300 font-bold tabular-nums">
                        নতুন মূল্য: ৳{alert.newPrice}
                      </span>
                    </>
                  )}
                </p>

                {/* Quick Action Button */}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const matched = products.find((p) => p.id === alert.productId);
                      if (onOpenProduct && matched) {
                        onOpenProduct(matched);
                      } else {
                        router.push(`/products/${alert.productId}`);
                      }
                      removeAlert(alert.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <span>বইটি দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeAlert(alert.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors cursor-pointer"
                  >
                    পরে দেখব
                  </button>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeAlert(alert.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="নোটিফিকেশন বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
