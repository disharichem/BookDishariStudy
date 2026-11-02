'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { BookOpen, Download, Layers, Eye, ShoppingCart, Heart } from 'lucide-react';
import { toBengaliNumber, calculateCommissionPercent } from '@/lib/utils';
import { StarRating } from './StarRating';
import { getProductRatingSummary, getUserRating, submitStudentRating, getBaseProductRatingSummary } from '@/lib/ratings';
import { addRecentlyViewed } from '@/lib/recentlyViewed';

interface BookCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onOpenSample?: (product: Product) => void;
  onViewDetails?: (product: Product, tab?: 'overview' | 'toc' | 'sample') => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onViewDetails,
  onDirectOrder,
  onAddToCart,
}) => {
  const isPdf = product.format === 'pdf';
  const isCombo = product.format === 'combo';
  const commissionPercent = calculateCommissionPercent(product.price, product.originalPrice);

  // Initialize with baseline-only to guarantee SSR and CSR hydration parity
  const [ratingSummary, setRatingSummary] = useState(() => getBaseProductRatingSummary(product.id));
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratedSuccess, setRatedSuccess] = useState(false);

  useEffect(() => {
    // Hydrate client state from localStorage asynchronously
    const timer = setTimeout(() => {
      setRatingSummary(getProductRatingSummary(product.id));
      setUserRating(getUserRating(product.id));
    }, 0);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId: string }>;
      if (customEvent.detail?.productId === product.id) {
        setRatingSummary(getProductRatingSummary(product.id));
        setUserRating(getUserRating(product.id));
      }
    };
    window.addEventListener('dishari-rating-updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('dishari-rating-updated', handleUpdate);
    };
  }, [product.id]);

  const handleRate = (stars: number) => {
    const updated = submitStudentRating(product.id, stars);
    setRatingSummary(updated);
    setUserRating(stars);
    setRatedSuccess(true);
    setTimeout(() => setRatedSuccess(false), 2500);
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:shadow-slate-950/50 transition-all duration-200 overflow-hidden relative">
      
      {/* Cover Image Area - Clickable to Open Dedicated Product Detail Page */}
      <Link 
        href={`/products/${product.id}`}
        onClick={() => {
          addRecentlyViewed(product.id);
          onViewDetails?.(product);
        }}
        className="block relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
        title={`${product.titleBn} - বিস্তারিত দেখতে ক্লিক করুন`}
      >
        <Image
          src={product.coverImage}
          alt={product.titleBn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          referrerPolicy="no-referrer"
          className="object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {/* Clear format indicator in corner */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs border border-white/10">
          {isPdf ? (
            <>
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>ডিজিটাল PDF</span>
            </>
          ) : isCombo ? (
            <>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>কম্বো প্যাক</span>
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>মুদ্রিত বই</span>
            </>
          )}
        </div>

        {/* Wishlist Heart Icon Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          aria-label={isWishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all cursor-pointer backdrop-blur-md shadow-xs ${
            isWishlisted
              ? 'bg-white text-rose-500 scale-105 shadow-md border border-rose-200'
              : 'bg-slate-900/60 text-white hover:bg-white hover:text-rose-500 border border-white/20'
          }`}
          title={isWishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে সেভ করুন"}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Hover quick preview button overlay */}
        <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700">
            <Eye className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            বিস্তারিত বিবরণ দেখুন
          </span>
        </div>

        {/* Touch & Mobile friendly bottom label */}
        <div className="absolute bottom-2 inset-x-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-medium py-1 px-2 rounded-md text-center flex items-center justify-center gap-1 border border-white/10">
          <Eye className="w-3 h-3 text-cyan-400" />
          <span>📖 ছবিতে ক্লিক করে বিস্তারিত দেখুন</span>
        </div>
      </Link>

      {/* Product Content Details: শুধু নাম, দাম (ডানে কমিশন %) এবং কার্ট বাটন ও অর্ডার বাটন */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 justify-between space-y-2.5">
        
        {/* ১. নাম (Title) - Clickable Link to Product Page */}
        <div>
          <Link 
            href={`/products/${product.id}`}
            onClick={() => {
              addRecentlyViewed(product.id);
              onViewDetails?.(product);
            }}
            className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
            title={product.titleBn}
          >
            {product.titleBn}
          </Link>
        </div>

        {/* Star Rating Component - শিক্ষার্থীদের রেটিং */}
        <div className="flex items-center justify-between gap-1 py-0.5">
          <StarRating
            rating={ratingSummary.averageRating}
            totalRatings={ratingSummary.totalRatings}
            userRating={userRating}
            size="xs"
            interactive
            onRate={handleRate}
            showCount
          />
          {ratedSuccess && (
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-1 py-0.5 rounded-xs animate-in fade-in">
              রেটিং গৃহীত!
            </span>
          )}
        </div>

        <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* ২. দাম (Price) এবং দামের ডানে কমিশনের পারসেন্ট */}
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
                ৳{product.originalPrice}
              </span>
            )}
            {commissionPercent !== null && (
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                {toBengaliNumber(commissionPercent)}%
              </span>
            )}
          </div>

          {/* ৩ ও ৪. কার্ট বাটন এবং অর্ডার বাটন */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="inline-flex items-center justify-center gap-1 py-2 px-1.5 sm:px-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>কার্ট</span>
            </button>

            <button
              type="button"
              onClick={() => onDirectOrder(product)}
              className="inline-flex items-center justify-center gap-1 py-2 px-1.5 sm:px-2 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <span>{isPdf ? 'PDF অর্ডার' : 'বই অর্ডার'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
