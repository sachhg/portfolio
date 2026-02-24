import { describe, it, expect } from 'vitest';
import { TOUR_WAYPOINTS, TOUR_STOPS, TOUR_TRAIN_SPEED, NARRATION_DURATION } from './tourRoute';
import { metroMap } from './mapData';

describe('TOUR_WAYPOINTS', () => {
  it('contains valid coordinate tuples', () => {
    expect(TOUR_WAYPOINTS.length).toBeGreaterThan(0);
    for (const wp of TOUR_WAYPOINTS) {
      expect(wp).toHaveLength(2);
      expect(typeof wp[0]).toBe('number');
      expect(typeof wp[1]).toBe('number');
    }
  });
});

describe('TOUR_STOPS', () => {
  it('has waypoint indices within bounds', () => {
    for (const stop of TOUR_STOPS) {
      expect(stop.waypointIndex).toBeGreaterThanOrEqual(0);
      expect(stop.waypointIndex).toBeLessThan(TOUR_WAYPOINTS.length);
    }
  });

  it('references valid area IDs', () => {
    const areaIds = metroMap.areas.map((a) => a.id);
    for (const stop of TOUR_STOPS) {
      expect(areaIds).toContain(stop.areaId);
    }
  });

  it('has waypoint indices in ascending order', () => {
    for (let i = 1; i < TOUR_STOPS.length; i++) {
      expect(TOUR_STOPS[i].waypointIndex).toBeGreaterThan(TOUR_STOPS[i - 1].waypointIndex);
    }
  });
});

describe('tour constants', () => {
  it('has positive speed and duration', () => {
    expect(TOUR_TRAIN_SPEED).toBeGreaterThan(0);
    expect(NARRATION_DURATION).toBeGreaterThan(0);
  });
});
