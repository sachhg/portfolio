import { memo } from 'react';
import type { Line as LineT } from '../data/mapData';
import Train from './Train';

type Props = {
  line: LineT;
  trainsPerLine?: number;
  dimmed?: boolean;
  reducedMotion?: boolean;
};

function buildPathD(positions: [number, number][]): string {
  if (positions.length === 0) return '';
  let d = `M ${positions[0][0]} ${positions[0][1]}`;
  for (let i = 1; i < positions.length; i++) {
    d += ` L ${positions[i][0]} ${positions[i][1]}`;
  }
  return d;
}

function LinePathComponent({ line, trainsPerLine = 2, dimmed = false, reducedMotion = false }: Props) {
  const positions = line.stations.map((s) => s.position);

  if (positions.length < 2) return null;

  const pathD = buildPathD(positions);

  const trains = Array.from({ length: trainsPerLine }, (_, i) => (
    <Train
      key={`train-${line.id}-${i}`}
      path={positions}
      color={line.color}
      speed={30 + Math.random() * 10}
      delay={i * 4000 + Math.random() * 1000}
      pauseAtStation={500}
      reducedMotion={reducedMotion}
    />
  ));

  return (
    <g style={{ opacity: dimmed ? 0.15 : 1, transition: 'opacity 0.4s ease' }}>
      {/* Outline for contrast against grid */}
      <path
        d={pathD}
        fill="none"
        style={{ stroke: 'var(--map-line-outline)', transition: 'stroke 0.3s ease' }}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main colored line */}
      <path
        d={pathD}
        fill="none"
        stroke={line.color}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {trains}
    </g>
  );
}

export default memo(LinePathComponent);
