'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
  const handleWhatsAppClick = () => {
    // Demo WhatsApp trigger or mock call
    window.open('https://api.whatsapp.com/send?phone=8801700000000&text=Assalamu%20Alaikum,%20Dishari%20Chemistry%20book%20inquiry', '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      <button
        onClick={handleWhatsAppClick}
        aria-label="হোয়াটসঅ্যাপে মেসেজ পাঠান"
        className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline-block text-xs font-semibold pr-1.5 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          হোয়াটসঅ্যাপে প্রশ্ন করুন
        </span>
      </button>
    </div>
  );
};
