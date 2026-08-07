import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    year: z.union([z.number(), z.string()]),
    stack: z.array(z.string()),
    repo: z.string().url().optional(),
    /** One short clause. Must fit a single row beside the mono tag. */
    summary: z.string().max(46),
    /** Longer form, for meta description and OG. */
    description: z.string(),
    status: z.enum(['active', 'shipped', 'archived', 'in progress']),
    /** Mono tag shown on one-line rows. */
    tag: z.string(),
    /** Surfaced in the SELECTED WORK block on the home page. */
    featured: z.boolean().default(false),
    /** Ascending. Controls order in both the index and the home list. */
    order: z.number().default(99),
  }),
})

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { projects, writing }
