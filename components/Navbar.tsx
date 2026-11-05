'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Atom, Truck, PhoneCall, Database, Download, Heart } from 'lucide-react';
import { useMounted } from '@/lib/useMounted';

interface NavbarProps {
  cartCount: number;
  wishlistCount?: number;
  onOpenCart: () => void;
  onOpenWishlist?: () => void;
  onOpenTracking: () => void;
  onOpenMyPdfs?: () => void;
  onOpenAdminManager?: () => void;
  onFilterChange: (category: 'all' | 'printed' | 'pdf' | 'combo') => void;
}

const BOOK_TITLES_TO_TYPE = [
  'দিশারী এসএসসি কেমিস্ট্রি সহায়িকা (মুদ্রিত বই)',
  'জৈব যৌগ ও বিক্রিয়া স্টাডি হ্যান্ডনোট (ডিজিটাল পিডিএফ)',
  'অজৈব রসায়ন ও পর্যায় সারণি হ্যান্ডনোট',
  'ভৌত রসায়ন ও গাণিতিক সূত্রাবলি হ্যান্ডনোট',
  'এসএসসি কেমিস্ট্রি মেগা কম্বো প্যাক (বই + সকল নোট)',
  'CQ ও MCQ প্রশ্নব্যাংক ও সাজেশন্স',
  'ব্যবহারিক রসায়ন ও ভাইভা নির্দেশিকা',
  'রসায়ন সূত্রাবলি ও পর্যায় সারণি চার্ট',
];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenTracking,
  onOpenMyPdfs,
  onOpenAdminManager,
  onFilterChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const mounted = useMounted();

  // Typewriter animation effect with async timers
  React.useEffect(() => {
    if (searchVal) return;

    const currentFullTitle = BOOK_TITLES_TO_TYPE[titleIndex % BOOK_TITLES_TO_TYPE.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (typedTitle.length < currentFullTitle.length) {
        timeout = setTimeout(() => {
          setTypedTitle(currentFullTitle.slice(0, typedTitle.length + 1));
        }, 70);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedTitle.length > 0) {
        timeout = setTimeout(() => {
          setTypedTitle(currentFullTitle.slice(0, typedTitle.length - 1));
        }, 35);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % BOOK_TITLES_TO_TYPE.length);
        }, 150);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedTitle, isDeleting, titleIndex, searchVal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchVal.trim() || typedTitle;
    if (query) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dishari-search', { detail: { query } }));
        if (window.location.pathname !== '/') {
          window.location.href = `/#catalog`;
        } else {
          const element = document.getElementById('catalog');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  };

  const handleNavClick = (sectionId: string, filter?: 'all' | 'printed' | 'pdf' | 'combo') => {
    if (filter) {
      onFilterChange(filter);
    }
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Main Top Bar - strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single element brand wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 text-slate-900 dark:text-white whitespace-nowrap shrink-0 group focus-visible:outline-hidden"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-cyan-950 text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-105 border border-transparent dark:border-cyan-800/40">
            <Atom className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Dishari Chemistry
            </span>
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
              দিশারী কেমিস্ট্রি
            </span>
          </div>
        </a>

        {/* Zone 2: clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => handleNavClick('catalog', 'printed')}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            মুদ্রিত বই
          </button>
          <button
            onClick={() => handleNavClick('catalog', 'pdf')}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            পিডিএফ নোট
          </button>
          <button
            onClick={() => handleNavClick('how-to-order')}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            অর্ডারের নিয়ম
          </button>
          <button
            onClick={onOpenTracking}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>অর্ডার ট্র্যাকিং</span>
          </button>
          {onOpenMyPdfs && (
            <button
              onClick={onOpenMyPdfs}
              className="text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 hover:text-cyan-900 dark:hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-cyan-200/80 dark:border-cyan-800/60 font-medium"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>আমার কেনা PDF</span>
            </button>
          )}
          <button
            onClick={() => handleNavClick('reviews')}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            রিভিউ
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            যোগাযোগ
          </button>
        </nav>

        {/* Zone 3: primary action area */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {onOpenAdminManager && (
            <button
              onClick={onOpenAdminManager}
              title="অ্যাডমিন ও প্রোডাক্ট ডাটা প্যানেল"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-800 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>অ্যাডমিন</span>
            </button>
          )}

          {/* Wishlist Button */}
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              aria-label="আমার উইশলিস্ট দেখুন"
              suppressHydrationWarning
              className="relative p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              title="আমার উইশলিস্ট (সংরক্ষিত তালিকা)"
            >
              <Heart className={`w-5 h-5 ${mounted && wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span className="hidden md:inline text-xs font-medium">উইশলিস্ট</span>
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenCart}
            aria-label="শপিং ব্যাগ দেখুন"
            suppressHydrationWarning
            className="relative p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-medium">ব্যাগ</span>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('catalog', 'all')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            বই কিনুন
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="মেনু খুলুন"
            className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 2nd Row: Typing Search Box Bar */}
      <div className="w-full bg-slate-50/95 dark:bg-slate-900/90 border-t border-slate-200/90 dark:border-slate-800 py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative w-full flex items-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 focus-within:border-cyan-600 dark:focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-xl sm:rounded-2xl transition-all shadow-xs overflow-hidden">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-700 dark:text-cyan-400 ml-3.5 shrink-0" />
              
              <div className="relative flex-1 flex items-center min-w-0">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full py-2 sm:py-2.5 pl-2.5 pr-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent relative z-10 focus:outline-hidden"
                />
                
                {/* Visual Typewriter Text Placeholder Overlay when searchVal is empty */}
                {!searchVal && (
                  <div 
                    className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-xs sm:text-sm text-slate-400 dark:text-slate-500 truncate pr-3 select-none"
                    suppressHydrationWarning
                  >
                    <span className="hidden xs:inline text-slate-400 dark:text-slate-500">বইয়ের নাম দিয়ে খুঁজুন:&nbsp;</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate" suppressHydrationWarning>
                      &ldquo;{typedTitle || 'দিশারী এসএসসি কেমিস্ট্রি সহায়িকা'}&rdquo;
                    </span>
                    <span className="w-1.5 h-4 bg-cyan-600 ml-0.5 inline-block animate-pulse align-middle shrink-0" />
                  </div>
                )}
              </div>

              {searchVal && (
                <button
                  type="button"
                  onClick={() => setSearchVal('')}
                  aria-label="অনুসন্ধান মুছুন"
                  className="p-1 mr-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white text-xs font-bold rounded-lg mr-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400 dark:text-white hidden xs:inline" />
                <span>খুঁজুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg transition-colors duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleNavClick('catalog', 'printed')}
              className="py-2.5 px-3 text-center text-sm font-medium rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              📖 মুদ্রিত বই
            </button>
            <button
              onClick={() => handleNavClick('catalog', 'pdf')}
              className="py-2.5 px-3 text-center text-sm font-medium rounded-lg bg-cyan-50 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/80 transition-colors"
            >
              ⚡ পিডিএফ নোট
            </button>
          </div>
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('how-to-order')}
              className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              অর্ডার করার সহজ নিয়ম
            </button>
            <button
              onClick={() => handleNavClick('reviews')}
              className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              শিক্ষার্থীদের রিভিউ ও ফলাফল
            </button>
            <button
              onClick={() => handleNavClick('about-us')}
              className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              দিশারী কেমিস্ট্রি পরিচিতি
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              সাধারণ প্রশ্ন ও উত্তর (FAQ)
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              সরাসরি যোগাযোগ ও সহায়তা
            </button>
            {onOpenWishlist && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWishlist();
                }}
                className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${mounted && wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>আমার উইশলিস্ট (পছন্দের তালিকা)</span>
                </div>
                {mounted && wishlistCount > 0 && (
                  <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    {wishlistCount}টি
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracking();
              }}
              className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-medium transition-colors"
            >
              <Truck className="w-4 h-4" />
              অর্ডার ট্র্যাকিং দেখুন
            </button>
            {onOpenMyPdfs && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMyPdfs();
                }}
                className="text-left py-2 px-2 bg-cyan-50/70 dark:bg-cyan-950/60 hover:bg-cyan-100/70 dark:hover:bg-cyan-900/60 rounded-md flex items-center gap-2 text-cyan-900 dark:text-cyan-200 font-semibold border border-cyan-200/60 dark:border-cyan-800/60 transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                আমার কেনা PDF (ডাউনলোড ও লাইসেন্স)
              </button>
            )}
            {onOpenAdminManager && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminManager();
                }}
                className="text-left py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                অ্যাডমিন ও প্রোডাক্ট ডাটা প্যানেল
              </button>
            )}
          </div>
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('catalog', 'all')}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 rounded-lg shadow-sm transition-colors"
            >
              সকল বই ও পিডিএফ ক্যাটালগ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
