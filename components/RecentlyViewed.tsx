'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useRecentlyViewed } from '@/lib/recentlyViewed';
import { toBengaliNumber } from '@/lib/utils';
import { useMounted } from '@/lib/useMounted';
import { 
  Clock, 
  Trash2, 
  BookOpen, 
  Download, 
  Layers, 
  ShoppingBag, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight,
  MoveHorizontal
} from 'lucide-react';

interface RecentlyViewedProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onOpenSampleModal?: (product: Product) => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  products,
  onOpenProduct,
  onDirectOrder,
  onOpenSampleModal,
}) => {
  const mounted = useMounted();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { recentProducts, clearHistory, removeProduct, isReady } = useRecentlyViewed(products);

  // Monitor scroll position for Left/Right slide navigation
  const checkScrollState = useCallback(() => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = sliderRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState, recentProducts.length]);

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // If not hydrated yet or no books viewed, don't show the section
  if (!mounted || !isReady || recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-slate-100/70 dark:bg-slate-900/60 py-8 border-y border-slate-200 dark:border-slate-800 transition-colors duration-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-xs border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  সম্প্রতি দেখা বইসমূহ
                </h2>
                <span className="text-[11px] font-semibold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                  {toBengaliNumber(recentProducts.length)}টি বই
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                আপনার দেখা বইসমূহ—ডান দিক থেকে বামে স্লাইড করে সহজে রিভিজিট ও অর্ডার করুন
              </p>
            </div>
          </div>

          {/* Action buttons & Slide Navigation */}
          <div className="flex items-center gap-2">
            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                aria-label="বামে স্লাইড করুন"
                title="পূর্বের বইগুলো দেখুন"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                aria-label="ডান দিক থেকে বামে স্লাইড করুন"
                title="পরবর্তী আরও বই দেখুন"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 bg-white dark:bg-slate-800/80 transition-colors shadow-2xs"
              title="সম্প্রতি দেখার তালিকা মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">হিস্ট্রি মুছুন</span>
            </button>
          </div>
        </div>

        {/* Single Row Horizontal Slider (বইগুলো একই সারিতে দেখাবে যা ডান দিক থেকে বামে স্লাইড করা যাবে) */}
        <div className="relative group/recent-slider">
          
          {/* Floating Left Arrow (Desktop) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={handleScrollLeft}
              aria-label="বামে স্ক্রোল করুন"
              className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 hover:border-cyan-600 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Horizontal Track */}
          <div
            ref={sliderRef}
            className="flex flex-row gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-0.5 no-scrollbar select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recentProducts.map((product) => {
              const isPdf = product.format === 'pdf';
              const isCombo = product.format === 'combo';

              return (
                <div
                  key={product.id}
                  className="w-[230px] sm:w-[250px] md:w-[270px] shrink-0 snap-start group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 shadow-xs hover:shadow-md dark:shadow-slate-950/50 transition-all duration-200 overflow-hidden"
                >
                  {/* Remove single item button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeProduct(product.id);
                    }}
                    title="এই বইটি তালিকা থেকে সরান"
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 backdrop-blur-xs shadow-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Clickable Image & Badge */}
                  <Link
                    href={`/products/${product.id}`}
                    onClick={() => onOpenProduct(product)}
                    className="block relative aspect-[4/5] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={product.coverImage}
                      alt={product.titleBn}
                      fill
                      sizes="(max-width: 640px) 230px, 270px"
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Format Indicator Badge */}
                    <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-white/10 backdrop-blur-xs">
                      {isPdf ? (
                        <>
                          <Download className="w-3 h-3 text-cyan-400" />
                          <span>PDF</span>
                        </>
                      ) : isCombo ? (
                        <>
                          <Layers className="w-3 h-3 text-amber-400" />
                          <span>কম্বো</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3 text-emerald-400" />
                          <span>বই</span>
                        </>
                      )}
                    </div>
                  </Link>

                  {/* Content Area */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                        {product.branches && product.branches.length > 0
                          ? (product.branches[0] === 'organic' ? 'জৈব রসায়ন' : product.branches[0] === 'inorganic' ? 'অজৈব রসায়ন' : 'ভৌত রসায়ন')
                          : 'রসায়ন নোট'}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        onClick={() => onOpenProduct(product)}
                        className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 line-clamp-2 leading-tight transition-colors"
                        title={product.titleBn}
                      >
                        {product.titleBn}
                      </Link>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ৳{toBengaliNumber(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ৳{toBengaliNumber(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          href={`/products/${product.id}`}
                          onClick={() => onOpenProduct(product)}
                          className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>দেখুন</span>
                        </Link>

                        <button
                          onClick={() => onDirectOrder(product)}
                          className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-cyan-600 hover:bg-cyan-700 text-white shadow-2xs transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>এখুনি কিনুন</span>
                        </button>
                      </div>

                      {/* Quick Sample Button if available */}
                      {product.samplePages && product.samplePages.length > 0 && onOpenSampleModal && (
                        <button
                          onClick={() => onOpenSampleModal(product)}
                          className="w-full mt-1.5 py-1 text-[10px] font-medium text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-2.5 h-2.5" />
                          <span>নমুনা পেইজ পড়ুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Right Arrow (Desktop) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={handleScrollRight}
              aria-label="ডান দিক থেকে বামে স্লাইড করুন"
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 hover:border-cyan-600 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Swipe Hint for Touch/Mobile Users */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
          <div className="flex items-center gap-1.5">
            <MoveHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <span>ডান দিক থেকে বামে স্লাইড করে বাকি বইগুলো দেখুন</span>
          </div>
        </div>

      </div>
    </section>
  );
};
