import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Compass } from 'lucide-react';
import { TERRAIN_IMAGES } from '../data/soharPlaces';
import { PlaceEntry } from '../types/atlas';

interface HeroSectionProps {
  places: PlaceEntry[];
  onStartExploring: () => void;
  onOpenEncyclopedia: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  places,
  onStartExploring,
  onOpenEncyclopedia,
}) => {
  const mappedCount = places.filter((p) => p.coordinates !== null).length;
  const poetryCount = places.filter((p) => p.poetryAndExamples !== null).length;
  const rootsCount = places.filter((p) => p.linguisticRoot !== null).length;

  return (
    <section id="hero" className="relative bg-[#0B253A] text-[#FBF9F5]">
      {/* Cinematic Backdrop */}
      <div className="relative min-h-[78vh] lg:min-h-[84vh] flex items-center overflow-hidden">
        <img
          src={TERRAIN_IMAGES.fort.src}
          alt={TERRAIN_IMAGES.fort.alt}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Measured contrast scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-l from-[#0B253A]/92 via-[#0B253A]/72 to-[#0B253A]/45"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B253A] to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            {/* Quiet Editorial Kicker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#D6B478] tracking-wide"
            >
              <span className="font-semibold">مُعجم سبع المدن</span>
              <span aria-hidden="true" className="text-[#C59B57]/60">·</span>
              <span>حكاية المكان تبدأ من اسمه</span>
            </motion.div>

            {/* Primary Opening Quote */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.28] text-[#FBF9F5] [text-wrap:balance]"
            >
              «في صحار... حتى أسماء الأماكن تروي حكاياتها»
            </motion.h1>

            {/* Supporting Prose */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-[#FBF9F5]/85 leading-relaxed max-w-2xl"
            >
              تجربة رقمية تفاعلية توثّق أسماء القرى والمناطق والأودية والأفلاج والمعالم في ولاية
              صحار بمحافظة شمال الباطنة؛ تجمع بين الجغرافيا والتاريخ والتراث والشواهد الشعرية
              والمعجم العربي.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={onStartExploring}
                className="inline-flex items-center gap-3 px-7 py-3.5 text-base font-semibold bg-[#C59B57] hover:bg-[#D6B478] text-[#0B253A] rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBF9F5]"
              >
                <Compass className="w-5 h-5" />
                <span>ابدأ استكشاف صحار</span>
              </button>

              <button
                type="button"
                onClick={onOpenEncyclopedia}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-medium text-[#FBF9F5] border border-[#FBF9F5]/30 hover:border-[#D6B478] hover:text-[#D6B478] rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C59B57]"
              >
                <span>تصفح موسوعة الأسماء</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Archival Index Strip (Full-width row below hero visual) */}
      <div className="border-t border-[#FBF9F5]/12 bg-[#0B253A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="border-e border-[#FBF9F5]/12 pe-4">
              <dt className="text-xs text-[#FBF9F5]/65 mb-1">المواضع الموثقة في المصدر</dt>
              <dd className="font-mono-num text-2xl sm:text-3xl font-medium text-[#D6B478]">
                {places.length}
                <span className="font-sans-ar text-sm text-[#FBF9F5]/75 ms-2">موضعًا</span>
              </dd>
            </div>
            <div className="lg:border-e border-[#FBF9F5]/12 lg:pe-4">
              <dt className="text-xs text-[#FBF9F5]/65 mb-1">مواقع مرصودة على الخريطة</dt>
              <dd className="font-mono-num text-2xl sm:text-3xl font-medium text-[#FBF9F5]">
                {mappedCount}
                <span className="font-sans-ar text-sm text-[#FBF9F5]/75 ms-2">إحداثيًا محققًا</span>
              </dd>
            </div>
            <div className="border-e border-[#FBF9F5]/12 pe-4">
              <dt className="text-xs text-[#FBF9F5]/65 mb-1">الجذور اللغوية المدروسة</dt>
              <dd className="font-mono-num text-2xl sm:text-3xl font-medium text-[#FBF9F5]">
                {rootsCount}
                <span className="font-sans-ar text-sm text-[#FBF9F5]/75 ms-2">جذرًا معجميًا</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#FBF9F5]/65 mb-1">الشواهد الشعرية والنصية</dt>
              <dd className="font-mono-num text-2xl sm:text-3xl font-medium text-[#FBF9F5]">
                {poetryCount}
                <span className="font-sans-ar text-sm text-[#FBF9F5]/75 ms-2">شاهدًا موثقًا</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
