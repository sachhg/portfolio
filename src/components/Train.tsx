import { useEffect, useRef } from 'react';

type Point = [number, number];

type Props = {
  path: Point[];
  color: string;
  speed?: number; // pixels per second
  delay?: number; // start delay in ms
  pauseAtStation?: number; // ms to pause at each station
  reducedMotion?: boolean;
};

function getSegmentLength(a: Point, b: Point): number {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
}

function getTotalLength(path: Point[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += getSegmentLength(path[i], path[i + 1]);
  }
  return total;
}

function getPointAtDistance(path: Point[], distance: number): Point {
  let remaining = distance;
  for (let i = 0; i < path.length - 1; i++) {
    const segLen = getSegmentLength(path[i], path[i + 1]);
    if (remaining <= segLen) {
      const t = segLen === 0 ? 0 : remaining / segLen;
      return [
        path[i][0] + (path[i + 1][0] - path[i][0]) * t,
        path[i][1] + (path[i + 1][1] - path[i][1]) * t,
      ];
    }
    remaining -= segLen;
  }
  return path[path.length - 1];
}

// Get cumulative distances at each station (point in path)
function getStationDistances(path: Point[]): number[] {
  const distances: number[] = [0];
  let cum = 0;
  for (let i = 0; i < path.length - 1; i++) {
    cum += getSegmentLength(path[i], path[i + 1]);
    distances.push(cum);
  }
  return distances;
}

export default function Train({ path, color, speed = 40, delay = 0, pauseAtStation = 800, reducedMotion = false }: Props) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (path.length < 2) return;
    const el = circleRef.current;
    if (!el) return;

    // Set initial position
    el.setAttribute('cx', String(path[0][0]));
    el.setAttribute('cy', String(path[0][1]));

    if (reducedMotion) return;

    const totalLen = getTotalLength(path);
    const stationDists = getStationDistances(path);
    const travelTime = (totalLen / speed) * 1000; // ms to traverse
    const totalPauseTime = (path.length - 2) * pauseAtStation; // don't pause at first/last
    const cycleDuration = travelTime + totalPauseTime;
    const forwardBackCycle = cycleDuration * 2; // go and return

    let started = false;

    function animate(timestamp: number) {
      if (!started) {
        startTimeRef.current = timestamp + delay;
        started = true;
      }

      const elapsed = timestamp - startTimeRef.current;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Position in the forward-back cycle
      const cyclePos = elapsed % forwardBackCycle;
      const isForward = cyclePos < cycleDuration;
      const withinHalf = isForward ? cyclePos : cyclePos - cycleDuration;

      // Calculate distance accounting for station pauses
      let accumulatedTime = 0;
      let distance = 0;

      for (let i = 0; i < stationDists.length - 1; i++) {
        const segDist = stationDists[i + 1] - stationDists[i];
        const segTime = (segDist / speed) * 1000;
        const pause = i > 0 ? pauseAtStation : 0; // pause at intermediate stations

        if (withinHalf < accumulatedTime + pause) {
          // Currently paused at station i
          distance = stationDists[i];
          break;
        }
        accumulatedTime += pause;

        if (withinHalf < accumulatedTime + segTime) {
          // Currently traveling between station i and i+1
          const tInSeg = withinHalf - accumulatedTime;
          distance = stationDists[i] + (tInSeg / segTime) * segDist;
          break;
        }
        accumulatedTime += segTime;
        distance = stationDists[i + 1];
      }

      // If going backward, reverse the distance
      const actualDist = isForward ? distance : totalLen - distance;
      const point = getPointAtDistance(path, actualDist);

      // Direct DOM update — bypasses React reconciliation
      el.setAttribute('cx', String(point[0]));
      el.setAttribute('cy', String(point[1]));

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [path, speed, delay, pauseAtStation, reducedMotion]);

  if (path.length < 2) return null;

  return (
    <circle
      ref={circleRef}
      cx={path[0][0]}
      cy={path[0][1]}
      r={3.5}
      fill={color}
      opacity={0.85}
      style={{ filter: `drop-shadow(0 0 2px ${color})` }}
    />
  );
}
