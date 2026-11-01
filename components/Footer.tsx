'use client';

import React from 'react';
import { Atom, Heart, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onOpenTracking: () => void;
  onOpenMyPdfs?: () => void;
  onFilterChange: (category: 'all' | 'printed' | 'pdf' | 'combo') => void;
  onOpenAdminManager?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTracking,
  onOpenMyPdfs,
  onFilterChange,
  onOpenAdminManager,
}) => {
  const scrollTo = (id: string, filter?: 'all' | 'printed' | 'pdf' | 'combo') => {
    if (filter) onFilterChange(filter);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center">
                <Atom className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Dishari Chemistry
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              এসএসসি বিজ্ঞান বিভাগের পরীক্ষার্থীদের রসায়ন ভীতি দূর করে সহজ ও যুক্তিগ্রাহ্য ভাষায়
              বোর্ড পরীক্ষায় A+ প্রস্তুতি অর্জনের বিশেষায়িত শিক্ষামূলক বই ও হ্যান্ডনোট প্ল্যাটফর্ম।
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>হেল্পলাইন: <span className="text-white font-mono font-medium">+৮৮০ ১৭০০-০০০০০০</span></p>
              <p>ইমেইল: <span className="text-white font-mono font-medium">disharichem@gmail.com</span></p>
            </div>
          </div>

          {/* Quick Links: Books */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              বই ও প্রকাশনা
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => scrollTo('catalog', 'printed')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  দিশারী মাস্টার গাইড (মুদ্রিত)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('catalog', 'printed')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  ১০০০+ CQ ও MCQ প্রশ্নব্যাংক
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('catalog', 'pdf')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  জৈব যৌগ ও বিক্রিয়া হ্যান্ডনোট (PDF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('catalog', 'pdf')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  শেষ মুহূর্তের রিভিশন চার্ট (PDF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('catalog', 'combo')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  দিশারী মেগা বান্ডেল কম্বো
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              গ্রাহক সেবা ও নীতি
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => scrollTo('how-to-order')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  অর্ডার করার নিয়ম
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  লাইভ অর্ডার ট্র্যাকিং
                </button>
              </li>
              {onOpenMyPdfs && (
                <li>
                  <button
                    onClick={onOpenMyPdfs}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium"
                  >
                    আমার কেনা PDF (ডাউনলোড)
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  সচরাচর জিজ্ঞাসা (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('contact')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  যোগাযোগ ও সাপোর্ট
                </button>
              </li>
              {onOpenAdminManager && (
                <li>
                  <button
                    onClick={onOpenAdminManager}
                    className="hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
                  >
                    অ্যাডমিন ও প্রোডাক্ট প্যানেল
                  </button>
                </li>
              )}
              <li>
                <span className="text-slate-400">সহায়তা সেল: disharichem@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Delivery & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              ডেলিভারি সংক্রান্ত তথ্য
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              প্রচলিত নির্ভরযোগ্য কুরিয়ার সার্ভিসের মাধ্যমে গ্রাহকের ঠিকানায় বই পৌঁছে দেওয়ার ব্যবস্থা করা হয়।
            </p>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
              <span className="text-cyan-400 font-semibold block mb-0.5">নমুনা প্ল্যাটফর্ম নোটিশ:</span>
              এটি প্রাথমিক ডেমো প্রিভিউ সাইট। প্রদর্শিত সকল মূল্য ও পণ্য তথ্য সম্পাদনাযোগ্য নমুনা (Placeholder)।
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} দিশারী কেমিস্ট্রি (Dishari Chemistry). সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>বাংলাদেশি শিক্ষার্থীদের জন্য নিবেদিত</span>
          </div>
        </div>

      </div>

    </footer>
  );
};
