import React from 'react';
import { NavSectionId } from './Navbar';

interface FooterProps {
  onNavigate?: (sectionId: NavSectionId) => void;
  onOpenEditor?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenEditor }) => {
  return (
    <footer className="relative bg-[#071C2C] text-[#FBF9F5] border-t border-[#C59B57]/30 overflow-hidden">
      {/* Subtle Top Gold Hairline & Atmospheric Glow */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#D6B478]/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[540px] h-48 rounded-full bg-[#C59B57]/8 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 space-y-8">
        {/* Optional Navigation Bar when rendered on main atlas layout */}
        {onNavigate && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#FBF9F5]/10 text-xs text-[#FBF9F5]/75">
            <span className="text-[#D6B478]/90">
              حكاية المكان تبدأ من اسمه — ولاية صحار، سلطنة عُمان
            </span>

            <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="روابط التذييل">
              <button
                type="button"
                onClick={() => onNavigate('map-section')}
                className="hover:text-[#D6B478] transition-colors cursor-pointer"
              >
                الخريطة التفاعلية
              </button>
              <button
                type="button"
                onClick={() => onNavigate('encyclopedia-section')}
                className="hover:text-[#D6B478] transition-colors cursor-pointer"
              >
                موسوعة الأسماء
              </button>
              <button
                type="button"
                onClick={() => onNavigate('journey-section')}
                className="hover:text-[#D6B478] transition-colors cursor-pointer"
              >
                رحلة عبر الأسماء
              </button>
              {onOpenEditor && (
                <button
                  type="button"
                  onClick={onOpenEditor}
                  className="hover:text-[#D6B478] transition-colors cursor-pointer"
                >
                  تحرير البيانات
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Ornamental Divider Inspired by Traditional Omani Engravings */}
        <div className="flex items-center justify-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-transparent to-[#C59B57]/60" />
          <svg
            viewBox="0 0 180 32"
            className="w-40 sm:w-48 h-8 text-[#D6B478] shrink-0"
            fill="none"
          >
            {/* Left Omani geometric stepping & diamond */}
            <path
              d="M8 16h34M42 16l8-6 8 6-8 6-8-6z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeOpacity="0.75"
            />
            <circle cx="24" cy="16" r="1.75" fill="currentColor" fillOpacity="0.7" />
            {/* Central Omani arch & eight-pointed star rosette */}
            <path
              d="M90 3l4.2 8.8L103 16l-8.8 4.2L90 29l-4.2-8.8L77 16l8.8-4.2L90 3z"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="#C59B57"
              fillOpacity="0.15"
            />
            <rect
              x="85.5"
              y="11.5"
              width="9"
              height="9"
              transform="rotate(45 90 16)"
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.85"
            />
            <circle cx="90" cy="16" r="2.2" fill="currentColor" />
            {/* Right Omani geometric stepping & diamond */}
            <path
              d="M172 16h-34M138 16l-8-6-8 6 8 6 8-6z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeOpacity="0.75"
            />
            <circle cx="156" cy="16" r="1.75" fill="currentColor" fillOpacity="0.7" />
          </svg>
          <div className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-transparent to-[#C59B57]/60" />
        </div>

        {/* Luxurious Attribution & Copyright Block */}
        <div className="text-center space-y-5">
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm text-[#D6B478]/90 tracking-wide">
              تصميم وإعداد
            </p>
            <p className="font-editorial text-2xl sm:text-3xl font-bold text-[#E6C78B] tracking-wide">
              حليمة عبدالحكيم الصالحي
            </p>
          </div>

          <div className="pt-2 space-y-1.5 text-xs sm:text-sm text-[#FBF9F5]/80">
            <p>© 2026 جميع الحقوق محفوظة.</p>
            <p className="font-editorial text-base sm:text-lg text-[#FBF9F5]">
              مشروع «مُعجم سبع المدن»
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
