import { memo } from 'react';
import type { Station, Line } from '../data/mapData';

type Props = {
  station: Station;
  lines: Line[];
  dimmed?: boolean;
  hidden?: boolean;
};

const ICON_SIZE = 18;
const ICON_GAP = 14;

function FeaturedCard({ station, lines, dimmed = false, hidden = false }: Props) {
  if (!station.featured || !station.logo || hidden) return null;

  const [sx, sy] = station.position;
  const dir = station.labelDir ?? 'above';
  const lineColor = lines[0]?.color ?? '#888';

  // Position icon on the opposite side of the station label
  let ix: number, iy: number;

  switch (dir) {
    case 'below':
      ix = sx - ICON_SIZE / 2;
      iy = sy - ICON_GAP - ICON_SIZE;
      break;
    case 'left':
      ix = sx + ICON_GAP;
      iy = sy - ICON_SIZE / 2;
      break;
    case 'right':
      ix = sx - ICON_GAP - ICON_SIZE;
      iy = sy - ICON_SIZE / 2;
      break;
    case 'above':
    default:
      ix = sx - ICON_SIZE / 2;
      iy = sy + ICON_GAP;
      break;
  }

  const cx = ix + ICON_SIZE / 2;
  const cy = iy + ICON_SIZE / 2;
  const r = ICON_SIZE / 2 + 2;

  return (
    <g
      style={{
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}
    >
      {/* Subtle background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        style={{
          fill: 'var(--panel-bg)',
          stroke: lineColor,
        }}
        strokeWidth={1}
        opacity={0.8}
      />

      {/* Logo image */}
      <image
        href={`/${station.logo}`}
        x={ix}
        y={iy}
        width={ICON_SIZE}
        height={ICON_SIZE}
      />
    </g>
  );
}

export default memo(FeaturedCard);
