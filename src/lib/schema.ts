/**
 * JSON-LD builders. Everything asserted here is also visible on the page —
 * structured data describes the content, it never adds claims of its own.
 */

import { site } from '../data/site'

const UCSB = {
  '@type': 'CollegeOrUniversity',
  name: 'University of California, Santa Barbara',
  sameAs: 'https://www.ucsb.edu',
}

const abs = (origin: string, path: string) => new URL(path, origin).href

export function personSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: origin,
    email: `mailto:${site.email}`,
    jobTitle: 'Software Engineer',
    description: site.identity,
    alumniOf: UCSB,
    // Current role first; schema.org permits multiple employers.
    worksFor: [
      { '@type': 'Organization', name: 'Conmitto', url: 'https://www.conmitto.io' },
      { '@type': 'Organization', name: 'American Express', url: 'https://www.americanexpress.com' },
      { '@type': 'Organization', name: 'Turing', url: 'https://www.turing.com' },
    ],
    knowsAbout: [
      'Distributed systems',
      'Machine learning infrastructure',
      'Post-quantum cryptography',
      'Database systems',
    ],
    sameAs: [site.github, site.linkedin],
    image: abs(origin, '/og.png'),
  }
}

export function articleSchema(opts: {
  origin: string
  path: string
  title: string
  description: string
  date: Date
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.date.toISOString(),
    dateModified: opts.date.toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(opts.origin, opts.path) },
    url: abs(opts.origin, opts.path),
    author: { '@type': 'Person', name: site.name, url: opts.origin },
    publisher: { '@type': 'Person', name: site.name, url: opts.origin },
    image: abs(opts.origin, '/og.png'),
  }
}

export function softwareSchema(opts: {
  origin: string
  path: string
  title: string
  description: string
  repo: string
  stack: readonly string[]
  year: number | string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: opts.title,
    description: opts.description,
    url: abs(opts.origin, opts.path),
    codeRepository: opts.repo,
    programmingLanguage: [...opts.stack],
    dateCreated: String(opts.year),
    author: { '@type': 'Person', name: site.name, url: opts.origin },
  }
}
