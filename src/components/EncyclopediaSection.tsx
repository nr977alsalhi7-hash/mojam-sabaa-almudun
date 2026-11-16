import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BookOpen,
  FileEdit,
  MapPin,
  Search,
} from 'lucide-react';
import { PlaceCategory, PlaceEntry } from '../types/atlas';
import { TERRAIN_IMAGES } from '../data/soharPlaces';

interface EncyclopediaSectionProps {
  places: PlaceEntry[];
  onSelectStory: (place: PlaceEntry) => void;
  onLocateOnMap: (placeId: string) => void;
  onOpenEditor: (place?: PlaceEntry) => void;
}

const CATEGORIES: ('الكل' | PlaceCategory)[] = [
  'الكل',
  'القرى',
  'الأودية',
  'المناطق التاريخية',
  'الأفلاج',
  'المناطق السكنية',
];

type SortMode = 'alpha-asc' | 'alpha-desc' | 'source';
type CoordFilter = 'all' | 'mapped' | 'unmapped';

export const EncyclopediaSection: React.FC<EncyclopediaSectionProps> = ({
  places,
  onSelectStory,
  onLocateOnMap,
  onOpenEditor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'الكل' | PlaceCategory>('الكل');
  const [coordFilter, setCoordFilter] = useState<CoordFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('alpha-asc');
  const [selectedLetter, setSelectedLetter] = useState<string>('الكل');

  const availableLetters = useMemo(() => {
    const letters = Array.from(new Set(places.map((p) => p.letter)));
    return letters.sort((a: string, b: string) => a.localeCompare(b, 'ar'));
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim();
    const list = places.filter((p) => {
      const catMatch = selectedCategory === 'الكل' || p.category === selectedCategory;
      const letterMatch = selectedLetter === 'الكل' || p.letter === selectedLetter;
      const coordMatch =
        coordFilter === 'all' ||
        (coordFilter === 'mapped' && p.coordinates !== null) ||
        (coordFilter === 'unmapped' && p.coordinates === null);
      const queryMatch =
        q === '' ||
        p.name.includes(q) ||
        p.definition.includes(q) ||
        p.historicalContext.includes(q) ||
        (p.linguisticRoot && p.linguisticRoot.includes(q)) ||
        (p.poetryAndExamples && p.poetryAndExamples.text.includes(q));

      return catMatch && letterMatch && coordMatch && queryMatch;
    });

    if (sortMode === 'alpha-asc') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }
    if (sortMode === 'alpha-desc') {
      return [...list].sort((a, b) => b.name.localeCompare(a.name, 'ar'));
    }
    return list;
  }, [places, searchQuery, selectedCategory, selectedLetter, coordFilter, sortMode]);

  return (
    <section
      id="encyclopedia-section"
      className="py-16 lg:py-24 bg-[#F3EFE6]/60 border-b border-[#D6CEBE]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#9E5633] tracking-wide">
              السجل التوثيقي الكامل · {places.length} موضعًا في ولاية صحار
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B253A]">
              موسوعة أسماء صحار
            </h2>
            <p className="text-sm sm:text-base text-[#555E68] leading-relaxed">
              تضم الموسوعة جميع المواضع المستخرجة من المصدر الأساسي مرتبةً أبجديًا ومصنفةً حسب
              نوع المكان، مع إمكانية الانتقال المباشر إلى الإحداثيات المؤكدة على الخريطة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenEditor()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-[#0B253A] bg-[#FBF9F5] border border-[#D6CEBE] hover:border-[#0B253A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileEdit className="w-4 h-4 text-[#9E5633]" />
            <span>تحرير وتصدير البيانات</span>
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#555E68] absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الجذر اللغوي، أو الشاهد الشعري..."
                className="w-full pr-10 pl-3 py-2.5 text-sm bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg text-[#1A1D20] placeholder:text-[#555E68] focus:outline-none focus:border-[#0B253A]"
                aria-label="البحث في موسوعة أسماء صحار"
              />
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#555E68] shrink-0" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="w-full py-2.5 px-3 text-sm bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg text-[#0B253A] focus:outline-none focus:border-[#0B253A] cursor-pointer"
                aria-label="ترتيب المواقع"
              >
                <option value="alpha-asc">ترتيب أبجدي (أ - ي)</option>
                <option value="alpha-desc">ترتيب أبجدي (ي - أ)</option>
                <option value="source">حسب تسلسل المصدر</option>
              </select>
            </div>

            {/* Coordinate Status Filter */}
            <div className="md:col-span-4 flex items-center gap-1 p-1 bg-[#F3EFE6] rounded-lg border border-[#D6CEBE]/70">
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'mapped', label: 'على الخريطة' },
                  { id: 'unmapped', label: 'قيد الرصد' },
                ] as { id: CoordFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCoordFilter(tab.id)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    coordFilter === tab.id
                      ? 'bg-[#FBF9F5] text-[#0B253A] shadow-sm font-semibold'
                      : 'text-[#555E68] hover:text-[#0B253A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D6CEBE]/60">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#0B253A] text-[#FBF9F5]'
                    : 'text-[#555E68] hover:bg-[#F3EFE6] hover:text-[#0B253A]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Arabic Letter Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D6CEBE]/60">
            <span className="text-xs text-[#555E68] me-1">الحرف الهجائي:</span>
            <button
              type="button"
              onClick={() => setSelectedLetter('الكل')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                selectedLetter === 'الكل'
                  ? 'bg-[#9E5633] text-[#FBF9F5] font-semibold'
                  : 'text-[#555E68] hover:bg-[#F3EFE6]'
              }`}
            >
              الكل
            </button>
            {availableLetters.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className={`w-7 h-7 flex items-center justify-center text-xs rounded-md transition-colors cursor-pointer ${
                  selectedLetter === letter
                    ? 'bg-[#9E5633] text-[#FBF9F5] font-semibold'
                    : 'text-[#555E68] hover:bg-[#F3EFE6] hover:text-[#0B253A]'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#555E68]">
          <span>
            عرض{' '}
            <strong className="font-mono-num text-[#0B253A]">{filteredPlaces.length}</strong> من
            أصل <strong className="font-mono-num text-[#0B253A]">{places.length}</strong> موضعًا
          </span>
          {(searchQuery || selectedCategory !== 'الكل' || selectedLetter !== 'الكل' || coordFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('الكل');
                setSelectedLetter('الكل');
                setCoordFilter('all');
              }}
              className="text-[#9E5633] hover:underline font-medium cursor-pointer"
            >
              إعادة ضبط المرشحات
            </button>
          )}
        </div>

        {/* Encyclopedia Cards Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl p-12 text-center space-y-2">
            <h3 className="font-editorial text-xl font-bold text-[#0B253A]">
              لا توجد مواضع مطابقة للبحث
            </h3>
            <p className="text-sm text-[#555E68]">
              جرّب تغيير كلمات البحث أو إعادة ضبط التصنيفات لعرض جميع الأسماء الموثقة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => {
              const terrain = TERRAIN_IMAGES[place.imageKey];
              return (
                <article
                  key={place.id}
                  className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#0B253A]/50 transition-colors"
                >
                  <div>
                    {/* Subtle visual top band */}
                    <div className="h-36 bg-[#0B253A] relative overflow-hidden">
                      <img
                        src={terrain.src}
                        alt={terrain.alt}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-[#0B253A]/80 via-[#0B253A]/20 to-transparent"
                        aria-hidden="true"
                      />
                      <div className="absolute bottom-3 inset-x-4 flex items-end justify-between text-[#FBF9F5]">
                        <h3 className="font-editorial text-2xl font-bold leading-snug">
                          {place.name}
                        </h3>
                        <span className="font-editorial text-lg text-[#D6B478] shrink-0">
                          {place.letter}
                        </span>
                      </div>
                    </div>

                    {/* Zero-pill quiet metadata line + short definition */}
                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#555E68]">
                        <span className="font-medium text-[#9E5633]">{place.typeLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {place.linguisticRoot
                            ? `الجذر: (${place.linguisticRoot})`
                            : 'اسم موضعي'}
                        </span>
                        {place.poetryAndExamples && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#0B253A]">شاهد شعري</span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-[#1A1D20] leading-relaxed line-clamp-3">
                        {place.definition}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-4 border-t border-[#D6CEBE]/70 flex items-center justify-between gap-2 bg-[#F3EFE6]/40">
                    <button
                      type="button"
                      onClick={() => onSelectStory(place)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0B253A] hover:bg-[#143A57] text-[#FBF9F5] rounded-lg transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D6B478]" />
                      <span>اقرأ الحكاية</span>
                    </button>

                    {place.coordinates ? (
                      <button
                        type="button"
                        onClick={() => onLocateOnMap(place.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0B253A] hover:text-[#9E5633] transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>على الخريطة</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#555E68]">دون إحداثي مؤكد</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
