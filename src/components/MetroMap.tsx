import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import { metroMap, getLinesAtPosition, getStationById, getAreaForStation } from '../data/mapData';
import type { Station, MetroArea, Line } from '../data/mapData';
import { readUrlState, useUrlSync } from '../hooks/useUrlState';
import LinePath from './LinePath';
import StationComponent from './Station';
import StationDetail from './StationDetail';
import Legend from './Legend';
import Header from './Header';
import SearchBar from './SearchBar';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTourMode } from '../hooks/useTourMode';
import TourOverlay from './TourOverlay';
import AmbientParticles from './AmbientParticles';
import MobileTimeline from './mobile/MobileTimeline';
import CurrentlyBar from './CurrentlyBar';

const MAP_W = metroMap.width;
const MAP_H = metroMap.height;
const GRID_SIZE = 20;
const GRID_PAD = 200;

export default function MetroMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const gridRef = useRef<SVGRectElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  // Read URL params once on mount for initial state
  const initialUrl = useRef(readUrlState());
  const [selectedStation, setSelectedStation] = useState<Station | null>(() => {
    const id = initialUrl.current.station;
    return id ? (getStationById(id) ?? null) : null;
  });
  const [currentArea, setCurrentArea] = useState<string | null>(() => initialUrl.current.area);
  const [dark, setDark] = useState(() => initialUrl.current.theme === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const reducedMotion = useReducedMotion();

  const tour = useTourMode({ svgRef, zoomRef, dimensions, reducedMotion });
  const tourActiveRef = useRef(false);
  tourActiveRef.current = tour.active;

  // Apply dark mode from URL on mount
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state → URL
  useUrlSync(currentArea, selectedStation?.id ?? null, dark);

  // Toggle dark class on <html>
  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInitialTransform = useCallback(() => {
    const padding = 100;
    const scaleX = (dimensions.width - padding * 2) / MAP_W;
    const scaleY = (dimensions.height - padding * 2) / MAP_H;
    const scale = Math.min(scaleX, scaleY, 1.6);
    const tx = (dimensions.width - MAP_W * scale) / 2;
    const ty = (dimensions.height - MAP_H * scale) / 2;
    return zoomIdentity.translate(tx, ty).scale(scale);
  }, [dimensions]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .filter((event) => {
        // Block user gestures during tour (programmatic transforms still work)
        if (tourActiveRef.current) return false;
        // Default d3-zoom filter: ignore secondary buttons, allow wheel/touch
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      })
      .on('zoom', (event) => {
        if (gRef.current) {
          const { x, y, k } = event.transform;
          gRef.current.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
        }
      });

    zoomRef.current = zoomBehavior;
    const sel = select(svg);
    sel.call(zoomBehavior);
    sel.call(zoomBehavior.transform, getInitialTransform());

    return () => {
      sel.on('.zoom', null);
    };
  }, [getInitialTransform]);

  // Parallax grid offset on mouse move
  useEffect(() => {
    const svg = svgRef.current;
    const gridEl = gridRef.current;
    if (!svg || !gridEl || reducedMotion) return;

    const MAX_OFFSET = 5;
    const FACTOR = 0.02;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) * FACTOR;
      const dy = (e.clientY - rect.top - rect.height / 2) * FACTOR;
      const cx = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx));
      const cy = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy));
      gridEl.setAttribute('transform', `translate(${cx}, ${cy})`);
    };

    svg.addEventListener('mousemove', handleMouseMove);
    return () => {
      svg.removeEventListener('mousemove', handleMouseMove);
      gridEl.setAttribute('transform', '');
    };
  }, [reducedMotion]);

  // On mount: zoom to area/station from URL params
  const didRestoreUrl = useRef(false);
  useEffect(() => {
    if (didRestoreUrl.current) return;
    didRestoreUrl.current = true;

    const { area: urlArea, station: urlStation } = initialUrl.current;
    if (!urlArea && !urlStation) return;

    // Find the area to zoom into
    let targetArea: MetroArea | undefined;
    if (urlArea) {
      targetArea = metroMap.areas.find((a) => a.id === urlArea);
    } else if (urlStation) {
      const station = getStationById(urlStation);
      if (station) targetArea = getAreaForStation(station);
    }

    if (!targetArea) return;

    // Defer zoom until D3 zoom behavior is ready
    const timer = setTimeout(() => {
      const svg = svgRef.current;
      const zb = zoomRef.current;
      if (!svg || !zb) return;

      // Compute area bounds for zoom
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const line of targetArea!.lines) {
        for (const station of line.stations) {
          const [x, y] = station.position;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      const padding = 100;
      const areaW = maxX - minX + padding * 2;
      const areaH = maxY - minY + padding * 2;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const scaleX = dimensions.width / areaW;
      const scaleY = dimensions.height / areaH;
      const scale = Math.min(scaleX, scaleY, 3.5);
      const tx = dimensions.width / 2 - centerX * scale;
      const ty = dimensions.height / 2 - centerY * scale;

      const transform = zoomIdentity.translate(tx, ty).scale(scale);
      select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, transform);
    }, 50);

    return () => clearTimeout(timer);
  }, [dimensions, reducedMotion]);

  const zoomToArea = useCallback(
    (area: MetroArea) => {
      const svg = svgRef.current;
      const zb = zoomRef.current;
      if (!svg || !zb) return;

      setCurrentArea(area.id);

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const line of area.lines) {
        for (const station of line.stations) {
          const [x, y] = station.position;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      const padding = 100;
      const areaW = maxX - minX + padding * 2;
      const areaH = maxY - minY + padding * 2;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const scaleX = dimensions.width / areaW;
      const scaleY = dimensions.height / areaH;
      const scale = Math.min(scaleX, scaleY, 3.5);

      const tx = dimensions.width / 2 - centerX * scale;
      const ty = dimensions.height / 2 - centerY * scale;

      const transform = zoomIdentity.translate(tx, ty).scale(scale);
      select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, transform);
    },
    [dimensions, reducedMotion]
  );

  const zoomOut = useCallback(() => {
    const svg = svgRef.current;
    const zb = zoomRef.current;
    if (!svg || !zb) return;

    setCurrentArea(null);
    setSelectedStation(null);
    setFocusedLineId(null);

    select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, getInitialTransform());
  }, [getInitialTransform, reducedMotion]);

  const handleStationSelect = useCallback((station: Station) => {
    if (tourActiveRef.current) return;
    setSelectedStation(station);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    if (tourActiveRef.current) return;
    if (selectedStation) setSelectedStation(null);
    if (focusedLineId) setFocusedLineId(null);
  }, [selectedStation, focusedLineId]);

  const allStationsDeduped = useMemo(() => {
    const seen = new Map<string, { station: Station; lines: Line[] }>();
    const processLine = (line: Line) => {
      for (const station of line.stations) {
        const key = `${station.position[0]},${station.position[1]}`;
        if (!seen.has(key)) {
          seen.set(key, {
            station,
            lines: getLinesAtPosition(station.position[0], station.position[1]),
          });
        }
      }
    };
    for (const area of metroMap.areas) {
      for (const line of area.lines) {
        processLine(line);
      }
    }
    for (const line of metroMap.connectorLines) {
      processLine(line);
    }
    return Array.from(seen.values());
  }, []);

  // Search: compute matching station positions and relevant line IDs
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchingPositions = new Set<string>();
    const relevantLineIds = new Set<string>();

    const allLines = [
      ...metroMap.areas.flatMap((a) => a.lines),
      ...metroMap.connectorLines,
    ];

    for (const line of allLines) {
      for (const station of line.stations) {
        const nameMatch = station.name.toLowerCase().includes(q);
        const descMatch = station.description.toLowerCase().includes(q);
        const tagMatch = station.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;

        if (nameMatch || descMatch || tagMatch) {
          const key = `${station.position[0]},${station.position[1]}`;
          matchingPositions.add(key);
          relevantLineIds.add(line.id);
        }
      }
    }

    return { matchingPositions, relevantLineIds };
  }, [searchQuery]);

  const isSearchActive = searchResults !== null && searchResults.matchingPositions.size > 0;
  const activeLineId = focusedLineId ?? hoveredLineId;

  // Zoom to focused line (or zoom back when cleared)
  const prevFocusedLine = useRef<string | null>(null);
  useEffect(() => {
    const svg = svgRef.current;
    const zb = zoomRef.current;
    if (!svg || !zb) return;

    if (focusedLineId) {
      const allLines = [
        ...metroMap.areas.flatMap((a) => a.lines),
        ...metroMap.connectorLines,
      ];
      const line = allLines.find((l) => l.id === focusedLineId);
      if (!line) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const station of line.stations) {
        const [x, y] = station.position;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      const padding = 120;
      const w = maxX - minX + padding * 2;
      const h = maxY - minY + padding * 2;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const scale = Math.min(dimensions.width / w, dimensions.height / h, 3.5);
      const tx = dimensions.width / 2 - cx * scale;
      const ty = dimensions.height / 2 - cy * scale;

      const transform = zoomIdentity.translate(tx, ty).scale(scale);
      select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, transform);
    } else if (prevFocusedLine.current) {
      select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, getInitialTransform());
    }
    prevFocusedLine.current = focusedLineId;
  }, [focusedLineId, dimensions, reducedMotion, getInitialTransform]);

  // Zoom to search results
  useEffect(() => {
    if (!isSearchActive || !searchResults) return;

    const svg = svgRef.current;
    const zb = zoomRef.current;
    if (!svg || !zb) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const { station } of allStationsDeduped) {
      const key = `${station.position[0]},${station.position[1]}`;
      if (searchResults.matchingPositions.has(key)) {
        const [x, y] = station.position;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (minX === Infinity) return;

    const padding = 120;
    const areaW = maxX - minX + padding * 2;
    const areaH = maxY - minY + padding * 2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = dimensions.width / areaW;
    const scaleY = dimensions.height / areaH;
    const scale = Math.min(scaleX, scaleY, 3.5);

    const tx = dimensions.width / 2 - centerX * scale;
    const ty = dimensions.height / 2 - centerY * scale;

    const transform = zoomIdentity.translate(tx, ty).scale(scale);
    select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, transform);
  }, [searchResults, isSearchActive, allStationsDeduped, dimensions, reducedMotion]);

  // When search is cleared, zoom back out
  const prevSearchActive = useRef(false);
  useEffect(() => {
    if (prevSearchActive.current && !isSearchActive && searchQuery.trim() === '') {
      const svg = svgRef.current;
      const zb = zoomRef.current;
      if (svg && zb) {
        select(svg).transition().duration(reducedMotion ? 0 : 750).call(zb.transform, getInitialTransform());
        setCurrentArea(null);
      }
    }
    prevSearchActive.current = isSearchActive;
  }, [isSearchActive, searchQuery, getInitialTransform, reducedMotion]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const selectedStationLines = selectedStation
    ? getLinesAtPosition(selectedStation.position[0], selectedStation.position[1])
    : [];

  const isMobile = dimensions.width < 768;

  if (isMobile) {
    return (
      <MobileTimeline
        dark={dark}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        selectedStation={selectedStation}
        onSelectStation={handleStationSelect}
        onCloseStation={() => setSelectedStation(null)}
        searchResults={searchResults}
        allStationsDeduped={allStationsDeduped}
        reducedMotion={reducedMotion}
      />
    );
  }

  return (
    <div
      className="w-full h-full relative transition-colors duration-300"
      style={{ backgroundColor: 'var(--map-bg)' }}
    >
      <Header
        onZoomOut={zoomOut}
        currentArea={currentArea}
        dark={dark}
        onToggleTheme={toggleTheme}
        onStartTour={tour.start}
        tourActive={tour.active}
        isSearchActive={isSearchActive}
      />
      {!tour.active && (
        <SearchBar
          onSearch={handleSearch}
          matchCount={searchResults?.matchingPositions.size ?? 0}
          totalCount={allStationsDeduped.length}
        />
      )}
      <Legend
        visible={!currentArea && !isSearchActive && !tour.active}
        onLineHover={setHoveredLineId}
        onLineClick={(lineId) => setFocusedLineId((prev) => prev === lineId ? null : lineId)}
      />
      <CurrentlyBar visible={!currentArea && !tour.active} />

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {searchQuery.trim() && searchResults
          ? `${searchResults.matchingPositions.size} of ${allStationsDeduped.length} stations match "${searchQuery.trim()}"`
          : ''}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {selectedStation
          ? `${selectedStation.name} station selected. ${selectedStation.description}`
          : ''}
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ cursor: 'grab' }}
        onClick={handleBackgroundClick}
        role="img"
        aria-label="Interactive metro map showing projects, experience, education, and skills as subway stations"
      >
        <defs>
          <pattern
            id="grid"
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
              fill="none"
              style={{ stroke: 'var(--map-grid)', transition: 'stroke 0.3s ease' }}
              strokeWidth={0.4}
            />
          </pattern>
        </defs>

        <g ref={gRef}>
          <rect
            x={-GRID_PAD}
            y={-GRID_PAD}
            width={MAP_W + GRID_PAD * 2}
            height={MAP_H + GRID_PAD * 2}
            style={{ fill: 'var(--map-bg)', transition: 'fill 0.3s ease' }}
          />
          <rect
            ref={gridRef}
            x={-GRID_PAD}
            y={-GRID_PAD}
            width={MAP_W + GRID_PAD * 2}
            height={MAP_H + GRID_PAD * 2}
            fill="url(#grid)"
          />

          <AmbientParticles
            width={MAP_W + GRID_PAD * 2}
            height={MAP_H + GRID_PAD * 2}
            offsetX={-GRID_PAD}
            offsetY={-GRID_PAD}
            dark={dark}
            reducedMotion={reducedMotion}
          />

          {metroMap.areas.map((area) => (
            <AreaLabel
              key={area.id}
              area={area}
              onClick={() => { if (!tourActiveRef.current) zoomToArea(area); }}
            />
          ))}

          {metroMap.connectorLines.map((line) => (
            <LinePath
              key={line.id}
              line={line}
              trainsPerLine={1}
              dimmed={
                (isSearchActive && !searchResults!.relevantLineIds.has(line.id)) ||
                (!!activeLineId && activeLineId !== line.id)
              }
              traced={hoveredLineId === line.id || focusedLineId === line.id}
              reducedMotion={reducedMotion}
              dark={dark}
            />
          ))}

          {metroMap.areas.map((area) =>
            area.lines.map((line) => (
              <LinePath
                key={line.id}
                line={line}
                trainsPerLine={2}
                dimmed={
                  (isSearchActive && !searchResults!.relevantLineIds.has(line.id)) ||
                  (!!activeLineId && activeLineId !== line.id)
                }
                traced={hoveredLineId === line.id || focusedLineId === line.id}
                reducedMotion={reducedMotion}
                dark={dark}
              />
            ))
          )}

          <g role="group" aria-label="Metro stations">
            {allStationsDeduped.map(({ station, lines: stLines }) => {
              const posKey = `${station.position[0]},${station.position[1]}`;
              const isMatch = searchResults?.matchingPositions.has(posKey) ?? false;
              const onActiveLine = activeLineId ? stLines.some((l) => l.id === activeLineId) : false;
              return (
                <StationComponent
                  key={`st-${station.position[0]}-${station.position[1]}`}
                  station={station}
                  lines={stLines}
                  onSelect={handleStationSelect}
                  isSelected={
                    selectedStation?.position[0] === station.position[0] &&
                    selectedStation?.position[1] === station.position[1]
                  }
                  dimmed={
                    (isSearchActive && !isMatch) ||
                    (!!activeLineId && !onActiveLine)
                  }
                  highlighted={isSearchActive && isMatch}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </g>

          {/* Tour train — rendered above all other map elements */}
          {tour.active && (
            <circle
              ref={tour.trainRef}
              r={5}
              fill="#f59e0b"
              opacity={0.95}
              style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}
            />
          )}
        </g>
      </svg>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          selectedStation
            ? 'opacity-100 bg-black/5 dark:bg-black/20'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedStation(null)}
        role="presentation"
        aria-hidden="true"
      />

      <StationDetail
        station={selectedStation}
        lines={selectedStationLines}
        onClose={() => setSelectedStation(null)}
      />

      {tour.active && (
        <TourOverlay
          narration={tour.narration}
          progress={tour.progress}
          totalStops={tour.totalStops}
          onExit={tour.stop}
        />
      )}
    </div>
  );
}

function AreaLabel({
  area,
  onClick,
}: {
  area: MetroArea;
  onClick: () => void;
}) {
  const [cx, cy] = area.center;
  const [ox, oy] = area.labelOffset ?? [0, 0];
  const lx = cx + ox;
  const ly = cy + oy;

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${area.name} area. Click to zoom in.`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {/* Focus ring */}
      <rect
        className="focus-ring"
        x={lx - 93}
        y={ly - 17}
        width={186}
        height={34}
        rx={17}
        fill="none"
        stroke="var(--map-interchange-stroke)"
        strokeWidth={2}
        strokeDasharray="4 2"
      />
      <rect
        x={lx - 90}
        y={ly - 14}
        width={180}
        height={28}
        rx={14}
        style={{
          fill: 'var(--map-area-label-bg)',
          stroke: 'var(--map-area-label-border)',
          transition: 'fill 0.3s ease, stroke 0.3s ease',
        }}
        strokeWidth={1}
      />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fontFamily="'Inter', sans-serif"
        style={{
          fill: 'var(--map-area-label-text)',
          userSelect: 'none',
          transition: 'fill 0.3s ease',
        }}
        letterSpacing="2.5"
      >
        {area.name}
      </text>
    </g>
  );
}
