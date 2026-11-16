import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Layers,
  MapPin,
  Minus,
  Plus,
  Search,
  BookOpen,
  Info,
  X,
} from 'lucide-react';
import { PlaceCategory, PlaceEntry } from '../types/atlas';
import { TERRAIN_IMAGES } from '../data/soharPlaces';

interface InteractiveMapSectionProps {
  places: PlaceEntry[];
  focusedPlaceId: string | null;
  onClearFocusedPlace: () => void;
  onSelectStory: (place: PlaceEntry) => void;
}

const CATEGORIES: ('الكل' | PlaceCategory)[] = [
  'الكل',
  'القرى',
  'الأودية',
  'المناطق التاريخية',
  'الأفلاج',
  'المناطق السكنية',
];

const SOHAR_CENTER: [number, number] = [24.332, 56.585];
const SOHAR_DEFAULT_ZOOM = 11;

function getCategoryStyle(category: PlaceCategory): {
  bg: string;
  ring: string;
  symbol: string;
} {
  switch (category) {
    case 'المناطق التاريخية':
      return {
        bg: '#9E5633',
        ring: '#D6B478',
        symbol:
          '<path d="M6 15h12M7 15v-5l2-1.5V6h2v2h2V6h2v2.5l2 1.5v5" stroke="#FBF9F5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      };
    case 'الأودية':
      return {
        bg: '#0B253A',
        ring: '#C59B57',
        symbol:
          '<path d="M5 14c2-2 4 2 7 0s5 2 7 0M6 10l4-4 3 3 2-2 3 3" stroke="#FBF9F5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      };
    case 'الأفلاج':
      return {
        bg: '#165B6D',
        ring: '#D6B478',
        symbol:
          '<path d="M12 5.5c2.5 3.2 4 5.3 4 7.5a4 4 0 1 1-8 0c0-2.2 1.5-4.3 4-7.5z" stroke="#FBF9F5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      };
    case 'القرى':
      return {
        bg: '#B6873C',
        ring: '#0B253A',
        symbol:
          '<path d="M12 6v10M12 9c-2-2-4.5-1.5-5.5 0M12 9c2-2 4.5-1.5 5.5 0M9 16h6" stroke="#FBF9F5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      };
    case 'المناطق السكنية':
    default:
      return {
        bg: '#2A4D69',
        ring: '#C59B57',
        symbol:
          '<circle cx="12" cy="11" r="3" stroke="#FBF9F5" stroke-width="1.5" fill="none"/><path d="M12 5v2M12 15v2M6 11h2M16 11h2" stroke="#FBF9F5" stroke-width="1.5" stroke-linecap="round"/>',
      };
  }
}

function createHeritageMarkerIcon(place: PlaceEntry, isSelected: boolean): L.DivIcon {
  const style = getCategoryStyle(place.category);
  const scaleClass = isSelected ? 'scale-125' : '';
  const shadow = isSelected
    ? '0 8px 20px rgba(158, 86, 51, 0.45)'
    : '0 4px 10px rgba(11, 37, 58, 0.35)';

  return L.divIcon({
    className: 'sohar-marker-wrapper',
    iconSize: [38, 44],
    iconAnchor: [19, 42],
    html: `
      <div class="sohar-marker-pin flex flex-col items-center ${scaleClass}" title="${place.name}">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${style.bg};
          border: 2px solid ${isSelected ? '#FBF9F5' : style.ring};
          box-shadow: ${shadow};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" width="18" height="18" style="transform: rotate(45deg);">
            ${style.symbol}
          </svg>
        </div>
      </div>
    `,
  });
}

function getSemanticLabel(type: PlaceEntry['semanticLinkType']): string {
  switch (type) {
    case 'direct_match':
      return 'ارتباط دلالي واضح بالفصحى';
    case 'possible_link':
      return 'تقارب دلالي محتمل';
    case 'no_link':
      return 'لا يظهر ارتباط دلالي مباشر';
    case 'proper_noun':
    default:
      return 'اسم علم أو موضع تاريخي';
  }
}

export const InteractiveMapSection: React.FC<InteractiveMapSectionProps> = ({
  places,
  focusedPlaceId,
  onClearFocusedPlace,
  onSelectStory,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<'الكل' | PlaceCategory>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>('al-hujrah');
  const [tileMode, setTileMode] = useState<'osm' | 'carto'>('osm');
  const [showUnmappedDrawer, setShowUnmappedDrawer] = useState(false);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim();
    return places.filter((p) => {
      const catMatch = selectedCategory === 'الكل' || p.category === selectedCategory;
      const searchMatch =
        q === '' ||
        p.name.includes(q) ||
        p.typeLabel.includes(q) ||
        (p.linguisticRoot && p.linguisticRoot.includes(q));
      return catMatch && searchMatch;
    });
  }, [places, selectedCategory, searchQuery]);

  const mappedPlaces = useMemo(
    () => filteredPlaces.filter((p) => p.coordinates !== null),
    [filteredPlaces]
  );

  const unmappedPlaces = useMemo(
    () => filteredPlaces.filter((p) => p.coordinates === null),
    [filteredPlaces]
  );

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId) || null,
    [places, selectedPlaceId]
  );

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SOHAR_CENTER,
      zoom: SOHAR_DEFAULT_ZOOM,
      minZoom: 9,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: true,
    });

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Switch OSM / CartoDB free keyless tile layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const url =
      tileMode === 'osm'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const attribution =
      tileMode === 'osm'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        : '&copy; OpenStreetMap &copy; CARTO';

    const layer = L.tileLayer(url, {
      attribution,
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = layer;
  }, [tileMode]);

  // Render markers whenever mappedPlaces or selectedPlaceId updates
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersLayer || !map) return;

    markersLayer.clearLayers();

    mappedPlaces.forEach((place) => {
      if (!place.coordinates) return;
      const isSelected = place.id === selectedPlaceId;
      const marker = L.marker(place.coordinates, {
        icon: createHeritageMarkerIcon(place, isSelected),
        zIndexOffset: isSelected ? 600 : 0,
      });

      marker.bindTooltip(place.name, {
        direction: 'top',
        offset: [0, -34],
        className: 'font-sans-ar text-xs font-semibold px-2 py-1',
      });

      marker.on('click', () => {
        setSelectedPlaceId(place.id);
        map.flyTo(place.coordinates!, Math.max(map.getZoom(), 13), {
          duration: 0.7,
        });
      });

      marker.addTo(markersLayer);
    });
  }, [mappedPlaces, selectedPlaceId]);

  // Handle external focus request from Encyclopedia / Story View
  useEffect(() => {
    if (!focusedPlaceId) return;
    const target = places.find((p) => p.id === focusedPlaceId);
    if (target) {
      setSelectedCategory('الكل');
      setSearchQuery('');
      setSelectedPlaceId(target.id);
      if (target.coordinates && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(target.coordinates, 14, { duration: 0.8 });
      }
    }
    onClearFocusedPlace();
  }, [focusedPlaceId, places, onClearFocusedPlace]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.flyTo(SOHAR_CENTER, SOHAR_DEFAULT_ZOOM, { duration: 0.65 });
  };

  const handleJumpToPlace = (place: PlaceEntry) => {
    setSelectedPlaceId(place.id);
    if (place.coordinates && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(place.coordinates, 14, { duration: 0.75 });
    }
  };

  return (
    <section
      id="map-section"
      className="py-16 lg:py-20 bg-[#FBF9F5] border-b border-[#D6CEBE]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#9E5633] tracking-wide">
              قلب المُعجم · خريطة ولاية صحار التفاعلية
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B253A]">
              استكشف جغرافية الأسماء في صحار
            </h2>
            <p className="text-sm sm:text-base text-[#555E68] leading-relaxed">
              تُظهر الخريطة المواضع التي أمكن التحقق من إحداثياتها بدقة في ولاية صحار. اضغط على أي
              علامة تراثية لقراءة نبذة المكان واكتشاف حكاية اسمه.
            </p>
          </div>

          {/* Search Input & Unmapped Drawer Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#555E68] absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قرية، وادي، أو منطقة..."
                className="w-full pr-10 pl-3 py-2.5 text-sm bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg text-[#1A1D20] placeholder:text-[#555E68] focus:outline-none focus:border-[#0B253A]"
                aria-label="البحث في خريطة صحار"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowUnmappedDrawer((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showUnmappedDrawer
                  ? 'bg-[#0B253A] text-[#FBF9F5] border-[#0B253A]'
                  : 'bg-[#F3EFE6] text-[#0B253A] border-[#D6CEBE] hover:border-[#0B253A]'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>مواضع قيد الرصد ({unmappedPlaces.length})</span>
            </button>
          </div>
        </div>

        {/* Interactive Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[#D6CEBE] py-3">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="تصنيفات المواقع">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0B253A] text-[#FBF9F5]'
                      : 'text-[#555E68] hover:bg-[#F3EFE6] hover:text-[#0B253A]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Clean unboxed map legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#555E68]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B6873C]" aria-hidden="true" />
              القرى
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B253A]" aria-hidden="true" />
              الأودية
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9E5633]" aria-hidden="true" />
              التاريخية
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#165B6D]" aria-hidden="true" />
              الأفلاج
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A4D69]" aria-hidden="true" />
              السكنية
            </span>
          </div>
        </div>

        {/* Map + Story Preview Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Map Canvas */}
          <div className="lg:col-span-8 relative rounded-xl overflow-hidden border border-[#D6CEBE] bg-[#E8EEF2] min-h-[460px] lg:min-h-[580px]">
            <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[580px] z-0" />

            {/* Custom Heritage Map Controls (Top-Left in RTL) */}
            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
              <div className="flex flex-col bg-[#FBF9F5]/95 border border-[#D6CEBE] rounded-lg overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-10 h-10 flex items-center justify-center text-[#0B253A] hover:bg-[#F3EFE6] border-b border-[#D6CEBE] transition-colors cursor-pointer"
                  aria-label="تكبير الخريطة"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-10 h-10 flex items-center justify-center text-[#0B253A] hover:bg-[#F3EFE6] border-b border-[#D6CEBE] transition-colors cursor-pointer"
                  aria-label="تصغير الخريطة"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="w-10 h-10 flex items-center justify-center text-[#0B253A] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                  aria-label="إعادة توسيط ولاية صحار"
                  title="إعادة التوسيط على ولاية صحار"
                >
                  <Compass className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTileMode((prev) => (prev === 'osm' ? 'carto' : 'osm'))}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FBF9F5]/95 border border-[#D6CEBE] rounded-lg text-[#0B253A] hover:bg-[#F3EFE6] shadow-sm transition-colors cursor-pointer"
                title="تبديل نمط الخريطة المفتوحة"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{tileMode === 'osm' ? 'خريطة طبوغرافية' : 'خريطة OSM'}</span>
              </button>
            </div>

            {/* Bottom Coordinate Counter Bar */}
            <div className="absolute bottom-4 right-4 z-[400] bg-[#FBF9F5]/95 border border-[#D6CEBE] rounded-lg px-3.5 py-2 text-xs text-[#1A1D20] shadow-sm">
              <span className="font-mono-num font-semibold text-[#0B253A]">
                {mappedPlaces.length}
              </span>
              <span className="text-[#555E68] ms-1.5">موقعًا مرصودًا ضمن نطاق صحار</span>
            </div>

            {/* Unmapped Places Honest Drawer Overlay */}
            {showUnmappedDrawer && (
              <div className="absolute inset-y-4 right-4 z-[450] w-80 max-w-[calc(100%-2rem)] bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl shadow-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[#D6CEBE] flex items-center justify-between gap-2 bg-[#F3EFE6]">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B253A]">مواضع دون إحداثيات مؤكدة</h3>
                    <p className="text-xs text-[#555E68] mt-0.5">
                      مُدرجة في الموسوعة دون وضع علامات تخمينية
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUnmappedDrawer(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555E68] hover:text-[#0B253A] hover:bg-[#D6CEBE]/40 cursor-pointer"
                    aria-label="إغلاق القائمة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto divide-y divide-[#D6CEBE]/60 p-2">
                  {unmappedPlaces.length === 0 ? (
                    <p className="p-4 text-xs text-[#555E68] text-center">
                      لا توجد نتائج مطابقة ضمن هذه الفئة.
                    </p>
                  ) : (
                    unmappedPlaces.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => onSelectStory(place)}
                        className="w-full text-right p-3 hover:bg-[#F3EFE6] rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-[#0B253A] group-hover:text-[#9E5633]">
                            {place.name}
                          </span>
                          <span className="text-xs text-[#555E68]">{place.typeLabel}</span>
                        </div>
                        <p className="text-xs text-[#555E68] mt-1 line-clamp-1">
                          {place.coordinateNote}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right/Side Preview Card Panel */}
          <aside className="lg:col-span-4 flex flex-col justify-between bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl overflow-hidden">
            {selectedPlace ? (
              <div className="flex flex-col h-full">
                {/* Place Terrain Image */}
                <div className="relative h-52 bg-[#0B253A] overflow-hidden shrink-0">
                  <img
                    src={TERRAIN_IMAGES[selectedPlace.imageKey].src}
                    alt={TERRAIN_IMAGES[selectedPlace.imageKey].alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0B253A]/85 via-[#0B253A]/20 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-4 inset-x-5 text-[#FBF9F5]">
                    <div className="flex items-center gap-2 text-xs text-[#D6B478] mb-1">
                      <span>{selectedPlace.typeLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>حرف {selectedPlace.letter}</span>
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight">
                      {selectedPlace.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <p className="text-sm sm:text-base text-[#1A1D20] leading-relaxed">
                      {selectedPlace.definition}
                    </p>

                    <div className="pt-3 border-t border-[#D6CEBE] space-y-2 text-xs text-[#555E68]">
                      <div className="flex items-center justify-between gap-2">
                        <span>الجذر اللغوي</span>
                        <span className="font-semibold text-[#0B253A]">
                          {selectedPlace.linguisticRoot
                            ? `(${selectedPlace.linguisticRoot})`
                            : 'اسم موضعي غير مشتق'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>الدلالة المعجمية</span>
                        <span className="font-medium text-[#9E5633]">
                          {getSemanticLabel(selectedPlace.semanticLinkType)}
                        </span>
                      </div>
                      {selectedPlace.coordinates && (
                        <div className="flex items-center justify-between gap-2">
                          <span>الإحداثيات الموثقة</span>
                          <span className="font-mono-num text-[#0B253A]" dir="ltr">
                            {selectedPlace.coordinates[0].toFixed(4)}° N,{' '}
                            {selectedPlace.coordinates[1].toFixed(4)}° E
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Action: Discover Story */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectStory(selectedPlace)}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold bg-[#0B253A] hover:bg-[#143A57] text-[#FBF9F5] rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B57]"
                    >
                      <BookOpen className="w-4 h-4 text-[#D6B478]" />
                      <span>اكتشف الحكاية</span>
                    </button>

                    {/* Quick Switcher between top mapped items */}
                    <div className="pt-2 border-t border-[#D6CEBE]">
                      <p className="text-xs text-[#555E68] mb-2">انتقال سريع لمواقع مرصودة:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mappedPlaces.slice(0, 6).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleJumpToPlace(item)}
                            className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                              item.id === selectedPlace.id
                                ? 'bg-[#C59B57]/25 text-[#0B253A] font-semibold'
                                : 'bg-[#FBF9F5] text-[#555E68] hover:text-[#0B253A] border border-[#D6CEBE]'
                            }`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full gap-3">
                <MapPin className="w-8 h-8 text-[#9E5633]" />
                <h3 className="font-editorial text-xl font-bold text-[#0B253A]">
                  اختر موقعًا على الخريطة
                </h3>
                <p className="text-sm text-[#555E68]">
                  اضغط على أي علامة لاستعراض بطاقة المكان والانتقال إلى حكاية اسمه.
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Search Results Quick Strip when searching */}
        {searchQuery.trim() !== '' && (
          <div className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#0B253A]">
                نتائج البحث في مُعجم سبع المدن ({filteredPlaces.length})
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#9E5633] hover:underline cursor-pointer"
              >
                مسح البحث
              </button>
            </div>
            {filteredPlaces.length === 0 ? (
              <p className="text-sm text-[#555E68]">
                لم يُعثر على موضع بهذا الاسم في مصدر ولاية صحار.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {filteredPlaces.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => (p.coordinates ? handleJumpToPlace(p) : onSelectStory(p))}
                    className="text-right p-3 bg-[#FBF9F5] border border-[#D6CEBE] hover:border-[#0B253A] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#0B253A]">{p.name}</span>
                      <span className="text-[11px] text-[#9E5633]">
                        {p.coordinates ? 'على الخريطة' : 'موسوعة'}
                      </span>
                    </div>
                    <p className="text-xs text-[#555E68] mt-1">{p.typeLabel}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
