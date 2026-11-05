'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMounted } from '@/lib/useMounted';
import { Product } from '@/types';
import { toBengaliNumber, calculateCommissionPercent } from '@/lib/utils';
import { getBaseProductRatingSummary } from '@/lib/ratings';
import { 
  Flame, 
  Star, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Download, 
  Layers, 
  Heart, 
  Sparkles,
  MoveHorizontal
} from 'lucide-react';

interface BestSellersProps {
  products: Product[];
  wishlistIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenSampleModal?: (product: Product) => void;
}

// Bestseller badge labels for ranking
const BESTSELLER_RANKS = [
  { rank: '১', label: 'সেরা বিক্রিত #১' },
  { rank: '২', label: 'মেগা কম্বো #২' },
  { rank: '৩', label: 'জনপ্রিয় নোট #৩' },
  { rank: '৪', label: 'টপ প্রশ্নব্যাংক #৪' },
  { rank: '৫', label: 'পর্যায় সারণি #৫' },
  { rank: '৬', label: 'ভৌত রসায়ন #৬' },
  { rank: '৭', label: 'ব্যবহারিক #৭' },
  { rank: '৮', label: 'ফর্মুলা চার্ট #৮' },
];

export const BestSellers: React.FC<BestSellersProps> = ({
  products,
  wishlistIds = [],
  onToggleWishlist,
  onOpenProduct,
  onDirectOrder,
  onAddToCart,
  onOpenSampleModal,
}) => {
  const mounted = useMounted();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Pick and sort all bestsellers based on priority order (up to 8 items in single row)
  const bestSellerProducts = useMemo(() => {
    const priorityIds = [
      'dishari-printed-chemistry-guide',
      'dishari-complete-combo-box',
      'dishari-sample-combo-pack',
      'dishari-organic-chem-pdf',
      'dishari-cq-mcq-question-bank',
      'dishari-inorganic-notes-pdf',
      'dishari-physical-chem-formulas',
      'dishari-practical-viva-companion',
      'dishari-formula-wallchart-card',
    ];

    const sorted: Product[] = [];
    priorityIds.forEach((id) => {
      const match = products.find((p) => p.id === id);
      if (match && !sorted.some((s) => s.id === match.id)) {
        sorted.push(match);
      }
    });

    // Fill in any other products from catalog
    products.forEach((p) => {
      if (!sorted.some((s) => s.id === p.id)) {
        sorted.push(p);
      }
    });

    return sorted;
  }, [products]);

  // Check scroll position to toggle arrow buttons
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
  }, [checkScrollState, bestSellerProducts.length]);

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section id="catalog" className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 overflow-hidden scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>শিক্ষার্থীদের শীর্ষ পছন্দ · হট বেস্টসেলার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              সর্বাধিক বিক্রিত বই ও নোটস
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              এসএসসি রসায়ন পরীক্ষার সেরা প্রস্তুতি নিশ্চিত করতে বিজ্ঞান বিভাগের শিক্ষার্থীদের সবচেয়ে বেশি পঠিত ও শীর্ষ রেটেড প্রকাশনা।
            </p>
          </div>

          {/* Right Action Controls: Carousel arrows */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <button
                type="button"
                onClick={handleScrollLeft}
                disabled={!canScrollLeft}
                aria-label="বামে স্লাইড করুন"
                title="পূর্বের বইসমূহ"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                disabled={!canScrollRight}
                aria-label="ডানে স্লাইড করে আরো বই দেখুন"
                title="পরবর্তী বইসমূহ"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Single Row Horizontal Carousel Slider with Relative Floating Buttons */}
        <div className="relative group/slider">
          
          {/* Floating Left Arrow (Desktop) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={handleScrollLeft}
              aria-label="বামে স্লাইড করুন"
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 hover:border-cyan-600 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Horizontal Track (সব বই একই সারিতে, বামে স্লাইড করলে ডান থেকে আরো বই বের হয়) */}
          <div
            ref={sliderRef}
            className="flex flex-row gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-3 px-1 no-scrollbar select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bestSellerProducts.map((product, index) => {
              const isWishlisted = mounted && wishlistIds.includes(product.id);
              const isPdf = product.format === 'pdf';
              const isCombo = product.format === 'combo';
              const ratingSummary = getBaseProductRatingSummary(product.id);
              const commissionPercent = calculateCommissionPercent(product.price, product.originalPrice);
              const badge = BESTSELLER_RANKS[index] || { rank: toBengaliNumber(index + 1), label: `টপ সেলার #${toBengaliNumber(index + 1)}` };

              return (
                <div
                  key={product.id}
                  className="w-[270px] sm:w-[290px] md:w-[310px] shrink-0 snap-start group/card relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 dark:hover:border-cyan-500/50 shadow-xs hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Ranking Ribbon */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900/90 dark:bg-slate-800/90 text-white border border-white/20 shadow-sm backdrop-blur-xs tracking-wide">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{badge.label}</span>
                  </div>

                  {/* Wishlist Heart Toggle */}
                  {onToggleWishlist && (
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      aria-label={isWishlisted ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে সেভ করুন'}
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                        isWishlisted
                          ? 'bg-white text-rose-500 scale-105 shadow-md border border-rose-200'
                          : 'bg-slate-900/60 text-white hover:bg-white hover:text-rose-500 border border-white/20'
                      }`}
                      title={isWishlisted ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে সেভ করুন'}
                    >
                      <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  )}

                  {/* Cover Image */}
                  <Link
                    href={`/products/${product.id}`}
                    onClick={() => onOpenProduct(product)}
                    className="block relative aspect-[4/5] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                    title={`${product.titleBn} - বিস্তারিত দেখতে ক্লিক করুন`}
                  >
                    <Image
                      src={product.coverImage}
                      alt={product.titleBn}
                      fill
                      sizes="(max-width: 640px) 280px, 320px"
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover/card:scale-104 transition-transform duration-300"
                    />

                    {/* Format Bottom Badge */}
                    <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                      <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs border border-white/10">
                        {isPdf ? (
                          <>
                            <Download className="w-3.5 h-3.5 text-cyan-400" />
                            <span>ডিজিটাল PDF</span>
                          </>
                        ) : isCombo ? (
                          <>
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span>কম্বো প্যাকেজ</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                            <span>মুদ্রিত কপি</span>
                          </>
                        )}
                      </span>

                      {commissionPercent !== null && (
                        <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {toBengaliNumber(commissionPercent)}% ছাড়
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Chemistry Branch Tag */}
                      <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                        {product.branches && product.branches.length > 0
                          ? product.branches.map((b) => (b === 'organic' ? 'জৈব রসায়ন' : b === 'inorganic' ? 'অজৈব রসায়ন' : 'ভৌত রসায়ন')).join(' · ')
                          : 'রসায়ন নির্দেশিকা'}
                      </span>

                      {/* Product Title */}
                      <Link
                        href={`/products/${product.id}`}
                        onClick={() => onOpenProduct(product)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
                        title={product.titleBn}
                      >
                        {product.titleBn}
                      </Link>

                      {/* Ratings & Reviews */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {toBengaliNumber(ratingSummary.averageRating.toFixed(1))}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          ({toBengaliNumber(ratingSummary.totalRatings)} রিভিউ)
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                          ৳{toBengaliNumber(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
                            ৳{toBengaliNumber(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAddToCart(product)}
                          className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>কার্ট</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDirectOrder(product)}
                          className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                        >
                          <span>এখুনি কিনুন</span>
                        </button>
                      </div>

                      {/* Sample Reader button if available */}
                      {product.samplePages && product.samplePages.length > 0 && onOpenSampleModal && (
                        <button
                          type="button"
                          onClick={() => onOpenSampleModal(product)}
                          className="w-full py-1 text-[11px] font-medium text-slate-500 hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-400 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          <span>নমুনা পৃষ্ঠা পড়ে দেখুন ❯</span>
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
              aria-label="ডানে স্লাইড করে আরো বই দেখুন"
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 hover:border-cyan-600 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

        </div>

        {/* Swipe Hint for Touch/Mobile Users */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <MoveHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <span>বামে স্লাইড করুন—ডান দিক থেকে আরও বই দেখতে পাবেন</span>
          </div>
          <span className="hidden sm:inline font-medium">
            মোট {toBengaliNumber(bestSellerProducts.length)}টি বেস্টসেলার বই ও নোটস
          </span>
        </div>

      </div>
    </section>
  );
};
