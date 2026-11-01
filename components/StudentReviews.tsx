'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, BookOpen, Download, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  institution: string;
  district: string;
  bookUsed: string;
  category: 'printed' | 'pdf' | 'question_bank';
  comment: string;
  date: string;
  isPlaceholder?: boolean;
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'sample-rev-1',
    name: '[নমুনা শিক্ষার্থী]',
    institution: 'আইডিয়াল স্কুল অ্যান্ড কলেজ',
    district: 'ঢাকা',
    bookUsed: 'দিশারী এসএসসি কেমিস্ট্রি সহায়িকা (মুদ্রিত বই)',
    category: 'printed',
    comment: 'মুদ্রিত বইয়ের প্রতিটি অধ্যায়ের কনসেপ্ট ম্যাপ ও বিগত বছরের বোর্ড প্রশ্ন অনুশীলনের নিয়মগুলো খুব সহজভাবে তুলে ধরা হয়েছে।',
    date: 'নমুনা তারিখ',
    isPlaceholder: true,
  },
  {
    id: 'sample-rev-2',
    name: '[নমুনা শিক্ষার্থী]',
    institution: 'রাজউক উত্তরা মডেল কলেজ',
    district: 'ঢাকা',
    bookUsed: 'জৈব যৌগ ও বিক্রিয়া স্টাডি হ্যান্ডনোট (ডিজিটাল পিডিএফ)',
    category: 'pdf',
    comment: 'জৈব রসায়নের রঙিন বিক্রিয়া ফ্লোচার্টটি মোবাইলে পড়ার জন্য বেশ সুবিধাজনক এবং বিক্রিয়ার রূপান্তর বুঝতে সাহায্য করে।',
    date: 'নমুনা তারিখ',
    isPlaceholder: true,
  },
  {
    id: 'sample-rev-3',
    name: '[নমুনা শিক্ষার্থী]',
    institution: 'সরকারি জিলা স্কুল',
    district: 'দিনাজপুর',
    bookUsed: 'এসএসসি কেমিস্ট্রি CQ ও MCQ প্রশ্নব্যাংক',
    category: 'question_bank',
    comment: 'অধ্যায়ভিত্তিক বহুনির্বাচনি প্রশ্নের পাশাপাশি ব্যাখ্যামূলক সমাধান থাকায় পরীক্ষার প্রস্তুতি গুছিয়ে নেওয়া সহজ হয়।',
    date: 'নমুনা তারিখ',
    isPlaceholder: true,
  },
];

export const StudentReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'printed' | 'pdf' | 'question_bank'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New review form states
  const [authorName, setAuthorName] = useState('');
  const [institution, setInstitution] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [bookUsed, setBookUsed] = useState('দিশারী এসএসসি কেমিস্ট্রি সহায়িকা (মুদ্রিত বই)');
  const [comment, setComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.category === activeFilter;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      name: authorName.trim(),
      institution: institution.trim() || 'এসএসসি শিক্ষার্থী',
      district: district || 'বাংলাদেশ',
      bookUsed,
      category: bookUsed.includes('পিডিএফ') ? 'pdf' : 'printed',
      comment: comment.trim(),
      date: 'আজকে (নতুন)',
      isPlaceholder: false,
    };

    setReviews([newRev, ...reviews]);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
      setAuthorName('');
      setInstitution('');
      setComment('');
    }, 2000);
  };

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-white border-b border-slate-200 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800">
              <span>শিক্ষার্থীদের প্রতিক্রিয়া</span>
              <span aria-hidden="true">·</span>
              <span>নমুনা কাঠামো ও মতামত সংগ্রহ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              শিক্ষার্থীদের অভিজ্ঞতা ও মতামত (নমুনা প্রিভিউ)
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              পাঠকদের অভিজ্ঞতা জানার জন্য এই সেকশনটি ডিজাইন করা হয়েছে। নিচের মতামতগুলো নমুনা
              হিসেবে প্রদর্শিত এবং যেকোনো শিক্ষার্থী তার বাস্তব অভিজ্ঞতা শেয়ার করতে পারেন।
            </p>
          </div>

          {/* Action button to share feedback */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-cyan-800 hover:border-cyan-300 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto shadow-2xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-cyan-600" />
            <span>আপনার মতামত জানান</span>
          </button>
        </div>

        {/* Transparent Educational Pillars (No fake ratings or statistics) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block text-sm">সহজ বাংলা ভাষা</span>
            <span className="text-slate-500 block">মৌলিক বিষয়ের বাস্তব উদাহরণ ভিত্তিক ব্যাখ্যা</span>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 block text-sm">মুদ্রিত ও পিডিএফ</span>
            <span className="text-slate-500 block">পড়ার টেবিল ও স্মার্টফোনে পড়ার আলাদা সুবিধা</span>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-cyan-800 block text-sm">মতামত সংগ্রহ উন্মুক্ত</span>
            <span className="text-slate-500 block">শিক্ষার্থীদের ফিডব্যাকের ভিত্তিতে পরিমার্জন</span>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 block text-sm">নমুনা প্রিভিউ সাইট</span>
            <span className="text-slate-500 block">প্রকৃত তথ্য যুক্ত হওয়ার পূর্ববর্তী ডেমো</span>
          </div>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            সকল মতামত ({reviews.length})
          </button>
          <button
            onClick={() => setActiveFilter('printed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === 'printed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            মুদ্রিত বই
          </button>
          <button
            onClick={() => setActiveFilter('pdf')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === 'pdf'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            পিডিএফ হ্যান্ডনোট
          </button>
          <button
            onClick={() => setActiveFilter('question_bank')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === 'question_bank'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            প্রশ্নব্যাংক
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all duration-200 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {rev.isPlaceholder ? 'নমুনা প্রতিক্রিয়া' : 'শিক্ষার্থী মতামত'}
                  </span>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pt-1">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">{rev.name}</h4>
                <p className="text-slate-500 text-[11px]">
                  {rev.institution}, {rev.district}
                </p>
                <p className="text-cyan-800 font-medium text-[11px] pt-0.5">
                  বই / নোট: {rev.bookUsed}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                আপনার মতামত ও প্রতিক্রিয়া জানান
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="py-8 text-center space-y-2 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  ধন্যবাদ! আপনার প্রতিক্রিয়া যুক্ত করা হয়েছে।
                </h4>
                <p className="text-xs text-emerald-700">
                  আপনার মতামতটি সাময়িকভাবে ব্রাউজারের তালিকায় দেখানো হচ্ছে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="যেমন: রাফিদ হাসান"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">স্কুল / শিক্ষাপ্রতিষ্ঠান</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="যেমন: মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">জেলা</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="যেমন: ঢাকা"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">বই বা হ্যান্ডনোট নির্বাচন করুন</label>
                  <select
                    value={bookUsed}
                    onChange={(e) => setBookUsed(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="দিশারী এসএসসি কেমিস্ট্রি সহায়িকা (মুদ্রিত বই)">দিশারী এসএসসি কেমিস্ট্রি সহায়িকা (মুদ্রিত বই)</option>
                    <option value="জৈব যৌগ ও বিক্রিয়া স্টাডি হ্যান্ডনোট (ডিজিটাল পিডিএফ)">জৈব যৌগ ও বিক্রিয়া স্টাডি হ্যান্ডনোট (ডিজিটাল পিডিএফ)</option>
                    <option value="এসএসসি কেমিস্ট্রি CQ ও MCQ প্রশ্নব্যাংক (মুদ্রিত বই)">এসএসসি কেমিস্ট্রি CQ ও MCQ প্রশ্নব্যাংক (মুদ্রিত বই)</option>
                    <option value="রসায়ন ব্যবহারিক ও ভাইভা হ্যান্ডবুক (মুদ্রিত বই)">রসায়ন ব্যবহারিক ও ভাইভা হ্যান্ডবুক (মুদ্রিত বই)</option>
                    <option value="রসায়ন রিভিশন বুস্টার চার্ট ও সূত্রাবলী (ডিজিটাল পিডিএফ)">রসায়ন রিভিশন বুস্টার চার্ট ও সূত্রাবলী (ডিজিটাল পিডিএফ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">আপনার প্রতিক্রিয়া বা পরামর্শ *</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="বই বা নোট সম্পর্কে আপনার অভিমত লিখুন..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>প্রতিক্রিয়া জমা দিন</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
