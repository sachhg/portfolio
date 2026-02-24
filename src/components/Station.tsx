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
};

const STATION_RADIUS = 4.5;
const INTERCHANGE_RADIUS = 6.5;
const LABEL_GAP = 8;

function StationComponent({
  station,
  lines,
  onSelect,
  isSelected,
  dimmed = false,
  highlighted = false,
  reducedMotion = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [x, y] = station.position;
  const isInterchange = station.isInterchange || lines.length > 1;
  const r = isInterchange ? INTERCHANGE_RADIUS : STATION_RADIUS;
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <circle cx={x} cy={y} r={r + 10} fill="transparent" />

      {/* Hover pulse ripple — single outward sonar on mouseenter */}
      {hovered && !highlighted && !reducedMotion && (
        <circle
          cx={x}
          cy={y}
          r={r + 2}
          fill="none"
          stroke={lines[0]?.color ?? 'var(--map-interchange-stroke)'}
          strokeWidth={1.5}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            from={String(r + 2)}
            to={String(r + 14)}
            dur="0.6s"
            repeatCount="1"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            from="0.5"
            to="0"
            dur="0.6s"
            repeatCount="1"
            fill="freeze"
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

      {isInterchange ? (
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
        fontSize={7}
        fontFamily="'Inter', sans-serif"
        fontWeight={isSelected ? 600 : 500}
        style={{
          fill: 'var(--map-text)',
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
