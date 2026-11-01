'use client';

import React, { useState } from 'react';
import { CompletedOrder, FirestoreOrderRecord } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { X, Search, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders?: CompletedOrder[];
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  recentOrders = [],
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<CompletedOrder | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setSearching(true);
    setSearched(true);
    const cleaned = searchCode.trim().toLowerCase();

    // 1. Check if it matches any recent session order
    const foundLocal = recentOrders.find(
      (o) =>
        o.orderId.toLowerCase().includes(cleaned) ||
        o.printedDetails?.phone.includes(cleaned) ||
        o.pdfDetails?.whatsappPhone.includes(cleaned)
    );

    if (foundLocal) {
      setMatchedOrder(foundLocal);
      setSearching(false);
      return;
    }

    // 2. Query Firestore directly for persistent order
    const normalizedOrderId = searchCode.trim().toUpperCase().startsWith('DC-')
      ? searchCode.trim().toUpperCase()
      : `DC-${searchCode.trim().toUpperCase()}`;

    try {
      const docSnap = await getDoc(doc(db, 'orders', normalizedOrderId));
      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as FirestoreOrderRecord;
        const mappedOrder: CompletedOrder = {
          orderId: firestoreData.orderId,
          date: new Date(firestoreData.createdAt).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          items: firestoreData.items.map((item) => {
            const p = INITIAL_PRODUCTS.find((pr) => pr.id === item.productId) || INITIAL_PRODUCTS[0];
            return {
              product: {
                ...p,
                titleBn: item.titleBn,
                price: item.unitPrice,
                format: item.format,
              },
              quantity: item.quantity,
            };
          }),
          subtotal: firestoreData.subtotal,
          deliveryFee: firestoreData.deliveryFee,
          total: firestoreData.total,
          orderType: firestoreData.orderType,
          printedDetails:
            firestoreData.orderType !== 'pdf'
              ? {
                  customerName: firestoreData.customerName,
                  phone: firestoreData.customerPhone,
                  district: firestoreData.district || 'ঢাকা',
                  fullAddress: firestoreData.deliveryAddress || '',
                  deliveryZone: (firestoreData.deliveryZone as any) || 'inside_dhaka',
                  deliveryFee: firestoreData.deliveryFee,
                  paymentMethod: firestoreData.paymentMethod,
                }
              : undefined,
          pdfDetails:
            firestoreData.orderType !== 'printed'
              ? {
                  customerName: firestoreData.customerName,
                  email: firestoreData.customerEmail || '',
                  whatsappPhone: firestoreData.senderPhone || firestoreData.customerPhone,
                  paymentMethod: firestoreData.paymentMethod as any,
                  transactionId: firestoreData.transactionId || '',
                  senderPhone: firestoreData.senderPhone || '',
                }
              : undefined,
          status: firestoreData.orderStatus as any,
          paymentStatus: firestoreData.paymentStatus,
          isDemoSimulation: false,
          dbPersisted: true,
          createdAt: firestoreData.createdAt,
        };
        setMatchedOrder(mappedOrder);
        setSearching(false);
        return;
      }
    } catch (err) {
      console.warn('Firestore tracking lookup fallback:', err);
    }
      // Create a mock trackable order for demo purposes so user can see how tracking works!
      const demoOrder: CompletedOrder = {
        orderId: searchCode.toUpperCase().startsWith('DC-') ? searchCode.toUpperCase() : `DC-${searchCode.toUpperCase()}`,
        date: '২৮ অক্টোবর ২০২৪',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 1,
          },
        ],
        subtotal: INITIAL_PRODUCTS[0].price,
        deliveryFee: 60,
        total: INITIAL_PRODUCTS[0].price + 60,
        orderType: 'printed',
        printedDetails: {
          customerName: 'শিক্ষার্থী (নমুনা ট্র্যাকিং ডেমো)',
          phone: searchCode,
          district: 'ঢাকা (Dhaka)',
          fullAddress: 'ধানমন্ডি, ঢাকা',
          deliveryZone: 'inside_dhaka',
          deliveryFee: 60,
          courierPreference: 'কুরিয়ার সার্ভিস [নমুনা]',
          paymentMethod: 'cod',
        },
        status: 'shipped',
        isDemoSimulation: true,
      };
      setMatchedOrder(demoOrder);
      setSearching(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-700" />
            <h3 className="text-base font-bold text-slate-900">
              অর্ডার লাইভ ট্র্যাকিং
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              অর্ডার কোড (যেমন: DC-2025-XXXX) অথবা আপনার মোবাইল নম্বর লিখুন:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="DC-2025-XXXX বা 017XXXXXXXX"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                খুঁজুন
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * ডেমো টেস্ট: যেকোনো কিছু লিখে খুঁজলে নমুনা ট্র্যাকিং টাইমলাইন দেখতে পারবেন।
            </p>
          </form>

          {searched && matchedOrder && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[11px] text-slate-500 block">অর্ডার আইডি</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {matchedOrder.orderId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">তারিখ</span>
                  <span className="text-slate-800 font-medium">{matchedOrder.date}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-3 py-2">
                <span className="font-bold text-slate-800 block text-xs">
                  বর্তমান অগ্রগতি:
                </span>
                
                <div className="space-y-3 pl-2 border-l-2 border-cyan-500">
                  <div className="relative pl-4">
                    <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <p className="font-semibold text-slate-900">১. অর্ডার কনফার্মড</p>
                    <p className="text-slate-500 text-[11px]">অর্ডারটি সিস্টেমে অনুমোদিত হয়েছে।</p>
                  </div>

                  <div className="relative pl-4">
                    <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <p className="font-semibold text-slate-900">২. মান নিয়ন্ত্রণ ও প্যাকেজিং সম্পন্ন</p>
                    <p className="text-slate-500 text-[11px]">বইয়ের কপি প্রুফ চেক করে ওয়াটারপ্রুফ প্যাকেজিং করা হয়েছে।</p>
                  </div>

                  <div className="relative pl-4">
                    <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-white" />
                    <p className="font-semibold text-cyan-900">৩. কুরিয়ারে হস্তান্তর করা হয়েছে (On the Way)</p>
                    <p className="text-slate-600 text-[11px]">
                      কুরিয়ার পার্টনার: সুন্দরবন কুরিয়ার / স্টেডফাস্ট। কুরিয়ার মেমো: SB-918204
                    </p>
                  </div>

                  <div className="relative pl-4 opacity-50">
                    <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white" />
                    <p className="font-semibold text-slate-700">৪. সফল ডেলিভারি</p>
                    <p className="text-slate-400 text-[11px]">গ্রাহকের ঠিকানায় পৌঁছানো হবে।</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-slate-600">
                <p>
                  <strong>প্রাপক:</strong> {matchedOrder.printedDetails?.customerName}
                </p>
                <p>
                  <strong>ঠিকানা:</strong> {matchedOrder.printedDetails?.fullAddress},{' '}
                  {matchedOrder.printedDetails?.district}
                </p>
                <p>
                  <strong>সর্বমোট বিল:</strong> ৳{matchedOrder.total}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
