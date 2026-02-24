import { useEffect, useCallback, useRef } from 'react';

type UrlState = {
  area: string | null;
  station: string | null;
  theme: 'dark' | 'light';
};

/** Read URL search params once */
export function readUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    area: params.get('area'),
    station: params.get('station'),
    theme: params.get('theme') === 'dark' ? 'dark' : 'light',
  };
}

/** Sync React state → URL search params via replaceState */
export function useUrlSync(area: string | null, stationId: string | null, dark: boolean) {
  const prevUrl = useRef('');

  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (area) params.set('area', area);
    if (stationId) params.set('station', stationId);
    if (dark) params.set('theme', 'dark');

    const search = params.toString();
    const newUrl = search ? `?${search}` : window.location.pathname;

    if (newUrl !== prevUrl.current) {
      prevUrl.current = newUrl;
      window.history.replaceState(null, '', newUrl);
    }
  }, [area, stationId, dark]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);
}
