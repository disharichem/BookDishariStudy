'use client';

import React from 'react';
import { ChemistryBranch } from '@/types';
import { 
  Atom, 
  FlaskConical, 
  Flame, 
  Layers, 
  ArrowRight, 
  Check, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface ProductCategoriesProps {
  selectedBranch: ChemistryBranch;
  onSelectBranch: (branch: ChemistryBranch) => void;
}

interface BranchItem {
  id: ChemistryBranch;
  titleBn: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  keyTopics: string[];
  chaptersBn: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  iconBg: string;
  itemCount: number;
}

const BRANCHES: BranchItem[] = [
  {
    id: 'organic',
    titleBn: 'জৈব রসায়ন',
    titleEn: 'Organic Chemistry',
    icon: Flame,
    tagline: 'হাইড্রোকার্বন, বিক্রিয়ার রঙিন রোডম্যাপ ও রূপান্তর চার্ট',
    keyTopics: ['অ্যালকেন, অ্যালকিন ও অ্যালকাইন', 'ব্রোমিন ও বেয়ার পরীক্ষা', 'অ্যালকোহল ও ফ্যাটি এসিড', 'পলিমার ও প্লাস্টিক প্রস্তুতি'],
    chaptersBn: 'মূল অধ্যায়: ১১শ অধ্যায় (জীবাশ্ম ও হাইড্রোকার্বন)',
    accentBg: 'hover:bg-amber-50/50',
    accentText: 'text-amber-700',
    accentBorder: 'hover:border-amber-300',
    iconBg: 'bg-amber-100 text-amber-700',
    itemCount: 3,
  },
  {
    id: 'inorganic',
    titleBn: 'অজৈব রসায়ন',
    titleEn: 'Inorganic Chemistry',
    icon: Atom,
    tagline: 'পর্যায় সারণি, ইলেকট্রন বিন্যাস, বন্ধন ও খনিজ সম্পদ',
    keyTopics: ['পর্যায় সারণির ছন্দ ও নিয়ম', 'আউফবাউ ও ব্যতিক্রমী বিন্যাস', 'আয়নিক ও সমযোজী বন্ধন', 'ধাতু নিষ্কাশন ও এসিড-ক্ষার'],
    chaptersBn: 'মূল অধ্যায়: ৩, ৪, ৫, ৯, ১০ ও ১২',
    accentBg: 'hover:bg-cyan-50/50',
    accentText: 'text-cyan-700',
    accentBorder: 'hover:border-cyan-300',
    iconBg: 'bg-cyan-100 text-cyan-800',
    itemCount: 4,
  },
  {
    id: 'physical',
    titleBn: 'ভৌত রসায়ন',
    titleEn: 'Physical Chemistry',
    icon: FlaskConical,
    tagline: 'পদার্থের অবস্থা, মোলের গণনা, লা-শাতেলিয়ার নীতি ও তড়িৎ কোষ',
    keyTopics: ['কণার গতিতত্ত্ব ও ব্যাপন-নিঃসরণ', 'মোলারিটি ও লিমিটিং বিক্রিয়ক', 'বিক্রিয়ার তাপ পরিবর্তন (ΔH)', 'গ্যালভানিক ও ড্রাই সেল'],
    chaptersBn: 'মূল অধ্যায়: ১, ২, ৬, ৭ ও ৮',
    accentBg: 'hover:bg-indigo-50/50',
    accentText: 'text-indigo-700',
    accentBorder: 'hover:border-indigo-300',
    iconBg: 'bg-indigo-100 text-indigo-700',
    itemCount: 4,
  },
];

export const ProductCategories: React.FC<ProductCategoriesProps> = ({
  selectedBranch,
  onSelectBranch,
}) => {
  const handleCardClick = (branchId: ChemistryBranch) => {
    onSelectBranch(branchId);
    // Smooth scroll to catalog
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className="py-10 sm:py-14 bg-white border-b border-slate-200 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800">
              <span>শাখাভিত্তিক অনুসন্ধান</span>
              <span aria-hidden="true">·</span>
              <span>এসএসসি কেমিস্ট্রি সিলেবাস</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              রসায়নের মূল শাখানুযায়ী নোট ও বই
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              যে অধ্যায়ে আপনার দুর্বলতা বেশি, সরাসরি সেই শাখার বই ও কালারফুল হ্যান্ডনোট বেছে নিয়ে
              প্রস্তুতি আরও সহজ ও দ্রুত করুন।
            </p>
          </div>

          {/* All topics reset button */}
          <button
            type="button"
            onClick={() => handleCardClick('all')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto ${
              selectedBranch === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সকল শাখা ({selectedBranch === 'all' ? 'সক্রিয়' : 'দেখুন'})</span>
          </button>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {BRANCHES.map((branch) => {
            const Icon = branch.icon;
            const isSelected = selectedBranch === branch.id;

            return (
              <div
                key={branch.id}
                onClick={() => handleCardClick(branch.id)}
                className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-cyan-600 ring-2 ring-cyan-500/20 bg-cyan-50/30 shadow-md'
                    : `border-slate-200 bg-white ${branch.accentBorder} ${branch.accentBg} hover:shadow-md hover:-translate-y-0.5`
                }`}
              >
                {/* Card Header: Icon & Branch Names */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${branch.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {branch.itemCount}টি প্রকাশনা
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                      {branch.titleBn}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">
                      {branch.titleEn}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {branch.tagline}
                  </p>
                </div>

                {/* Key Topics List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {branch.keyTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-cyan-800 font-medium pt-1">
                    {branch.chaptersBn}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-cyan-700 transition-colors border-t border-slate-100/80">
                  <span>
                    {isSelected ? 'এই শাখার বই দেখানো হচ্ছে' : 'বই ও হ্যান্ডনোট দেখুন'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-cyan-100 text-slate-700 group-hover:text-cyan-800 flex items-center justify-center transition-colors">
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
