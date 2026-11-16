import React, { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { SOHAR_PLACES } from './data/soharPlaces';
import { PlaceEntry } from './types/atlas';
import { Navbar, NavSectionId } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InteractiveMapSection } from './components/InteractiveMapSection';
import { EncyclopediaSection } from './components/EncyclopediaSection';
import { JourneySection } from './components/JourneySection';
import { MemoryToMapSection } from './components/MemoryToMapSection';
import { PlaceStoryView } from './components/PlaceStoryView';
import { DataEditorModal } from './components/DataEditorModal';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'athar_sohar_places_v1';

export default function App() {
  const [places, setPlaces] = useState<PlaceEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlaceEntry[];
        if (Array.isArray(parsed) && parsed.length === SOHAR_PLACES.length) {
          return parsed;
        }
      }
    } catch {
      // Fall back cleanly to canonical source dataset
    }
    return SOHAR_PLACES;
  });

  const [activeSection, setActiveSection] = useState<NavSectionId>('hero');
  const [selectedStoryPlace, setSelectedStoryPlace] = useState<PlaceEntry | null>(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [editorTarget, setEditorTarget] = useState<{ open: boolean; place?: PlaceEntry }>({
    open: false,
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    } catch {
      // Ignore storage quota issues
    }
  }, [places]);

  const scrollToSection = useCallback((sectionId: NavSectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleLocateOnMap = useCallback(
    (placeId: string) => {
      setFocusedPlaceId(placeId);
      scrollToSection('map-section');
    },
    [scrollToSection]
  );

  const handleClearFocusedPlace = useCallback(() => {
    setFocusedPlaceId(null);
  }, []);

  const handleSavePlace = useCallback((updated: PlaceEntry) => {
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedStoryPlace((prev) => (prev && prev.id === updated.id ? updated : prev));
  }, []);

  const handleResetAll = useCallback(() => {
    setPlaces(SOHAR_PLACES);
    localStorage.removeItem(STORAGE_KEY);
    setSelectedStoryPlace((prev) =>
      prev ? SOHAR_PLACES.find((p) => p.id === prev.id) || null : null
    );
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1A1D20]">
        <Navbar activeSection={activeSection} onNavigate={scrollToSection} />

        <main className="flex-1">
          <HeroSection
            places={places}
            onStartExploring={() => scrollToSection('map-section')}
            onOpenEncyclopedia={() => scrollToSection('encyclopedia-section')}
          />

          <InteractiveMapSection
            places={places}
            focusedPlaceId={focusedPlaceId}
            onClearFocusedPlace={handleClearFocusedPlace}
            onSelectStory={(place) => setSelectedStoryPlace(place)}
          />

          <EncyclopediaSection
            places={places}
            onSelectStory={(place) => setSelectedStoryPlace(place)}
            onLocateOnMap={handleLocateOnMap}
            onOpenEditor={(place) => setEditorTarget({ open: true, place })}
          />

          <JourneySection
            places={places}
            onSelectStory={(place) => setSelectedStoryPlace(place)}
            onLocateOnMap={handleLocateOnMap}
          />

          <MemoryToMapSection places={places} />
        </main>

        <Footer
          onNavigate={scrollToSection}
          onOpenEditor={() => setEditorTarget({ open: true })}
        />

        {/* Independent Place Story Page / Modal */}
        {selectedStoryPlace && (
          <PlaceStoryView
            place={selectedStoryPlace}
            allPlaces={places}
            onClose={() => setSelectedStoryPlace(null)}
            onSelectPlace={(p) => setSelectedStoryPlace(p)}
            onLocateOnMap={handleLocateOnMap}
            onOpenEditor={(place) => setEditorTarget({ open: true, place })}
          />
        )}

        {/* Structured Data Editor Modal */}
        {editorTarget.open && (
          <DataEditorModal
            places={places}
            initialPlace={editorTarget.place}
            onSavePlace={handleSavePlace}
            onResetAll={handleResetAll}
            onClose={() => setEditorTarget({ open: false })}
          />
        )}
      </div>
    </MotionConfig>
  );
}
