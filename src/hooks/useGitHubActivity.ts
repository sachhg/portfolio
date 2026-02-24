import { useState, useEffect } from 'react';

type CacheEntry = {
  data: number[];
  fetchedAt: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const RETRY_DELAY = 2000;

type Result = {
  data: number[] | null;
  loading: boolean;
  error: boolean;
};

export function useGitHubActivity(repo: string | undefined): Result {
  const [result, setResult] = useState<Result>(() => {
    if (!repo) return { data: null, loading: false, error: false };
    const cached = cache.get(repo);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return { data: cached.data, loading: false, error: false };
    }
    return { data: null, loading: true, error: false };
  });

  useEffect(() => {
    if (!repo) return;

    const cached = cache.get(repo);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setResult({ data: cached.data, loading: false, error: false });
      return;
    }

    let cancelled = false;

    async function fetchActivity(attempt: number) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/stats/commit_activity`,
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        );

        // GitHub returns 202 while computing stats — retry once
        if (res.status === 202 && attempt < 2) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          return fetchActivity(attempt + 1);
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: Array<{ total: number; week: number }> = await res.json();
        const weeklyTotals = json.map((w) => w.total);

        if (!cancelled) {
          cache.set(repo!, { data: weeklyTotals, fetchedAt: Date.now() });
          setResult({ data: weeklyTotals, loading: false, error: false });
        }
      } catch {
        if (!cancelled) {
          setResult({ data: null, loading: false, error: true });
        }
      }
    }

    setResult({ data: null, loading: true, error: false });
    fetchActivity(0);

    return () => {
      cancelled = true;
    };
  }, [repo]);

  return result;
}
