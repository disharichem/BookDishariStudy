'use client';

import React, { useState, useMemo } from 'react';
import { Product, ChemistryBranch } from '@/types';
import { BookCard } from './BookCard';
import { Search, BookOpen, Download, Layers, Sparkles, X, Filter, Tag, Check, ArrowUpDown, ArrowDownWideNarrow, ArrowUpNarrowWide, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface BookCatalogProps {
  products: Product[];
  wishlistIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  activeCategory: 'all' | 'printed' | 'pdf' | 'combo';
  onCategoryChange: (category: 'all' | 'printed' | 'pdf' | 'combo') => void;
  selectedBranch?: ChemistryBranch;
  onSelectBranch?: (branch: ChemistryBranch) => void;
  onOpenSample?: (product: Product) => void;
  onViewDetails?: (product: Product, tab?: 'overview' | 'toc' | 'sample') => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

// Quick popular topic search shortcuts for SSC Chemistry
const POPULAR_SEARCH_TOPICS = [
  { label: 'জৈব যৌগ ও বিক্রিয়া', query: 'জৈব' },
  { label: 'পর্যায় সারণি', query: 'পর্যায় সারণি' },
  { label: 'মোলের ধারণা ও গণনা', query: 'মোল' },
  { label: 'CQ ও MCQ প্রশ্নব্যাংক', query: 'প্রশ্নব্যাংক' },
  { label: 'ব্যবহারিক ও ভাইভা', query: 'ব্যবহারিক' },
  { label: 'রিভিশন বুস্টার', query: 'রিভিশন' },
];

export const BookCatalog: React.FC<BookCatalogProps> = ({
  products,
  wishlistIds = [],
  onToggleWishlist,
  activeCategory,
  onCategoryChange,
  selectedBranch = 'all',
  onSelectBranch,
  onOpenSample,
  onViewDetails,
  onDirectOrder,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [priceRange, setPriceRange] = useState<'all' | 'under_200' | '200_400' | 'above_400'>('all');

  // Enhanced search and price filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Chemistry Branch filter (Organic, Inorganic, Physical)
      if (selectedBranch !== 'all') {
        if (!product.branches || !product.branches.includes(selectedBranch)) {
          return false;
        }
      }

      // Format category filter (printed, pdf, combo)
      if (activeCategory !== 'all') {
        if (activeCategory === 'printed' && product.format !== 'printed') return false;
        if (activeCategory === 'pdf' && product.format !== 'pdf') return false;
        if (activeCategory === 'combo' && product.format !== 'combo') return false;
      }

      // Price Range filter
      if (priceRange === 'under_200' && product.price >= 200) return false;
      if (priceRange === '200_400' && (product.price < 200 || product.price > 400)) return false;
      if (priceRange === 'above_400' && product.price <= 400) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitleBn = product.titleBn?.toLowerCase().includes(q) ?? false;
      const matchTitleEn = product.titleEn?.toLowerCase().includes(q) ?? false;
      const matchSubtitle = product.subtitleBn?.toLowerCase().includes(q) ?? false;
      const matchDesc = product.description?.toLowerCase().includes(q) ?? false;
      const matchAuthor = product.author?.toLowerCase().includes(q) ?? false;
      const matchHighlights = (product.highlights || []).some(h => h.toLowerCase().includes(q));
      const matchChapters = (product.chapters || []).some(
        c => c.title.toLowerCase().includes(q) || (c.topics || []).some(t => t.toLowerCase().includes(q))
      );

      return matchTitleBn || matchTitleEn || matchSubtitle || matchDesc || matchAuthor || matchHighlights || matchChapters;
    });

    // Price sorting (Low to High or High to Low)
    if (priceSort === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedBranch, activeCategory, searchQuery, priceRange, priceSort]);

  const handleTopicClick = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const resetPriceFilters = () => {
    setPriceSort('default');
    setPriceRange('all');
  };

  return (
    <section id="catalog" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800">
            <span>ক্যাটালগ ও সংস্করণ</span>
            <span aria-hidden="true">·</span>
            <span>২০২৪-২৫ নতুন পাঠ্যক্রম</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            এসএসসি রসায়ন বই ও ডিজিটাল নোটস
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            মুদ্রিত বইগুলো পৌঁছে যাবে আপনার ঠিকানায় আর রঙিন পিডিএফ হ্যান্ডনোটগুলো পাবেন আপনার
            ইমেইল ও ড্রাইভে সাথে সাথে। আপনার প্রয়োজনীয় টপিক বা অধ্যায় অনুযায়ী সহজে খুঁজে নিন।
          </p>
        </div>

        {/* Enhanced Search Bar Module */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3.5">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Primary Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-700" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বইয়ের নাম, অধ্যায় বা টপিক দিয়ে খুঁজুন (যেমন: জৈব যৌগ, পর্যায় সারণি, মোল, CQ)..."
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="অনুসন্ধান মুছুন"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Match Counter Badge */}
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs px-3 py-2 bg-slate-100 rounded-lg text-slate-700 whitespace-nowrap shrink-0">
              <span className="font-medium text-slate-600">ফলাফল:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {filteredProducts.length}টি বই / নোট
              </span>
            </div>

          </div>

          {/* Quick Suggested Topic Search Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-cyan-700" />
              জনপ্রিয় টপিক সার্চ:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {POPULAR_SEARCH_TOPICS.map((topic) => {
                const isActive = searchQuery === topic.query;
                return (
                  <button
                    key={topic.query}
                    type="button"
                    onClick={() => handleTopicClick(topic.query)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white font-medium shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800'
                    }`}
                  >
                    {topic.label}
                  </button>
                );
              })}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-xs text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 cursor-pointer font-medium"
                >
                  ক্লিয়ার ফিল্টার
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Interactive Segmented Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto scrollbar-none shadow-2xs">
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সবগুলো প্রকাশনা ({products.length})</span>
          </button>

          <button
            onClick={() => onCategoryChange('printed')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'printed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>মুদ্রিত বই ({products.filter(p => p.format === 'printed').length})</span>
          </button>

          <button
            onClick={() => onCategoryChange('pdf')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'pdf'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ডিজিটাল পিডিএফ ({products.filter(p => p.format === 'pdf').length})</span>
          </button>

          <button
            onClick={() => onCategoryChange('combo')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'combo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>মেগা কম্বো প্যাক ({products.filter(p => p.format === 'combo').length})</span>
          </button>
        </div>

        {/* Price Range & Budget Filter Bar (Low to High, High to Low & Price Ranges) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            
            {/* Left: Budget Range Filter Pills */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-700" />
                <span>বাজেট ফিল্টার (Price Range):</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'সকল বাজেট' },
                  { id: 'under_200', label: '৳২০০ এর নিচে (সাশ্রয়ী)' },
                  { id: '200_400', label: '৳২০০ - ৳৪০০ (গাইড ও হ্যান্ডনোট)' },
                  { id: 'above_400', label: '৳৪০০+ (মাস্টার বুক/কম্বো)' },
                ].map((range) => {
                  const isActive = priceRange === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setPriceRange(range.id as 'all' | 'under_200' | '200_400' | 'above_400')}
                      className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Price Sort (Low to High, High to Low) */}
            <div className="space-y-1.5 sm:min-w-[240px]">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-cyan-700" />
                  <span>দাম অনুযায়ী সাজান (Sort):</span>
                </span>
                {(priceSort !== 'default' || priceRange !== 'all') && (
                  <button
                    type="button"
                    onClick={resetPriceFilters}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:underline"
                    title="বাজেট ফিল্টার রিসেট করুন"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>রিসেট</span>
                  </button>
                )}
              </div>
              
              <div className="relative">
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as 'default' | 'price_asc' | 'price_desc')}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all cursor-pointer appearance-none pr-8"
                >
                  <option value="default">প্রস্তাবিত ক্রম (Default)</option>
                  <option value="price_asc">দাম: কম থেকে বেশি (Low to High ↗)</option>
                  <option value="price_desc">দাম: বেশি থেকে কম (High to Low ↘)</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Active Chemistry Branch Filter Indicator */}
        {selectedBranch !== 'all' && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs">
            <div className="flex items-center gap-2 text-cyan-950">
              <span className="font-bold">শাখা অনুযায়ী প্রদর্শিত হচ্ছে:</span>
              <span className="font-semibold text-cyan-800">
                {selectedBranch === 'organic' && 'জৈব রসায়ন (Organic Chemistry)'}
                {selectedBranch === 'inorganic' && 'অজৈব রসায়ন (Inorganic Chemistry)'}
                {selectedBranch === 'physical' && 'ভৌত রসায়ন (Physical Chemistry)'}
              </span>
            </div>
            {onSelectBranch && (
              <button
                type="button"
                onClick={() => onSelectBranch('all')}
                className="text-xs font-semibold text-cyan-800 hover:text-cyan-950 underline cursor-pointer"
              >
                সবগুলো শাখা রিসেট করুন
              </button>
            )}
          </div>
        )}

        {/* Product Grid - Two Columns (দুই কলাম লেআউট) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {filteredProducts.map((product) => (
              <BookCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onOpenSample={onOpenSample}
                onViewDetails={onViewDetails}
                onDirectOrder={onDirectOrder}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery 
                  ? `"${searchQuery}" দিয়ে কোনো বই বা হ্যান্ডনোট পাওয়া যায়নি`
                  : 'নির্বাচিত বাজেটে কোনো বই বা হ্যান্ডনোট পাওয়া যায়নি'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {priceRange !== 'all' 
                  ? 'অন্য কোনো বাজেট রেঞ্জ নির্বাচন করুন অথবা ফিল্টার রিসেট করুন।'
                  : 'বানানটি যাচাই করুন অথবা উপরের যেকোনো জনপ্রিয় টপিকে ক্লিক করে ব্রাউজ করুন।'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {(priceRange !== 'all' || priceSort !== 'default') && (
                <button
                  type="button"
                  onClick={resetPriceFilters}
                  className="px-4 py-2 text-xs font-semibold text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  বাজেট ফিল্টার রিসেট করুন
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  resetPriceFilters();
                  onCategoryChange('all');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                সকল বই ও নোট দেখুন
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
