import { describe, it, expect, beforeEach } from 'vitest';
import { readUrlState } from './useUrlState';

describe('readUrlState', () => {
  beforeEach(() => {
    // Reset URL to clean state before each test
    window.history.replaceState(null, '', '/');
  });

  it('returns defaults for empty URL', () => {
    const state = readUrlState();
    expect(state).toEqual({
      area: null,
      station: null,
      theme: 'light',
    });
  });

  it('parses all params from a full URL', () => {
    window.history.replaceState(null, '', '?area=projects&station=p-ml-dashboard&theme=dark');
    const state = readUrlState();
    expect(state).toEqual({
      area: 'projects',
      station: 'p-ml-dashboard',
      theme: 'dark',
    });
  });

  it('handles partial params', () => {
    window.history.replaceState(null, '', '?station=p-ml-dashboard');
    const state = readUrlState();
    expect(state.area).toBeNull();
    expect(state.station).toBe('p-ml-dashboard');
    expect(state.theme).toBe('light');
  });

  it('defaults theme to light for invalid values', () => {
    window.history.replaceState(null, '', '?theme=banana');
    const state = readUrlState();
    expect(state.theme).toBe('light');
  });
});
