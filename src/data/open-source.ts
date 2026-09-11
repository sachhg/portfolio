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
