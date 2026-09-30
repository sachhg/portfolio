export interface Contribution {
  /** `owner/name`, as GitHub renders it. */
  repo: string
  /** The merged pull request. */
  url: string
  /** One clause, in the register of the project summaries. */
  summary: string
  /** Mono tag on the right of the row. */
  tag: string
  /** Longer form, for llms.txt. */
  description: string
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
    repo: 'redis/redis-py',
    url: 'https://github.com/redis/redis-py/pull/4320',
    summary: 'Stops exponential backoff overflowing on long outages',
    tag: 'PR #4320',
    description:
      'Clients configured to retry forever crashed with OverflowError once consecutive failures passed 1024, because multiplying a float base by the arbitrary-precision integer 2**failures exceeded the 64-bit float limit. OverflowError bypassed RedisError handlers and aborted the retry loop. Added a shared _exponential helper using math.ldexp that caps at infinity, scaled the base before exponentiation in ExponentialWithJitterBackoff to preserve zero jitter, and added tests covering large failure counts. Merged into redis-py, the Python client for Redis.',
    merged: '2026-09-29',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/448',
    summary: 'Stops leaking the MCP client secret to Jupyter',
    tag: 'PR #448',
    description:
      'When configured with password authentication, the server forwarded the client\'s MCP bearer token as the Jupyter token on session PUTs and WebSocket room URLs. The cookie authenticated the requests, but the secret was exposed in reverse proxy and access logs. Wrapped the shared-secret verifier to clear the token on verified access credentials so secrets are not passed upstream. Added unit tests verifying token clearing and fallback handling. Merged into the Model Context Protocol server for Jupyter.',
    merged: '2026-09-25',
  },
  {
    repo: 'fmtlib/fmt',
    url: 'https://github.com/fmtlib/fmt/pull/4942',
    summary: 'Fixes printf zero precision with zero values',
    tag: 'PR #4942',
    description:
      'C99 requires converting a zero value with a precision of zero to emit no characters (e.g. %.0d of 0), but fmt::printf printed 0 instead across d, i, o, u, x, and X. Updated write_int to omit digits when both precision and value are zero while preserving flags and width padding, and handled the %#o octal exception. Added tests against platform snprintf covering specifier, flag, and width combinations. Merged into {fmt}, the C++ formatting library.',
    merged: '2026-09-19',
  },
  {
    repo: 'valyala/fasthttp',
    url: 'https://github.com/valyala/fasthttp/pull/2392',
    summary: 'Normalizes trailing /. segments in URI paths',
    tag: 'PR #2392',
    description:
      'RFC 3986 section 5.2.4 step 2B specifies that trailing /. segments must be replaced with /, but normalizePath left them untouched so URI.Path() returned paths like /foo/. instead of /foo/. Added normalization for trailing single-dot segments positioned after parent-directory segment removal, with test cases covering dot runs and dotfiles across RFC-compliant paths. Merged into fasthttp, the fast Go HTTP package.',
    merged: '2026-09-19',
  },
  {
    repo: 'labstack/echo',
    url: 'https://github.com/labstack/echo/pull/3094',
    summary: 'Stops the Problem Details handler rewriting shared errors',
    tag: 'PR #3094',
    description:
      'The RFC 9457 error handler filled in missing fields by writing them back into the error it was handed. Apps often return one shared error value, so concurrent requests raced on the same struct, and after the first request the app\'s own error had a type and title it never set. The defaults now go on a copy, with a test that fails on the old handler. Merged into Echo, the Go web framework.',
    merged: '2026-09-11',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/449',
    summary: 'Keeps insert_cell from breaking older notebooks',
    tag: 'PR #449',
    description:
      'insert_cell gave every new cell an id, but cell ids only exist from nbformat 4.5 on. Inserting into a 4.4 or older notebook wrote a file that failed validation, while the tool still reported success. The id is now left off for older notebooks, and the file keeps the version it had. Added tests that insert each cell type into 4.2, 4.4 and 4.5 notebooks and validate the result. Merged into the Model Context Protocol server for Jupyter.',
    merged: '2026-09-11',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/450',
    summary: 'Stops terminal escape codes leaking into cell output',
    tag: 'PR #450',
    description:
      'Only color and cursor codes were being stripped from cell output, so every other escape a kernel printed got through as raw bytes. A link from rich, for example, showed up with its URL and an internal id still wrapped in escape characters. Widened the regex to catch the rest, and added tests using real output captured from rich. Merged into the Model Context Protocol server for Jupyter.',
    merged: '2026-09-11',
  },
  {
    repo: 'datalayer/jupyter-mcp-server',
    url: 'https://github.com/datalayer/jupyter-mcp-server/pull/294',
    summary: 'Rejects negative and out-of-range cell indices',
    tag: 'PR #294',
    description:
      'delete_cell checked only the upper bound of a cell index, so a negative one either raised a raw IndexError or silently deleted the wrong cell, with -1 deleting the last. Added validation across the YDoc, file and WebSocket paths, and a test module covering it. Merged into the Model Context Protocol server for Jupyter.',
    merged: '2026-07-20',
  },
]
