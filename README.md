# sachitmadaan.com

Personal site. Astro 5, MDX, hand-written CSS, no framework.

Static output. The only JavaScript that reaches the browser is the topographic
canvas, about **2.8 KB gzipped**, inlined so the page makes zero extra JS
requests.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/
```

## Layout

```
src/
  components/     Topography.astro is the only one with a script
  content/
    projects/     MDX, one file per project
    writing/      MDX, one file per post
  data/           site.ts (links, identity), experience.ts (roles)
  layouts/        Base.astro (head + SEO), Entry.astro (project/post shell)
  lib/            github.ts (footer data), schema.ts (JSON-LD graph),
                  og-card.ts (satori OG cards)
  pages/          routes, plus og/[...slug].png.ts, rss.xml.ts,
                  robots.txt.ts, llms.txt.ts, 404.astro
  styles/         global.css (tokens), prose.css, shiki-paper.json
scripts/
  fetch-fonts.mjs Downloads, subsets, and instances the two typefaces
```

## Writing content

Projects (`src/content/projects/*.mdx`):

```yaml
---
title: pgpilot
year: 2026
stack: ['Go', 'PostgreSQL']
repo: 'https://github.com/sachhg/pgpilot'   # optional
summary: 'Read-your-writes routing for Postgres'   # ≤46 chars, one row
description: 'Longer form, used for meta description and OG.'
status: active            # active | shipped | archived | in progress
tag: Go                   # mono tag on list rows
featured: true            # surfaces in SELECTED WORK on the home page
order: 2                  # ascending
---
```

Posts (`src/content/writing/*.mdx`) take `title`, `date`, `description`, and
optional `draft: true` (drafts are excluded from the index, RSS, and sitemap).

`summary` is capped at 46 characters by the schema, so the build fails if a row
would wrap past its mono tag. That is deliberate.

## Design

Tokens live at the top of `src/styles/global.css`.

| Token             | Value     | Role                             |
| ----------------- | --------- | -------------------------------- |
| `--paper`         | `#E8E0CA` | background                       |
| `--ink`           | `#1C1B18` | text                             |
| `--muted`         | `#666357` | metadata, captions               |
| `--line`          | `#D3CEC3` | hairline rules                   |
| `--accent`        | `#2F4A8A` | links, active states             |
| `--contour`       | `#3A4760` | canvas minor contours            |
| `--contour-major` | `#2F4A8A` | canvas every-4th contour         |

`--contour` is deliberately separate from `--muted`: `--muted` is pinned by its
4.5:1 requirement as metadata text and cannot be tuned for the canvas.

Newsreader for display and body, Commit Mono for metadata only. Both are
self-hosted from `public/fonts/`, axis-limited and unicode-subset. `npm run
fonts` re-fetches and also instances the two static TTFs under
`src/assets/fonts/` that satori needs for OG cards, since satori cannot read
woff2. Needs `fonttools` and `brotli`; the committed outputs are otherwise fine.

Code blocks use a custom Shiki theme (`src/styles/shiki-paper.json`).

## The background canvas

3D simplex noise contoured with marching squares, chained into paths and drawn
as quadratic curves. Click raises a peak in the field, which gathers the
isolines into rings on their own. Date-seeded, DPR aware, paused when hidden,
one static frame under `prefers-reduced-motion`. The centre column is erased
with a composite pass so text always sits on clean paper.

## SEO

Every page emits a single linked JSON-LD `@graph`: Person, employer
Organizations, WebSite, WebPage, ImageObject, BreadcrumbList, plus ProfilePage
on home, CollectionPage with an ItemList on the indexes, BlogPosting on posts,
and SoftwareSourceCode on projects. Nodes cross-reference by `@id`. Employer
Organizations are generated from `experience.ts`, so the graph cannot drift
from the visible page.

One OG card per route is generated at build under `/og/<route>.png`.
`robots.txt`, `llms.txt`, `rss.xml`, and the sitemap are all generated so their
URLs follow the deploy origin.

## The footer strip

Built at build time from the public GitHub API: last commit, commit count, and
a 30-day sparkline. Every failure path degrades to a static strip rather than
an error, so a rate limit or outage never breaks a build.

Three things to know about why it might look stale:

1. **It reads the *public* events feed.** Activity in private repos never
   appears, and making a repo public does **not** backfill its earlier pushes
   into the timeline. Only pushes made while a repo is public show up.
2. **The data is baked in at build.** It only changes when the site rebuilds.
   Vercel rebuilds on push; for days without a push, that is what
   `.github/workflows/daily-rebuild.yml` is for. It runs at 07:10 UTC, verifies
   the build, then POSTs a Vercel deploy hook. **Until the
   `VERCEL_DEPLOY_HOOK` repo secret exists the deploy step only warns**, so the
   strip will not refresh on quiet days.
3. **Builds are anonymous unless given a token.** `GITHUB_TOKEN` is honoured
   only to lift the 60 req/hr anonymous limit. A build makes about 20 calls
   from shared Vercel IPs, so setting it in Vercel's env vars makes the strip
   reliable. A rate-limited build renders the strip with no live parts, which
   looks identical to being stale.

## Deployment

Vercel, static output.

| Setting          | Value          |
| ---------------- | -------------- |
| Framework preset | Astro          |
| Build command    | `astro build`  |
| Output directory | `dist`         |
| Install command  | `npm ci`       |
| Node version     | 22.x           |

`build.format` is `'directory'`, not `'file'`. With `'file'` a collection index
emits `projects.html` beside a `projects/` directory and a static host
resolving `/projects` picks the directory, finds no `index.html`, and 404s.
`vercel.json` pins `cleanUrls` and `trailingSlash` rather than relying on
platform defaults.

Canonical URLs, the sitemap, `robots.txt`, and `llms.txt` all derive from one
origin, resolved in `astro.config.mjs` in this order:

1. `SITE_URL` if set
2. `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel injects automatically
3. `http://localhost:4321`

So production is self-configuring. Set `SITE_URL` only when pointing a custom
domain at the project.

## Notes

- **Astro is pinned to 5.x.** Every release up to 7.0.9 carries open XSS
  advisories, and there is no patched 5.x. The fix is the Astro 7 major. This
  site is fully static with no SSR and no user-controlled input, which is what
  those vectors require, and the one piece of external data rendered (GitHub
  commit messages) goes through escaped expressions, never `set:html`.
  Upgrading to 7 is worth doing when there is time to test it.
- `public/resume.pdf` is referenced by the home page but not committed. Drop the
  file there to activate the link.
