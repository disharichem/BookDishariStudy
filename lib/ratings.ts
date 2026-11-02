import { toBengaliNumber } from './utils';

export interface StudentReview {
  id: string;
  productId: string;
  studentName: string;
  studentBatch?: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalRatings: number;
  breakdown: { [stars: number]: number };
}

// Initial baseline ratings per product
const INITIAL_BASELINE_RATINGS: Record<string, { average: number; count: number; reviews: StudentReview[] }> = {
  'dishari-printed-chemistry-guide': {
    average: 4.9,
    count: 48,
    reviews: [
      {
        id: 'rev-1',
        productId: 'dishari-printed-chemistry-guide',
        studentName: 'রাফিদ হাসান',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'রসায়ন ৩য় ও ৫ম অধ্যায়ের ব্যাখ্যাগুলো অসাধারণ! বোর্ড পরীক্ষার জন্য সেরা গাইড।',
        createdAt: '২ দিন আগে',
      },
      {
        id: 'rev-2',
        productId: 'dishari-printed-chemistry-guide',
        studentName: 'সুমাইয়া আক্তার',
        studentBatch: 'এসএসসি ২০২৬',
        rating: 5,
        comment: 'প্রিন্ট কোয়ালিটি এবং অফসেট পেপার অনেক সুন্দর। পড়তে খুব সুবিধা হয়।',
        createdAt: '৫ দিন আগে',
      },
      {
        id: 'rev-3',
        productId: 'dishari-printed-chemistry-guide',
        studentName: 'তানভীর আহমেদ',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 4,
        comment: 'গাণিতিক সমস্যার সমাধানগুলো খুব পরিষ্কারভাবে স্টেপ বাই স্টেপ দেওয়া আছে।',
        createdAt: '১ সপ্তাহ আগে',
      },
    ],
  },
  'dishari-organic-chem-pdf': {
    average: 4.9,
    count: 36,
    reviews: [
      {
        id: 'rev-4',
        productId: 'dishari-organic-chem-pdf',
        studentName: 'মাহিয়া রহমান',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'জৈব যৌগের বিক্রিয়া মনে রাখা কঠিন লাগত, কিন্তু এই পিডিএফ ফ্লোচার্ট দেখে সহজে মনে থাকে!',
        createdAt: '৩ দিন আগে',
      },
      {
        id: 'rev-5',
        productId: 'dishari-organic-chem-pdf',
        studentName: 'সাদাত হোসেন',
        studentBatch: 'এসএসসি ২০২৬',
        rating: 5,
        comment: 'মোবাইলে পড়ার জন্য একদম পারফেক্ট ও রঙিন হ্যান্ডনোট। সাথে সাথে ডেলিভারি পেয়েছি।',
        createdAt: '১ সপ্তাহ আগে',
      },
    ],
  },
  'dishari-inorganic-notes-pdf': {
    average: 4.8,
    count: 29,
    reviews: [
      {
        id: 'rev-6',
        productId: 'dishari-inorganic-notes-pdf',
        studentName: 'আরিফুল ইসলাম',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'পর্যায় সারণি ও ধাতু নিষ্কাশন অধ্যায়ের ট্রিকসগুলো দুর্দান্ত।',
        createdAt: '৪ দিন আগে',
      },
    ],
  },
  'dishari-physical-chem-formulas': {
    average: 4.8,
    count: 22,
    reviews: [
      {
        id: 'rev-7',
        productId: 'dishari-physical-chem-formulas',
        studentName: 'ফারজানা সুলতানা',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'মোলের ধারণা ও ঘনমাত্রার সকল সূত্র এক ফাইলে পেয়েছি, ম্যাথ করতে সুবিধা হচ্ছে।',
        createdAt: '৬ দিন আগে',
      },
    ],
  },
  'dishari-complete-combo-box': {
    average: 5.0,
    count: 52,
    reviews: [
      {
        id: 'rev-8',
        productId: 'dishari-complete-combo-box',
        studentName: 'আবরার তাহমিদ',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'প্রিন্টেড বই এবং সকল পিডিএফ হ্যান্ডনোট একসাথে পেয়েছি। পুরো রসায়ন প্রস্তুতি সহজ হয়ে গেছে!',
        createdAt: 'গতকাল',
      },
      {
        id: 'rev-9',
        productId: 'dishari-complete-combo-box',
        studentName: 'জান্নাতুল ফেরদৌস',
        studentBatch: 'এসএসসি ২০২৬',
        rating: 5,
        comment: 'বইয়ের সাথে গিফট হিসেবে ফর্মুলা চার্ট পেয়ে খুব খুশি। হাইলি রেকমেন্ডেড!',
        createdAt: '৪ দিন আগে',
      },
    ],
  },
  'dishari-cq-mcq-question-bank': {
    average: 4.9,
    count: 34,
    reviews: [
      {
        id: 'rev-10',
        productId: 'dishari-cq-mcq-question-bank',
        studentName: 'নাজমুল সাকিব',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'বোর্ড প্রশ্ন এবং শীর্ষ কলেজের টেস্ট পেপার CQ-MCQ খুব সুন্দর করে সমাধান করা।',
        createdAt: '৫ দিন আগে',
      },
    ],
  },
  'dishari-practical-viva-companion': {
    average: 4.7,
    count: 19,
    reviews: [
      {
        id: 'rev-11',
        productId: 'dishari-practical-viva-companion',
        studentName: 'মাহমুদুল হাসান',
        studentBatch: 'এসএসসি ২০২৫',
        rating: 5,
        comment: 'ল্যাব পরীক্ষা ও ভাইভাতে স্যারের সম্ভাব্য প্রশ্নগুলোর উত্তর খুব গোছানো।',
        createdAt: '১ সপ্তাহ আগে',
      },
    ],
  },
  'dishari-formula-wallchart-card': {
    average: 4.8,
    count: 27,
    reviews: [
      {
        id: 'rev-12',
        productId: 'dishari-formula-wallchart-card',
        studentName: 'রওনক জাহান',
        studentBatch: 'এসএসসি ২০২৬',
        rating: 5,
        comment: 'পড়ার টেবিলে টানিয়ে রেখেছি, প্রতিদিন রিভিশন দিতে দারুণ কাজে দেয়।',
        createdAt: '৩ দিন আগে',
      },
    ],
  },
};

const RATINGS_STORAGE_KEY = 'dishari_custom_reviews_v1';
const USER_RATED_KEY = 'dishari_user_ratings_v1';

// Safe localStorage access
function getStoredCustomReviews(): Record<string, StudentReview[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(RATINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to parse stored ratings:', e);
    return {};
  }
}

function saveStoredCustomReviews(data: Record<string, StudentReview[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save stored ratings:', e);
  }
}

export function getUserRating(productId: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_RATED_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return typeof map[productId] === 'number' ? map[productId] : null;
  } catch (e) {
    return null;
  }
}

export function saveUserRating(productId: string, rating: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(USER_RATED_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[productId] = rating;
    localStorage.setItem(USER_RATED_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save user rating map:', e);
  }
}

/**
 * Calculates baseline-only rating summary for a product (pure and deterministic for SSR)
 */
export function getBaseProductRatingSummary(productId: string): ProductRatingSummary {
  const base = INITIAL_BASELINE_RATINGS[productId] || { average: 4.8, count: 20, reviews: [] };
  const totalRatings = base.count;
  const averageRating = base.average;

  const breakdown: { [stars: number]: number } = {
    5: Math.round(totalRatings * 0.85),
    4: Math.round(totalRatings * 0.12),
    3: Math.max(0, totalRatings - Math.round(totalRatings * 0.85) - Math.round(totalRatings * 0.12)),
    2: 0,
    1: 0,
  };

  return {
    averageRating: Math.min(5, Math.max(1, averageRating)),
    totalRatings,
    breakdown,
  };
}

/**
 * Gets baseline reviews for a product (pure and deterministic for SSR)
 */
export function getBaseProductReviews(productId: string): StudentReview[] {
  return INITIAL_BASELINE_RATINGS[productId]?.reviews || [];
}

/**
 * Calculates current rating summary for a product including baseline and user submitted reviews
 */
export function getProductRatingSummary(productId: string): ProductRatingSummary {
  const base = INITIAL_BASELINE_RATINGS[productId] || { average: 4.8, count: 20, reviews: [] };
  const customReviews = getStoredCustomReviews()[productId] || [];

  const baseCount = base.count;
  const customCount = customReviews.length;
  const totalRatings = baseCount + customCount;

  // Calculate sum of base ratings
  const baseSum = base.average * baseCount;
  const customSum = customReviews.reduce((acc, r) => acc + r.rating, 0);
  const totalSum = baseSum + customSum;

  const averageRating = totalRatings > 0 ? Number((totalSum / totalRatings).toFixed(1)) : 5.0;

  // Breakdown distribution approximation
  const breakdown: { [stars: number]: number } = {
    5: Math.round(totalRatings * 0.85),
    4: Math.round(totalRatings * 0.12),
    3: Math.max(0, totalRatings - Math.round(totalRatings * 0.85) - Math.round(totalRatings * 0.12)),
    2: 0,
    1: 0,
  };

  // Adjust breakdown with custom reviews
  customReviews.forEach((rev) => {
    const star = Math.min(5, Math.max(1, Math.round(rev.rating)));
    breakdown[star] = (breakdown[star] || 0) + 1;
  });

  return {
    averageRating: Math.min(5, Math.max(1, averageRating)),
    totalRatings,
    breakdown,
  };
}

/**
 * Gets all reviews for a product (both seed and user-submitted)
 */
export function getProductReviews(productId: string): StudentReview[] {
  const base = INITIAL_BASELINE_RATINGS[productId]?.reviews || [];
  const custom = getStoredCustomReviews()[productId] || [];
  // Custom user reviews appear on top
  return [...custom, ...base];
}

/**
 * Submits a new rating/review for a product
 */
export function submitStudentRating(
  productId: string,
  rating: number,
  studentName?: string,
  studentBatch?: string,
  comment?: string
): ProductRatingSummary {
  const customStore = getStoredCustomReviews();
  const existingProductReviews = customStore[productId] || [];

  const newReview: StudentReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId,
    studentName: studentName?.trim() || 'শিক্ষার্থী',
    studentBatch: studentBatch?.trim() || 'এসএসসি বিজ্ঞান শিক্ষার্থী',
    rating: Math.min(5, Math.max(1, rating)),
    comment: comment?.trim(),
    createdAt: 'আজ',
  };

  customStore[productId] = [newReview, ...existingProductReviews];
  saveStoredCustomReviews(customStore);
  saveUserRating(productId, rating);

  // Dispatch custom event to notify all components in the app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dishari-rating-updated', {
        detail: { productId, rating },
      })
    );
  }

  return getProductRatingSummary(productId);
}
