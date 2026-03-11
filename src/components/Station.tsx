import { memo, useState } from 'react';
import type { Station as StationT, Line } from '../data/mapData';

type Props = {
  station: StationT;
  lines: Line[];
  onSelect: (station: StationT) => void;
  isSelected: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
  reducedMotion?: boolean;
  onHover?: (station: StationT | null) => void;
  dark?: boolean;
};

const STATION_RADIUS = 4.5;
const INTERCHANGE_RADIUS = 6.5;
const FEATURED_RADIUS = 5.5;
const ABOUT_RADIUS = 8;
const LABEL_GAP = 8;
const ABOUT_COLOR = '#D4A017';

function StationComponent({
  station,
  lines,
  onSelect,
  isSelected,
  dimmed = false,
  highlighted = false,
  reducedMotion = false,
  onHover,
  dark = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [x, y] = station.position;
  const isAbout = station.id === 'about';
  const isFeatured = !!station.featured;
  const isInterchange = station.isInterchange || lines.length > 1;
  const r = isAbout ? ABOUT_RADIUS : isInterchange ? INTERCHANGE_RADIUS : isFeatured ? FEATURED_RADIUS : STATION_RADIUS;
  const dir = station.labelDir ?? 'above';

  let lx = x;
  let ly = y;
  let anchor: 'middle' | 'start' | 'end' = 'middle';
  let baseline: 'auto' | 'hanging' = 'auto';

  switch (dir) {
    case 'above':
      ly = y - r - LABEL_GAP;
      break;
    case 'below':
      ly = y + r + LABEL_GAP;
      baseline = 'hanging';
      break;
    case 'left':
      lx = x - r - LABEL_GAP;
      anchor = 'end';
      ly = y;
      break;
    case 'right':
      lx = x + r + LABEL_GAP;
      anchor = 'start';
      ly = y;
      break;
  }

  const lineDescription = isInterchange
    ? `Interchange with ${lines.map((l) => l.name).join(', ')}`
    : `On ${lines[0]?.name ?? 'unknown line'}`;

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${station.name} station. ${station.description}. ${lineDescription}.`}
      aria-pressed={isSelected}
      style={{
        cursor: 'pointer',
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 0.4s ease',
        outline: 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(station);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onSelect(station);
        }
      }}
      onMouseEnter={() => { setHovered(true); onHover?.(station); }}
      onMouseLeave={() => { setHovered(false); onHover?.(null); }}
    >
      <circle cx={x} cy={y} r={r + 10} fill="transparent" />

      {/* About station — persistent pulsing beacon */}
      {isAbout && !reducedMotion && (
        <circle
          cx={x}
          cy={y}
          r={r + 4}
          fill="none"
          stroke={ABOUT_COLOR}
          strokeWidth={1.5}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            values={`${r + 4};${r + 14};${r + 4}`}
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {isAbout && reducedMotion && (
        <circle
          cx={x}
          cy={y}
          r={r + 5}
          fill="none"
          stroke={ABOUT_COLOR}
          strokeWidth={1.5}
          opacity={0.25}
        />
      )}

      {/* Hover pulse ripple — gentle continuous sonar while hovering */}
      {hovered && !highlighted && !reducedMotion && (
        <circle
          cx={x}
          cy={y}
          r={r + 3}
          fill="none"
          stroke={lines[0]?.color ?? 'var(--map-interchange-stroke)'}
          strokeWidth={2}
          opacity={0.4}
        >
          <animate
            attributeName="r"
            values={`${r + 3};${r + 12};${r + 3}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.05;0.4"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Focus ring — shown via CSS :focus-visible */}
      <circle
        className="focus-ring"
        cx={x}
        cy={y}
        r={r + 6}
        fill="none"
        stroke="var(--map-interchange-stroke)"
        strokeWidth={2}
        strokeDasharray="4 2"
      />

      {/* Highlight pulse ring */}
      {highlighted && (
        <circle
          cx={x}
          cy={y}
          r={reducedMotion ? r + 5 : r + 3}
          fill="none"
          stroke={lines[0]?.color ?? 'var(--map-interchange-stroke)'}
          strokeWidth={2}
          opacity={0.6}
        >
          {!reducedMotion && (
            <>
              <animate
                attributeName="r"
                values={`${r + 3};${r + 10};${r + 3}`}
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>
      )}

      {/* Dark mode selected glow ring */}
      {isSelected && dark && (
        <circle
          cx={x}
          cy={y}
          r={r + 4}
          fill="none"
          stroke={lines[0]?.color ?? 'var(--map-interchange-stroke)'}
          strokeWidth={1.5}
          opacity={0.8}
          style={{ filter: `drop-shadow(0 0 5px ${lines[0]?.color ?? '#d4d0c8'})` }}
        />
      )}

      {isAbout ? (
        <>
          <circle
            cx={x}
            cy={y}
            r={ABOUT_RADIUS}
            style={{
              fill: isSelected ? ABOUT_COLOR : 'var(--map-station-fill)',
              stroke: ABOUT_COLOR,
              transition: 'fill 0.3s ease, stroke 0.3s ease',
              filter: `drop-shadow(0 0 4px ${ABOUT_COLOR})`,
            }}
            strokeWidth={2.5}
          />
          {!isSelected && (
            <circle
              cx={x}
              cy={y}
              r={3}
              style={{ fill: ABOUT_COLOR }}
              opacity={0.6}
            />
          )}
        </>
      ) : isInterchange ? (
        <>
          <circle
            cx={x}
            cy={y}
            r={INTERCHANGE_RADIUS}
            style={{
              fill: 'var(--map-station-fill)',
              stroke: 'var(--map-interchange-stroke)',
              transition: 'fill 0.3s ease, stroke 0.3s ease',
            }}
            strokeWidth={2}
          />
          {isSelected && (
            <circle
              cx={x}
              cy={y}
              r={2.5}
              style={{ fill: 'var(--map-interchange-stroke)' }}
            />
          )}
        </>
      ) : isFeatured ? (
        <circle
          cx={x}
          cy={y}
          r={FEATURED_RADIUS}
          style={{
            fill: isSelected
              ? 'var(--map-station-selected)'
              : 'var(--map-station-fill)',
            transition: 'fill 0.3s ease',
            filter: `drop-shadow(0 0 3px ${lines[0]?.color ?? '#888'})`,
          }}
          stroke={lines[0]?.color ?? 'var(--map-interchange-stroke)'}
          strokeWidth={2.5}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={STATION_RADIUS}
          style={{
            fill: isSelected
              ? 'var(--map-station-selected)'
              : 'var(--map-station-fill)',
            transition: 'fill 0.3s ease',
          }}
          stroke={lines[0]?.color ?? 'var(--map-interchange-stroke)'}
          strokeWidth={2}
        />
      )}

      <text
        x={lx}
        y={ly}
        textAnchor={anchor}
        dominantBaseline={baseline === 'hanging' ? 'hanging' : 'auto'}
        fontSize={isAbout ? 9 : 7}
        fontFamily="'Inter', sans-serif"
        fontWeight={isAbout ? 700 : isSelected ? 600 : 500}
        letterSpacing={isAbout ? 0.5 : undefined}
        style={{
          fill: isAbout ? ABOUT_COLOR : 'var(--map-text)',
          userSelect: 'none',
          pointerEvents: 'none',
          transition: 'fill 0.3s ease',
        }}
      >
        {station.name}
      </text>
    </g>
  );
}

export default memo(StationComponent);
