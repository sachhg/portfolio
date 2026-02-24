import { describe, it, expect } from 'vitest';
import {
  metroMap,
  getAllStations,
  getStationById,
  getStationAt,
  getAreaForStation,
  getLinesAtPosition,
} from './mapData';

describe('getAllStations', () => {
  it('returns a non-empty array of stations', () => {
    const stations = getAllStations();
    expect(stations.length).toBeGreaterThan(0);
  });

  it('deduplicates stations by position', () => {
    const stations = getAllStations();
    const positions = stations.map((s) => `${s.position[0]},${s.position[1]}`);
    const unique = new Set(positions);
    expect(positions.length).toBe(unique.size);
  });
});

describe('getStationById', () => {
  it('finds a known station', () => {
    const station = getStationById('p-cloud-orchestrator');
    expect(station).toBeDefined();
    expect(station!.name).toBe('Cloud Orchestrator');
  });

  it('returns undefined for an unknown ID', () => {
    expect(getStationById('nonexistent-station')).toBeUndefined();
  });
});

describe('getStationAt', () => {
  it('finds a station at known coordinates', () => {
    const station = getStationAt(180, 120);
    expect(station).toBeDefined();
    expect(station!.name).toBe('Cloud Orchestrator');
  });

  it('returns undefined for empty coordinates', () => {
    expect(getStationAt(9999, 9999)).toBeUndefined();
  });
});

describe('getAreaForStation', () => {
  it('returns the correct area for a Projects station', () => {
    const station = getStationById('p-cloud-orchestrator');
    expect(station).toBeDefined();
    const area = getAreaForStation(station!);
    expect(area).toBeDefined();
    expect(area!.id).toBe('projects');
  });

  it('returns undefined for a connector-only station', () => {
    // Midtown is on the Gold connector but not inside any area
    const station = getStationAt(600, 120);
    expect(station).toBeDefined();
    const area = getAreaForStation(station!);
    expect(area).toBeUndefined();
  });
});

describe('getLinesAtPosition', () => {
  it('returns one line for a regular station', () => {
    // Cloud Orchestrator is only on the Blue Line
    const lines = getLinesAtPosition(180, 120);
    expect(lines.length).toBe(1);
    expect(lines[0].id).toBe('blue');
  });

  it('returns multiple lines for an interchange', () => {
    // Data Pipeline at [260, 120] is on blue, light-blue, and cyan
    const lines = getLinesAtPosition(260, 120);
    expect(lines.length).toBeGreaterThan(1);
    const ids = lines.map((l) => l.id);
    expect(ids).toContain('blue');
    expect(ids).toContain('light-blue');
    expect(ids).toContain('cyan');
  });

  it('returns empty array for a position with no stations', () => {
    const lines = getLinesAtPosition(9999, 9999);
    expect(lines.length).toBe(0);
  });
});

describe('metroMap structure', () => {
  it('has 5 areas', () => {
    expect(metroMap.areas.length).toBe(5);
    const ids = metroMap.areas.map((a) => a.id);
    expect(ids).toContain('projects');
    expect(ids).toContain('experience');
    expect(ids).toContain('education');
    expect(ids).toContain('skills');
    expect(ids).toContain('blog');
  });
});
