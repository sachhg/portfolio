import { useMemo } from 'react';

type Props = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  visible: boolean;
};

type Star = {
  x: number;
  y: number;
  r: number;
  opacity: number;
};

// Simple seeded pseudo-random number generator (mulberry32)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(
  count: number,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
): Star[] {
  const rand = seededRandom(42);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    let r: number;
    let opacity: number;

    if (i < 50) {
      // Dim stars
      r = 0.4 + rand() * 0.2;
      opacity = 0.15 + rand() * 0.1;
    } else if (i < 75) {
      // Medium stars
      r = 0.6 + rand() * 0.3;
      opacity = 0.3 + rand() * 0.15;
    } else {
      // Bright stars
      r = 0.9 + rand() * 0.3;
      opacity = 0.5 + rand() * 0.2;
    }

    stars.push({
      x: offsetX + rand() * width,
      y: offsetY + rand() * height,
      r,
      opacity,
    });
  }

  return stars;
}

export default function StarField({ width, height, offsetX, offsetY, visible }: Props) {
  const stars = useMemo(
    () => generateStars(80, width, height, offsetX, offsetY),
    [width, height, offsetX, offsetY],
  );

  return (
    <g
      aria-hidden="true"
      style={{
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      {stars.map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#c9c5be"
          opacity={star.opacity}
        />
      ))}
    </g>
  );
}
