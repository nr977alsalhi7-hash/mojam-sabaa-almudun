import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { PlaceEntry } from '../types/atlas';
import { TERRAIN_IMAGES } from '../data/soharPlaces';

interface JourneySectionProps {
  places: PlaceEntry[];
  onSelectStory: (place: PlaceEntry) => void;
  onLocateOnMap: (placeId: string) => void;
}

type JourneyTrackId =
  | 'water_terrain'
  | 'local_narratives'
  | 'poetic_places'
  | 'transformed_names'
  | 'all';

const TRACKS: { id: JourneyTrackId; label: string; description: string }[] = [
  {
    id: 'water_terrain',
    label: 'ذاكرة الماء والتضاريس',
    description: 'أسماء ارتبطت بالأودية والأفلاج وعيون الماء والتكوينات الصخرية.',
  },
  {
    id: 'local_narratives',
    label: 'الروايات المحلية',
    description: 'مواضع نقل المصدر حول تسميتها روايةً شفهيةً أو تفسيرًا محليًا.',
  },
  {
    id: 'poetic_places',
    label: 'في ديوان الشعر',
    description: 'أسماء وردت حولها شواهد شعرية أو نصوص تراثية في المصدر.',
  },
  {
    id: 'transformed_names',
    label: 'أسماء تبدّلت أو غمض أصلها',
    description: 'مواضع تغيّر اسمها عبر الزمن أو بقيت دلالتها المعجمية غير مثبتة.',
  },
  {
    id: 'all',
    label: 'المسار الشامل',
    description: 'استعراض تتابعي لجميع المواضع الخمسين في ولاية صحار.',
  },
];

export const JourneySection: React.FC<JourneySectionProps> = ({
  places,
  onSelectStory,
  onLocateOnMap,
}) => {
  const [activeTrack, setActiveTrack] = useState<JourneyTrackId>('water_terrain');
  const [stepIndex, setStepIndex] = useState<number>(0);

  const trackPlaces = useMemo(() => {
    switch (activeTrack) {
      case 'water_terrain':
        return places.filter(
          (p) =>
            p.category === 'الأودية' ||
            p.category === 'الأفلاج' ||
            ['al-waqibah', 'al-uwainat', 'yanbu', 'muwailih', 'salan', 'saih-al-barir'].includes(
              p.id
            )
        );
      case 'local_narratives':
        return places.filter((p) => p.hasLocalNarrative);
      case 'poetic_places':
        return places.filter((p) => p.poetryAndExamples !== null);
      case 'transformed_names':
        return places.filter(
          (p) =>
            p.semanticLinkType === 'no_link' ||
            ['al-afifah', 'al-multaqa', 'karwan'].includes(p.id)
        );
      case 'all':
      default:
        return places;
    }
  }, [places, activeTrack]);

  const safeIndex = Math.min(stepIndex, Math.max(0, trackPlaces.length - 1));
  const currentPlace = trackPlaces[safeIndex] || places[0];
  const currentTrackMeta = TRACKS.find((t) => t.id === activeTrack)!;

  const handleSelectTrack = (id: JourneyTrackId) => {
    setActiveTrack(id);
    setStepIndex(0);
  };

  if (!currentPlace) return null;

  const terrain = TERRAIN_IMAGES[currentPlace.imageKey];

  const natureRelation =
    currentPlace.semanticLinkType === 'direct_match'
      ? 'نعم — يرتبط الاسم بوضوح بالسمات الطبيعية أو العمرانية المذكورة للموضع.'
      : currentPlace.semanticLinkType === 'possible_link'
      ? 'ارتباط محتمل — تشير الدلالة اللغوية أو الرواية المحلية إلى صلة محتملة بطبيعة المكان دون جزم قاطع.'
      : 'لا يظهر ارتباط مثبت في المصدر بين المعنى المعجمي وطبيعة المكان.';

  return (
    <section
      id="journey-section"
      className="py-16 lg:py-24 bg-[#0B253A] text-[#FBF9F5] border-b border-[#D6CEBE]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#D6B478] tracking-wide">
              تجربة تفاعلية موجهة
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#FBF9F5]">
              رحلة عبر أسماء صحار
            </h2>
            <p className="text-sm sm:text-base text-[#FBF9F5]/80 leading-relaxed">
              تأمّل حكاية كل اسم عبر خمسة أسئلة توثيقية تكشف نشأة الاسم، ومعناه في الفصحى،
              وصلته بطبيعة المكان، وما رُوي حوله من أخبار وأشعار.
            </p>
          </div>

          {/* Step Counter */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-mono-num text-[#D6B478] text-lg font-semibold">
              {safeIndex + 1} / {trackPlaces.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={safeIndex === 0}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#FBF9F5]/25 hover:border-[#D6B478] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="الموضع السابق في الرحلة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setStepIndex((i) => Math.min(trackPlaces.length - 1, i + 1))
                }
                disabled={safeIndex >= trackPlaces.length - 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#FBF9F5]/25 hover:border-[#D6B478] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="الموضع التالي في الرحلة"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Track Selector Tabs */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {TRACKS.map((track) => {
              const active = track.id === activeTrack;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(track.id)}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#C59B57] text-[#0B253A] font-semibold'
                      : 'bg-[#143A57]/70 text-[#FBF9F5]/80 hover:text-[#FBF9F5] hover:bg-[#143A57]'
                  }`}
                >
                  {track.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#D6B478]/90">{currentTrackMeta.description}</p>
        </div>

        {/* Interactive 5-Question Documentary Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#143A57]/55 border border-[#FBF9F5]/15 rounded-2xl overflow-hidden">
          {/* Place Visual & Identity */}
          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-[#0B253A]">
            <img
              src={terrain.src}
              alt={terrain.alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0B253A] via-[#0B253A]/45 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#D6B478]">
                <span>{currentPlace.typeLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{currentPlace.category}</span>
              </div>
              <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-[#FBF9F5]">
                {currentPlace.name}
              </h3>
              <p className="text-sm text-[#FBF9F5]/85 leading-relaxed">
                {currentPlace.definition}
              </p>

              <div className="pt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onSelectStory(currentPlace)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#C59B57] hover:bg-[#D6B478] text-[#0B253A] rounded-lg transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>قراءة الحكاية كاملة</span>
                </button>

                {currentPlace.coordinates && (
                  <button
                    type="button"
                    onClick={() => onLocateOnMap(currentPlace.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#FBF9F5]/30 hover:border-[#D6B478] text-[#FBF9F5] rounded-lg transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#D6B478]" />
                    <span>موقعها على الخريطة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 5 Diagnostic Answers */}
          <div className="lg:col-span-7 p-6 sm:p-8 divide-y divide-[#FBF9F5]/12">
            {/* Q1 */}
            <div className="pb-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-[#D6B478]">
                01. كيف نشأ الاسم وفق المعلومات المتاحة؟
              </h4>
              <p className="text-sm text-[#FBF9F5]/90 leading-relaxed">
                {currentPlace.historicalContext}
              </p>
            </div>

            {/* Q2 */}
            <div className="py-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-[#D6B478]">
                02. ما معناه في اللغة العربية؟
              </h4>
              <p className="text-sm text-[#FBF9F5]/90 leading-relaxed">
                {currentPlace.lexicalContext ||
                  'لم يرد بند معجمي مستقل لهذا الاسم في المصدر الأساسي.'}
              </p>
            </div>

            {/* Q3 */}
            <div className="py-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-[#D6B478]">
                03. هل يرتبط بطبيعة المكان؟
              </h4>
              <p className="text-sm text-[#FBF9F5]/90 leading-relaxed">
                {natureRelation} — {currentPlace.fushaColloquialLink}
              </p>
            </div>

            {/* Q4 */}
            <div className="py-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-[#D6B478]">
                04. هل توجد رواية محلية حول تسميته؟
              </h4>
              <p className="text-sm text-[#FBF9F5]/90 leading-relaxed">
                {currentPlace.hasLocalNarrative && currentPlace.localNarrativeSummary
                  ? currentPlace.localNarrativeSummary
                  : 'لم يرد في المصدر الأساسي نصٌّ يشير إلى رواية شفهية محلية مستقلة حول سبب التسمية.'}
              </p>
            </div>

            {/* Q5 */}
            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-semibold text-[#D6B478]">
                05. هل توجد شواهد شعرية مرتبطة به؟
              </h4>
              {currentPlace.poetryAndExamples ? (
                <div className="bg-[#0B253A]/70 border border-[#C59B57]/30 rounded-lg p-4 space-y-1.5">
                  {currentPlace.poetryAndExamples.attribution && (
                    <span className="block text-xs text-[#D6B478]">
                      {currentPlace.poetryAndExamples.attribution}
                    </span>
                  )}
                  <p className="font-editorial text-lg sm:text-xl text-[#FBF9F5] leading-relaxed whitespace-pre-line">
                    {currentPlace.poetryAndExamples.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#FBF9F5]/70">
                  لا يوجد شاهد شعري مذكور في المصدر الأساسي لهذا الموضع.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Place Pills Strip for Track */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {trackPlaces.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStepIndex(idx)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                idx === safeIndex
                  ? 'bg-[#FBF9F5] text-[#0B253A] font-semibold'
                  : 'bg-[#143A57]/60 text-[#FBF9F5]/75 hover:text-[#FBF9F5] border border-[#FBF9F5]/10'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
