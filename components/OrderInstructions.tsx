'use client';

import React from 'react';
import { BookCheck, ClipboardList, PackageCheck, DownloadCloud } from 'lucide-react';

export const OrderInstructions: React.FC = () => {
  return (
    <section id="how-to-order" className="py-12 sm:py-16 bg-white border-b border-slate-200 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-800">
            <span>সহজ অর্ডারিং প্রক্রিয়া</span>
            <span aria-hidden="true">·</span>
            <span>মুদ্রিত ও পিডিএফ সংস্করণ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            কীভাবে সহজে অর্ডার করবেন?
          </h2>
          <p className="text-sm text-slate-600">
            ৩টি সাধারণ ধাপে আপনার পছন্দের মুদ্রিত বই বা ডিজিটাল পিডিএফ সংগ্রহ করুন
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider block">
              ধাপ ০১
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center">
              <BookCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              বই বা পিডিএফ নির্বাচন করুন
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ক্যাটালগ থেকে আপনার প্রয়োজনীয় এসএসসি কেমিস্ট্রি বই, হ্যান্ডনোট বা প্রশ্নব্যাংক
              খুঁজে বের করুন এবং &ldquo;অর্ডার করুন&rdquo; বা &ldquo;কার্টে নিন&rdquo; বোতামে চাপুন।
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider block">
              ধাপ ০২
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ঠিকানা বা ইমেইল পূরণ করুন
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              মুদ্রিত বইয়ের জন্য আপনার নাম, সচল মোবাইল নম্বর এবং কুরিয়ারের ঠিকানা প্রদান করুন।
              আর পিডিএফের জন্য আপনার সক্রিয় ইমেইল ও বিকাশ/নগদ পেমেন্ট ট্রানজেকশন তথ্য দিন।
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider block">
              ধাপ ০৩
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ডেলিভারি ও কপি সংগ্রহ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              মুদ্রিত বই কুরিয়ারের মাধ্যমে পৌঁছে দেওয়া হয় (ক্যাশ অন ডেলিভারি সুবিধা)।
              আর ডিজিটাল পিডিএফের ক্ষেত্রে পেমেন্ট নিশ্চিতকরণ সাপেক্ষে ইমেইল বা ড্রাইভে ফাইল লিংক পাঠানো হয়।
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
