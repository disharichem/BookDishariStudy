'use client';

import React, { useState, useMemo } from 'react';
import { Product, ChemistryBranch } from '@/types';
import { BookCard } from './BookCard';
import { FilterModal, FilterState, defaultFilterState } from './FilterModal';
import { Search, BookOpen, Download, Layers, Sparkles, X, Tag, ArrowUpDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { calculateCommissionPercent, toBengaliNumber } from '@/lib/utils';
import { getProductRatingSummary } from '@/lib/ratings';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState<FilterState>(defaultFilterState);
  const [priceSort, setPriceSort] = useState<SortOption>('default');

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

  // Count active filter dimensions
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (modalFilters.inStockOnly) count++;
    if (modalFilters.ebookOnly) count++;
    count += modalFilters.selectedAuthors.length;
    count += modalFilters.selectedCategories.length;
    count += modalFilters.selectedRatings.length;
    if (modalFilters.priceMax < 2100) count++;
    if (modalFilters.discountMin > 0) count++;
    return count;
  }, [modalFilters]);

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

      // In Stock filter from modal
      if (modalFilters.inStockOnly) {
        const isStock = product.availabilityStatus === 'in_stock' || product.format === 'printed' || product.format === 'combo';
        if (!isStock) return false;
      }

      // eBook filter from modal
      if (modalFilters.ebookOnly) {
        const isEbook = product.format === 'pdf' || product.format === 'combo' || product.availabilityStatus === 'digital_download';
        if (!isEbook) return false;
      }

      // By Ratings filter from modal (স্ক্রিনশটের অনুকরণে)
      if (modalFilters.selectedRatings && modalFilters.selectedRatings.length > 0) {
        const avgRating = getProductRatingSummary(product.id).averageRating;
        const matchesRating = modalFilters.selectedRatings.some((r) => Math.round(avgRating) === r);
        if (!matchesRating) return false;
      }

      // Shop by Price filter from modal
      if (typeof modalFilters.priceMax === 'number' && modalFilters.priceMax < 2100) {
        if (product.price > modalFilters.priceMax) return false;
      }

      // Shop by Discount filter from modal
      if (typeof modalFilters.discountMin === 'number' && modalFilters.discountMin > 0) {
        const disc = calculateCommissionPercent(product.price, product.originalPrice) || 0;
        if (disc < modalFilters.discountMin) return false;
      }

      // Authors filter from modal
      if (modalFilters.selectedAuthors.length > 0) {
        const matchesAuthor = modalFilters.selectedAuthors.some((author) => {
          if (author === 'রক্সস পাবলিকেশন') {
            return (
              (product.publisher && product.publisher.includes('রক্সস')) ||
              (product.publisher && product.publisher.includes('দিশারী')) ||
              (product.author && product.author.includes('রক্সস')) ||
              product.titleBn.includes('সহায়িকা') ||
              product.titleBn.includes('গাইড')
            );
          }
          if (author === 'মোঃ আল মেহেদী') {
            return (
              (product.author && product.author.includes('মেহেদী')) ||
              (product.author && product.author.includes('আল মেহেদী')) ||
              product.titleBn.includes('রসায়ন') ||
              product.titleBn.includes('হ্যান্ডনোট')
            );
          }
          if (author === 'লেকচার') {
            return (
              (product.author && product.author.includes('লেকচার')) ||
              (product.publisher && product.publisher.includes('লেকচার')) ||
              product.titleBn.includes('লেকচার') ||
              product.titleBn.includes('নোটস')
            );
          }
          return false;
        });
        if (!matchesAuthor) return false;
      }

      // Categories filter from modal
      if (modalFilters.selectedCategories.length > 0) {
        const matchesCategory = modalFilters.selectedCategories.some((category) => {
          if (category === 'নবম ও দশম (বিজ্ঞান): রসায়ন পাঠ্য সহায়িকা') {
            return (
              product.titleBn.includes('সহায়িকা') ||
              product.titleBn.includes('গাইড') ||
              product.titleBn.includes('এসএসসি কেমিস্ট্রি') ||
              product.subtitleBn.includes('পাঠ্যক্রম')
            );
          }
          if (category === 'এসএসসি ও সমমান: সাজেশন ও টেস্ট পেপারস') {
            return (
              product.titleBn.includes('সাজেশন') ||
              product.titleBn.includes('প্রশ্নব্যাংক') ||
              product.subtitleBn.includes('অনুশীলন') ||
              product.subtitleBn.includes('রিভিশন') ||
              (product.highlights && product.highlights.some(h => h.includes('বোর্ড') || h.includes('প্রশ্ন')))
            );
          }
          return false;
        });
        if (!matchesCategory) return false;
      }

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
  }, [products, selectedBranch, activeCategory, searchQuery, modalFilters, priceSort]);

  const handleTopicClick = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const resetAllFilters = () => {
    setPriceSort('default');
    setModalFilters(defaultFilterState);
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

        {/* Enhanced Search Bar Module */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3.5 transition-colors">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Primary Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বইয়ের নাম, অধ্যায় বা টপিক দিয়ে খুঁজুন (যেমন: জৈব যৌগ, পর্যায় সারণি, মোল, CQ)..."
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="অনুসন্ধান মুছুন"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Match Counter Badge */}
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 border border-slate-200/50 dark:border-slate-700/50">
              <span className="font-medium text-slate-600 dark:text-slate-400">ফলাফল:</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {filteredProducts.length}টি বই / নোট
              </span>
            </div>

          </div>

          {/* Quick Suggested Topic Search Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-cyan-700 dark:text-cyan-400" />
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
                        ? 'bg-slate-900 dark:bg-cyan-600 text-white font-medium shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-slate-700 hover:text-cyan-800 dark:hover:text-cyan-300'
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
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:underline px-2 py-1 cursor-pointer font-medium"
                >
                  ক্লিয়ার ফিল্টার
                </button>
              )}
            </div>
          </div>

        </div>

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

        {/* Filter & Sort Action Bar - 'ফিল্টার' বাটন ও তার পাশেই 'সাজান: ডিফল্ট' */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-2xs transition-colors">
          <div className="flex flex-row items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            
            {/* Left: ফিল্টার বাটন ও তার পাশেই সাজান: ডিফল্ট */}
            <div className="flex items-center gap-2 shrink-0">
              {/* ফিল্টার বাটন (পূর্বে 'সকল বাজেট' বাটন) */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                  activeFilterCount > 0
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700'
                }`}
                title="ফিল্টার অপশন ওপেন করুন"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-300" />
                <span>ফিল্টার</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-sky-700 text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

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

              {/* ফিল্টার রিসেট বাটন */}
              {(activeFilterCount > 0 || priceSort !== 'default') && (
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

          {/* Active Filter Chips / Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2.5 mt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">সক্রিয় ফিল্টার:</span>
              {modalFilters.inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-200">
                  In Stock
                  <X className="w-3 h-3 cursor-pointer hover:text-sky-900" onClick={() => setModalFilters(prev => ({ ...prev, inStockOnly: false }))} />
                </span>
              )}
              {modalFilters.ebookOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-200">
                  eBook
                  <X className="w-3 h-3 cursor-pointer hover:text-sky-900" onClick={() => setModalFilters(prev => ({ ...prev, ebookOnly: false }))} />
                </span>
              )}
              {modalFilters.selectedRatings.map(star => (
                <span key={star} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200">
                  {toBengaliNumber(star)}★ রেটিং
                  <X className="w-3 h-3 cursor-pointer hover:text-amber-950" onClick={() => setModalFilters(prev => ({ ...prev, selectedRatings: prev.selectedRatings.filter(s => s !== star) }))} />
                </span>
              ))}
              {modalFilters.priceMax < 2100 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-200">
                  সর্বোচ্চ ৳{toBengaliNumber(modalFilters.priceMax)}
                  <X className="w-3 h-3 cursor-pointer hover:text-sky-900" onClick={() => setModalFilters(prev => ({ ...prev, priceMax: 2100 }))} />
                </span>
              )}
              {modalFilters.discountMin > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-200">
                  {toBengaliNumber(modalFilters.discountMin)}%+ মূল্যছাড়
                  <X className="w-3 h-3 cursor-pointer hover:text-sky-900" onClick={() => setModalFilters(prev => ({ ...prev, discountMin: 0 }))} />
                </span>
              )}
              {modalFilters.selectedAuthors.map(author => (
                <span key={author} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                  {author}
                  <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setModalFilters(prev => ({ ...prev, selectedAuthors: prev.selectedAuthors.filter(a => a !== author) }))} />
                </span>
              ))}
              {modalFilters.selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                  {cat.length > 25 ? cat.substring(0, 25) + '...' : cat}
                  <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setModalFilters(prev => ({ ...prev, selectedCategories: prev.selectedCategories.filter(c => c !== cat) }))} />
                </span>
              ))}
            </div>
          )}
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
                {activeFilterCount > 0 
                  ? 'ফিল্টার পরিবর্তন করুন অথবা রিসেট করে পুনরায় চেষ্টা করুন।'
                  : 'বানানটি যাচাই করুন অথবা উপরের যেকোনো জনপ্রিয় টপিকে ক্লিক করে ব্রাউজ করুন।'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {(activeFilterCount > 0 || priceSort !== 'default') && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  ফিল্টার রিসেট করুন
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

        {/* Filter Popup Modal matching screenshot */}
        {isFilterModalOpen && (
          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            filters={modalFilters}
            onApplyFilters={(newFilters) => setModalFilters(newFilters)}
            onResetFilters={() => setModalFilters(defaultFilterState)}
            totalResultsCount={filteredProducts.length}
          />
        )}

      </div>
    </section>
  );
};
