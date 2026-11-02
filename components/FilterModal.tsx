'use client';

import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toBengaliNumber } from '@/lib/utils';

export interface FilterState {
  inStockOnly: boolean;
  ebookOnly: boolean;
  selectedAuthors: string[];
  selectedCategories: string[];
  selectedRatings: number[]; // 5, 4, 3, 2, 1
  priceMin: number;
  priceMax: number;
  discountMin: number;
}

export const defaultFilterState: FilterState = {
  inStockOnly: false,
  ebookOnly: false,
  selectedAuthors: [],
  selectedCategories: [],
  selectedRatings: [],
  priceMin: 0,
  priceMax: 2100,
  discountMin: 0,
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalResultsCount,
}) => {
  // Temporary state inside modal until "Apply Filter" is clicked
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  if (!isOpen) return null;

  const handleToggleRating = (ratingValue: number) => {
    setLocalFilters((prev) => {
      const exists = prev.selectedRatings.includes(ratingValue);
      return {
        ...prev,
        selectedRatings: exists
          ? prev.selectedRatings.filter((r) => r !== ratingValue)
          : [...prev.selectedRatings, ratingValue],
      };
    });
  };

  const handleToggleAuthor = (authorName: string) => {
    setLocalFilters((prev) => {
      const exists = prev.selectedAuthors.includes(authorName);
      return {
        ...prev,
        selectedAuthors: exists
          ? prev.selectedAuthors.filter((a) => a !== authorName)
          : [...prev.selectedAuthors, authorName],
      };
    });
  };

  const handleToggleCategory = (categoryName: string) => {
    setLocalFilters((prev) => {
      const exists = prev.selectedCategories.includes(categoryName);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter((c) => c !== categoryName)
          : [...prev.selectedCategories, categoryName],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(defaultFilterState);
    onResetFilters();
    onClose();
  };

  const authorsList = [
    'রক্সস পাবলিকেশন',
    'মোঃ আল মেহেদী',
    'লেকচার',
  ];

  const categoriesList = [
    'নবম ও দশম (বিজ্ঞান): রসায়ন পাঠ্য সহায়িকা',
    'এসএসসি ও সমমান: সাজেশন ও টেস্ট পেপারস',
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-14 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between relative">
          <div className="w-8" /> {/* Spacer */}
          <h3 className="text-xl font-bold text-slate-900 text-center flex-1">
            Filters
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="ফিল্টার বন্ধ করুন"
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Filter Options Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-slate-800">
          
          {/* Section 1: By Ratings (স্ক্রিনশটের অনুকরণে) */}
          <div className="space-y-3.5 pb-5 border-b border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-base">
              By Ratings
            </h4>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const isChecked = localFilters.selectedRatings.includes(stars);
                return (
                  <label key={stars} className="flex items-center gap-3.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleRating(stars)}
                      className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer accent-sky-500"
                    />
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: Shop by Price (স্ক্রিনশটের স্লাইডার) */}
          <div className="space-y-3.5 pb-5 border-b border-slate-200/80">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base">
                Shop by Price
              </h4>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                ৳০ - ৳{toBengaliNumber(localFilters.priceMax)}
              </span>
            </div>
            
            <div className="px-1 pt-2 space-y-2">
              <input
                type="range"
                min="0"
                max="2100"
                step="50"
                value={localFilters.priceMax}
                onChange={(e) => setLocalFilters({ ...localFilters, priceMax: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>৳০</span>
                <span>৳২১০০</span>
              </div>
            </div>
          </div>

          {/* Section 3: Shop by Discount (স্ক্রিনশটের ডিসকাউন্ট স্লাইডার) */}
          <div className="space-y-3.5 pb-5 border-b border-slate-200/80">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base">
                Shop by Discount
              </h4>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {toBengaliNumber(localFilters.discountMin)}% বা বেশি
              </span>
            </div>
            
            <div className="px-1 pt-2 space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={localFilters.discountMin}
                onChange={(e) => setLocalFilters({ ...localFilters, discountMin: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>০%</span>
                <span>১০০%</span>
              </div>
            </div>
          </div>

          {/* Section 4: In Stock & eBook */}
          <div className="space-y-3.5 pb-5 border-b border-slate-200/80">
            {/* In Stock */}
            <label className="flex items-center gap-3.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={localFilters.inStockOnly}
                onChange={(e) => setLocalFilters({ ...localFilters, inStockOnly: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer accent-sky-500"
              />
              <span className="font-semibold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                In Stock
              </span>
            </label>

            {/* eBook */}
            <label className="flex items-center gap-3.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={localFilters.ebookOnly}
                onChange={(e) => setLocalFilters({ ...localFilters, ebookOnly: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer accent-sky-500"
              />
              <span className="font-semibold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                eBook
              </span>
            </label>
          </div>

          {/* Section 5: Authors */}
          <div className="pb-5 border-b border-slate-200/80 space-y-3.5">
            <h4 className="font-bold text-slate-900 text-base">
              Authors
            </h4>
            <div className="space-y-3">
              {authorsList.map((author) => {
                const isChecked = localFilters.selectedAuthors.includes(author);
                return (
                  <label key={author} className="flex items-center gap-3.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleAuthor(author)}
                      className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer accent-sky-500"
                    />
                    <span className="text-slate-800 text-[15px] font-normal group-hover:text-slate-950 transition-colors">
                      {author}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 6: Categories */}
          <div className="space-y-3.5 pb-2">
            <h4 className="font-bold text-slate-900 text-base">
              Categories
            </h4>
            <div className="space-y-3">
              {categoriesList.map((category) => {
                const isChecked = localFilters.selectedCategories.includes(category);
                return (
                  <label key={category} className="flex items-start gap-3.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCategory(category)}
                      className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400 mt-0.5 cursor-pointer accent-sky-500"
                    />
                    <span className="text-slate-800 text-[15px] font-normal group-hover:text-slate-950 transition-colors leading-snug">
                      {category}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions - Apply Filter Button matching screenshot */}
        <div className="p-5 pt-3 bg-white border-t border-slate-100 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 px-4 bg-[#70b4f8] hover:bg-[#5aa3f0] active:scale-[0.99] text-white font-medium text-base rounded-2xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Apply Filter</span>
            <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-semibold">
              ({toBengaliNumber(totalResultsCount)}টি পণ্য)
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-rose-600 py-1 transition-colors text-center cursor-pointer font-medium"
          >
            ফিল্টার রিসেট করুন (Reset)
          </button>
        </div>

      </div>
    </div>
  );
};


