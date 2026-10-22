export interface Contribution {
  /** `owner/name`, as GitHub renders it. */
  repo: string
  /** The merged pull request. */
  url: string
  /** One clause, in the register of the project summaries. */
  summary: string
  /** Mono tag on the right of the row. */
  tag: string
  /** ISO date the PR merged. */
  merged: string
}

/**
 * Merged upstream, in someone else's repo. Own projects belong in the
 * projects collection; this list is only for work that landed in a codebase
 * that is not mine. Deliberately not scraped: a contribution is worth listing
 * because of what it fixed, which no API reports.
 */
export const contributions: Contribution[] = [
  {
    repo: 'Kludex/starlette',
    url: 'https://github.com/Kludex/starlette/pull/3542',
    summary: 'Matches host names case-insensitively',
    tag: 'PR #3542',
    merged: '2026-10-18',
  },
  {
    repo: 'redis/redis-py',
    url: 'https://github.com/redis/redis-py/pull/4320',
    summary: 'Stops exponential backoff overflowing on long outages',
    tag: 'PR #4320',
    merged: '2026-09-29',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/448',
    summary: 'Stops leaking the MCP client secret to Jupyter',
    tag: 'PR #448',
    merged: '2026-09-25',
  },
  {
    repo: 'fmtlib/fmt',
    url: 'https://github.com/fmtlib/fmt/pull/4942',
    summary: 'Fixes printf zero precision with zero values',
    tag: 'PR #4942',
    merged: '2026-09-19',
  },
  {
    repo: 'valyala/fasthttp',
    url: 'https://github.com/valyala/fasthttp/pull/2392',
    summary: 'Normalizes trailing /. segments in URI paths',
    tag: 'PR #2392',
    merged: '2026-09-19',
  },
  {
    repo: 'labstack/echo',
    url: 'https://github.com/labstack/echo/pull/3094',
    summary: 'Stops the Problem Details handler rewriting shared errors',
    tag: 'PR #3094',
    merged: '2026-09-11',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/449',
    summary: 'Keeps insert_cell from breaking older notebooks',
    tag: 'PR #449',
    merged: '2026-09-11',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/450',
    summary: 'Stops terminal escape codes leaking into cell output',
    tag: 'PR #450',
    merged: '2026-09-11',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/294',
    summary: 'Rejects negative and out-of-range cell indices',
    tag: 'PR #294',
    merged: '2026-07-20',
  },
]
