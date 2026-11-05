'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Product, SamplePage } from '@/types';
import { 
  X, 
  BookOpen, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  CheckCircle2, 
  FileText,
  BookmarkCheck,
  HardDriveDownload,
  WifiOff,
  Check,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { addRecentlyViewed } from '@/lib/recentlyViewed';

// Dynamically load PdfPreviewViewer with ssr: false to prevent Next.js server-side canvas/DOMMatrix issues
const PdfPreviewViewer = dynamic(() => import('./PdfPreviewViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 text-slate-600 bg-slate-100 rounded-xl min-h-[420px]">
      <div className="w-9 h-9 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-semibold text-slate-800">পিডিএফ প্রিভিউ ইঞ্জিন সক্রিয় হচ্ছে...</p>
      <p className="text-xs text-slate-500 mt-1">প্রথম ৩টি পৃষ্ঠা লোড করা হচ্ছে</p>
    </div>
  ),
});

interface SampleReaderModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewFullDetails?: (product: Product) => void;
}

const OFFLINE_SAMPLE_CACHE_KEY = 'dishari_offline_samples_cache_v1';

export const SampleReaderModal: React.FC<SampleReaderModalProps> = ({
  product,
  onClose,
  onDirectOrder,
  onAddToCart,
  onViewFullDetails,
}) => {
  // Mode: 'pdf' for live 3-page react-pdf preview, 'text' for structured chapter sample notes
  const isInitialPdf = product?.format === 'pdf';
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>(isInitialPdf ? 'pdf' : 'pdf');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [cachedSamplePages, setCachedSamplePages] = useState<SamplePage[] | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Synchronize state when product changes without cascading renders
  const [prevProductId, setPrevProductId] = useState<string | null>(product?.id || null);
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setViewMode('pdf');
    setCurrentPageIndex(0);
  }

  // Monitor online/offline status and hydrate local cache safely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNetworkChange = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Asynchronous load to ensure SSR / hydration parity
    const timer = setTimeout(() => {
      setIsOffline(!navigator.onLine);

      if (product) {
        addRecentlyViewed(product.id);
        try {
          const raw = localStorage.getItem(OFFLINE_SAMPLE_CACHE_KEY);
          if (raw) {
            const cache = JSON.parse(raw);
            const cachedItem = cache[product.id];
            if (cachedItem) {
              setIsSavedOffline(true);
              setCachedAt(cachedItem.savedAt || null);
              if (cachedItem.samplePages && cachedItem.samplePages.length > 0) {
                setCachedSamplePages(cachedItem.samplePages);
              }
            } else {
              setIsSavedOffline(false);
              setCachedAt(null);
              setCachedSamplePages(null);
            }
          }
        } catch (e) {
          console.warn('Failed to load offline sample cache:', e);
        }
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [product]);

  if (!product) return null;

  const isPdf = product.format === 'pdf';
  const isCombo = product.format === 'combo';

  // Construct PDF URL for preview: uses explicit samplePdfUrl or the dedicated sample PDF generation route
  const previewPdfUrl = 
    product.samplePdfUrl ||
    `/api/pdf/sample?id=${encodeURIComponent(product.id)}&title=${encodeURIComponent(product.titleBn)}&sku=${encodeURIComponent(product.sku || '')}`;

  // Fallback to offline cached sample pages if product.samplePages is empty or offline
  const samples: SamplePage[] = 
    (product.samplePages && product.samplePages.length > 0)
      ? product.samplePages
      : (cachedSamplePages && cachedSamplePages.length > 0)
      ? cachedSamplePages
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

  // Toggle Save for Offline caching in local state and localStorage
  const handleToggleSaveOffline = () => {
    if (!product) return;
    try {
      const raw = localStorage.getItem(OFFLINE_SAMPLE_CACHE_KEY);
      const cache = raw ? JSON.parse(raw) : {};

      if (isSavedOffline) {
        delete cache[product.id];
        localStorage.setItem(OFFLINE_SAMPLE_CACHE_KEY, JSON.stringify(cache));
        setIsSavedOffline(false);
        setCachedAt(null);
        setFeedbackMessage('অফলাইন ক্যাশ থেকে নমুনাটি সরানো হয়েছে।');
      } else {
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('bn-BD', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const pagesToCache = (product.samplePages && product.samplePages.length > 0)
          ? product.samplePages
          : samples;

        cache[product.id] = {
          productId: product.id,
          titleBn: product.titleBn,
          format: product.format,
          samplePages: pagesToCache,
          savedAt: dateFormatted,
          timestamp: Date.now(),
        };

        localStorage.setItem(OFFLINE_SAMPLE_CACHE_KEY, JSON.stringify(cache));
        setIsSavedOffline(true);
        setCachedAt(dateFormatted);
        setCachedSamplePages(pagesToCache);
        setFeedbackMessage('নমুনাটি অফলাইনে সেভ করা হয়েছে! ইন্টারনেট ছাড়াও এটি পড়তে পারবেন।');
      }

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3500);
    } catch (err) {
      console.warn('Error updating offline sample cache:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg shrink-0">
              {isPdf ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  {isPdf ? 'ডিজিটাল PDF সংস্করণ' : isCombo ? 'কম্বো প্যাকেজ' : 'মুদ্রিত বই'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">· নমুনা পাঠ ও কোয়ালিটি ভেরিফিকেশন</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg pt-0.5">
                {product.titleBn}
              </h2>
            </div>
          </div>

          {/* Right Header Action: Offline Save Button & Close */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleToggleSaveOffline}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                isSavedOffline
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/35 hover:text-white'
                  : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/35 hover:text-white'
              }`}
              title={isSavedOffline ? 'অফলাইন ক্যাশ থেকে নমুনা মুছতে ক্লিক করুন' : 'ইন্টারনেট ছাড়াই পড়তে নমুনাটি সেভ করুন'}
            >
              {isSavedOffline ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden xs:inline">অফলাইনে সংরক্ষিত</span>
                  <span className="xs:hidden">সংরক্ষিত</span>
                </>
              ) : (
                <>
                  <HardDriveDownload className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="hidden xs:inline">অফলাইনে সেভ</span>
                  <span className="xs:hidden">অফলাইন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="পপআপ বন্ধ করুন"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher: Live react-pdf (3 Pages) vs Structured Text Sample */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'pdf'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>পিডিএফ প্রিভিউ (প্রথম ৩ পাতা)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                viewMode === 'pdf' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-cyan-300'
              }`}>
                react-pdf
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'text'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>নমুনা পাঠ (টেক্সট ও সূত্র)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">কেনার আগে বিষয়বস্তুর গুণমান সরাসরি যাচাই করুন</span>
            <span className="sm:hidden">গুণমান যাচাই মোড</span>
          </div>
        </div>

        {/* Offline Connection Alert Banner */}
        {isOffline && (
          <div className="bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>আপনি বর্তমানে অফলাইনে আছেন — সংরক্ষিত স্থানীয় ক্যাশ থেকে নমুনা পাঠ প্রদর্শন করা হচ্ছে।</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded font-bold text-amber-300 shrink-0">
              অফলাইন মোড
            </span>
          </div>
        )}

        {/* Action Feedback Toast */}
        {feedbackMessage && (
          <div className="bg-emerald-700 text-white text-xs px-4 py-2.5 flex items-center justify-between animate-in slide-in-from-top-1 duration-200 shadow-inner">
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-100 hover:text-white p-0.5 cursor-pointer ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Area: Switched between Live PDF (react-pdf) and Structured Text Samples */}
        {viewMode === 'pdf' ? (
          <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-slate-900">
            <PdfPreviewViewer
              pdfUrl={previewPdfUrl}
              bookTitle={product.titleBn}
              totalPagesInProduct={product.pages}
              onDirectOrder={() => {
                onClose();
                onDirectOrder(product);
              }}
              onAddToCart={() => onAddToCart(product)}
            />
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Page Switcher Navigation Bar for Text mode */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
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

                {isSavedOffline && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>অফলাইন ক্যাশে প্রস্তুত</span>
                    {cachedAt && <span className="text-slate-400 text-[10px]">({cachedAt})</span>}
                  </span>
                )}
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

            {/* Reader Canvas / Document View for Text mode */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-8 space-y-6 min-h-[380px] relative">
                
                {/* Watermark / Header of the Book Page */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
                  <span className="font-semibold text-cyan-800">দিশারী কেমিস্ট্রি প্রকাশনা</span>
                  <div className="flex items-center gap-2">
                    {isSavedOffline && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        অফলাইন প্রস্তুত
                      </span>
                    )}
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                      পৃষ্ঠা নং: {currentSample.pageNumber || currentPageIndex + 1}
                    </span>
                  </div>
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
                  <button
                    type="button"
                    onClick={() => setViewMode('pdf')}
                    className="text-cyan-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>সরাসরি ৩-পৃষ্ঠার পিডিএফ দেখুন</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

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
              <span>এখুনি কিনুন</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SampleReaderModal;
