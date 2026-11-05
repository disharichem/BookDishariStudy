'use client';

import React from 'react';
import { BookOpen, Download, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onBuyBooks: () => void;
  onBuyPdf: () => void;
  onViewDetails?: (productId: string) => void;
  onOpenSample?: (productId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onBuyBooks, onBuyPdf }) => {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 pt-10 pb-14 md:pt-16 md:pb-20 transition-colors duration-200">
      {/* Subtle scientific grid & accent glow */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none bg-[radial-gradient(#0f2b48_1px,transparent_1px)] dark:bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -top-32 right-1/4 w-96 h-96 bg-cyan-100/50 dark:bg-cyan-900/20 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-24 left-1/4 w-80 h-80 bg-slate-100 dark:bg-slate-900/40 rounded-full blur-2xl pointer-events-none" 
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Clean unboxed editorial kicker */}
        <div className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wide text-cyan-800 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 px-3.5 py-1.5 rounded-full">
          <span>দিশারী কেমিস্ট্রি</span>
          <span aria-hidden="true">·</span>
          <span>এসএসসি রসায়ন শিক্ষা উপকরণ</span>
          <span aria-hidden="true">·</span>
          <span>মুদ্রিত ও পিডিএফ</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.25] text-balance">
          এসএসসি রসায়ন প্রস্তুতির{' '}
          <span className="text-cyan-600 dark:text-cyan-400 underline decoration-cyan-300 dark:decoration-cyan-600 decoration-wavy decoration-2">
            সহজ ও আধুনিক
          </span>{' '}
          সহায়িকা ও স্টাডি নোট
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          রসায়নের বিক্রিয়া ও গাণিতিক নিয়ম সহজে বোঝার জন্য প্রতিটি অধ্যায়ের
          কনসেপ্ট ব্যাখ্যা, বিক্রিয়া ফ্লোচার্ট ও বোর্ড প্রশ্ন অনুশীলনের
          মুদ্রিত বই এবং ডিজিটাল পিডিএফ হ্যান্ডনোট।
        </p>

        {/* Primary Action Buttons (মুদ্রিত বই ক্যাটালগ & পিডিএফ নোট ক্যাটালগ) */}
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={onBuyBooks}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 active:scale-[0.98] transition-all shadow-sm cursor-pointer text-center"
          >
            <BookOpen className="w-4 h-4 text-cyan-400 dark:text-white shrink-0" />
            <span className="whitespace-nowrap">মুদ্রিত বই ক্যাটালগ</span>
          </button>

          <button
            type="button"
            onClick={onBuyPdf}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-cyan-200 bg-cyan-100/90 dark:bg-cyan-950/80 hover:bg-cyan-200 dark:hover:bg-cyan-900/90 active:scale-[0.98] transition-all border border-cyan-300 dark:border-cyan-800/80 shadow-xs cursor-pointer text-center"
          >
            <Download className="w-4 h-4 text-cyan-700 dark:text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap">পিডিএফ নোট ক্যাটালগ</span>
          </button>
        </div>

        {/* Adjacency Trust Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>মুদ্রিত বইয়ে কুরিয়ার ডেলিভারি</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>ডিজিটাল পিডিএফে ইনস্ট্যান্ট এক্সেস</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>বই ও পিডিএফের নমুনা পাঠ</span>
          </div>
        </div>

      </div>
    </section>
  );
};
