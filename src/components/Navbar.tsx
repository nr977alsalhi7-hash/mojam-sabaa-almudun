import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type NavSectionId = 'hero' | 'map-section' | 'encyclopedia-section' | 'journey-section' | 'methodology-section';

interface NavbarProps {
  activeSection: NavSectionId;
  onNavigate: (sectionId: NavSectionId) => void;
}

const NAV_ITEMS: { id: NavSectionId; label: string }[] = [
  { id: 'map-section', label: 'الخريطة التفاعلية' },
  { id: 'encyclopedia-section', label: 'موسوعة الأسماء' },
  { id: 'journey-section', label: 'رحلة عبر الأسماء' },
  { id: 'methodology-section', label: 'من الذاكرة إلى الخريطة' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (id: NavSectionId) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#D6CEBE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (single line, no adjacent subtitle/badge) */}
        <button
          type="button"
          onClick={() => handleLinkClick('hero')}
          className="font-editorial text-xl sm:text-2xl font-bold text-[#0B253A] tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9E5633] rounded-sm px-1"
          aria-label="العودة إلى واجهة مُعجم سبع المدن"
        >
          مُعجم سبع المدن
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="التنقل الرئيسي">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9E5633] rounded-sm ${
                  isActive
                    ? 'text-[#0B253A] font-semibold'
                    : 'text-[#555E68] hover:text-[#0B253A]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-[#9E5633]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile drawer trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('map-section')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FBF9F5] bg-[#0B253A] hover:bg-[#143A57] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B57]"
          >
            استكشف الخريطة
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[#0B253A] hover:bg-[#F3EFE6] rounded-lg transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t border-[#D6CEBE] bg-[#FBF9F5] px-4 py-3 space-y-1"
          aria-label="قائمة الجوال"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`block w-full text-right px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#F3EFE6] text-[#0B253A] font-semibold'
                    : 'text-[#555E68] hover:bg-[#F3EFE6]/60 hover:text-[#0B253A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
