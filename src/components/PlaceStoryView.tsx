import React, { useEffect } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  MapPin,
  X,
} from 'lucide-react';
import { PlaceEntry } from '../types/atlas';
import { TERRAIN_IMAGES } from '../data/soharPlaces';
import { Footer } from './Footer';

interface PlaceStoryViewProps {
  place: PlaceEntry;
  allPlaces: PlaceEntry[];
  onClose: () => void;
  onSelectPlace: (place: PlaceEntry) => void;
  onLocateOnMap: (placeId: string) => void;
  onOpenEditor: (place: PlaceEntry) => void;
}

function getSemanticStatusText(type: PlaceEntry['semanticLinkType']): {
  label: string;
  description: string;
} {
  switch (type) {
    case 'direct_match':
      return {
        label: 'توافق دلالي مباشر مع الفصحى',
        description: 'يرتبط الاسم محليًا بالمعنى المعجمي الوارد في أمهات الكتب العربية.',
      };
    case 'possible_link':
      return {
        label: 'تقارب دلالي محتمل أو رواية تفسيرية',
        description: 'توجد صلة لغوية محتملة أو تفسير محلي متداول دون جزم تاريخي قاطع.',
      };
    case 'no_link':
      return {
        label: 'لا يظهر ارتباط مثبت بالمعنى المعجمي',
        description: 'ورد اللفظ في المعاجم بدلالة أخرى لا تثبت اشتقاق اسم الموضع منه.',
      };
    case 'proper_noun':
    default:
      return {
        label: 'اسم علم أو نسبة قبلية',
        description: 'ترتبط التسمية بعَلَمٍ أو جماعة محلية.',
      };
  }
}

export const PlaceStoryView: React.FC<PlaceStoryViewProps> = ({
  place,
  allPlaces,
  onClose,
  onSelectPlace,
  onLocateOnMap,
  onOpenEditor,
}) => {
  const currentIndex = allPlaces.findIndex((p) => p.id === place.id);
  const prevPlace = currentIndex > 0 ? allPlaces[currentIndex - 1] : null;
  const nextPlace =
    currentIndex >= 0 && currentIndex < allPlaces.length - 1
      ? allPlaces[currentIndex + 1]
      : null;

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [place.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const terrain = TERRAIN_IMAGES[place.imageKey];
  const semanticInfo = getSemanticStatusText(place.semanticLinkType);

  // Dynamic editorial section numbering (only available sections are shown)
  let sectionCounter = 0;
  const nextSectionNum = () => {
    sectionCounter += 1;
    return `0${sectionCounter}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#FBF9F5] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`حكاية اسم ${place.name}`}
    >
      {/* Top Sticky Documentary Bar */}
      <div className="sticky top-0 z-20 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#D6CEBE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0B253A] hover:text-[#9E5633] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى المُعجم</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#555E68]">
            <span className="font-semibold text-[#0B253A]">مُعجم سبع المدن</span>
            <span aria-hidden="true">·</span>
            <span>ولاية صحار</span>
            <span aria-hidden="true">·</span>
            <span>حرف {place.letter}</span>
            <span aria-hidden="true">·</span>
            <span>المصدر: ص {place.sourcePage}</span>
          </div>

          <div className="flex items-center gap-2">
            {place.coordinates && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLocateOnMap(place.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0B253A] text-[#FBF9F5] hover:bg-[#143A57] rounded-lg transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D6B478]" />
                <span>عرض على الخريطة</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555E68] hover:bg-[#F3EFE6] hover:text-[#0B253A] cursor-pointer"
              aria-label="إغلاق صفحة الحكاية"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner of the Place Story */}
      <div className="relative h-64 sm:h-80 bg-[#0B253A] overflow-hidden">
        <img
          src={terrain.src}
          alt={terrain.alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0B253A] via-[#0B253A]/60 to-[#0B253A]/30"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-8 text-[#FBF9F5]">
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-[#D6B478] mb-2">
              <span>{place.typeLabel}</span>
              <span aria-hidden="true">·</span>
              <span>تصنيف: {place.category}</span>
              <span aria-hidden="true">·</span>
              <span>حرف {place.letter}</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold leading-tight">
              {place.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Documentary Narrative Layout */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Reading Column (70%) */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. التعريف بالمكان */}
            <section className="space-y-3">
              <div className="flex items-baseline gap-3 border-b border-[#D6CEBE] pb-2">
                <span className="font-mono-num text-xs text-[#9E5633] font-medium">
                  {nextSectionNum()}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#0B253A]">
                  التعريف بالمكان
                </h2>
              </div>
              <p className="text-base sm:text-lg text-[#1A1D20] leading-[1.85]">
                {place.definition}
              </p>
            </section>

            {/* 2. السياق التاريخي والجغرافي */}
            <section className="space-y-4">
              <div className="flex items-baseline gap-3 border-b border-[#D6CEBE] pb-2">
                <span className="font-mono-num text-xs text-[#9E5633] font-medium">
                  {nextSectionNum()}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#0B253A]">
                  السياق التاريخي والجغرافي
                </h2>
              </div>
              <p className="text-base sm:text-lg text-[#1A1D20] leading-[1.85] whitespace-pre-line">
                {place.historicalContext}
              </p>

              {/* Distinction Callout for Local Oral Narrative */}
              {place.hasLocalNarrative && place.localNarrativeSummary && (
                <div className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-5 space-y-1.5">
                  <p className="text-xs font-semibold text-[#9E5633]">
                    تمييز منهجي · رواية محلية منقولة في المصدر
                  </p>
                  <p className="text-sm text-[#1A1D20] leading-relaxed">
                    {place.localNarrativeSummary}
                  </p>
                </div>
              )}
            </section>

            {/* 3. السياق المعجمي (Only rendered if available in source) */}
            {place.lexicalContext && (
              <section className="space-y-3">
                <div className="flex items-baseline gap-3 border-b border-[#D6CEBE] pb-2">
                  <span className="font-mono-num text-xs text-[#9E5633] font-medium">
                    {nextSectionNum()}
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#0B253A]">
                    السياق المعجمي
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-[#1A1D20] leading-[1.85] whitespace-pre-line">
                  {place.lexicalContext}
                </p>
              </section>
            )}

            {/* 4. الجذر اللغوي (Only rendered if available in source) */}
            {place.linguisticRoot && (
              <section className="space-y-4">
                <div className="flex items-baseline gap-3 border-b border-[#D6CEBE] pb-2">
                  <span className="font-mono-num text-xs text-[#9E5633] font-medium">
                    {nextSectionNum()}
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#0B253A]">
                    الجذر اللغوي
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-6 bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-5">
                  <div className="px-5 py-3 bg-[#0B253A] text-[#D6B478] rounded-lg font-editorial text-2xl font-bold tracking-wider">
                    ({place.linguisticRoot})
                  </div>
                  <p className="text-sm text-[#555E68] flex-1 leading-relaxed">
                    المادة المعجمية التي أُرجِع إليها اسم «{place.name}» في البحث اللغوي وفق
                    المصدر الأساسي.
                  </p>
                </div>
              </section>
            )}

            {/* 5. الربط بين المعنى الفصيح والمعنى المحلي */}
            <section className="space-y-4">
              <div className="flex items-baseline gap-3 border-b border-[#D6CEBE] pb-2">
                <span className="font-mono-num text-xs text-[#9E5633] font-medium">
                  {nextSectionNum()}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#0B253A]">
                  الربط بين المعنى الفصيح والمعنى المحلي
                </h2>
              </div>

              <p className="text-base sm:text-lg text-[#1A1D20] leading-[1.85]">
                {place.fushaColloquialLink}
              </p>

              <div className="bg-[#F3EFE6]/80 border border-[#D6CEBE] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#0B253A]">{semanticInfo.label}</span>
                <span className="text-[#555E68]">{semanticInfo.description}</span>
              </div>
            </section>

            {/* 6. الشواهد الشعرية والأمثلة (ONLY rendered when present in source) */}
            {place.poetryAndExamples && (
              <section className="space-y-4">
                <div className="flex items-baseline gap-3 border-b border-[#D6CEBE] pb-2">
                  <span className="font-mono-num text-xs text-[#9E5633] font-medium">
                    {nextSectionNum()}
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#0B253A]">
                    الشواهد الشعرية والأمثلة
                  </h2>
                </div>

                <blockquote className="py-8 px-6 border-y border-[#C59B57]/60 bg-[#F3EFE6]/50 text-center space-y-4">
                  {place.poetryAndExamples.attribution && (
                    <p className="text-xs sm:text-sm font-medium text-[#9E5633]">
                      {place.poetryAndExamples.attribution}
                    </p>
                  )}
                  <p className="font-editorial text-2xl sm:text-3xl text-[#0B253A] leading-[2] whitespace-pre-line">
                    {place.poetryAndExamples.text}
                  </p>
                </blockquote>
              </section>
            )}

            {/* Dedicated Placeholder for Incomplete Source Data / Researcher Additions */}
            {(place.incompleteSourceNote || !place.coordinates || place.researcherAddition) && (
              <section className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-[#0B253A]">
                    موضع استكمال وتوثيق إضافي
                  </h3>
                  <button
                    type="button"
                    onClick={() => onOpenEditor(place)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E5633] hover:text-[#0B253A] cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>تحديث أو إضافة معلومة</span>
                  </button>
                </div>

                {place.incompleteSourceNote && (
                  <p className="text-xs sm:text-sm text-[#555E68] leading-relaxed">
                    <strong>ملحوظة مصدرية:</strong> {place.incompleteSourceNote}
                  </p>
                )}

                {!place.coordinates && (
                  <p className="text-xs sm:text-sm text-[#555E68] leading-relaxed">
                    <strong>الحالة الجغرافية:</strong> {place.coordinateNote}
                  </p>
                )}

                {place.researcherAddition && (
                  <div className="pt-3 border-t border-[#D6CEBE] text-sm text-[#1A1D20] leading-relaxed">
                    <span className="block text-xs font-semibold text-[#0B253A] mb-1">
                      إضافة الباحث الميدانية:
                    </span>
                    {place.researcherAddition}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Margin Metadata Column (30%) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            <div className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-5 space-y-4">
              <h3 className="font-editorial text-lg font-bold text-[#0B253A] border-b border-[#D6CEBE] pb-2">
                بطاقة الفهرسة التوثيقية
              </h3>

              <dl className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#555E68]">الاسم في المصدر</dt>
                  <dd className="font-semibold text-[#0B253A]">{place.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#555E68]">النطاق الإداري</dt>
                  <dd className="text-[#1A1D20]">ولاية صحار · شمال الباطنة</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#555E68]">نوع الموضع</dt>
                  <dd className="text-[#1A1D20]">{place.typeLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#555E68]">الجذر اللغوي</dt>
                  <dd className="font-medium text-[#0B253A]">
                    {place.linguisticRoot ? `(${place.linguisticRoot})` : 'غير محدد في المصدر'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#555E68]">مرجع الصفحة</dt>
                  <dd className="font-mono-num text-[#1A1D20]">ص {place.sourcePage}</dd>
                </div>
                <div className="pt-2 border-t border-[#D6CEBE]">
                  <dt className="text-[#555E68] mb-1">الرصد الإحداثي</dt>
                  <dd className="text-xs text-[#1A1D20] leading-relaxed">
                    {place.coordinates ? (
                      <span className="font-mono-num text-[#0B253A]" dir="ltr">
                        {place.coordinates[0].toFixed(4)}° N, {place.coordinates[1].toFixed(4)}° E
                      </span>
                    ) : (
                      place.coordinateNote
                    )}
                  </dd>
                </div>
              </dl>

              <div className="pt-2 flex flex-col gap-2">
                {place.coordinates && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLocateOnMap(place.id);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#0B253A] hover:bg-[#143A57] text-[#FBF9F5] rounded-lg transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#D6B478]" />
                    <span>انتقل للموقع على الخريطة</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenEditor(place)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-[#FBF9F5] border border-[#D6CEBE] hover:border-[#0B253A] text-[#0B253A] rounded-lg transition-colors cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5 text-[#9E5633]" />
                  <span>تحرير بيانات هذا الموضع</span>
                </button>
              </div>
            </div>

            <figure className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl overflow-hidden">
              <img
                src={terrain.src}
                alt={terrain.alt}
                referrerPolicy="no-referrer"
                className="w-full h-40 object-cover"
              />
              <figcaption className="p-3 text-xs text-[#555E68]">
                {terrain.caption} — ولاية صحار
              </figcaption>
            </figure>
          </aside>
        </div>

        {/* Previous / Next Place Footer Navigation */}
        <div className="mt-14 pt-8 border-t border-[#D6CEBE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {prevPlace ? (
            <button
              type="button"
              onClick={() => onSelectPlace(prevPlace)}
              className="flex items-center gap-3 px-4 py-3 bg-[#F3EFE6] hover:bg-[#EBE6DF] border border-[#D6CEBE] rounded-xl text-right transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-[#9E5633] shrink-0" />
              <div>
                <span className="block text-[11px] text-[#555E68]">الموضع السابق</span>
                <span className="font-editorial text-lg font-bold text-[#0B253A]">
                  {prevPlace.name}
                </span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextPlace && (
            <button
              type="button"
              onClick={() => onSelectPlace(nextPlace)}
              className="flex items-center justify-end gap-3 px-4 py-3 bg-[#F3EFE6] hover:bg-[#EBE6DF] border border-[#D6CEBE] rounded-xl text-left transition-colors cursor-pointer"
            >
              <div>
                <span className="block text-[11px] text-[#555E68]">الموضع التالي</span>
                <span className="font-editorial text-lg font-bold text-[#0B253A]">
                  {nextPlace.name}
                </span>
              </div>
              <ChevronLeft className="w-5 h-5 text-[#9E5633] shrink-0" />
            </button>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
};
