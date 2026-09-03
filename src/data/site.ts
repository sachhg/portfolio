export const site = {
  name: 'Sachit Madaan',
  identity: 'CS at UC Santa Barbara.',
  description:
    'CS honors student at UC Santa Barbara building infrastructure and ML systems. Software engineering at American Express, Conmitto, Turing, and Raytheon.',
  email: 'sachhg21@gmail.com',
  github: 'https://github.com/sachhg',
  githubUser: 'sachhg',
  linkedin: 'https://www.linkedin.com/in/madaan-sachit',
  /** The index links this only when public/resume.pdf is actually present. */
  resume: '/resume.pdf',
  school: 'University of California, Santa Barbara',
} as const

export const nav = [
  { href: '/', label: 'Index' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/open-source', label: 'Open source' },
] as const
