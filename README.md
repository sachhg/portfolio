# sachitmadaan.com

Personal site. Astro 5, MDX, hand-written CSS, no framework.

Static output. The only JavaScript that reaches the browser is the lattice
canvas on the home page, about **1.3 KB gzipped**, inlined.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/
```

## Layout

```
src/
  components/     Astro components; Lattice.astro is the only one with a script
  content/
    projects/     MDX, one file per project
    writing/      MDX, one file per post
  data/           site.ts (links, identity), experience.ts (roles)
  layouts/        Base.astro (head + SEO), Entry.astro (project/post shell)
  lib/            github.ts (footer data), schema.ts (JSON-LD)
  pages/          routes, plus og.png.ts, rss.xml.ts, robots.txt.ts
  styles/         global.css (tokens), prose.css, shiki-paper.json
scripts/
  fetch-fonts.mjs Downloads and subsets the two typefaces
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

| Token      | Value     | Role                        |
| ---------- | --------- | --------------------------- |
| `--paper`  | `#F2EFE7` | background                  |
| `--ink`    | `#1C1B18` | text                        |
| `--muted`  | `#6E6A5E` | metadata, captions          |
| `--line`   | `#E3DED2` | hairline rules              |
| `--accent` | `#2F4A8A` | links, active states, links in the lattice |

Newsreader for display and body, Commit Mono for metadata only. Both are
self-hosted from `public/fonts/` with `font-display: swap`. Re-fetch with
`npm run fonts` (needs `fonttools` on PATH to regenerate the static TTF that
the OG image uses; the committed one is otherwise fine).

Code blocks use a custom Shiki theme (`src/styles/shiki-paper.json`) that keeps
the paper ground and spends color only on keywords.

## The footer strip

Built at build time from the public GitHub API: last commit, commit count, and
a 30-day sparkline. No token is required; `GITHUB_TOKEN` is only used to lift
the 60 req/hr anonymous rate limit. Every failure path degrades to a
static strip rather than an error, so a rate limit or outage never breaks a
build.

Because the data is baked in, the site needs a periodic rebuild to stay fresh.
That is what `.github/workflows/daily-rebuild.yml` is for. It runs at 07:10 UTC
daily, verifies the build, then POSTs a Vercel deploy hook.

**To finish wiring it up:** create a deploy hook at Vercel → Project → Settings
→ Git → Deploy Hooks, then add it as a repository secret named
`VERCEL_DEPLOY_HOOK`. Until that secret exists the workflow still verifies the
build and simply warns that it skipped the deploy.

## Deployment

Vercel, static output.

| Setting          | Value          |
| ---------------- | -------------- |
| Framework preset | Astro          |
| Build command    | `astro build`  |
| Output directory | `dist`         |
| Install command  | `npm ci`       |
| Node version     | 22.x           |

Canonical URLs, the sitemap, and `robots.txt` all derive from one origin,
resolved in `astro.config.mjs` in this order:

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
