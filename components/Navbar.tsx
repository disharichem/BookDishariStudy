'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Atom, Truck, PhoneCall, Database, Download, Heart } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main Top Bar - strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single element brand wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 text-slate-900 whitespace-nowrap shrink-0 group focus-visible:outline-hidden"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-105">
            <Atom className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Dishari Chemistry
            </span>
            <span className="text-xs font-semibold text-cyan-700">
              দিশারী কেমিস্ট্রি
            </span>
          </div>
        </a>

        {/* Zone 2: clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick('catalog', 'printed')}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            মুদ্রিত বই
          </button>
          <button
            onClick={() => handleNavClick('catalog', 'pdf')}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            পিডিএফ নোট
          </button>
          <button
            onClick={() => handleNavClick('how-to-order')}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            অর্ডারের নিয়ম
          </button>
          <button
            onClick={onOpenTracking}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-600" />
            <span>অর্ডার ট্র্যাকিং</span>
          </button>
          {onOpenMyPdfs && (
            <button
              onClick={onOpenMyPdfs}
              className="text-cyan-800 bg-cyan-50 hover:bg-cyan-100 hover:text-cyan-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-cyan-200/80 font-medium"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600" />
              <span>আমার কেনা PDF</span>
            </button>
          )}
          <button
            onClick={() => handleNavClick('reviews')}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            রিভিউ
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="hover:text-cyan-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-cyan-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              <span>অ্যাডমিন</span>
            </button>
          )}

          {/* Wishlist Button */}
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              aria-label="আমার উইশলিস্ট দেখুন"
              className="relative p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title="আমার উইশলিস্ট (সংরক্ষিত তালিকা)"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span className="hidden md:inline text-xs font-medium">উইশলিস্ট</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenCart}
            aria-label="শপিং ব্যাগ দেখুন"
            className="relative p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:text-cyan-700 hover:border-cyan-300 transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-medium">ব্যাগ</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('catalog', 'all')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            বই কিনুন
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="মেনু খুলুন"
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => handleNavClick('catalog', 'printed')}
              className="py-2.5 px-3 text-center text-sm font-medium rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100"
            >
              📖 মুদ্রিত বই
            </button>
            <button
              onClick={() => handleNavClick('catalog', 'pdf')}
              className="py-2.5 px-3 text-center text-sm font-medium rounded-lg bg-cyan-50 text-cyan-900 hover:bg-cyan-100"
            >
              ⚡ পিডিএফ নোট
            </button>
          </div>
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <button
              onClick={() => handleNavClick('how-to-order')}
              className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
            >
              অর্ডার করার সহজ নিয়ম
            </button>
            <button
              onClick={() => handleNavClick('reviews')}
              className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
            >
              শিক্ষার্থীদের রিভিউ ও ফলাফল
            </button>
            <button
              onClick={() => handleNavClick('about-us')}
              className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
            >
              দিশারী কেমিস্ট্রি পরিচিতি
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
            >
              সাধারণ প্রশ্ন ও উত্তর (FAQ)
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
            >
              সরাসরি যোগাযোগ ও সহায়তা
            </button>
            {onOpenWishlist && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWishlist();
                }}
                className="text-left py-2 px-2 hover:bg-slate-50 rounded-md flex items-center justify-between text-slate-700 font-medium"
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
                  <span>আমার উইশলিস্ট (পছন্দের তালিকা)</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">
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
              className="text-left py-2 px-2 hover:bg-slate-50 rounded-md flex items-center gap-2 text-cyan-700 font-medium"
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
                className="text-left py-2 px-2 bg-cyan-50/70 hover:bg-cyan-100/70 rounded-md flex items-center gap-2 text-cyan-900 font-semibold border border-cyan-200/60"
              >
                <Download className="w-4 h-4 text-cyan-700" />
                আমার কেনা PDF (ডাউনলোড ও লাইসেন্স)
              </button>
            )}
            {onOpenAdminManager && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminManager();
                }}
                className="text-left py-2 px-2 hover:bg-slate-50 rounded-md flex items-center gap-2 text-slate-700 font-medium"
              >
                <Database className="w-4 h-4 text-cyan-600" />
                অ্যাডমিন ও প্রোডাক্ট ডাটা প্যানেল
              </button>
            )}
          </div>
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('catalog', 'all')}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-slate-900 rounded-lg shadow-sm"
            >
              সকল বই ও পিডিএফ ক্যাটালগ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
