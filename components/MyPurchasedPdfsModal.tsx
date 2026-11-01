'use client';

import React, { useState, useEffect } from 'react';
import { CompletedOrder, FirestoreOrderRecord, Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';
import {
  auth,
  db,
  signInWithGoogle,
  logOut,
  onAuthUserChanged,
} from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  X,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MyPurchasedPdfsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders?: CompletedOrder[];
}

export const MyPurchasedPdfsModal: React.FC<MyPurchasedPdfsModalProps> = ({
  isOpen,
  onClose,
  recentOrders = [],
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<FirestoreOrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Manual lookup state for guest checkouts
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [manualLookupOrder, setManualLookupOrder] = useState<FirestoreOrderRecord | null>(null);
  const [manualSearchDone, setManualSearchDone] = useState(false);
  const [manualSearching, setManualSearching] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthUserChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // 2. Fetch authenticated customer's orders from Firestore
  useEffect(() => {
    let isCancelled = false;
    if (!isOpen || !currentUser) {
      return;
    }

    const loadOrders = async () => {
      setLoadingOrders(true);
      setDownloadError(null);
      try {
        const ordersCol = collection(db, 'orders');
        
        // Query 1: by customerId (Firebase UID)
        const qById = query(ordersCol, where('customerId', '==', currentUser.uid));
        const snapById = await getDocs(qById);

        const map = new Map<string, FirestoreOrderRecord>();
        snapById.forEach((d) => {
          const data = d.data() as FirestoreOrderRecord;
          if (data.items.some((i) => i.format === 'pdf' || i.format === 'combo')) {
            map.set(data.orderId, data);
          }
        });

        // Query 2: by customerEmail if available
        if (currentUser.email) {
          try {
            const qByEmail = query(ordersCol, where('customerEmail', '==', currentUser.email));
            const snapByEmail = await getDocs(qByEmail);
            snapByEmail.forEach((d) => {
              const data = d.data() as FirestoreOrderRecord;
              if (data.items.some((i) => i.format === 'pdf' || i.format === 'combo')) {
                map.set(data.orderId, data);
              }
            });
          } catch {
            // If index or security rule restricts, rely on qById
          }
        }

        // Also integrate any recent session PDF orders matching user email/phone
        recentOrders.forEach((ro) => {
          if (ro.orderType !== 'printed' && !map.has(ro.orderId)) {
            // convert completed order format to firestore record format for display
            map.set(ro.orderId, {
              orderId: ro.orderId,
              customerId: ro.customerId || currentUser.uid,
              customerName: ro.pdfDetails?.customerName || ro.printedDetails?.customerName || 'গ্রাহক',
              customerPhone: ro.pdfDetails?.whatsappPhone || ro.printedDetails?.phone || '',
              customerEmail: ro.pdfDetails?.email || currentUser.email || '',
              orderType: ro.orderType,
              items: ro.items.map((it) => ({
                productId: it.product.id,
                titleBn: it.product.titleBn,
                format: it.product.format,
                unitPrice: it.product.price,
                quantity: it.quantity,
                totalPrice: it.product.price * it.quantity,
                sku: it.product.sku,
              })),
              subtotal: ro.subtotal,
              deliveryFee: ro.deliveryFee,
              total: ro.total,
              paymentMethod: (ro.pdfDetails?.paymentMethod || 'bkash') as any,
              paymentStatus: ro.paymentStatus || 'pending_verification',
              orderStatus: ro.status as any,
              downloadPermission: ro.downloadPermission || false,
              downloadCount: ro.downloadCount || 0,
              downloadLimit: ro.downloadLimit || 5,
              downloadHistory: ro.downloadHistory || [],
              transactionId: ro.pdfDetails?.transactionId || '',
              senderPhone: ro.pdfDetails?.senderPhone || '',
              isDemoSimulation: false,
              createdAt: ro.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        });

        if (!isCancelled) {
          const fetchedList = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setUserOrders(fetchedList);
        }
      } catch (err: any) {
        console.warn('Notice: Could not load user orders:', err.message);
      } finally {
        if (!isCancelled) {
          setLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, currentUser, recentOrders, refreshTrigger]);

  if (!isOpen) return null;

  // Manual search handler for guest buyers
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;

    setManualSearching(true);
    setManualSearchDone(true);
    setManualLookupOrder(null);
    setDownloadError(null);

    const normOrderId = searchOrderId.trim().toUpperCase().startsWith('DC-')
      ? searchOrderId.trim().toUpperCase()
      : `DC-${searchOrderId.trim().toUpperCase()}`;

    try {
      const docSnap = await getDoc(doc(db, 'orders', normOrderId));
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreOrderRecord;
        if (data.items.some((i) => i.format === 'pdf' || i.format === 'combo')) {
          setManualLookupOrder(data);
        } else {
          setDownloadError('এই অর্ডারটিতে কোনো ডিজিটাল পিডিএফ নোট অন্তর্ভুক্ত নেই। এটি কেবল মুদ্রিত বইয়ের অর্ডার।');
        }
      } else {
        // Look into recent orders
        const local = recentOrders.find(
          (r) => r.orderId.toUpperCase() === normOrderId.toUpperCase()
        );
        if (local && local.orderType !== 'printed') {
          setManualLookupOrder({
            orderId: local.orderId,
            customerId: local.customerId || '',
            customerName: local.pdfDetails?.customerName || 'গ্রাহক',
            customerPhone: local.pdfDetails?.whatsappPhone || '',
            customerEmail: local.pdfDetails?.email || '',
            orderType: local.orderType,
            items: local.items.map((it) => ({
              productId: it.product.id,
              titleBn: it.product.titleBn,
              format: it.product.format,
              unitPrice: it.product.price,
              quantity: it.quantity,
              totalPrice: it.product.price * it.quantity,
              sku: it.product.sku,
            })),
            subtotal: local.subtotal,
            deliveryFee: local.deliveryFee,
            total: local.total,
            paymentMethod: (local.pdfDetails?.paymentMethod || 'bkash') as any,
            paymentStatus: local.paymentStatus || 'pending_verification',
            orderStatus: local.status as any,
            downloadPermission: local.downloadPermission || false,
            downloadCount: local.downloadCount || 0,
            downloadLimit: local.downloadLimit || 5,
            downloadHistory: local.downloadHistory || [],
            transactionId: local.pdfDetails?.transactionId || '',
            senderPhone: local.pdfDetails?.senderPhone || '',
            isDemoSimulation: false,
            createdAt: local.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setDownloadError('প্রদত্ত অর্ডার কোড অনুযায়ী কোনো রেকর্ড পাওয়া যায়নি। সঠিক কোড লিখুন।');
        }
      }
    } catch (err: any) {
      console.error('Manual search error:', err);
      setDownloadError('অর্ডার অনুসন্ধান করার সময় সমস্যা হয়েছে।');
    } finally {
      setManualSearching(false);
    }
  };

  // Secure download trigger via /api/pdf/download
  const handleDownloadPdf = async (order: FirestoreOrderRecord, productId: string, titleBn: string) => {
    setDownloadingId(`${order.orderId}_${productId}`);
    setDownloadError(null);

    try {
      const url = new URL('/api/pdf/download', window.location.origin);
      url.searchParams.set('orderId', order.orderId);
      url.searchParams.set('productId', productId);
      if (currentUser?.uid) {
        url.searchParams.set('customerId', currentUser.uid);
      }
      if (order.customerEmail) {
        url.searchParams.set('customerEmail', order.customerEmail);
      }

      const headers: Record<string, string> = {};
      if (order.customerPhone) {
        headers['x-customer-phone'] = order.customerPhone;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'পিডিএফ ফাইল ডাউনলোড করা সম্ভব হয়নি।');
      }

      // Stream the binary PDF as a file download in the browser
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanName = titleBn.replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_');
      a.download = `Dishari_Chemistry_${cleanName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      // Refresh order list to update download count and history in UI
      setUserOrders((prev) =>
        prev.map((o) =>
          o.orderId === order.orderId
            ? {
                ...o,
                downloadCount: (o.downloadCount || 0) + 1,
                downloadHistory: [
                  ...(o.downloadHistory || []),
                  {
                    downloadedAt: new Date().toISOString(),
                    itemTitle: titleBn,
                    productId,
                  },
                ],
              }
            : o
        )
      );
      setRefreshTrigger((prev) => prev + 1);

      if (manualLookupOrder) {
        setManualLookupOrder((prev) =>
          prev
            ? {
                ...prev,
                downloadCount: (prev.downloadCount || 0) + 1,
                downloadHistory: [
                  ...(prev.downloadHistory || []),
                  {
                    downloadedAt: new Date().toISOString(),
                    itemTitle: titleBn,
                    productId,
                  },
                ],
              }
            : null
        );
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'ডাউনলোড ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setDownloadingId(null);
    }
  };

  const displayedOrders = currentUser
    ? userOrders
    : manualLookupOrder
    ? [manualLookupOrder]
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">আমার কেনা ডিজিটাল PDF</h3>
              <p className="text-xs text-slate-400">
                যাচাইকৃত অর্ডারের সুরক্ষিত ও লাইসেন্সপ্রাপ্ত পিডিএফ ফাইল ডাউনলোড করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Ribbon */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">{currentUser.displayName || currentUser.email}</span>
              <span className="text-slate-400">হিসেবে সাইন-ইন আছেন</span>
            </div>
          ) : (
            <div className="text-slate-600 flex items-center gap-1.5">
              <span>গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করলে আপনার সকল কেনা বই সংরক্ষিত থাকবে:</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => logOut()}
                className="px-2.5 py-1 rounded-md text-slate-600 hover:text-rose-600 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
              >
                লগআউট
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (e) {
                    console.error('Sign-in error:', e);
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google দিয়ে সাইন ইন</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {downloadError && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Guest Search Bar (If not signed in or wants to find a specific order) */}
          {!currentUser && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Search className="w-4 h-4 text-cyan-600" />
                <span>অর্ডার কোড দিয়ে পিডিএফ খুঁজুন</span>
              </div>
              <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="যেমন: DC-2026-1234"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-600 uppercase"
                />
                <button
                  type="submit"
                  disabled={manualSearching}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {manualSearching ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>পিডিএফ দেখুন</span>
                </button>
              </form>
            </div>
          )}

          {/* Orders Section */}
          {loadingOrders ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">ফায়ারস্টোর থেকে আপনার কেনা পিডিএফ তালিকা লোড হচ্ছে...</p>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {currentUser
                  ? 'আপনার কোনো অনুমোদিত পিডিএফ অর্ডার পাওয়া যায়নি'
                  : 'এখনও কোনো পিডিএফ দেখাচ্ছে না'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {currentUser
                  ? 'আপনি যদি সম্প্রতি কোনো পিডিএফ নোটের অর্ডার দিয়ে থাকেন, তবে অ্যাডমিন প্যানেলে পেমেন্ট ট্রানজেকশন আইডি যাচাই সম্পন্ন হলে তা স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।'
                  : 'আপনি যদি গুগল অ্যাকাউন্ট ছাড়াই অর্ডার করে থাকেন, তবে উপরে আপনার অর্ডার কোড দিয়ে সার্চ করুন অথবা গুগল দিয়ে সাইন-ইন করুন।'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  পাওয়া গেছে {displayedOrders.length} টি ডিজিটাল অর্ডার
                </span>
                {currentUser && (
                  <button
                    onClick={() => setRefreshTrigger((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-700 hover:text-cyan-900 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>রিফ্রেশ</span>
                  </button>
                )}
              </div>

              {displayedOrders.map((order) => {
                const pdfItems = order.items.filter(
                  (i) => i.format === 'pdf' || i.format === 'combo'
                );
                const isVerified = order.paymentStatus === 'verified';
                const isPending = order.paymentStatus === 'pending_verification';
                const isFailed = order.paymentStatus === 'failed';
                const canDownload = isVerified && order.downloadPermission;
                const isHistoryExpanded = expandedHistoryId === order.orderId;

                const downloadCount = order.downloadCount || 0;
                const downloadLimit = order.downloadLimit || 5;
                const downloadsLeft = Math.max(0, downloadLimit - downloadCount);

                return (
                  <div
                    key={order.orderId}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    {/* Order Top Summary */}
                    <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {order.orderId}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (
                            {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            )
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          পেমেন্ট মেথড: <strong className="uppercase">{order.paymentMethod}</strong>
                          {order.transactionId && (
                            <span className="ml-1 font-mono text-[10px] text-slate-500">
                              (Txn: {order.transactionId})
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Payment Verification Status Badge */}
                      <div>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>পেমেন্ট যাচাইকৃত ও অনুমোদিত</span>
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            <span>পেমেন্ট যাচাই ব্যর্থ / বাতিল</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>পেমেন্ট ভেরিফিকেশন অপেক্ষমাণ</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pending Notice Box */}
                    {isPending && (
                      <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          <span>ম্যানুয়াল ভেরিফিকেশন চলছে</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          আপনার জমাকৃত ট্রানজেকশন আইডি ({order.transactionId || 'তথ্য অপেক্ষমাণ'}) আমাদের অ্যাডমিন প্যানেলে পর্যালোচনা করা হচ্ছে। অ্যাডমিন পেমেন্ট নিশ্চিত করার সাথে সাথেই ডাউনলোড বাটন সক্রিয় হবে।
                        </p>
                      </div>
                    )}

                    {/* Purchased Items in this Order */}
                    <div className="p-4 space-y-3 divide-y divide-slate-100">
                      {pdfItems.map((item) => {
                        const isDownloading = downloadingId === `${order.orderId}_${item.productId}`;
                        const productInfo = INITIAL_PRODUCTS.find((p) => p.id === item.productId);

                        return (
                          <div
                            key={item.productId}
                            className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-cyan-100 text-cyan-800">
                                  {item.format === 'combo' ? 'কম্বো (PDF সহ)' : 'ডিজিটাল PDF'}
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                  SKU: {item.sku || 'DC-PDF'}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-slate-800">
                                {item.titleBn}
                              </h5>
                              <p className="text-[11px] text-slate-500">
                                পরিমাণ: {item.quantity} টি · পরিশোধিত: ৳{item.totalPrice}
                              </p>
                            </div>

                            {/* Download Action */}
                            <div className="flex flex-col items-end gap-1 shrink-0 w-full sm:w-auto">
                              {canDownload ? (
                                <button
                                  type="button"
                                  disabled={isDownloading || downloadsLeft <= 0}
                                  onClick={() => handleDownloadPdf(order, item.productId, item.titleBn)}
                                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-xs cursor-pointer ${
                                    downloadsLeft <= 0
                                      ? 'bg-slate-400 cursor-not-allowed'
                                      : 'bg-cyan-700 hover:bg-cyan-800 active:scale-[0.99]'
                                  }`}
                                >
                                  {isDownloading ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>প্রস্তুত হচ্ছে...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-3.5 h-3.5" />
                                      <span>সুরক্ষিত PDF ডাউনলোড</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                                >
                                  {isFailed ? 'ডাউনলোড অনুপলব্ধ' : 'ভেরিফিকেশনের পর সক্রিয় হবে'}
                                </button>
                              )}

                              {isVerified && (
                                <span className="text-[10px] text-slate-500">
                                  ডাউনলোড বাকি: <strong>{downloadsLeft}</strong> / {downloadLimit} বার
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Download History Footer */}
                    {order.downloadHistory && order.downloadHistory.length > 0 && (
                      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedHistoryId(isHistoryExpanded ? null : order.orderId)
                          }
                          className="flex items-center justify-between w-full text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <span className="text-[11px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-700" />
                            ডাউনলোড হিস্টোরি ({order.downloadHistory.length} বার ডাউনলোড হয়েছে)
                          </span>
                          {isHistoryExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isHistoryExpanded && (
                          <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                            {order.downloadHistory.map((hist, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
                              >
                                <span>
                                  {new Date(hist.downloadedAt).toLocaleString('bn-BD', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  আইপি: {hist.ip || 'রেকর্ডকৃত'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span>সকল পিডিএফ ফাইল ডিজিটাল ওয়াটারমার্ক ও কপিরাইট দ্বারা সুরক্ষিত।</span>
          </div>
          <span>সহায়তা সেল: disharichem@gmail.com</span>
        </div>
      </div>
    </div>
  );
};
