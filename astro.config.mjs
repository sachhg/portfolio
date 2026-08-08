// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import paperTheme from './src/styles/shiki-paper.json' with { type: 'json' }

/**
 * Canonical origin. On Vercel this resolves itself from the platform env var,
 * so no hardcoded domain can drift. Override locally or in CI with SITE_URL.
 */
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321')

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: {
    // 'directory', not 'file'. With 'file' a collection index emits
    // projects.html *beside* a projects/ directory holding its children, and
    // a static host resolving /projects picks the directory, finds no
    // index.html in it, and 404s. Directory format gives every route its own
    // index.html with nothing to collide with.
    format: 'directory',
    // The whole stylesheet is ~2.4 KB over the wire. Inlining it removes the
    // only render-blocking request on the critical path.
    inlineStylesheets: 'always',
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // @ts-expect-error: a TextMate theme object is valid here.
      theme: paperTheme,
      wrap: false,
    },
  },
  vite: {
    build: {
      // The canvas is the only script on the site. Inlining it keeps the page
      // to zero extra JS requests; it is ~3 KB over the wire once gzipped.
      assetsInlineLimit: 8192,
    },
  },
})
