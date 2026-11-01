'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhoneOrEmail('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="contact" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-800">
            <span>সহায়তা সেল</span>
            <span aria-hidden="true">·</span>
            <span>সরাসরি যোগাযোগ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            যোগাযোগ ও কাস্টমার সাপোর্ট
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            বই বা পিডিএফ সংক্রান্ত যেকোনো তথ্যে আমাদের প্রতিনিধিকে সরাসরি মেসেজ দিন বা কল করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone & WhatsApp */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">হটলাইন ও হোয়াটসঅ্যাপ</h3>
                <p className="text-sm font-semibold text-slate-800 font-mono">+৮৮০ ১৭০০-০০০০০০</p>
                <p className="text-[11px] text-slate-500">প্রতিদিন সকাল ৯টা থেকে রাত ১০টা পর্যন্ত সক্রিয়</p>
              </div>
            </div>

            {/* Official Email */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">অফিসিয়াল ইমেইল</h3>
                <p className="text-sm font-semibold text-slate-800 font-mono">disharichem@gmail.com</p>
                <p className="text-[11px] text-slate-500">যেকোনো প্রাতিষ্ঠানিক বা বাল্ক অর্ডারের জন্য</p>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">প্রকাশনা ও প্রধান বিতরণ কেন্দ্র</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  দিশারী কেমিস্ট্রি সেলস সেন্টার, ইসলামিয়া মার্কেট, বাংলাবাজার / নীলক্ষেত, ঢাকা - ১১০০
                </p>
              </div>
            </div>

            {/* Response Time Guarantee */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>
                হোয়াটসঅ্যাপ বা ইমেইলে মেসেজ পাঠানোর সর্বোচ্চ ৩০ মিনিটের মধ্যে উত্তর প্রদান করা হয়।
              </span>
            </div>

          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              আমাদের একটি বার্তা পাঠান
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              কোনো অধ্যায় বা বই সম্পর্কে কোনো প্রশ্ন থাকলে নিচের ফর্মটি পূরণ করুন:
            </p>

            {submitted ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!
                </h4>
                <p className="text-xs text-emerald-800">
                  আমাদের একাডেমি টিম দ্রুত আপনার সাথে যোগাযোগ করবে। ধন্যবাদ!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: সাকিব হাসান"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      মোবাইল বা ইমেইল *
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      placeholder="01XXXXXXXXX বা email"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    আপনার জিজ্ঞাসা বা বার্তা *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="এসএসসি রসায়ন বই বা হ্যান্ডনোট সংক্রান্ত আপনার প্রশ্ন এখানে লিখুন..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>বার্তা পাঠিয়ে দিন</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
