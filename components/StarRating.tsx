'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toBengaliNumber } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // e.g. 4.9
  totalRatings?: number; // e.g. 35
  userRating?: number | null;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCount?: boolean;
  showScore?: boolean;
  className?: string;
  label?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'চলনসই (১/৫)',
  2: 'মোটামুটি (২/৫)',
  3: 'ভালো (৩/৫)',
  4: 'খুব ভালো (৪/৫)',
  5: 'অসাধারণ! (৫/৫)',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalRatings,
  userRating = null,
  onRate,
  interactive = false,
  size = 'sm',
  showCount = true,
  showScore = true,
  className = '',
  label,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  const textSizes = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  const handleStarClick = (starIndex: number, e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    onRate?.(starIndex);
  };

  const handleMouseEnter = (starIndex: number) => {
    if (!interactive) return;
    setHoverRating(starIndex);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(null);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* 5 Stars Container */}
      <div 
        className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
        title={interactive ? 'রেটিং দিতে তারকায় ক্লিক করুন' : `${rating.toFixed(1)} স্টার রেটিং`}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = currentDisplayRating >= starIndex;
          const isPartiallyFilled = !isFilled && currentDisplayRating >= starIndex - 0.5;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={(e) => handleStarClick(starIndex, e)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              aria-label={`${starIndex} তারকা রেটিং দিন`}
              className={`p-0.5 -m-0.5 transition-transform ${
                interactive 
                  ? 'hover:scale-125 active:scale-95 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-amber-400 rounded-xs' 
                  : 'cursor-default pointer-events-none'
              }`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isPartiallyFilled
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-slate-300 fill-slate-100 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Numeric Score */}
      {showScore && (
        <span className={`${textSizes[size]} font-bold text-slate-800 tabular-nums`} suppressHydrationWarning>
          {toBengaliNumber(currentDisplayRating.toFixed(1))}
        </span>
      )}

      {/* Ratings Count */}
      {showCount && typeof totalRatings === 'number' && (
        <span className={`text-slate-400 font-medium ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`} suppressHydrationWarning>
          ({toBengaliNumber(totalRatings)})
        </span>
      )}

      {/* Hover preview tooltip text when interactive */}
      {interactive && hoverRating !== null && (
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200 animate-in fade-in duration-100">
          {RATING_LABELS[hoverRating]}
        </span>
      )}

      {/* User's already rated indicator badge */}
      {userRating !== null && hoverRating === null && interactive && (
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-sm border border-emerald-200 font-medium" suppressHydrationWarning>
          আপনার রেটিং: {toBengaliNumber(userRating)}★
        </span>
      )}

      {label && (
        <span className="text-xs text-slate-500 font-medium">
          {label}
        </span>
      )}
    </div>
  );
};
