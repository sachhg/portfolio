import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { renderCard } from '../../lib/og-card'
import { site } from '../../data/site'

/** One card per page. Home is 'index' so the route always has a slug to match. */
export async function getStaticPaths() {
  const projects = await getCollection('projects')
  const posts = (await getCollection('writing')).filter((p) => !p.data.draft)

  return [
    {
      params: { slug: 'index' },
      props: { eyebrow: 'Portfolio', title: site.name, subtitle: site.description },
    },
    {
      params: { slug: 'projects' },
      props: {
        eyebrow: 'Projects',
        title: 'Projects',
        subtitle: 'Infrastructure, cryptography, and inference systems.',
      },
    },
    {
      params: { slug: 'writing' },
      props: {
        eyebrow: 'Writing',
        title: 'Writing',
        subtitle: 'Notes on systems worth thinking hard about.',
      },
    },
    ...projects.map((p) => ({
      params: { slug: `projects/${p.id}` },
      props: { eyebrow: 'Project', title: p.data.title, subtitle: p.data.summary },
    })),
    ...posts.map((p) => ({
      params: { slug: `writing/${p.id}` },
      props: { eyebrow: 'Writing', title: p.data.title, subtitle: p.data.description },
    })),
  ]
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as { eyebrow: string; title: string; subtitle?: string })
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
