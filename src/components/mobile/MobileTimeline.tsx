import { useEffect, useRef, useCallback } from 'react';
import type { Station, Line } from '../../data/mapData';
import { metroMap, getLinesAtPosition } from '../../data/mapData';
import { SOCIAL_LINKS } from '../../data/socialLinks';
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
  searchQuery,
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
              SM
            </span>
          </div>
          <div>
            <h1 className="text-[10px] font-bold text-[#1a1a1a] dark:text-[#e5e1db] leading-tight tracking-[0.15em] uppercase transition-colors duration-300">
              Sachit Madaan
            </h1>
            <p className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold tracking-[0.2em] uppercase transition-colors duration-300">
              Software Engineer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Social Links */}
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--map-area-label-bg)',
              color: 'var(--map-text)',
              border: '1px solid var(--map-area-label-border)',
            }}
            aria-label="GitHub"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 15c0-1 0-2.5 0-3.2 0-.6.2-1.1.6-1.5-2.2-.2-4.1-1.1-4.1-4.8 0-1 .4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.7-2 4.6-4.1 4.8.3.3.5.9.5 1.8V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--map-area-label-bg)',
              color: 'var(--map-text)',
              border: '1px solid var(--map-area-label-border)',
            }}
            aria-label="LinkedIn"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5.5 7v3.5M8 10.5V8.5a1.5 1.5 0 0 1 3 0v2M5.5 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href={SOCIAL_LINKS.email}
            className="flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--map-area-label-bg)',
              color: 'var(--map-text)',
              border: '1px solid var(--map-area-label-border)',
            }}
            aria-label="Email"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 4.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href={SOCIAL_LINKS.resume}
            download
            className="flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--map-area-label-bg)',
              color: 'var(--map-text)',
              border: '1px solid var(--map-area-label-border)',
            }}
            aria-label="Download Resume"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M4.5 7.5 8 11l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 13.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>

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
        </div>
      </header>

      {/* Search bar */}
      <div className="mobile-search-wrapper shrink-0">
        <SearchBar
          onSearch={onSearch}
          matchCount={searchResults?.matchingPositions.size ?? 0}
          totalCount={allStationsDeduped.length}
          externalQuery={searchQuery}
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
        {/* Profile card — mobile business card */}
        <div
          className="px-4 py-3 transition-colors duration-300"
          style={{
            borderBottom: '1px solid var(--panel-border)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <p
            className="text-[12px] leading-relaxed transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)' }}
          >
            CS student at UC Santa Barbara seeking Summer 2026 SWE internships.
            I build distributed systems and interactive interfaces.
          </p>
          {/* Quick-nav pills */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto">
            {metroMap.areas.map((area) => (
              <button
                key={area.id}
                onClick={() => {
                  document.getElementById(`area-heading-${area.id}`)?.scrollIntoView({
                    behavior: reducedMotion ? 'auto' : 'smooth',
                    block: 'start',
                  });
                }}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-colors duration-200"
                style={{
                  backgroundColor: area.lines[0].color + '18',
                  color: area.lines[0].color,
                  border: `1px solid ${area.lines[0].color}40`,
                }}
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>

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
        onTagClick={(tag) => {
          onCloseStation();
          onSearch(tag);
        }}
      />
    </div>
  );
}
