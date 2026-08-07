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
    format: 'file',
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
      // The two islands are tiny; inlining them avoids two extra requests
      // and keeps the client JS budget honest.
      assetsInlineLimit: 4096,
    },
  },
})
