'use client';

import React, { useState } from 'react';
import { CartItem, CompletedOrder } from '@/types';
import { DISTRICTS_OF_BANGLADESH } from '@/data/products';
import { auth } from '@/lib/firebase';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  Download, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  Smartphone,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: CompletedOrder) => void;
  singleProductMode?: boolean;
  onOpenMyPdfs?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  onOpenMyPdfs,
}) => {
  // Determine order categories
  const hasPrinted = items.some(
    (item) => item.product.format === 'printed' || item.product.format === 'combo'
  );
  const hasPdf = items.some(
    (item) => item.product.format === 'pdf' || item.product.format === 'combo'
  );

  // Form states - Printed
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা (Dhaka)');
  const [fullAddress, setFullAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>(
    hasPrinted ? 'cod' : 'bkash'
  );

  // Form states - PDF
  const [pdfEmail, setPdfEmail] = useState('');
  const [pdfWhatsapp, setPdfWhatsapp] = useState('');
  const [pdfTxnId, setPdfTxnId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Delivery fee calculation
  const deliveryFee = hasPrinted ? (deliveryZone === 'inside_dhaka' ? 60 : 120) : 0;
  const total = subtotal + deliveryFee;

  const handleCopyMockBkash = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (hasPrinted && !fullAddress.trim()) {
      setErrorMessage('মুদ্রিত বইয়ের ডেলিভারির জন্য বিস্তারিত ঠিকানা প্রদান করুন।');
      return;
    }

    if (hasPdf && (!pdfEmail.trim() || !pdfEmail.includes('@'))) {
      setErrorMessage('পিডিএফ পাওয়ার জন্য একটি সচল ইমেইল অ্যাড্রেস লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: auth.currentUser?.uid || undefined,
          items: items.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
          })),
          customerName,
          customerPhone: phone,
          customerEmail: pdfEmail || undefined,
          deliveryZone: hasPrinted ? deliveryZone : undefined,
          district: hasPrinted ? district : undefined,
          fullAddress: hasPrinted ? fullAddress : undefined,
          paymentMethod: hasPrinted && paymentMethod === 'cod' ? 'cod' : paymentMethod,
          transactionId: pdfTxnId || undefined,
          senderPhone: phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'অর্ডার সংরক্ষণ করা সম্ভব হয়নি।');
      }

      const orderData = data.order;
      const newOrder: CompletedOrder = {
        orderId: orderData.orderId,
        date: new Date(orderData.createdAt).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        items: [...items],
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,
        orderType: orderData.orderType,
        printedDetails: hasPrinted
          ? {
              customerName,
              phone,
              district,
              fullAddress,
              deliveryZone,
              deliveryFee: orderData.deliveryFee,
              courierPreference: 'কুরিয়ার সার্ভিস [নমুনা]',
              paymentMethod,
            }
          : undefined,
        pdfDetails: hasPdf
          ? {
              customerName,
              email: pdfEmail,
              whatsappPhone: pdfWhatsapp || phone,
              paymentMethod: (paymentMethod === 'cod' ? 'bkash' : paymentMethod) as 'bkash' | 'nagad',
              transactionId: pdfTxnId || 'DEMO-TXN-882194',
              senderPhone: phone,
            }
          : undefined,
        status: orderData.orderStatus,
        paymentStatus: orderData.paymentStatus,
        isDemoSimulation: false,
        dbPersisted: true,
        createdAt: orderData.createdAt,
      };

      setCompletedOrder(newOrder);
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {completedOrder ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'অর্ডার ও ডেলিভারি তথ্য'}
            </h3>
            <p className="text-xs text-slate-500">
              {completedOrder ? 'আপনার অর্ডার নিশ্চিতকরণ রসিদ' : 'নিচের সাধারণ ফরমটি পূরণ করুন'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          
          {completedOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center">
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-800 tracking-wider uppercase">
                  অর্ডার কোড: {completedOrder.orderId}
                </span>
                <h4 className="text-xl font-bold text-slate-900">
                  ধন্যবাদ, {completedOrder.printedDetails?.customerName || completedOrder.pdfDetails?.customerName}!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  আপনার অর্ডারটি ক্লাউড ফায়ারস্টোর (Cloud Firestore) ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয়েছে।
                </p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ফায়ারস্টোর ডাটাবেজ পারসিস্টেন্স সফল!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    অর্ডার আইডি: <strong className="font-mono">{completedOrder.orderId}</strong>। পেমেন্ট স্ট্যাটাস: <strong>ম্যানুয়াল ভেরিফিকেশন অপেক্ষমাণ (Pending Verification)</strong>। অ্যাডমিন প্যানেল থেকে ট্রানজেকশন আইডি যাচাই করে স্ট্যাটাস আপডেট করা যাবে।
                  </p>
                </div>
              </div>

              {/* PDF Secure Digital License Info */}
              {hasPdf && (
                <div className="p-4 rounded-xl bg-cyan-50/80 border border-cyan-200 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-900 font-bold text-sm">
                      <Download className="w-4 h-4 text-cyan-700" />
                      <span>ডিজিটাল পিডিএফ ডেলিভারি ও লাইসেন্স</span>
                    </div>
                    <span className="text-[11px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-medium">
                      ম্যানুয়াল যাচাই অপেক্ষমাণ
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    আপনার ডিজিটাল পিডিএফ অর্ডারের পেমেন্ট ট্রানজেকশন আইডি ({completedOrder.pdfDetails?.transactionId || pdfTxnId || 'প্রদান করা হয়েছে'}) ডাটাবেজে রেকর্ড করা হয়েছে। অ্যাডমিন ম্যানুয়ালি বিকাশ/নগদ পেমেন্ট নিশ্চিত করার সাথে সাথে আপনার ডাউনলোড পারমিশন সক্রিয় হয়ে যাবে।
                  </p>

                  <div className="pt-1 flex flex-wrap gap-2">
                    {onOpenMyPdfs && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenMyPdfs();
                        }}
                        className="inline-flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold text-white bg-cyan-800 hover:bg-cyan-900 transition-colors shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>আমার কেনা PDF সেকশনে যান</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Printed Book Status Timeline if applicable */}
              {hasPrinted && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Truck className="w-4 h-4 text-slate-700" />
                    <span>মুদ্রিত বইয়ের ডেলিভারি স্ট্যাটাস</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center pt-2">
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">✓</div>
                      <span className="text-[10px] font-semibold text-slate-800 block">অর্ডার গ্রহণ</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center mx-auto text-xs font-bold">২</div>
                      <span className="text-[10px] font-semibold text-slate-800 block">প্যাকিং</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-xs font-bold">৩</div>
                      <span className="text-[10px] text-slate-500 block">কুরিয়ার</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-xs font-bold">৪</div>
                      <span className="text-[10px] text-slate-500 block">ডেলিভারি</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                    <p>
                      <strong>ডেলিভারি ঠিকানা:</strong> {completedOrder.printedDetails?.fullAddress},{' '}
                      {completedOrder.printedDetails?.district}
                    </p>
                    <p className="pt-1">
                      <strong>প্রদেয় মোট মূল্য:</strong> ৳{completedOrder.total} ({completedOrder.printedDetails?.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ'})
                    </p>
                  </div>
                </div>
              )}

              {/* Close / Done */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  ঠিক আছে, হোমপেজে ফিরে যান
                </button>
              </div>

            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sample Disclaimer Banner */}
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>নমুনা ডেমো সাইট:</strong> এটি দিশারী কেমিস্ট্রির কার্যপদ্ধতি প্রদর্শনের জন্য
                  একটি স্যাম্পল অর্ডার ফর্ম। কোনো আসল ব্যাংক অ্যাকাউন্ট বা ক্রেডিট কার্ডের তথ্য লাগবে না।
                </div>
              </div>

              {/* Order Items Snapshot */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>অর্ডারের সারসংক্ষেপ ({items.length}টি আইটেম):</span>
                  <span className="tabular-nums">মোট: ৳{total}</span>
                </div>
                <div className="text-xs text-slate-600 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.product.id} className="py-1.5 flex justify-between">
                      <span className="line-clamp-1">{item.product.titleBn} × {item.quantity}</span>
                      <span className="tabular-nums font-semibold text-slate-900 shrink-0 ml-2">
                        ৳{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  {hasPrinted && (
                    <div className="py-1.5 flex justify-between text-slate-500">
                      <span>কুরিয়ার চার্জ ({deliveryZone === 'inside_dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'}):</span>
                      <span className="tabular-nums font-medium text-slate-800">৳{deliveryFee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* General Contact Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ১. গ্রাহকের সাধারণ তথ্য
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      শিক্ষার্থী / অভিভাবকের পুরো নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      মোবাইল নম্বর (যোগাযোগের জন্য) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Printed Book Delivery Information */}
              {hasPrinted && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      ২. মুদ্রিত বই ডেলিভারি ঠিকানা
                    </h4>
                  </div>

                  {/* Delivery Zone Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                        deliveryZone === 'inside_dhaka'
                          ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deliveryZone"
                          checked={deliveryZone === 'inside_dhaka'}
                          onChange={() => setDeliveryZone('inside_dhaka')}
                          className="accent-slate-900"
                        />
                        <span>ঢাকা সিটির ভেতরে</span>
                      </div>
                      <span className="text-[11px] text-cyan-800 mt-1 font-bold">ডেলিভারি চার্জ: ৳৬০</span>
                    </label>

                    <label 
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                        deliveryZone === 'outside_dhaka'
                          ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deliveryZone"
                          checked={deliveryZone === 'outside_dhaka'}
                          onChange={() => setDeliveryZone('outside_dhaka')}
                          className="accent-slate-900"
                        />
                        <span>ঢাকা সিটির বাইরে (সারা দেশ)</span>
                      </div>
                      <span className="text-[11px] text-cyan-800 mt-1 font-bold">ডেলিভারি চার্জ: ৳১২০</span>
                    </label>
                  </div>

                  {/* District & Full Address */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        জেলা নির্বাচন করুন *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                      >
                        {DISTRICTS_OF_BANGLADESH.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        পূর্ণ ঠিকানা (থানা/উপজেলা, রোড নং, বাড়ি নং বা এলাকার নাম) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="যেমন: বাড়ি নং ১২, রোড ৩, সেক্টর ৪, উত্তরা, ঢাকা"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Specific Delivery & Verification */}
              {hasPdf && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {hasPrinted ? '৩. পিডিএফ প্রেরণের তথ্য ও পেমেন্ট ভেরিফিকেশন' : '২. পিডিএফ ডেলিভারি ও ভেরিফিকেশন'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ইমেইল এড্রেস (যেখানে ড্রাইভ লিংক যাবে) *
                      </label>
                      <input
                        type="email"
                        required
                        value={pdfEmail}
                        onChange={(e) => setPdfEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক নোটিফিকেশন)
                      </label>
                      <input
                        type="tel"
                        value={pdfWhatsapp}
                        onChange={(e) => setPdfWhatsapp(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Payment Verification Placeholder Instructions */}
                  <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-cyan-400">
                        বিকাশ / নগদ পেমেন্ট যাচাইকরণ নির্দেশিকা (নমুনা)
                      </span>
                      <span className="text-[10px] text-slate-400">ব্যক্তিগত নম্বর</span>
                    </div>

                    <p className="leading-relaxed text-slate-300">
                      পিডিএফের ক্ষেত্রে নিচের যেকোনো নম্বরে বিকাশ বা নগদ অ্যাপ থেকে <strong>Send Money</strong> করে
                      প্রাপ্ত ট্রানজেকশন আইডিটি বক্সে লিখুন:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-950 rounded flex items-center justify-between">
                        <div>
                          <span className="text-pink-400 font-bold block">বিকাশ (Send Money)</span>
                          <span className="font-mono text-white text-xs">01700-112233</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyMockBkash('01700112233')}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title="কপি করুন"
                        >
                          {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="p-2 bg-slate-950 rounded flex items-center justify-between">
                        <div>
                          <span className="text-amber-400 font-bold block">নগদ (Send Money)</span>
                          <span className="font-mono text-white text-xs">01800-445566</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyMockBkash('01800445566')}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title="কপি করুন"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-semibold text-slate-300 block">
                        ট্রানজেকশন আইডি (TxnID) লিখুন (নমুনার জন্য যেকোনো কিছু লিখতে পারেন):
                      </label>
                      <input
                        type="text"
                        value={pdfTxnId}
                        onChange={(e) => setPdfTxnId(e.target.value)}
                        placeholder="যেমন: BK92847AX"
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-cyan-300 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Option for Printed Books */}
              {hasPrinted && !hasPdf && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    ৩. মূল্য পরিশোধের পদ্ধতি
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label 
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        paymentMethod === 'cod'
                          ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-slate-900"
                      />
                      <span>ক্যাশ অন ডেলিভারি (বই পেয়ে টাকা দিন)</span>
                    </label>

                    <label 
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                        paymentMethod === 'bkash'
                          ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="accent-slate-900"
                      />
                      <span>বিকাশ / নগদ অগ্রিম (নমুনা)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>অর্ডার প্রক্রিয়াধীন রয়েছে...</span>
                  ) : (
                    <span>অর্ডার চূড়ান্ত করুন (মোট ৳{total})</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
