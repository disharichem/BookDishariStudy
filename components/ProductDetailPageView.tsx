'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { toBengaliNumber, calculateCommissionPercent } from '@/lib/utils';
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Layers, 
  ChevronRight, 
  Clock, 
  Check, 
  Info, 
  Share2, 
  Eye,
  Heart
} from 'lucide-react';

interface ProductDetailPageViewProps {
  product: Product;
  allProducts?: Product[];
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onBack: () => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenSampleModal: (product: Product) => void;
  onSelectRelated?: (product: Product) => void;
}

export const ProductDetailPageView: React.FC<ProductDetailPageViewProps> = ({
  product,
  allProducts = [],
  isWishlisted = false,
  onToggleWishlist,
  onBack,
  onDirectOrder,
  onAddToCart,
  onOpenSampleModal,
  onSelectRelated,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'toc' | 'specs'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  const isPdf = product.format === 'pdf';
  const isCombo = product.format === 'combo';

  const formatBadge = isPdf 
    ? 'ডিজিটাল পিডিএফ (PDF)' 
    : isCombo 
    ? 'মুদ্রিত + পিডিএফ কম্বো' 
    : 'মুদ্রিত বই (Paperback)';

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-cyan-800 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span>সকল বই ও নোট ক্যাটালগে ফিরে যান</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 truncate">
            <span>হোম</span>
            <span>/</span>
            <span>ক্যাটালগ</span>
            <span>/</span>
            <span className="text-slate-900 font-medium truncate max-w-xs">{product.titleBn}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="লিংক কপি করুন"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>শেয়ার</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Book Cover Image & Sample Trigger */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div 
                onClick={() => onOpenSampleModal(product)}
                className="relative aspect-[3/4] w-full max-w-sm rounded-2xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200 cursor-pointer group"
                title="ক্লিক করে বইয়ের নমুনা অংশ পপআপে পড়ুন"
              >
                <Image
                  src={product.coverImage}
                  alt={product.titleBn}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  referrerPolicy="no-referrer"
                  className="object-cover group-hover:scale-103 transition-transform duration-300"
                />

                {/* Top Corner Badge */}
                <div className="absolute top-3.5 left-3.5 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md border border-white/10">
                  {isPdf ? (
                    <>
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>ডিজিটাল PDF</span>
                    </>
                  ) : isCombo ? (
                    <>
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>কম্বো বান্ডেল</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>মুদ্রিত সংস্করণ</span>
                    </>
                  )}
                </div>

                {/* Hover Click Prompt Overlay */}
                <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-white text-slate-950 px-4 py-2.5 rounded-xl shadow-xl">
                    <FileText className="w-4 h-4 text-cyan-700" />
                    পপআপে নমুনা অংশ পড়ুন
                  </span>
                  <span className="text-xs text-slate-200 mt-2 font-medium">
                    (ছবিতে ক্লিক করলেই নমুনা পৃষ্ঠা খুলবে)
                  </span>
                </div>

                {/* Permanent Mobile & Desktop Ribbon */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-xs text-white text-xs font-medium py-2 px-3 rounded-xl text-center flex items-center justify-center gap-2 border border-cyan-500/30 shadow-lg">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>📖 ছবিতে ক্লিক করে পপআপে নমুনা পড়ুন</span>
                </div>
              </div>

              {/* Explicit Sample Button Under Image */}
              <button
                type="button"
                onClick={() => onOpenSampleModal(product)}
                className="mt-4 w-full max-w-sm py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-cyan-900 hover:text-cyan-950 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <FileText className="w-4 h-4 text-cyan-700" />
                <span>📖 নমুনা অংশ পড়ুন (পপআপ রিডার)</span>
              </button>

              <p className="text-[11px] text-slate-500 text-center mt-2 max-w-xs">
                বইটি কেনার আগে নির্বাচিত অধ্যায় ও কনসেপ্টের নমুনা পৃষ্ঠা পড়ে সিদ্ধান্ত নিতে পারেন।
              </p>
            </div>

            {/* Right Column: Title, Metadata, Pricing, Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-cyan-800 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {product.sku || 'DC-SSC-CHEM'}
                  </span>
                  <span>·</span>
                  <span className="text-slate-700 font-medium">{formatBadge}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isPdf ? 'তাৎক্ষণিক ডিজিটাল ডাউনলোড' : 'স্টকে রয়েছে (মুদ্রিত কপি)'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                  {product.titleBn}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {product.titleEn}
                </p>
                <p className="text-sm sm:text-base text-cyan-800 font-medium pt-1">
                  {product.subtitleBn}
                </p>
              </div>

              {/* Price & Savings Block */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <div className="flex items-baseline flex-wrap gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base text-slate-400 line-through tabular-nums">
                        ৳{product.originalPrice}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                        ৳{product.originalPrice - product.price} সাশ্রয়
                      </span>
                    )}
                    {calculateCommissionPercent(product.price, product.originalPrice) && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md shadow-2xs">
                        {toBengaliNumber(calculateCommissionPercent(product.price, product.originalPrice)!)}% কমিশন
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 block pt-1">
                    * {isPdf ? 'এককালীন পেমেন্টে লাইফটাইম এক্সেস' : 'সারা বাংলাদেশে কুরিয়ার হোম ডেলিভারি সুবিধা'}
                  </span>
                </div>

                <div className="text-right text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">
                    {product.pages ? `${product.pages} পৃষ্ঠা` : 'পূর্ণাঙ্গ প্রকাশনা'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isPdf ? 'রঙিন সার্চেবল PDF' : product.bindingType || 'কাগজ বাঁধাই'}
                  </p>
                </div>
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {onToggleWishlist && (
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product)}
                    className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-300'
                    }`}
                    title={isWishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে সেভ করুন"}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="inline">{isWishlisted ? 'উইশলিস্টে সেভ আছে' : 'উইশলিস্ট'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-cyan-700" />
                  <span>ব্যাগে যোগ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDirectOrder(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>{isPdf ? 'সরাসরি PDF অর্ডার করুন' : 'সরাসরি বইটি অর্ডার করুন'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Value Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{isPdf ? 'পেমেন্ট অনুমোদনে তাৎক্ষণিক লিংক' : 'দ্রুত কুরিয়ার ডেলিভারি'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>সরাসরি অথেনটিক প্রকাশনী থেকে</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>এসএসসি ২০২৫-২০২৬ এর সিলেবাস</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>বোর্ড প্রশ্ন ও ব্যাখ্যামূলক সমাধান</span>
                </div>
              </div>

              {/* Product Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    বইটির বিশেষ বৈশিষ্ট্যসমূহ:
                  </h4>
                  <ul className="space-y-2">
                    {product.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <Check className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* In-Depth Information Section (Tabs: Overview, Table of Contents, Specifications) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Section Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              বইয়ের পূর্ণাঙ্গ বিবরণ
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('toc')}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'toc'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <span>পূর্ণাঙ্গ সূচিপত্র ({product.chapters?.length || 0}টি অধ্যায়)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-cyan-600" />
              <span>স্পেসিফিকেশন ও প্রকাশনা তথ্য</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-8">
            
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-4xl">
                <div className="prose text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                  <p>{product.description}</p>
                </div>

                {/* Sample Prompt Box */}
                <div className="p-4 sm:p-5 bg-cyan-50/70 border border-cyan-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-cyan-950 text-sm sm:text-base block">
                      বইটির কয়েকটি নমুনা পৃষ্ঠা পড়ে দেখতে চান?
                    </span>
                    <p className="text-xs text-cyan-800">
                      ইলেকট্রন বিন্যাস, বিক্রিয়া ফ্লোচার্ট ও সমীকরণ সংবলিত নমুনা পাতা পপআপে পড়ার ব্যবস্থা রয়েছে।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSampleModal(product)}
                    className="shrink-0 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>নমুনা পপআপ খুলুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Table of Contents Tab */}
            {activeTab === 'toc' && (
              <div className="space-y-4 max-w-4xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">অধ্যায়ভিত্তিক সূচিপত্র ও বিষয়বস্তু</h3>
                  <span className="text-xs text-slate-500">মোট {product.chapters?.length || 0} টি অধ্যায়</span>
                </div>

                <div className="space-y-3">
                  {product.chapters?.map((ch) => (
                    <div 
                      key={ch.number}
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {ch.number}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{ch.title}</h4>
                      </div>
                      {ch.topics && ch.topics.length > 0 && (
                        <div className="pl-8 flex flex-wrap gap-1.5">
                          {ch.topics.map((t, idx) => (
                            <span 
                              key={idx}
                              className="text-[11px] bg-white text-slate-600 px-2.5 py-0.5 rounded border border-slate-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="max-w-3xl">
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="py-3 grid grid-cols-3">
                    <span className="text-slate-500 font-medium">বইয়ের নাম</span>
                    <span className="col-span-2 text-slate-900 font-semibold">{product.titleBn}</span>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <span className="text-slate-500 font-medium">প্রকাশক</span>
                    <span className="col-span-2 text-slate-800">{product.publisher || 'দিশারী কেমিস্ট্রি প্রকাশনা'}</span>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <span className="text-slate-500 font-medium">সংস্করণ</span>
                    <span className="col-span-2 text-slate-800">{product.edition}</span>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <span className="text-slate-500 font-medium">ফরম্যাট</span>
                    <span className="col-span-2 text-slate-800">{formatBadge}</span>
                  </div>
                  <div className="py-3 grid grid-cols-3">
                    <span className="text-slate-500 font-medium">পৃষ্ঠা সংখ্যা</span>
                    <span className="col-span-2 text-slate-800">{product.pages ? `${product.pages} পৃষ্ঠা` : 'সম্পূর্ণ সংকলন'}</span>
                  </div>
                  {product.bindingType && (
                    <div className="py-3 grid grid-cols-3">
                      <span className="text-slate-500 font-medium">বাঁধাই ও কাগজ</span>
                      <span className="col-span-2 text-slate-800">{product.bindingType}</span>
                    </div>
                  )}
                  {isPdf && product.fileSizeMb && (
                    <div className="py-3 grid grid-cols-3">
                      <span className="text-slate-500 font-medium">ফাইল সাইজ</span>
                      <span className="col-span-2 text-slate-800">{product.fileSizeMb} MB (উচ্চ রেজোলিউশন PDF)</span>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-3">
                    <span className="text-slate-500 font-medium">প্রযোজ্য বিষয়</span>
                    <span className="col-span-2 text-slate-800">মাধ্যমিক এসএসসি বিজ্ঞান বিভাগ (রসায়ন)</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && onSelectRelated && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              সম্পর্কিত অন্যান্য বই ও স্টাডি নোট
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((rel) => (
                <div 
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-cyan-400 p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs"
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-16 rounded overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={rel.coverImage}
                        alt={rel.titleBn}
                        fill
                        sizes="60px"
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-cyan-700 font-bold block">
                        {rel.format === 'pdf' ? 'ডিজিটাল PDF' : 'মুদ্রিত বই'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-cyan-800 transition-colors">
                        {rel.titleBn}
                      </h4>
                      <p className="text-cyan-900 font-bold text-xs mt-1 tabular-nums">৳{rel.price}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-cyan-800 font-semibold">
                    <span>বিস্তারিত দেখুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
