import { useRef, useState, useCallback, useEffect } from 'react';
import { zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import { metroMap } from '../data/mapData';
import {
  TOUR_WAYPOINTS,
  TOUR_STOPS,
  TOUR_TRAIN_SPEED,
  NARRATION_DURATION,
  type Point,
} from '../data/tourRoute';

// ── Path math (duplicated from Train.tsx — small pure functions) ──

function getSegmentLength(a: Point, b: Point): number {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
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

// Pre-compute cumulative distances at each waypoint
function getCumulativeDistances(path: Point[]): number[] {
  const dists: number[] = [0];
  let cum = 0;
  for (let i = 0; i < path.length - 1; i++) {
    cum += getSegmentLength(path[i], path[i + 1]);
    dists.push(cum);
  }
  return dists;
}

// ── Area bounds calculation (mirrors MetroMap.zoomToArea) ──

function getAreaBounds(areaId: string) {
  const area = metroMap.areas.find((a) => a.id === areaId);
  if (!area) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const line of area.lines) {
    for (const station of line.stations) {
      const [x, y] = station.position;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY };
}

// ── Types ──

export type TourNarration = {
  title: string;
  text: string;
  stopIndex: number;
};

type TourState = {
  active: boolean;
  narration: TourNarration | null;
  progress: number; // 0..TOUR_STOPS.length (which stop we've reached)
};

type UseTourModeInput = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  zoomRef: React.RefObject<ZoomBehavior<SVGSVGElement, unknown> | null>;
  dimensions: { width: number; height: number };
  reducedMotion: boolean;
};

// ── Hook ──

export function useTourMode({ svgRef, zoomRef, dimensions, reducedMotion }: UseTourModeInput) {
  const trainRef = useRef<SVGCircleElement>(null);
  const [state, setState] = useState<TourState>({
    active: false,
    narration: null,
    progress: 0,
  });

  // Mutable refs for the animation loop
  const activeRef = useRef(false);
  const rafRef = useRef(0);
  const phaseRef = useRef<'idle' | 'travel' | 'narrate'>('idle');
  const segmentStartRef = useRef(0); // distance into path where current travel segment starts
  const segmentEndRef = useRef(0); // distance into path where current travel segment ends
  const segmentStartTimeRef = useRef(0);
  const currentStopRef = useRef(0); // next stop index to reach
  const narrationTimerRef = useRef(0);

  // Pre-computed
  const waypointDists = useRef(getCumulativeDistances(TOUR_WAYPOINTS));

  // ── Camera helpers ──

  const zoomToPoint = useCallback(
    (cx: number, cy: number, scale: number, duration: number) => {
      const svg = svgRef.current;
      const zb = zoomRef.current;
      if (!svg || !zb) return;

      const tx = dimensions.width / 2 - cx * scale;
      const ty = dimensions.height / 2 - cy * scale;
      const transform = zoomIdentity.translate(tx, ty).scale(scale);

      if (duration > 0) {
        select(svg).transition().duration(duration).call(zb.transform, transform);
      } else {
        // Instant — for RAF-driven following
        zb.transform(select(svg), transform);
      }
    },
    [svgRef, zoomRef, dimensions]
  );

  const zoomToAreaBounds = useCallback(
    (areaId: string, duration: number) => {
      const bounds = getAreaBounds(areaId);
      if (!bounds) return;

      const padding = 100;
      const areaW = bounds.maxX - bounds.minX + padding * 2;
      const areaH = bounds.maxY - bounds.minY + padding * 2;
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;

      const scaleX = dimensions.width / areaW;
      const scaleY = dimensions.height / areaH;
      const scale = Math.min(scaleX, scaleY, 3.5);

      zoomToPoint(centerX, centerY, scale, duration);
    },
    [dimensions, zoomToPoint]
  );

  const zoomToInitial = useCallback(
    (duration: number) => {
      const svg = svgRef.current;
      const zb = zoomRef.current;
      if (!svg || !zb) return;

      const padding = 100;
      const scaleX = (dimensions.width - padding * 2) / metroMap.width;
      const scaleY = (dimensions.height - padding * 2) / metroMap.height;
      const scale = Math.min(scaleX, scaleY, 1.6);
      const tx = (dimensions.width - metroMap.width * scale) / 2;
      const ty = (dimensions.height - metroMap.height * scale) / 2;
      const transform = zoomIdentity.translate(tx, ty).scale(scale);

      if (duration > 0) {
        select(svg).transition().duration(duration).call(zb.transform, transform);
      } else {
        zb.transform(select(svg), transform);
      }
    },
    [svgRef, zoomRef, dimensions]
  );

  // ── Start narration at a stop ──

  const startNarration = useCallback(
    (stopIndex: number) => {
      const stop = TOUR_STOPS[stopIndex];
      if (!stop) return;

      phaseRef.current = 'narrate';
      setState((s) => ({
        ...s,
        narration: { title: stop.title, text: stop.narration, stopIndex },
        progress: stopIndex + 1,
      }));

      // Zoom into the area
      const dur = reducedMotion ? 0 : 750;
      zoomToAreaBounds(stop.areaId, dur);

      // Position train at the stop waypoint
      const el = trainRef.current;
      if (el) {
        const pos = TOUR_WAYPOINTS[stop.waypointIndex];
        el.setAttribute('cx', String(pos[0]));
        el.setAttribute('cy', String(pos[1]));
      }

      // After narration duration → advance
      narrationTimerRef.current = window.setTimeout(() => {
        if (!activeRef.current) return;

        setState((s) => ({ ...s, narration: null }));

        const nextStopIdx = stopIndex + 1;
        if (nextStopIdx >= TOUR_STOPS.length) {
          // Tour complete — zoom out and stop
          const outDur = reducedMotion ? 0 : 750;
          zoomToInitial(outDur);
          setTimeout(
            () => {
              activeRef.current = false;
              phaseRef.current = 'idle';
              setState({ active: false, narration: null, progress: TOUR_STOPS.length });
            },
            outDur + 100
          );
          return;
        }

        // Start travel to next stop
        currentStopRef.current = nextStopIdx;
        const currentDist = waypointDists.current[stop.waypointIndex];
        const nextDist = waypointDists.current[TOUR_STOPS[nextStopIdx].waypointIndex];
        segmentStartRef.current = currentDist;
        segmentEndRef.current = nextDist;

        if (reducedMotion) {
          // Skip animation — jump to next stop
          startNarration(nextStopIdx);
          return;
        }

        phaseRef.current = 'travel';
        segmentStartTimeRef.current = performance.now();

        // Ease out of area zoom before travel starts
        const startPos = TOUR_WAYPOINTS[stop.waypointIndex];
        zoomToPoint(startPos[0], startPos[1], 1.8, 500);

        rafRef.current = requestAnimationFrame(travelLoop);
      }, NARRATION_DURATION);
    },
    [reducedMotion, zoomToAreaBounds, zoomToInitial, zoomToPoint] // travelLoop added via ref below
  );

  // ── Travel animation loop ──

  const travelLoop = useCallback(
    (timestamp: number) => {
      if (!activeRef.current || phaseRef.current !== 'travel') return;

      const elapsed = timestamp - segmentStartTimeRef.current;
      const segDist = segmentEndRef.current - segmentStartRef.current;
      const segDuration = (segDist / TOUR_TRAIN_SPEED) * 1000;
      const t = Math.min(elapsed / segDuration, 1);

      const currentDist = segmentStartRef.current + t * segDist;
      const pos = getPointAtDistance(TOUR_WAYPOINTS, currentDist);

      // Update train position
      const el = trainRef.current;
      if (el) {
        el.setAttribute('cx', String(pos[0]));
        el.setAttribute('cy', String(pos[1]));
      }

      // Camera follows train at moderate zoom
      zoomToPoint(pos[0], pos[1], 1.8, 0);

      if (t >= 1) {
        // Reached next stop — start narration
        startNarration(currentStopRef.current);
        return;
      }

      rafRef.current = requestAnimationFrame(travelLoop);
    },
    [zoomToPoint, startNarration]
  );

  // ── Start tour ──

  const start = useCallback(() => {
    if (activeRef.current) return;

    activeRef.current = true;
    phaseRef.current = 'narrate';
    currentStopRef.current = 0;
    setState({ active: true, narration: null, progress: 0 });

    // Position train at first waypoint
    const el = trainRef.current;
    if (el) {
      const pos = TOUR_WAYPOINTS[0];
      el.setAttribute('cx', String(pos[0]));
      el.setAttribute('cy', String(pos[1]));
    }

    // Brief zoom out first, then start narration at first stop
    const dur = reducedMotion ? 0 : 750;
    zoomToInitial(dur);

    setTimeout(
      () => {
        if (!activeRef.current) return;
        startNarration(0);
      },
      dur + 200
    );
  }, [reducedMotion, zoomToInitial, startNarration]);

  // ── Stop tour ──

  const stop = useCallback(() => {
    activeRef.current = false;
    phaseRef.current = 'idle';
    cancelAnimationFrame(rafRef.current);
    clearTimeout(narrationTimerRef.current);
    setState({ active: false, narration: null, progress: 0 });

    // Zoom back to initial view
    const dur = reducedMotion ? 0 : 750;
    zoomToInitial(dur);
  }, [reducedMotion, zoomToInitial]);

  // ── Escape key ──

  useEffect(() => {
    if (!state.active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        stop();
      }
    };

    // Use capture to intercept before StationDetail's escape handler
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [state.active, stop]);

  // Favicon animation during tour
  useEffect(() => {
    if (!state.active) return;

    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;

    const originalHref = link.href;

    const tourFavicon = `data:image/svg+xml,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">' +
        '<circle cx="18" cy="18" r="18" fill="#2563eb"/>' +
        '<text x="18" y="18" text-anchor="middle" dominant-baseline="central" ' +
        'font-family="system-ui, sans-serif" font-weight="700" font-size="13" ' +
        'fill="#ffffff" letter-spacing="0.5">SM</text></svg>'
    )}`;

    let alt = false;
    const interval = setInterval(() => {
      alt = !alt;
      link.href = alt ? tourFavicon : originalHref;
    }, 500);

    return () => {
      clearInterval(interval);
      link.href = originalHref;
    };
  }, [state.active]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(narrationTimerRef.current);
    };
  }, []);

  return {
    active: state.active,
    narration: state.narration,
    progress: state.progress,
    totalStops: TOUR_STOPS.length,
    trainRef,
    start,
    stop,
  };
}
