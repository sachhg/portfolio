import { useState, useMemo, useRef } from 'react';
import type { Station, Line, MetroArea } from '../../data/mapData';
import { getLinesAtPosition } from '../../data/mapData';
import MobileStationCard from './MobileStationCard';

type Props = {
  area: MetroArea;
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  searchResults: {
    matchingPositions: Set<string>;
    relevantLineIds: Set<string>;
  } | null;
  reducedMotion: boolean;
  /** Ref callback to register station card refs for scroll-into-view */
  stationRefCallback?: (stationId: string, el: HTMLButtonElement | null) => void;
};

export default function MobileAreaSection({
  area,
  selectedStation,
  onSelectStation,
  searchResults,
  reducedMotion,
  stationRefCallback,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const primaryColor = area.lines[0].color;

  // Deduplicate stations by position within this area
  const stationsForArea = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ station: Station; lines: Line[] }> = [];
    for (const line of area.lines) {
      for (const station of line.stations) {
        const key = `${station.position[0]},${station.position[1]}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            station,
            lines: getLinesAtPosition(station.position[0], station.position[1]),
          });
        }
      }
    }
    return result;
  }, [area]);

  // Filter by search results
  const visibleStations = useMemo(() => {
    if (!searchResults) return stationsForArea;
    return stationsForArea.filter(({ station }) => {
      const key = `${station.position[0]},${station.position[1]}`;
      return searchResults.matchingPositions.has(key);
    });
  }, [stationsForArea, searchResults]);

  const isSearchActive = searchResults !== null;
  const matchCount = visibleStations.length;

  // Hide section entirely if search has zero matches
  if (isSearchActive && matchCount === 0) return null;

  return (
    <section aria-labelledby={`area-heading-${area.id}`}>
      {/* Area header */}
      <button
        id={`area-heading-${area.id}`}
        onClick={() => setExpanded((prev) => !prev)}
        className="sticky top-0 z-10 w-full flex items-center justify-between px-4 py-2.5 backdrop-blur-sm transition-colors duration-300"
        style={{
          backgroundColor: 'var(--map-area-label-bg)',
          borderBottom: '1px solid var(--panel-border)',
          fontFamily: "'Inter', sans-serif",
        }}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          {/* Colored line indicator */}
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: primaryColor }}
          />
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ color: 'var(--map-area-label-text)' }}
          >
            {area.name}
          </span>
          {isSearchActive && (
            <span
              className="text-[10px] font-medium transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              ({matchCount})
            </span>
          )}
        </div>
        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="transition-transform duration-200"
          style={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            color: 'var(--panel-text-secondary)',
          }}
        >
          <path
            d="M3.5 5.25L7 8.75L10.5 5.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Collapsible station list */}
      <div
        className="grid transition-[grid-template-rows] overflow-hidden"
        style={{
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transitionDuration: reducedMotion ? '0ms' : '250ms',
        }}
      >
        <div className="min-h-0">
          <div className="pl-3">
            {visibleStations.map(({ station, lines }, index) => {
              const posKey = `${station.position[0]},${station.position[1]}`;
              const isSelected =
                selectedStation?.position[0] === station.position[0] &&
                selectedStation?.position[1] === station.position[1];

              return (
                <MobileStationCard
                  key={posKey}
                  ref={(el) => stationRefCallback?.(station.id, el)}
                  station={station}
                  lines={lines}
                  isSelected={isSelected}
                  onSelect={onSelectStation}
                  isLast={index === visibleStations.length - 1}
                  primaryColor={primaryColor}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
