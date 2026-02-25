import { useRef, useMemo } from 'react';
import type { Line, MetroArea } from '../data/mapData';

type Props = {
  lines: Line[];
  areas: MetroArea[];
  mapWidth: number;
  mapHeight: number;
  transform: { x: number; y: number; k: number };
  viewportWidth: number;
  viewportHeight: number;
  onNavigate: (mapX: number, mapY: number) => void;
  dark: boolean;
};

const MINI_W = 160;
const MINI_H = Math.round((160 * 600) / 1100); // ≈87

function buildPathD(positions: [number, number][]): string {
  if (positions.length === 0) return '';
  let d = `M ${positions[0][0]} ${positions[0][1]}`;
  for (let i = 1; i < positions.length; i++) {
    d += ` L ${positions[i][0]} ${positions[i][1]}`;
  }
  return d;
}

export default function MiniMap({
  lines,
  mapWidth,
  mapHeight,
  transform,
  viewportWidth,
  viewportHeight,
  onNavigate,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Deduplicate stations by position for dot rendering
  const stationDots = useMemo(() => {
    const seen = new Set<string>();
    const dots: { x: number; y: number; color: string }[] = [];
    for (const line of lines) {
      for (const station of line.stations) {
        const key = `${station.position[0]},${station.position[1]}`;
        if (!seen.has(key)) {
          seen.add(key);
          dots.push({ x: station.position[0], y: station.position[1], color: line.color });
        }
      }
    }
    return dots;
  }, [lines]);

  // Viewport indicator in map coordinates
  const vx = -transform.x / transform.k;
  const vy = -transform.y / transform.k;
  const vw = viewportWidth / transform.k;
  const vh = viewportHeight / transform.k;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mapX = ((e.clientX - rect.left) / rect.width) * mapWidth;
    const mapY = ((e.clientY - rect.top) / rect.height) * mapHeight;
    onNavigate(mapX, mapY);
  };

  return (
    <div
      className="fixed z-20 pointer-events-auto"
      style={{
        right: 16,
        bottom: 48,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="rounded-lg shadow-lg overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
        }}
      >
        <svg
          ref={svgRef}
          width={MINI_W}
          height={MINI_H}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          style={{ cursor: 'pointer', display: 'block' }}
          onClick={handleClick}
          aria-label="Mini-map navigator — click to pan the main map"
          role="img"
        >
          {/* Background */}
          <rect
            width={mapWidth}
            height={mapHeight}
            style={{ fill: 'var(--map-bg)' }}
          />

          {/* Simplified line paths */}
          {lines.map((line) => {
            const positions = line.stations.map((s) => s.position);
            if (positions.length < 2) return null;
            return (
              <path
                key={line.id}
                d={buildPathD(positions)}
                fill="none"
                stroke={line.color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
            );
          })}

          {/* Station dots */}
          {stationDots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={8}
              fill="var(--map-station-fill)"
              stroke={dot.color}
              strokeWidth={3}
            />
          ))}

          {/* Viewport indicator */}
          <rect
            x={vx}
            y={vy}
            width={vw}
            height={vh}
            fill="var(--map-interchange-stroke)"
            fillOpacity={0.08}
            stroke="var(--map-interchange-stroke)"
            strokeWidth={6}
            strokeOpacity={0.6}
            rx={4}
          />
        </svg>
      </div>
    </div>
  );
}
