'use client';

import React, { useState } from 'react';
import { FAQS } from '@/data/products';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white border-b border-slate-200 scroll-mt-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-800">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>সচরাচর জিজ্ঞাসা</span>
            <span aria-hidden="true">·</span>
            <span>প্রয়োজনীয় তথ্যাবলি</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            প্রায়শই জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            বই ডেলিভারি, পিডিএফ এক্সেস ও পেমেন্ট সংক্রান্ত সাধারণ প্রশ্নের সরাসরি উত্তর
          </p>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-700' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Note */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            অন্য কোনো জিজ্ঞাসা থাকলে সরাসরি আমাদের হটলাইনে ফোন করুন অথবা হোয়াটসঅ্যাপে নক দিন।
          </p>
        </div>

      </div>
    </section>
  );
};
