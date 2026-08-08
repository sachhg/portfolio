/**
 * JSON-LD as a single linked @graph rather than isolated nodes.
 *
 * Every page emits Person, WebSite, WebPage, and BreadcrumbList, cross
 * referenced by @id, plus whatever node describes the page itself. The point
 * of the graph is disambiguation: a crawler can tell that the Person on the
 * home page, the author of a post, and the site's publisher are one entity.
 *
 * Everything asserted here is also visible on the page. Structured data
 * describes the content, it never adds claims of its own.
 */

import { site } from '../data/site'
import { experience } from '../data/experience'

type Node = Record<string, unknown>

const abs = (origin: string, path: string) => new URL(path, origin).href

/** Stable @id anchors, so nodes can reference each other across pages. */
const ids = (origin: string) => ({
  person: `${new URL('/', origin).href}#person`,
  website: `${new URL('/', origin).href}#website`,
  org: (name: string) =>
    `${new URL('/', origin).href}#org-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
})

const UCSB: Node = {
  '@type': 'CollegeOrUniversity',
  name: 'University of California, Santa Barbara',
  sameAs: 'https://www.ucsb.edu',
}

function personNode(origin: string, ogImage: string): Node {
  const id = ids(origin)
  // Employers come from the same list the page renders, so the graph and the
  // visible text can never drift apart.
  const orgs = experience.map((r) => ({
    '@type': 'Organization',
    '@id': id.org(r.company),
    name: r.company,
    ...(r.url ? { url: r.url } : {}),
  }))

  return {
    '@type': 'Person',
    '@id': id.person,
    name: site.name,
    url: new URL('/', origin).href,
    email: `mailto:${site.email}`,
    jobTitle: 'Software Engineer',
    description: site.description,
    image: { '@type': 'ImageObject', url: ogImage, width: 1200, height: 630 },
    alumniOf: UCSB,
    affiliation: UCSB,
    worksFor: { '@id': id.org('Conmitto') },
    knowsAbout: [
      'Distributed systems',
      'Machine learning infrastructure',
      'Post-quantum cryptography',
      'Database systems',
      'Program analysis',
    ],
    sameAs: [site.github, site.linkedin],
    subjectOf: orgs.map((o) => ({ '@id': o['@id'] })),
    '@reverse': { about: [{ '@id': id.website }] },
    _orgs: orgs,
  }
}

function websiteNode(origin: string): Node {
  const id = ids(origin)
  return {
    '@type': 'WebSite',
    '@id': id.website,
    url: new URL('/', origin).href,
    name: site.name,
    description: site.description,
    publisher: { '@id': id.person },
    inLanguage: 'en-US',
    copyrightHolder: { '@id': id.person },
  }
}

function breadcrumbs(origin: string, url: string, trail: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(origin, c.path),
    })),
  }
}

export interface PageInput {
  origin: string
  /** Canonical URL of this page, without a trailing slash. */
  url: string
  title: string
  description: string
  ogImage: string
  /** Breadcrumb trail, root first. */
  trail: { name: string; path: string }[]
  /** Extra nodes describing the page itself. */
  kind?: 'profile' | 'article' | 'software' | 'collection'
  article?: { date: Date; updated?: Date; wordCount: number; section: string }
  software?: { repo?: string; stack: readonly string[]; year: number | string; status: string }
  collection?: { items: { name: string; url: string }[] }
}

export function pageGraph(input: PageInput) {
  const { origin, url, title, description, ogImage, trail, kind } = input
  const id = ids(origin)

  const person = personNode(origin, ogImage)
  const orgs = person._orgs as Node[]
  delete person._orgs
  delete person['@reverse']

  const image: Node = {
    '@type': 'ImageObject',
    '@id': `${url}#primaryimage`,
    url: ogImage,
    contentUrl: ogImage,
    width: 1200,
    height: 630,
  }

  const webPage: Node = {
    '@type':
      kind === 'profile' ? 'ProfilePage' : kind === 'collection' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': id.website },
    primaryImageOfPage: { '@id': `${url}#primaryimage` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    inLanguage: 'en-US',
    ...(kind === 'profile' ? { mainEntity: { '@id': id.person } } : { about: { '@id': id.person } }),
  }

  const graph: Node[] = [person, ...orgs, websiteNode(origin), webPage, image, breadcrumbs(origin, url, trail)]

  if (input.article) {
    const a = input.article
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: title,
      description,
      url,
      datePublished: a.date.toISOString(),
      dateModified: (a.updated ?? a.date).toISOString(),
      author: { '@id': id.person },
      publisher: { '@id': id.person },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      image: { '@id': `${url}#primaryimage` },
      articleSection: a.section,
      wordCount: a.wordCount,
      // Rounded to the nearest minute at 220 wpm.
      timeRequired: `PT${Math.max(1, Math.round(a.wordCount / 220))}M`,
      inLanguage: 'en-US',
      isAccessibleForFree: true,
    })
  }

  if (input.software) {
    const s = input.software
    graph.push({
      '@type': 'SoftwareSourceCode',
      '@id': `${url}#software`,
      name: title,
      description,
      url,
      ...(s.repo ? { codeRepository: s.repo } : {}),
      programmingLanguage: [...s.stack],
      dateCreated: String(s.year),
      creativeWorkStatus: s.status,
      author: { '@id': id.person },
      maintainer: { '@id': id.person },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      isAccessibleForFree: true,
    })
  }

  if (input.collection) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#itemlist`,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: input.collection.items.length,
      itemListElement: input.collection.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: it.url,
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
