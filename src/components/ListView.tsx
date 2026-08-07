import { useEffect, useRef, useCallback } from 'react';
import type { Station, Line } from '../data/mapData';
import { metroMap, getLinesAtPosition } from '../data/mapData';
import SearchBar from './SearchBar';
import MobileAreaSection from './mobile/MobileAreaSection';

import MobileBottomSheet from './mobile/MobileBottomSheet';

type Props = {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  searchResults: {
    matchingPositions: Set<string>;
    relevantLineIds: Set<string>;
  } | null;
  allStationsDeduped: Array<{ station: Station; lines: Line[] }>;
  reducedMotion: boolean;
};

export default function ListView({
  searchQuery,
  onSearch,
  selectedStation,
  onSelectStation,
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

    const timer = setTimeout(() => {
      const el = stationRefs.current.get(selectedStation.id);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedStation, reducedMotion]);

  return (
    <div className="w-full h-full flex flex-col pt-[88px]" style={{ backgroundColor: 'var(--map-bg)' }}>
      {/* List wrapper takes up the full width */}
      <div className="w-full px-4 flex-1 flex flex-col min-h-0">
        <div className="shrink-0 py-2">
          <SearchBar
            onSearch={onSearch}
            matchCount={searchResults?.matchingPositions.size ?? 0}
            totalCount={allStationsDeduped.length}
            externalQuery={searchQuery}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-2 pb-24 px-4 custom-scrollbar">
          {/* Profile summary */}
          <div
            className="px-4 py-5 mb-6 rounded-xl transition-colors duration-300 shadow-sm"
            style={{
              backgroundColor: 'var(--map-area-label-bg)',
              border: '1px solid var(--panel-border)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <p
              className="text-sm leading-relaxed transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              CS student at UC Santa Barbara seeking Summer 2026 SWE internships.
              I build distributed systems and interactive interfaces.
            </p>
            {/* Quick-nav pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {metroMap.areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => {
                    document.getElementById(`area-heading-${area.id}`)?.scrollIntoView({
                      behavior: reducedMotion ? 'auto' : 'smooth',
                      block: 'start',
                    });
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all hover:scale-105"
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

          <div className="space-y-6">
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
          </div>
        </div>
      </div>

      <MobileBottomSheet
        station={selectedStation}
        lines={selectedStationLines}
        onClose={() => onSelectStation(null as any)}
        onTagClick={(tag) => {
          onSelectStation(null as any);
          onSearch(tag);
        }}
      />
    </div>
  );
}
