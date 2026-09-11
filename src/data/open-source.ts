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
