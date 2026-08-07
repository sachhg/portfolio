/**
 * Build-time GitHub activity for the footer strip.
 *
 * Anonymous access is enough; GITHUB_TOKEN is honoured only to lift the
 * 60 req/hr limit (the daily Actions rebuild passes one).
 *
 * Note on sourcing: the public events feed used to embed a `commits` array in
 * each PushEvent payload, and no longer does — it now carries only `before`
 * and `head`. So exact counts come from the compare endpoint per push, and the
 * newest commit message from a single commit lookup. Both are public.
 *
 * Every failure path degrades rather than throws: a missing piece renders as
 * absent, and a total failure renders the strip with no live parts at all.
 */

import { site } from '../data/site'

export interface LastCommit {
  repo: string
  message: string
  url: string
}

export interface Activity {
  lastCommit: LastCommit | null
  /** Commits across the sparkline window. */
  commitCount: number | null
  /** Commits per day, oldest → newest, length WINDOW_DAYS. */
  sparkline: number[] | null
}

const EMPTY: Activity = { lastCommit: null, commitCount: null, sparkline: null }

const WINDOW_DAYS = 30
const TIMEOUT_MS = 8000
const MAX_MESSAGE = 72
const PAGES = 3
const CONCURRENCY = 5
/** Backstop so an unusually busy month cannot balloon the request count. */
const MAX_COMPARES = 60

const ZERO_SHA = '0'.repeat(40)

interface GhEvent {
  type: string
  created_at: string
  repo?: { name: string }
  payload?: { before?: string; head?: string }
}

interface Push {
  repo: string
  head: string
  before: string
  at: Date
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `${site.githubUser}-portfolio-build`,
  }
  const token = process.env.GITHUB_TOKEN
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** Map over items with a bounded number of in-flight requests. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let cursor = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await fn(items[i]!)
    }
  })

  await Promise.all(workers)
  return out
}

async function fetchPushes(since: Date): Promise<Push[]> {
  const pushes: Push[] = []

  for (let page = 1; page <= PAGES; page++) {
    const batch = await api<GhEvent[]>(
      `/users/${site.githubUser}/events/public?per_page=100&page=${page}`
    )
    if (!batch?.length) break

    for (const e of batch) {
      if (e.type !== 'PushEvent' || !e.repo?.name || !e.payload?.head) continue
      pushes.push({
        repo: e.repo.name,
        head: e.payload.head,
        before: e.payload.before ?? ZERO_SHA,
        at: new Date(e.created_at),
      })
    }

    // The feed is newest-first; stop once it runs past the window.
    const oldest = batch[batch.length - 1]
    if (batch.length < 100 || (oldest && new Date(oldest.created_at) < since)) break
  }

  return pushes
}

/**
 * Exact commits introduced by one push. A push that created a branch has no
 * meaningful base, and a force-push can leave `before` unreachable — both
 * return null from the API, so fall back to counting the push as one commit
 * rather than dropping it.
 */
async function countCommits(p: Push): Promise<number> {
  if (p.before === ZERO_SHA) return 1
  const cmp = await api<{ total_commits?: number }>(
    `/repos/${p.repo}/compare/${p.before}...${p.head}`
  )
  return cmp?.total_commits && cmp.total_commits > 0 ? cmp.total_commits : 1
}

function tidyMessage(raw: string): string {
  const firstLine = raw.split('\n')[0]!.trim()
  return firstLine.length > MAX_MESSAGE
    ? `${firstLine.slice(0, MAX_MESSAGE - 1).trimEnd()}…`
    : firstLine
}

/** `owner/name` → `name` when the owner is Sachit, else the full path. */
function shortRepo(full: string): string {
  const [owner, name] = full.split('/')
  return owner === site.githubUser ? (name ?? full) : full
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

async function resolveLastCommit(p: Push): Promise<LastCommit | null> {
  const commit = await api<{ commit?: { message?: string } }>(
    `/repos/${p.repo}/commits/${p.head}`
  )
  const message = commit?.commit?.message
  if (!message) return null

  return {
    repo: shortRepo(p.repo),
    message: tidyMessage(message),
    url: `https://github.com/${p.repo}/commit/${p.head}`,
  }
}

/**
 * The footer renders on every page, but the data is identical across them.
 * Memoise the in-flight promise so one build makes one round of API calls
 * instead of one per page — which is what exhausts the anonymous rate limit.
 */
let inFlight: Promise<Activity> | null = null

export function getActivity(): Promise<Activity> {
  return (inFlight ??= fetchActivity())
}

async function fetchActivity(): Promise<Activity> {
  // "now" is build time, which the daily rebuild advances.
  const now = new Date()
  const since = new Date(now)
  since.setUTCDate(since.getUTCDate() - (WINDOW_DAYS - 1))
  since.setUTCHours(0, 0, 0, 0)

  let pushes: Push[]
  try {
    pushes = await fetchPushes(since)
  } catch {
    pushes = []
  }

  if (!pushes.length) {
    console.warn('[footer] no public push activity resolved; rendering static strip')
    return EMPTY
  }

  // Newest push first — its tip is the last commit.
  pushes.sort((a, b) => b.at.getTime() - a.at.getTime())
  const lastCommit = await resolveLastCommit(pushes[0]!)

  const inWindow = pushes.filter((p) => p.at >= since).slice(0, MAX_COMPARES)
  if (inWindow.length === MAX_COMPARES) {
    console.warn(`[footer] capped commit counting at ${MAX_COMPARES} pushes`)
  }

  const counts = await mapLimit(inWindow, CONCURRENCY, countCommits)

  const buckets = new Map<string, number>()
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const d = new Date(since)
    d.setUTCDate(d.getUTCDate() + i)
    buckets.set(dayKey(d), 0)
  }

  let commitCount = 0
  inWindow.forEach((p, i) => {
    const n = counts[i] ?? 0
    commitCount += n
    const key = dayKey(p.at)
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + n)
  })

  return { lastCommit, commitCount, sparkline: [...buckets.values()] }
}

export { WINDOW_DAYS }
