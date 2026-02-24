import { useEffect, useRef, useCallback } from 'react';
import type { Station, Line } from '../../data/mapData';
import { metroMap, getLinesAtPosition } from '../../data/mapData';
import SearchBar from '../SearchBar';
import MobileAreaSection from './MobileAreaSection';
import MobileBottomSheet from './MobileBottomSheet';

type Props = {
  dark: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  onCloseStation: () => void;
  searchResults: {
    matchingPositions: Set<string>;
    relevantLineIds: Set<string>;
  } | null;
  allStationsDeduped: Array<{ station: Station; lines: Line[] }>;
  reducedMotion: boolean;
};

export default function MobileTimeline({
  dark,
  onToggleTheme,
  onSearch,
  selectedStation,
  onSelectStation,
  onCloseStation,
  searchResults,
  allStationsDeduped,
  reducedMotion,
}: Props) {
  const selectedStationLines = selectedStation
    ? getLinesAtPosition(selectedStation.position[0], selectedStation.position[1])
    : [];

  // Station card refs for scroll-into-view on deep link
  const stationRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const didScrollToInitial = useRef(false);

  const stationRefCallback = useCallback((stationId: string, el: HTMLButtonElement | null) => {
    if (el) {
      stationRefs.current.set(stationId, el);
    } else {
      stationRefs.current.delete(stationId);
    }
  }, []);

  // Scroll to selected station on mount (deep link)
  useEffect(() => {
    if (didScrollToInitial.current || !selectedStation) return;
    didScrollToInitial.current = true;

    // Defer to allow DOM to settle after first render
    const timer = setTimeout(() => {
      const el = stationRefs.current.get(selectedStation.id);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedStation, reducedMotion]);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: 'var(--map-bg)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--map-area-label-bg)',
          borderBottom: '1px solid var(--panel-border)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] dark:bg-[#e5e1db] flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300">
            <span className="text-white dark:text-[#0d1117] font-bold text-[10px] tracking-tight transition-colors duration-300">
              SN
            </span>
          </div>
          <div>
            <h1 className="text-[10px] font-bold text-[#1a1a1a] dark:text-[#e5e1db] leading-tight tracking-[0.15em] uppercase transition-colors duration-300">
              SN Metropolitan
            </h1>
            <p className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold tracking-[0.2em] uppercase transition-colors duration-300">
              Transit Authority
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-sm transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: 'var(--map-area-label-bg)',
            color: 'var(--map-text)',
            border: '1px solid var(--map-area-label-border)',
          }}
          onClick={onToggleTheme}
          aria-label={dark ? 'Switch to day service' : 'Switch to night service'}
        >
          {dark ? (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.6 3.4L11.5 4.5M4.5 11.5L3.4 12.6M12.6 12.6L11.5 11.5M4.5 4.5L3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Day
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5 6 6 0 1 0 13.5 9.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Night
            </>
          )}
        </button>
      </header>

      {/* Search bar */}
      <div className="mobile-search-wrapper shrink-0">
        <SearchBar
          onSearch={onSearch}
          matchCount={searchResults?.matchingPositions.size ?? 0}
          totalCount={allStationsDeduped.length}
        />
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedStation
          ? `${selectedStation.name} station selected. ${selectedStation.description}`
          : ''}
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto mobile-timeline-scroll">
        {metroMap.areas.map((area) => (
          <MobileAreaSection
            key={area.id}
            area={area}
            selectedStation={selectedStation}
            onSelectStation={onSelectStation}
            searchResults={searchResults}
            reducedMotion={reducedMotion}
            stationRefCallback={stationRefCallback}
          />
        ))}

        {/* Bottom spacer for safe area */}
        <div className="h-6" />
      </div>

      {/* Bottom sheet for station detail */}
      <MobileBottomSheet
        station={selectedStation}
        lines={selectedStationLines}
        onClose={onCloseStation}
      />
    </div>
  );
}
