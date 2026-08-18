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
      'ML autoscaling for a 300+ VM DBaaS fleet, with LightGBM demand forecasting and a LangChain agent',
    url: 'https://www.americanexpress.com',
  },
  {
    company: 'Conmitto',
    role: 'Software Engineer Intern',
    dates: 'Jun 2025 – present',
    impact:
      'self-serve integration platform with 11 production connectors for WMS/TMS/ERP systems like SAP and SphereWMS',
    url: 'https://www.conmitto.io',
  },
  {
    company: 'Turing',
    role: 'AI Engineering Intern',
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
  'Just wrapped up a Software Engineering internship at **American Express**, building ML autoscaling across a 300+ VM database fleet.',
  'Co-President of **ACM.Industry**, the software consulting club at UCSB.',
]
