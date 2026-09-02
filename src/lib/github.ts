/**
 * Build-time GitHub activity for the footer strip.
 *
 * Anonymous access is enough; GITHUB_TOKEN is only used to lift the
 * 60 req/hr limit (the daily Actions rebuild passes one).
 *
 * Note on sourcing: this reads the repositories directly rather than the
 * public events feed. The feed looks like the obvious source and is not one:
 * it holds ~90 days and at most 300 events, it is written only while a repo
 * is public so making a repo public never backfills the pushes that came
 * before, and it trails a live push by minutes. An account whose work sits in
 * repos that were opened up later therefore reads as almost no activity. The
 * repos themselves have no such gaps, so the strip now walks the repo list
 * newest-push-first and asks each one in the window for its commits.
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
/** Repo-list pages. 100 per page, newest push first; one page is plenty. */
const REPO_PAGES = 2
/** Commit pages per repo. Caps an unusually busy month at 200 per repo. */
const COMMIT_PAGES = 2
const PER_PAGE = 100
const CONCURRENCY = 5

interface GhRepo {
  full_name: string
  pushed_at: string | null
}

interface GhCommit {
  sha: string
  commit?: {
    message?: string
    author?: { date?: string }
    committer?: { date?: string }
  }
}

interface Commit {
  repo: string
  sha: string
  message: string
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

/**
 * Repos touched since the window opened, newest push first. Forks are kept:
 * the commit query filters by author, and an account cannot fork itself, so
 * nothing can be counted twice.
 */
async function fetchActiveRepos(since: Date): Promise<string[]> {
  const active: string[] = []

  for (let page = 1; page <= REPO_PAGES; page++) {
    const batch = await api<GhRepo[]>(
      `/users/${site.githubUser}/repos?per_page=${PER_PAGE}&page=${page}&sort=pushed&direction=desc`
    )
    if (!batch?.length) break

    for (const r of batch) {
      if (!r.pushed_at) continue
      if (new Date(r.pushed_at) < since) return active
      active.push(r.full_name)
    }

    if (batch.length < PER_PAGE) break
  }

  return active
}

/**
 * The user's own commits in one repo since the window opened. This is the
 * default branch only, which is where the work being advertised lives.
 */
async function fetchCommits(repo: string, since: Date): Promise<Commit[]> {
  const out: Commit[] = []

  for (let page = 1; page <= COMMIT_PAGES; page++) {
    const batch = await api<GhCommit[]>(
      `/repos/${repo}/commits?author=${site.githubUser}` +
        `&since=${since.toISOString()}&per_page=${PER_PAGE}&page=${page}`
    )
    if (!batch?.length) break

    for (const c of batch) {
      const raw = c.commit?.committer?.date ?? c.commit?.author?.date
      const message = c.commit?.message
      if (!raw || !message || !c.sha) continue

      const at = new Date(raw)
      if (Number.isNaN(at.getTime()) || at < since) continue

      out.push({ repo, sha: c.sha, message, at })
    }

    if (batch.length < PER_PAGE) break
  }

  return out
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

/**
 * The footer renders on every page, but the data is identical across them.
 * Memoize the in-flight promise so one build makes one round of API calls
 * instead of one per page, which is what exhausts the anonymous rate limit.
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

  let repos: string[]
  try {
    repos = await fetchActiveRepos(since)
  } catch {
    repos = []
  }

  if (!repos.length) {
    console.warn('[footer] no repos resolved in window; rendering static strip')
    return EMPTY
  }

  const commits = (await mapLimit(repos, CONCURRENCY, (r) => fetchCommits(r, since))).flat()

  if (!commits.length) {
    console.warn(`[footer] ${repos.length} repos in window resolved no commits`)
    return EMPTY
  }

  // Newest first, so the head of the list is the last commit.
  commits.sort((a, b) => b.at.getTime() - a.at.getTime())
  const head = commits[0]!

  const buckets = new Map<string, number>()
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const d = new Date(since)
    d.setUTCDate(d.getUTCDate() + i)
    buckets.set(dayKey(d), 0)
  }

  // A commit dated ahead of the last bucket (clock skew, or a rewritten date)
  // still counts, it just has nowhere to sit on the sparkline.
  for (const c of commits) {
    const key = dayKey(c.at)
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1)
  }

  return {
    lastCommit: {
      repo: shortRepo(head.repo),
      message: tidyMessage(head.message),
      url: `https://github.com/${head.repo}/commit/${head.sha}`,
    },
    commitCount: commits.length,
    sparkline: [...buckets.values()],
  }
}

export { WINDOW_DAYS }
