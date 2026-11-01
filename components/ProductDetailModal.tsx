'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { 
  X, 
  BookOpen, 
  Download, 
  Star, 
  ShoppingCart, 
  Check, 
  FileText, 
  ListTree, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  initialTab?: 'overview' | 'toc' | 'sample';
  onClose: () => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenSampleModal?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialTab = 'overview',
  onClose,
  onDirectOrder,
  onAddToCart,
  onOpenSampleModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'toc' | 'sample'>(initialTab);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  if (!product) return null;

  const isPdf = product.format === 'pdf';
  const isCombo = product.format === 'combo';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            {isPdf ? (
              <span className="flex items-center gap-1.5 text-cyan-700">
                <Download className="w-3.5 h-3.5" />
                ডিজিটাল পিডিএফ নোট
              </span>
            ) : isCombo ? (
              <span className="flex items-center gap-1.5 text-amber-700">
                <Sparkles className="w-3.5 h-3.5" />
                মেগা কম্বো প্যাকেজ
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-800">
                <BookOpen className="w-3.5 h-3.5" />
                মুদ্রিত বই
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span className="text-slate-500 font-normal">{product.edition}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top Overview: Cover Image + Key Purchase Block */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Book Cover - Clickable to preview sample pages in popup */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div 
                onClick={() => {
                  if (onOpenSampleModal) {
                    onOpenSampleModal(product);
                  } else {
                    setActiveTab('sample');
                  }
                }}
                className="relative aspect-[3/4] w-48 sm:w-56 md:w-full rounded-xl overflow-hidden bg-slate-100 shadow-md border border-slate-200 cursor-pointer group"
                title="ক্লিক করে বইয়ের নমুনা অংশ পপআপে পড়ুন"
              >
                <Image
                  src={product.coverImage}
                  alt={product.titleBn}
                  fill
                  sizes="(max-width: 768px) 240px, 320px"
                  referrerPolicy="no-referrer"
                  className="object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                  <span className="text-xs font-bold bg-white text-slate-900 px-3 py-2 rounded-lg shadow-md flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-600" />
                    নমুনা অংশ পপআপ
                  </span>
                </div>

                <div className="absolute bottom-2 inset-x-2 bg-slate-900/85 backdrop-blur-xs text-cyan-300 text-[10px] font-medium py-1 px-2 rounded text-center flex items-center justify-center gap-1 border border-cyan-500/20">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>📖 ছবিতে ক্লিক করে নমুনা পড়ুন</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenSampleModal) {
                    onOpenSampleModal(product);
                  } else {
                    setActiveTab('sample');
                  }
                }}
                className="mt-2.5 w-full text-xs font-semibold text-cyan-800 hover:text-cyan-950 flex items-center justify-center gap-1.5 cursor-pointer bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 py-1.5 px-3 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-600" />
                <span>📖 নমুনা অংশ পপআপে পড়ুন</span>
              </button>
            </div>

            {/* Book Title & Key Specs */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-cyan-800 font-semibold">{product.sku || 'DC-SAMPLE'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 font-medium">{isPdf ? 'ডিজিটাল সংস্করণ' : 'মুদ্রিত কপি'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-medium">
                    {isPdf ? 'ডিজিটাল অ্যাক্সেস' : product.stockQuantity ? `স্টক: ${product.stockQuantity} কপি` : 'উপলব্ধ'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {product.titleBn}
                </h2>
                <p className="text-xs text-slate-500 font-medium">{product.titleEn}</p>
                <p className="text-xs sm:text-sm text-cyan-800 font-medium pt-0.5">
                  {product.subtitleBn}
                </p>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 tabular-nums">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through tabular-nums">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    * নমুনা মূল্য (প্রকৃত তথ্য পরবর্তীতে হালনাগাদ করা যাবে)
                  </span>
                </div>

                <div className="text-right text-xs">
                  <p className="font-semibold text-slate-700">উপলব্ধতা স্ট্যাটাস</p>
                  <p className="text-emerald-700 font-medium">
                    {isPdf ? 'ডাউনলোডযোগ্য (নমুনা)' : 'অর্ডারের জন্য উন্মুক্ত (নমুনা)'}
                  </p>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">লেখক / সংকলক</span>
                  <span className="font-medium text-slate-800">{product.author || '[তথ্য শীঘ্রই যুক্ত হবে]'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">মোট পৃষ্ঠা</span>
                  <span className="font-medium text-slate-800 tabular-nums">{product.pages ? `${product.pages} পৃষ্ঠা` : 'নমুনা পৃষ্ঠা'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">ফরমেট / বাইন্ডিং</span>
                  <span className="font-medium text-slate-800">
                    {product.bindingType || product.fileFormat || (isPdf ? 'PDF ডিজিটাল ই-বুক' : 'কাগজ বাঁধাই')}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">ডেলিভারির ধরন</span>
                  <span className="font-medium text-cyan-800">
                    {isPdf ? 'ইমেইল ও গুগল ড্রাইভ লিংক' : 'কুরিয়ার ডেলিভারি (ক্যাশ অন ডেলিভারি)'}
                  </span>
                </div>
              </div>

              {/* Immediate Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 text-slate-800 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-cyan-600" />
                  <span>ব্যাগে যোগ করুন</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onDirectOrder(product);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md cursor-pointer"
                >
                  <span>{isPdf ? 'সরাসরি PDF অর্ডার করুন' : 'সরাসরি বই অর্ডার করুন'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Tabbed In-Depth Information: Details, Table of Contents, Sample Pages */}
          <div className="pt-2">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                বইয়ের বিবরণ ও বৈশিষ্ট্য
              </button>

              <button
                onClick={() => setActiveTab('toc')}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'toc'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                পূর্ণাঙ্গ সূচিপত্র ({product.chapters.length}টি অধ্যায়)
              </button>

              <button
                onClick={() => setActiveTab('sample')}
                className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sample'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-600" />
                <span>নমুনা পাতা প্রিভিউ</span>
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="pt-4 space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {product.description}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    বইটির বিশেষ সুবিধাসমূহ
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    {product.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50">
                        <Check className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-100 flex items-center gap-3 text-xs text-cyan-950">
                  <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0" />
                  <span>
                    নোট: এটি একটি নমুনা প্রোডাক্ট পেজ। দিশারী কেমিস্ট্রির ডেটাসেট থেকে যেকোনো সময় প্রকৃত
                    লেখক, পৃষ্ঠা সংখ্যা ও ফাইল লিঙ্ক যুক্ত বা সম্পাদন করা যাবে।
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Table of Contents */}
            {activeTab === 'toc' && (
              <div className="pt-4 space-y-3">
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {product.chapters.map((chapter) => (
                    <div key={chapter.number} className="p-3.5 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-cyan-700 block">
                            অধ্যায় {chapter.number}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                            {chapter.title}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {chapter.topics.map((topic, i) => (
                              <span key={i} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Interactive Sample Reader Simulator */}
            {activeTab === 'sample' && (
              <div className="pt-4 space-y-4">
                {onOpenSampleModal && (
                  <button
                    type="button"
                    onClick={() => onOpenSampleModal(product)}
                    className="w-full flex items-center justify-between p-3 bg-cyan-900 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>পপআপ আকারে বড় স্ক্রিনে এই নমুনা অংশটি পড়ুন</span>
                    </span>
                    <span className="text-cyan-300 bg-cyan-950/70 px-2.5 py-1 rounded-md text-[11px] font-bold border border-cyan-700/50">
                      পপআপ খুলুন ↗
                    </span>
                  </button>
                )}

                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-cyan-400">
                        পৃষ্ঠা {product.samplePages[selectedSampleIndex]?.pageNumber || '১'}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-300 font-medium">
                        {product.samplePages[selectedSampleIndex]?.title || 'নমুনা পাঠ'}
                      </span>
                    </div>

                    {product.samplePages.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        {product.samplePages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSampleIndex(idx)}
                            className={`px-2 py-0.5 text-xs rounded transition-colors cursor-pointer ${
                              selectedSampleIndex === idx
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            নমুনা {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sample Content Display */}
                  <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
                    <p className="whitespace-pre-line">
                      {product.samplePages[selectedSampleIndex]?.excerpt}
                    </p>

                    {product.samplePages[selectedSampleIndex]?.keyFormulas && (
                      <div className="pt-2 space-y-1.5 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-cyan-300 block">
                          গুরুত্বপূর্ণ সমীকরণ / সূত্র:
                        </span>
                        <div className="space-y-1 font-mono text-cyan-200 text-xs bg-slate-900/80 p-2.5 rounded border border-cyan-500/20">
                          {product.samplePages[selectedSampleIndex]?.keyFormulas?.map((formula, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-cyan-500">❯</span>
                              <span>{formula}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.samplePages[selectedSampleIndex]?.diagramNote && (
                      <p className="text-[11px] text-amber-300/90 pt-1 italic">
                        নোট: {product.samplePages[selectedSampleIndex]?.diagramNote}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    বইটি সংগ্রহ করলে মূল বাঁধাইকৃত কপি অথবা ফুল রেজোলিউশন পিডিএফে সকল চিত্র ও ব্যাখ্যা পাবেন।
                  </p>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
