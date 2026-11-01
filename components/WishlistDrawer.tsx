'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { X, Trash2, ShoppingCart, Heart, ArrowRight, Download, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { toBengaliNumber, calculateCommissionPercent } from '@/lib/utils';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
  onAddAllToCart: () => void;
  onClearWishlist: () => void;
  onViewProduct?: (productId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveFromWishlist,
  onMoveToCart,
  onAddAllToCart,
  onClearWishlist,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>আমার উইশলিস্ট</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 tabular-nums">
                  {items.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">পছন্দের সংরক্ষিত বই ও পিডিএফ নোট</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="উইশলিস্ট বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900">
                  উইশলিস্ট এখনো খালি
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  পছন্দের বই বা ডিজিটাল নোট পরবর্তীতে দ্রুত কেনার জন্য প্রতিটি বইয়ের কভারের ওপর হার্ট (❤️) আইকনে ক্লিক করে সেভ করে রাখুন।
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>ক্যাটালগ ব্রাউজ করুন</span>
                </button>
              </div>
            </div>
          ) : (
            items.map((product) => {
              const commissionPercent = calculateCommissionPercent(product.price, product.originalPrice);
              const isPdf = product.format === 'pdf';
              const isCombo = product.format === 'combo';

              return (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-3 sm:gap-4 items-start group">
                  
                  {/* Thumbnail Clickable */}
                  <Link
                    href={`/products/${product.id}`}
                    onClick={() => {
                      onViewProduct?.(product.id);
                      onClose();
                    }}
                    className="relative w-16 h-22 sm:w-18 sm:h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 block hover:opacity-90 transition-opacity"
                    title={product.titleBn}
                  >
                    <Image
                      src={product.coverImage}
                      alt={product.titleBn}
                      fill
                      sizes="80px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        {/* Format Badge */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded border mb-1 bg-slate-50 text-slate-700 border-slate-200">
                          {isPdf ? (
                            <>
                              <Download className="w-3 h-3 text-cyan-600" />
                              <span>ডিজিটাল PDF</span>
                            </>
                          ) : isCombo ? (
                            <>
                              <Layers className="w-3 h-3 text-amber-600" />
                              <span>কম্বো প্যাক</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3 text-cyan-600" />
                              <span>মুদ্রিত বই</span>
                            </>
                          )}
                        </span>
                        
                        {/* Title */}
                        <Link
                          href={`/products/${product.id}`}
                          onClick={() => {
                            onViewProduct?.(product.id);
                            onClose();
                          }}
                          className="block text-xs sm:text-sm font-bold text-slate-900 hover:text-cyan-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                        >
                          {product.titleBn}
                        </Link>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveFromWishlist(product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="উইশলিস্ট থেকে সরান"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price & Commission % */}
                    <div className="flex items-baseline flex-wrap gap-1.5">
                      <span className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                        ৳{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through tabular-nums">
                          ৳{product.originalPrice}
                        </span>
                      )}
                      {commissionPercent !== null && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded">
                          {toBengaliNumber(commissionPercent)}% কমিশন
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Move to Cart */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onMoveToCart(product)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ব্যাগে যোগ করুন</span>
                      </button>

                      <Link
                        href={`/products/${product.id}`}
                        onClick={() => {
                          onViewProduct?.(product.id);
                          onClose();
                        }}
                        className="text-xs text-cyan-800 hover:text-cyan-950 font-medium hover:underline px-1.5 py-1"
                      >
                        বিস্তারিত
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions (Only when items exist) */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600 font-medium">মোট আইটেম ({items.length}টি):</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                ৳{totalValue}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onAddAllToCart}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                <span>সবগুলো ব্যাগে যোগ করুন</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={onClearWishlist}
                  className="text-rose-600 hover:text-rose-800 hover:underline font-medium cursor-pointer"
                >
                  উইশলিস্ট খালি করুন
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-600 hover:text-slate-900 hover:underline font-medium cursor-pointer"
                >
                  আরও বই দেখুন
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
