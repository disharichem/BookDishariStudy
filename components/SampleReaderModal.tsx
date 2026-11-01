'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { 
  X, 
  BookOpen, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  CheckCircle2, 
  Layers, 
  FileText,
  BookmarkCheck,
  ZoomIn
} from 'lucide-react';

interface SampleReaderModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewFullDetails?: (product: Product) => void;
}

export const SampleReaderModal: React.FC<SampleReaderModalProps> = ({
  product,
  onClose,
  onDirectOrder,
  onAddToCart,
  onViewFullDetails,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (!product) return null;

  const isPdf = product.format === 'pdf';
  const isCombo = product.format === 'combo';
  const samples = product.samplePages && product.samplePages.length > 0
    ? product.samplePages
    : [
        {
          pageNumber: 1,
          title: 'নমুনা পাঠ্য অংশ',
          excerpt: product.description || 'বইটির নমুনা পাঠ শীঘ্রই যুক্ত করা হবে।',
        }
      ];

  const currentSample = samples[currentPageIndex] || samples[0];

  const handleNext = () => {
    if (currentPageIndex < samples.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg shrink-0">
              {isPdf ? <Download className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  {isPdf ? 'ডিজিটাল PDF নমুনা পপআপ' : isCombo ? 'কম্বো প্যাক নমুনা' : 'মুদ্রিত বইয়ের নমুনা অংশ'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">· নমুনা পাঠ</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md pt-0.5">
                {product.titleBn}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="পপআপ বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Page Switcher Navigation Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-slate-500 font-medium whitespace-nowrap mr-1">নমুনা পাতা:</span>
            {samples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPageIndex(idx)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  currentPageIndex === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <span>পাতা {sample.pageNumber || idx + 1}</span>
                {currentPageIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="পূর্ববর্তী পাতা"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-medium text-slate-600 tabular-nums">
              {currentPageIndex + 1} / {samples.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPageIndex === samples.length - 1}
              className="p-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="পরবর্তী পাতা"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reader Canvas / Document View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-8 space-y-6 min-h-[380px] relative">
            
            {/* Watermark / Header of the Book Page */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
              <span className="font-semibold text-cyan-800">দিশারী কেমিস্ট্রি প্রকাশনা</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                পৃষ্ঠা নং: {currentSample.pageNumber || currentPageIndex + 1}
              </span>
            </div>

            {/* Title of the Sample Section */}
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                নমুনা অনুচ্ছেদ
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentSample.title}
              </h3>
            </div>

            {/* Main Reading Excerpt */}
            <div className="font-sans text-sm sm:text-base text-slate-800 leading-relaxed space-y-3 whitespace-pre-line text-justify">
              <p>{currentSample.excerpt}</p>
            </div>

            {/* Key Chemical Formulas Box */}
            {currentSample.keyFormulas && currentSample.keyFormulas.length > 0 && (
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>গুরুত্বপূর্ণ সমীকরণ ও রাসায়নিক বিক্রিয়া:</span>
                </div>
                <div className="space-y-1.5 font-mono text-xs sm:text-sm text-cyan-200 bg-slate-950/70 p-3 rounded-lg border border-cyan-500/20">
                  {currentSample.keyFormulas.map((formula, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">❯</span>
                      <span className="select-all">{formula}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagram / Concept Note */}
            {currentSample.diagramNote && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/70 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950">চিত্র ও বিশেষ নোট:</span>
                  <p className="text-amber-800/90">{currentSample.diagramNote}</p>
                </div>
              </div>
            )}

            {/* Bottom Book Page Footnote */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>* এটি মূল বই/পিডিএফের একটি নির্বাচিত নমুনা অংশ।</span>
              <span className="text-cyan-700 font-semibold">দিশারী রসায়ন গাইড</span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Sticky Action Bar */}
        <div className="p-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="relative w-10 h-14 rounded overflow-hidden bg-slate-100 border border-slate-200 shrink-0 hidden xs:block">
              <Image
                src={product.coverImage}
                alt={product.titleBn}
                fill
                sizes="40px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 tabular-nums">৳{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">৳{product.originalPrice}</span>
                )}
                <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {isPdf ? 'ইনস্ট্যান্ট ডাউনলোড' : 'কুরিয়ার ডেলিভারি'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {product.pages ? `${product.pages} পৃষ্ঠার সম্পূর্ণ কপি` : 'সম্পূর্ণ সংস্করণ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onViewFullDetails && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewFullDetails(product);
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                বিস্তারিত
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onAddToCart(product);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-800 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-cyan-600" />
              <span>কার্ট</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDirectOrder(product);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>{isPdf ? 'PDF অর্ডার' : 'বই অর্ডার'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
