import type { APIRoute } from 'astro'

/** Generated so the sitemap URL always matches the real deploy origin. */
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *
Allow: /

# Generated build artifacts; no value as landing pages.
Disallow: /og/

Sitemap: ${new URL('sitemap-index.xml', site).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
