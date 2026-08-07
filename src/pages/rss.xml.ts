import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { site } from '../data/site'

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('writing'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  return rss({
    title: `${site.name} — Writing`,
    description:
      'Notes on distributed systems, databases, and machine learning infrastructure.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}`,
    })),
    customData: '<language>en-us</language>',
  })
}
