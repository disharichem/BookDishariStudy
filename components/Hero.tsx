'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Download, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onBuyBooks: () => void;
  onBuyPdf: () => void;
  onViewDetails?: (productId: string) => void;
  onOpenSample?: (productId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onBuyBooks, onBuyPdf, onViewDetails, onOpenSample }) => {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 pt-8 pb-14 md:pt-14 md:pb-20 transition-colors duration-200">
      {/* Subtle scientific grid & accent glow */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none bg-[radial-gradient(#0f2b48_1px,transparent_1px)] dark:bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -top-32 right-0 w-96 h-96 bg-cyan-100/50 dark:bg-cyan-900/20 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-24 left-1/4 w-80 h-80 bg-slate-100 dark:bg-slate-900/40 rounded-full blur-2xl pointer-events-none" 
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Copy, Action Buttons, Trust Adjacency */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Clean unboxed editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-cyan-800 dark:text-cyan-400">
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
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              রসায়নের বিক্রিয়া ও গাণিতিক নিয়ম সহজে বোঝার জন্য প্রতিটি অধ্যায়ের
              কনসেপ্ট ব্যাখ্যা, বিক্রিয়া ফ্লোচার্ট ও বোর্ড প্রশ্ন অনুশীলনের
              মুদ্রিত বই এবং ডিজিটাল পিডিএফ হ্যান্ডনোট।
            </p>

            {/* Primary Action Buttons (মুদ্রিত বই ক্যাটালগ & পিডিএফ নোট ক্যাটালগ - ছবির বাটন দুইটি একই সারিতে প্রদর্শিত) */}
            <div className="flex flex-row items-center gap-2 sm:gap-3.5 pt-2 w-full max-w-xl">
              <button
                type="button"
                onClick={onBuyBooks}
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 active:scale-[0.98] transition-all shadow-sm cursor-pointer text-center"
              >
                <BookOpen className="w-4 h-4 text-cyan-400 dark:text-white shrink-0" />
                <span className="whitespace-nowrap truncate">মুদ্রিত বই ক্যাটালগ</span>
              </button>

              <button
                type="button"
                onClick={onBuyPdf}
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-cyan-200 bg-cyan-100/90 dark:bg-cyan-950/80 hover:bg-cyan-200 dark:hover:bg-cyan-900/90 active:scale-[0.98] transition-all border border-cyan-300 dark:border-cyan-800/80 shadow-xs cursor-pointer text-center"
              >
                <Download className="w-4 h-4 text-cyan-700 dark:text-cyan-400 shrink-0" />
                <span className="whitespace-nowrap truncate">পিডিএফ নোট ক্যাটালগ</span>
              </button>
            </div>

            {/* Adjacency Trust Markers - Honest transparent highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>মুদ্রিত বইয়ে কুরিয়ার ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>ডিজিটাল পিডিএফে ইনস্ট্যান্ট এক্সেস</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>বই ও পিডিএফের নমুনা পাঠ</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Main Book Card Display - Clickable to View Details New Page */}
              <div className="relative bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
                <Link 
                  href="/products/dishari-printed-chemistry-guide"
                  onClick={() => onViewDetails?.('dishari-printed-chemistry-guide')}
                  className="block relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 mb-4 cursor-pointer group"
                  title="ক্লিক করে বইয়ের বিস্তারিত বিবরণ ও পৃষ্ঠা দেখুন"
                >
                  <Image
                    src="/images/book_ssc_chemistry_guide_1793290222060.jpg"
                    alt="দিশারী এসএসসি কেমিস্ট্রি সহায়িকা"
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    priority
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-cyan-500/30 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>মুদ্রিত বই</span>
                  </div>

                  {/* Desktop Hover Reading Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-950 px-3.5 py-2 rounded-lg shadow-lg">
                      <BookOpen className="w-4 h-4 text-cyan-700" />
                      ক্লিক করে বিস্তারিত দেখুন
                    </span>
                  </div>

                  {/* Mobile & Desktop Persistent Prompt Ribbon */}
                  <div className="absolute bottom-2 inset-x-2 bg-slate-950/85 backdrop-blur-xs text-center py-1.5 rounded-lg text-[11px] font-medium text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>📖 ছবিতে ক্লিক করে নতুন পেইজে বিস্তারিত দেখুন</span>
                  </div>
                </Link>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-medium">মুদ্রিত প্রকাশনা · ৩৮০ পৃষ্ঠা</span>
                    <span className="text-xs text-slate-400">নমুনা মূল্য</span>
                  </div>
                  <Link 
                    href="/products/dishari-printed-chemistry-guide"
                    onClick={() => onViewDetails?.('dishari-printed-chemistry-guide')}
                    className="block text-base font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    দিশারী এসএসসি কেমিস্ট্রি মাস্টার গাইড
                  </Link>
                  <div className="flex items-baseline justify-between pt-1">
                    {/* দাম এবং ডানে কমিশনের পারসেন্ট */}
                    <div className="flex items-baseline flex-wrap gap-2">
                      <span className="text-xl font-bold text-cyan-400 tabular-nums">৳৪২০</span>
                      <span className="text-xs text-slate-400 line-through tabular-nums">৳৫৫০</span>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded shadow-2xs">
                        ২৪%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenSample?.('dishari-printed-chemistry-guide')}
                        className="text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        title="পপআপে নমুনা পড়ুন"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>নমুনা পড়ুন</span>
                      </button>
                      <Link
                        href="/products/dishari-printed-chemistry-guide"
                        onClick={() => onViewDetails?.('dishari-printed-chemistry-guide')}
                        className="text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center"
                      >
                        বিস্তারিত
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Companion Note - PDF Showcase (Clickable to View Details New Page) */}
              <Link 
                href="/products/dishari-organic-chem-pdf"
                onClick={() => onViewDetails?.('dishari-organic-chem-pdf')}
                className="flex absolute -bottom-5 -left-2 sm:-bottom-6 sm:-left-6 bg-white rounded-xl p-2.5 sm:p-3 shadow-xl border border-cyan-300/80 items-center gap-2.5 sm:gap-3 max-w-[270px] sm:max-w-[290px] cursor-pointer hover:border-cyan-500 group transition-all"
                title="ক্লিক করে পিডিএফ নোটের বিস্তারিত বিবরণ দেখুন"
              >
                <div className="relative w-12 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src="/images/book_organic_chemistry_notes_1793290222839.jpg"
                    alt="জৈব যৌগ নোট"
                    fill
                    sizes="60px"
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
                </div>
                <div className="text-xs min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                      ডিজিটাল PDF
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">জৈব যৌগ হ্যান্ডনোট</p>
                  <p className="text-cyan-800 text-[10px] font-medium flex items-center gap-1">
                    <span>📖 ক্লিক করে নতুন পেইজে দেখুন</span>
                  </p>
                  {/* দাম এবং ডানে কমিশনের পারসেন্ট */}
                  <div className="flex items-baseline gap-1.5 pt-0.5">
                    <span className="text-cyan-800 font-bold tabular-nums">৳১২০</span>
                    <span className="text-[10px] text-slate-400 line-through tabular-nums">৳২০০</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded">
                      ৪০%
                    </span>
                  </div>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
