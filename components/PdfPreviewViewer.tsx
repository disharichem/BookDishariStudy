'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  CheckCircle,
  FileText,
  ShoppingCart,
  Maximize2
} from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdfjs worker via CDN matching the installed react-pdf pdfjs version
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfPreviewViewerProps {
  pdfUrl: string;
  bookTitle?: string;
  totalPagesInProduct?: number;
  onDirectOrder?: () => void;
  onAddToCart?: () => void;
}

export const PdfPreviewViewer: React.FC<PdfPreviewViewerProps> = ({
  pdfUrl,
  bookTitle,
  totalPagesInProduct = 96,
  onDirectOrder,
  onAddToCart,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(560);
  const containerRef = useRef<HTMLDivElement>(null);

  // Maximum allowed preview pages according to student preview requirements
  const MAX_PREVIEW_PAGES = 3;

  // Measure container width for responsive PDF rendering
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const measured = containerRef.current.clientWidth;
        // Keep some padding
        setContainerWidth(Math.max(280, Math.min(measured - 32, 640)));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setLoadError(null);
    setPageNumber(1);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('Failed to load PDF preview:', err);
    setLoading(false);
    setLoadError(err.message || 'পিডিএফ ফাইলটি লোড করতে সমস্যা হয়েছে।');
  };

  const handleNextPage = () => {
    if (pageNumber < MAX_PREVIEW_PAGES && (!numPages || pageNumber < numPages)) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.15, 1.6));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.15, 0.7));
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
      
      {/* Top PDF Preview Tool & Navigation Bar */}
      <div className="bg-slate-900 text-white px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800">
        
        {/* Page Selector & Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="পূর্ববর্তী পাতা (পৃষ্ঠা ১)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-mono font-medium text-slate-200 tabular-nums">
              পৃষ্ঠা {pageNumber} / {MAX_PREVIEW_PAGES}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={pageNumber >= MAX_PREVIEW_PAGES}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="পরবর্তী পাতা"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick jump pills for 3 pages */}
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPageNumber(p)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  pageNumber === p
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                পৃষ্ঠা {p}
              </button>
            ))}
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            নমুনা যাচাই (প্রথম ৩ পাতা)
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.7}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="স্বাভাবিক আকার (১০০%)"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 1.6}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80 transition-colors cursor-pointer"
            title="ঘড়ির কাঁটার দিকে ঘোরান"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Quality Verification Header Banner */}
      <div className="bg-cyan-50 border-b border-cyan-200/80 px-4 py-2 flex items-center justify-between text-xs text-cyan-950">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>
            শিক্ষার্থীদের গুণমান যাচাইয়ের সুবিধার্থে পিডিএফের প্রথম <strong>৩টি পৃষ্ঠা</strong> উন্মুক্ত করা হয়েছে।
          </span>
        </div>
        <span className="text-[11px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded border border-cyan-300 shrink-0 hidden sm:inline">
          {totalPagesInProduct ? `মোট ${totalPagesInProduct} পৃষ্ঠার বই` : 'সম্পূর্ণ সংস্করণ'}
        </span>
      </div>

      {/* Main Document Viewer Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-start min-h-[380px] bg-slate-200/80"
      >
        {loadError ? (
          <div className="bg-white rounded-xl p-6 sm:p-8 text-center max-w-md shadow-md border border-slate-300 my-auto">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 mb-1">পিডিএফ লোড করা সম্ভব হয়নি</h4>
            <p className="text-xs text-slate-600 mb-4">{loadError}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoadError(null);
                  setLoading(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-12 text-slate-600 my-12 bg-white/70 rounded-xl backdrop-blur-xs shadow-sm border border-slate-300/70">
                  <div className="w-9 h-9 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm font-semibold text-slate-800">পিডিএফ রেন্ডার হচ্ছে...</p>
                  <p className="text-xs text-slate-500 mt-1">শিক্ষার্থীদের যাচাইয়ের জন্য প্রথম ৩ পৃষ্ঠা প্রস্তুত হচ্ছে</p>
                </div>
              }
              error={
                <div className="bg-white rounded-xl p-6 text-center max-w-md shadow-sm border border-rose-200 text-rose-700">
                  <p className="text-sm font-semibold">পিডিএফ ফাইলটি পড়তে ব্যর্থ হয়েছে।</p>
                </div>
              }
              className="flex justify-center"
            >
              <div 
                className="bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden transition-transform duration-150"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  marginBottom: scale > 1 ? `${(scale - 1) * 600}px` : '16px',
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth}
                  rotate={rotation}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  loading={
                    <div 
                      className="flex items-center justify-center bg-slate-50 text-slate-500"
                      style={{ width: containerWidth, height: containerWidth * 1.3 }}
                    >
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                />
              </div>
            </Document>

            {/* End of Preview Notification on Page 3 */}
            {pageNumber === MAX_PREVIEW_PAGES && !loading && !loadError && (
              <div className="w-full max-w-xl mt-4 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-400/50 rounded-xl p-4 text-center shadow-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>নমুনা প্রিভিউ সমাপ্ত (পৃষ্ঠা ৩ / ৩)</span>
                </div>
                <p className="text-xs text-amber-800/90 max-w-md mx-auto mb-3">
                  আপনি প্রথম ৩টি নমুনা পৃষ্ঠা পরিদর্শন করেছেন। বইটির পরবর্তী সকল অধ্যায়, বোর্ড সমাধান ও সম্পূর্ণ রঙিন চার্ট পেতে এখুনি বইটি সংগ্রহ করুন।
                </p>
                {onDirectOrder && (
                  <button
                    type="button"
                    onClick={onDirectOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 transition-all shadow cursor-pointer"
                  >
                    <span>সম্পূর্ণ বই/নোটটি এখুনি কিনুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2 bg-slate-900 text-slate-300 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>react-pdf ইঞ্জিন দ্বারা সরাসরি ৩-পৃষ্ঠা যাচাই মোড সক্রিয়</span>
        </div>
        <div className="flex items-center gap-3">
          <span>পৃষ্ঠা: {pageNumber} / {MAX_PREVIEW_PAGES}</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-medium">দিশারী কেমিস্ট্রি</span>
        </div>
      </div>

    </div>
  );
};

export default PdfPreviewViewer;
