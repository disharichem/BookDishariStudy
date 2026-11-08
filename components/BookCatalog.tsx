'use client';

import React, { useState, useMemo } from 'react';
import { Product, ChemistryBranch } from '@/types';
import { BookCard } from './BookCard';
import { Search, BookOpen, Download, Layers, Sparkles, X, ArrowUpDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { calculateCommissionPercent, toBengaliNumber } from '@/lib/utils';
import { getProductRatingSummary } from '@/lib/ratings';
import { FilterModal, FilterState, defaultFilterState } from './FilterModal';

export type SortOption = 
  | 'default'
  | 'bestselling'
  | 'discount_asc'
  | 'discount_desc'
  | 'price_asc'
  | 'price_desc'
  | 'coming_soon'
  | 'special_offers';

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
  const [priceSort, setPriceSort] = useState<SortOption>('default');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.inStockOnly) count++;
    if (filters.ebookOnly) count++;
    if (filters.selectedAuthors.length > 0) count += filters.selectedAuthors.length;
    if (filters.selectedCategories.length > 0) count += filters.selectedCategories.length;
    if (filters.selectedRatings.length > 0) count += filters.selectedRatings.length;
    if (filters.priceMin > defaultFilterState.priceMin || filters.priceMax < defaultFilterState.priceMax) count++;
    if (filters.discountMin > 0) count++;
    return count;
  }, [filters]);

  // Listen to global header searchbox queries
  React.useEffect(() => {
    const handleGlobalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      if (customEvent.detail?.query !== undefined) {
        setSearchQuery(customEvent.detail.query);
        setTimeout(() => {
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    };
    window.addEventListener('dishari-search', handleGlobalSearch);
    return () => window.removeEventListener('dishari-search', handleGlobalSearch);
  }, []);

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

      // Advanced FilterModal criteria
      if (filters.inStockOnly && product.availabilityStatus !== 'in_stock') return false;
      if (filters.ebookOnly && product.format !== 'pdf') return false;
      if (filters.selectedAuthors.length > 0 && product.author && !filters.selectedAuthors.includes(product.author)) return false;
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(product.format)) return false;
      if (filters.selectedRatings.length > 0) {
        const avg = Math.round(getProductRatingSummary(product.id).averageRating);
        if (!filters.selectedRatings.includes(avg)) return false;
      }
      if (product.price < filters.priceMin || product.price > filters.priceMax) return false;
      if (filters.discountMin > 0) {
        const disc = calculateCommissionPercent(product.price, product.originalPrice) || 0;
        if (disc < filters.discountMin) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitleBn = product.titleBn?.toLowerCase().includes(q) ?? false;
      const matchTitleEn = product.titleEn?.toLowerCase().includes(q) ?? false;
      const matchSubtitle = product.subtitleBn?.toLowerCase().includes(q) ?? false;
      const matchDesc = product.description?.toLowerCase().includes(q) ?? false;
      const matchAuthor = product.author?.toLowerCase().includes(q) ?? false;
      const matchHighlights = (product.highlights || []).some((h) => h.toLowerCase().includes(q));
      const matchChapters = (product.chapters || []).some(
        (c) => c.title.toLowerCase().includes(q) || (c.topics || []).some((t) => t.toLowerCase().includes(q))
      );

      return matchTitleBn || matchTitleEn || matchSubtitle || matchDesc || matchAuthor || matchHighlights || matchChapters;
    });

    // Sorting logic - সর্বাধিক বিক্রিত, মূল্যছাড়: কম থেকে বেশি, বেশি থেকে কম, শীঘ্রই আসছে, বিশেষ অফার
    if (priceSort === 'bestselling') {
      result = [...result].sort((a, b) => {
        const aReviews = getProductRatingSummary(a.id).totalRatings;
        const bReviews = getProductRatingSummary(b.id).totalRatings;
        return bReviews - aReviews;
      });
    } else if (priceSort === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (priceSort === 'discount_asc') {
      result = [...result].sort((a, b) => {
        const aDisc = calculateCommissionPercent(a.price, a.originalPrice) || 0;
        const bDisc = calculateCommissionPercent(b.price, b.originalPrice) || 0;
        return aDisc - bDisc;
      });
    } else if (priceSort === 'discount_desc') {
      result = [...result].sort((a, b) => {
        const aDisc = calculateCommissionPercent(a.price, a.originalPrice) || 0;
        const bDisc = calculateCommissionPercent(b.price, b.originalPrice) || 0;
        return bDisc - aDisc;
      });
    } else if (priceSort === 'special_offers') {
      result = [...result].sort((a, b) => {
        const aSavings = (a.originalPrice || a.price) - a.price;
        const bSavings = (b.originalPrice || b.price) - b.price;
        return bSavings - aSavings;
      });
    } else if (priceSort === 'coming_soon') {
      result = [...result].sort((a, b) => {
        const aIsPre = a.availabilityStatus === 'pre_order' ? 1 : 0;
        const bIsPre = b.availabilityStatus === 'pre_order' ? 1 : 0;
        return bIsPre - aIsPre;
      });
    }

    return result;
  }, [products, selectedBranch, activeCategory, searchQuery, priceSort, filters]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const resetAllFilters = () => {
    setPriceSort('default');
    setFilters(defaultFilterState);
  };

  return (
    <section id="catalog" className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 scroll-mt-14 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800 dark:text-cyan-400">
            <span>ক্যাটালগ ও সংস্করণ</span>
            <span aria-hidden="true">·</span>
            <span>২০২৪-২৫ নতুন পাঠ্যক্রম</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            এসএসসি রসায়ন বই ও ডিজিটাল নোটস
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            মুদ্রিত বইগুলো পৌঁছে যাবে আপনার ঠিকানায় আর রঙিন পিডিএফ হ্যান্ডনোটগুলো পাবেন আপনার
            ইমেইল ও ড্রাইভে সাথে সাথে। আপনার প্রয়োজনীয় টপিক বা অধ্যায় অনুযায়ী সহজে খুঁজে নিন।
          </p>
        </div>

        {/* Active Search Filter Notice (Only shown if user triggered a search from the header navbar) */}
        {searchQuery && (
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs text-cyan-900 dark:text-cyan-200 animate-in fade-in">
            <span className="font-medium">
              অনুসন্ধান ফলাফল: &ldquo;{searchQuery}&rdquo; ({filteredProducts.length}টি বই / নোট পাওয়া গেছে)
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>অনুসন্ধান মুছুন</span>
            </button>
          </div>
        )}

        {/* Interactive Segmented Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto scrollbar-none shadow-2xs transition-colors">
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সবগুলো প্রকাশনা ({products.length})</span>
          </button>

          <button
            onClick={() => onCategoryChange('printed')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'printed'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>মুদ্রিত বই ({products.filter(p => p.format === 'printed').length})</span>
          </button>

          <button
            onClick={() => onCategoryChange('pdf')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'pdf'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ডিজিটাল পিডিএফ ({products.filter(p => p.format === 'pdf').length})</span>
          </button>

          <button
            onClick={() => onCategoryChange('combo')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'combo'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>মেগা কম্বো প্যাক ({products.filter(p => p.format === 'combo').length})</span>
          </button>
        </div>

        {/* Sort & Quick Filter Action Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs transition-colors">
          <div className="flex flex-row items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            
            {/* Left: ফিল্টার বাটন ও সাজান ড্রপডাউন */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* ফিল্টার বাটন (সাজান এর বামে) */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs shrink-0 ${
                  activeFilterCount > 0
                    ? 'bg-cyan-600 text-white border-cyan-700 hover:bg-cyan-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                }`}
                title="বই ও নোটস ফিল্টার করুন"
              >
                <SlidersHorizontal className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`} />
                <span>ফিল্টার</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-cyan-800 text-[10px] flex items-center justify-center font-bold">
                    {toBengaliNumber(activeFilterCount)}
                  </span>
                )}
              </button>

              <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>সাজান:</span>
              </span>

              {/* এর তার পাশেই সাজান: ডিফল্ট বাটন / ড্রপডাউন */}
              <div className="relative shrink-0">
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as SortOption)}
                  className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all cursor-pointer appearance-none whitespace-nowrap"
                  title="বাছাই ও সাজান"
                >
                  <option value="default">সাজান: ডিফল্ট</option>
                  <option value="bestselling">সর্বাধিক বিক্রিত</option>
                  <option value="discount_asc">মূল্যছাড়: কম থেকে বেশি</option>
                  <option value="discount_desc">মূল্যছাড়: বেশি থেকে কম</option>
                  <option value="price_asc">দাম: কম থেকে বেশি ↗</option>
                  <option value="price_desc">দাম: বেশি থেকে কম ↘</option>
                  <option value="special_offers">বিশেষ অফার</option>
                  <option value="coming_soon">শীঘ্রই আসছে</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* সর্ট ও ফিল্টার রিসেট বাটন */}
              {(priceSort !== 'default' || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 p-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="ফিল্টার ও সর্ট রিসেট করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">রিসেট</span>
                </button>
              )}
            </div>

            {/* Right: মোট ফলাফল */}
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium ml-auto">
              <span>মোট: <strong className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</strong>টি বই/নোট</span>
            </div>

          </div>
        </div>

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
                  : 'নির্বাচিত ফিল্টারে কোনো বই বা হ্যান্ডনোট পাওয়া যায়নি'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                বানানটি যাচাই করুন অথবা উপরের যেকোনো জনপ্রিয় টপিকে ক্লিক করে ব্রাউজ করুন।
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {priceSort !== 'default' && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 text-xs font-semibold text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  সর্ট রিসেট করুন
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  resetAllFilters();
                  onCategoryChange('all');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                সকল বই ও নোট দেখুন
              </button>
            </div>
          </div>
        )}


        {/* Advanced Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onApplyFilters={(newFilters) => setFilters(newFilters)}
          onResetFilters={() => setFilters(defaultFilterState)}
          totalResultsCount={filteredProducts.length}
        />

      </div>
    </section>
  );
};
