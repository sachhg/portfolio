import { useEffect, useRef, useMemo } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type Props = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  dark: boolean;
  reducedMotion: boolean;
};

const COUNT = 24;
const MIN_R = 1.2;
const MAX_R = 2.8;
const MIN_SPEED = 3; // px/s
const MAX_SPEED = 8;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createParticles(
  count: number,
  w: number,
  h: number,
  ox: number,
  oy: number,
): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(MIN_SPEED, MAX_SPEED);
    return {
      x: ox + Math.random() * w,
      y: oy + Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: rand(MIN_R, MAX_R),
    };
  });
}

export default function AmbientParticles({
  width,
  height,
  offsetX,
  offsetY,
  dark,
  reducedMotion,
}: Props) {
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const prevTimeRef = useRef(0);

  const initial = useMemo(
    () => createParticles(COUNT, width, height, offsetX, offsetY),
    [width, height, offsetX, offsetY],
  );

  useEffect(() => {
    particlesRef.current = initial.map((p) => ({ ...p }));
  }, [initial]);

  useEffect(() => {
    if (reducedMotion) return;

    const particles = particlesRef.current;
    const refs = circleRefs.current;

    for (let i = 0; i < particles.length; i++) {
      const el = refs[i];
      if (el) {
        el.setAttribute('cx', String(particles[i].x));
        el.setAttribute('cy', String(particles[i].y));
      }
    }

    function animate(ts: number) {
      if (prevTimeRef.current === 0) {
        prevTimeRef.current = ts;
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const dt = Math.min((ts - prevTimeRef.current) / 1000, 0.1);
      prevTimeRef.current = ts;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < offsetX) p.x = offsetX + width;
        if (p.x > offsetX + width) p.x = offsetX;
        if (p.y < offsetY) p.y = offsetY + height;
        if (p.y > offsetY + height) p.y = offsetY;

        const el = refs[i];
        if (el) {
          el.setAttribute('cx', String(p.x));
          el.setAttribute('cy', String(p.y));
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      prevTimeRef.current = 0;
    };
  }, [reducedMotion, width, height, offsetX, offsetY]);

  const fill = dark ? 'rgba(201,197,190,0.22)' : 'rgba(64,61,57,0.15)';

  return (
    <g aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {initial.map((p, i) => (
        <circle
          key={i}
          ref={(el) => { circleRefs.current[i] = el; }}
          cx={p.x}
          cy={p.y}
          r={p.radius}
          fill={fill}
        />
      ))}
    </g>
  );
}
