import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { site } from '../data/site'
import { experience } from '../data/experience'
import { contributions } from '../data/open-source'

/**
 * llms.txt: a plain-text summary for language-model crawlers, mirroring what
 * the site already says. Same convention as robots.txt, generated so it can
 * never drift from the content.
 */
export const GET: APIRoute = async ({ site: origin }) => {
  const abs = (p: string) => new URL(p, origin).href
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order)
  const posts = (await getCollection('writing'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  const body = `# ${site.name}

> ${site.description}

${site.identity} Personal site, portfolio, and writing.

## Experience

${experience.map((r) => `- **${r.company}**, ${r.role} (${r.dates}): ${r.impact}`).join('\n')}

## Projects

${projects.map((p) => `- [${p.data.title}](${abs(`/projects/${p.id}`)}): ${p.data.description}${p.data.repo ? ` Source: ${p.data.repo}` : ''}`).join('\n')}

## Open source

${contributions.map((c) => `- [${c.repo}](${c.url}) (merged ${c.merged}): ${c.description}`).join('\n')}

## Writing

${posts.map((p) => `- [${p.data.title}](${abs(`/writing/${p.id}`)}) (${p.data.date.toISOString().slice(0, 10)}): ${p.data.description}`).join('\n')}

## Links

- GitHub: ${site.github}
- LinkedIn: ${site.linkedin}
- Email: ${site.email}
- RSS: ${abs('/rss.xml')}
- Sitemap: ${abs('/sitemap-index.xml')}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
