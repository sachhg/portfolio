export interface Role {
  company: string
  role: string
  /** Mono-set, as displayed. */
  dates: string
  /** One clause. The home list stays a typeset line, never a card. */
  impact: string
  url?: string
}

/**
 * Ordered by weight rather than recency. A reader gives this ten seconds.
 */
export const experience: Role[] = [
  {
    company: 'American Express',
    role: 'Software Engineer Intern',
    dates: 'May – Aug 2026',
    impact:
      'ML-driven autoscaling for a 500+ cluster DBaaS fleet, cutting compute cost 8% at flat latency',
    url: 'https://www.americanexpress.com',
  },
  {
    company: 'Conmitto',
    role: 'Software Engineer Intern',
    dates: 'Jun 2025 – present',
    impact:
      'self-serve integration platform whose 15 connectors anchored a $6M seed',
    url: 'https://www.conmitto.io',
  },
  {
    company: 'Turing',
    role: 'Applied AI Intern',
    dates: 'Feb – May 2026',
    impact:
      'LangGraph agent triaging live support calls from 10K+ property managers daily',
    url: 'https://www.turing.com',
  },
  {
    company: 'Raytheon',
    role: 'Software Consultant',
    dates: 'Jan – May 2026',
    impact:
      'C++23 inference engine classifying RF signals by modulation on embedded RISC-V',
    url: 'https://www.rtx.com',
  },
  {
    company: 'PwC',
    role: 'Software Consultant',
    dates: 'Mar – May 2025',
    impact:
      'anomaly detection across millions of bank transactions, 25% fewer false positives',
    url: 'https://www.pwc.com',
  },
]

/** The two or three lines under NOW. */
export const now: string[] = [
  'Software engineer intern at **Conmitto**, building the integration platform for a multi-tenant logistics product.',
  'Just wrapped **Global Infrastructure at American Express**, building ML autoscaling across a 500+ cluster DBaaS fleet.',
  'President of **ACM.Industry**, the software consulting club at UCSB.',
]
