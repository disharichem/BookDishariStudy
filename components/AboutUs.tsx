'use client';

import React from 'react';
import { Atom, BookOpen, Download, Layers, CheckCircle2 } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <section id="about-us" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Mission & Identity */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800">
              <span>আমাদের উদ্যোগ ও লক্ষ্য</span>
              <span aria-hidden="true">·</span>
              <span>দিশারী কেমিস্ট্রি</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
              রসায়নকে ভীতিকর নয়, বরং সহজবোধ্য বিষয় হিসেবে গড়ে তোলার উদ্যোগ
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              &ldquo;দিশারী কেমিস্ট্রি&rdquo; বাংলাদেশের মাধ্যমিক (এসএসসি) বিজ্ঞান বিভাগের
              শিক্ষার্থীদের রসায়ন বিষয়কে সহজ ভাষায় বোঝার একটি শিক্ষামূলক প্ল্যাটফর্ম। রসায়নের রাসায়নিক বিক্রিয়া,
              ইলেকট্রন বিন্যাসের নীতি, জারণ-বিজারণ ও গাণিতিক বিষয়গুলো যাতে শিক্ষার্থীরা মুখস্থ
              না করে যুক্তি ও ছকের মাধ্যমে বুঝতে পারে, সেই লক্ষ্যেই আমাদের মুদ্রিত বই ও ডিজিটাল পিডিএফ প্রস্তুত করা হয়েছে।
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>
                  <strong>সহজ ভাষায় বিষয়ভিত্তিক উপস্থাপন:</strong> জটিল তত্ত্ব ও সমীকরণগুলো প্রাথমিক পর্যায় থেকে বাস্তব উদাহরণের সাথে বুঝিয়ে দেওয়া।
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>
                  <strong>মুদ্রিত বই ও ডিজিটাল বিকল্প:</strong> পড়ার টেবিলে পড়ার জন্য মুদ্রিত কপি এবং স্মার্টফোনে দ্রুত রিভিশনের জন্য সুবিধাজনক ডিজিটাল পিডিএফ।
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>
                  <strong>প্রশ্ন প্যাটার্ন অনুশীলন:</strong> বিগত বছরগুলোর বোর্ড পরীক্ষার প্রশ্ন ও সৃজনশীল কাঠামোর সাথে মিল রেখে অধ্যায়ভিত্তিক অনুশীলন।
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Key Focus Areas */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-base font-bold text-slate-900">মুদ্রিত সহায়িকা</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                পরিপূর্ণ অধ্যায়ভিত্তিক ব্যাখ্যা ও সৃজনশীল অনুশীলনী সংবলিত পেপারব্যাক বই।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <p className="text-base font-bold text-slate-900">ডিজিটাল হ্যান্ডনোট</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                স্মার্টফোনে ও ট্যাবলেটে সুবিধাজনক রিভিশনের জন্য রঙিন পিডিএফ নোটস।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-base font-bold text-slate-900">শাখাভিত্তিক ফোকাস</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                জৈব রসায়ন, অজৈব রসায়ন ও ভৌত রসায়নের আলাদা আলাদা প্রস্তুতি সুবিধা।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-cyan-100/60 text-cyan-900 flex items-center justify-center">
                <Atom className="w-5 h-5" />
              </div>
              <p className="text-base font-bold text-slate-900">স্বাধীন উদ্যোগ</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                শিক্ষার্থীদের সহজ রসায়ন শিক্ষা উপকরণ পৌঁছে দেওয়ার লক্ষ্যে নির্মিত প্ল্যাটফর্ম।
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
