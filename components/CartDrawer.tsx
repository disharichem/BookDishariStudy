'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Download } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const hasPrintedBooks = items.some(
    (item) => item.product.format === 'printed' || item.product.format === 'combo'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <h3 className="text-base font-bold text-slate-900">
              আপনার শপিং ব্যাগ ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="ব্যাগ বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">
                আপনার ব্যাগে এখনও কোনো বই যুক্ত করা হয়নি।
              </p>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 underline cursor-pointer"
              >
                বই ও নোট ক্যাটালগ দেখুন
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3 sm:gap-4 items-start">
                
                {/* Thumbnail */}
                <div className="relative w-16 h-22 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src={item.product.coverImage}
                    alt={item.product.titleBn}
                    fill
                    sizes="80px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                      {item.product.titleBn}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[11px] text-cyan-800 font-medium block">
                    {item.product.format === 'pdf' ? 'ডিজিটাল পিডিএফ' : 'মুদ্রিত কপি'}
                  </span>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      ৳{item.product.price * item.quantity}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>বইয়ের মোট মূল্য:</span>
                <span className="font-bold text-slate-900 tabular-nums">৳{subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ডেলিভারি চার্জ:</span>
                <span className="text-slate-700">
                  {hasPrintedBooks ? 'চেকআউটে নির্ধারিত হবে (৳৬০ / ৳১২০)' : 'বিনামূল্যে (ডিজিটাল ডেলিভারি)'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-slate-500 block">সর্বমোট (আনুমানিক):</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">৳{subtotal}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">
                *নমুনা ডেমো ক্যালকুলেশন
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
