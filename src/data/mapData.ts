export type MockupType =
  | 'dashboard' | 'code-editor' | 'api-docs'
  | 'mobile-app' | 'terminal' | 'data-viz'
  | 'search-ui' | 'pipeline-monitor' | 'blockchain-explorer'
  | 'design-system';

export type ArchNode = { id: string; label: string; x: number; y: number; color?: string };
export type ArchEdge = { from: string; to: string; label?: string };
export type ArchDiagram = { nodes: ArchNode[]; edges: ArchEdge[] };

export type StationMedia = {
  mockup?: MockupType;
  architecture?: ArchDiagram;
  github?: string;
};

export type Station = {
  id: string;
  name: string;
  position: [number, number];
  description: string;
  details: string;
  tags?: string[];
  link?: string;
  isInterchange?: boolean;
  labelDir?: 'above' | 'below' | 'left' | 'right';
  media?: StationMedia;
  markdown?: boolean;
  logo?: string;
};

export type Line = {
  id: string;
  name: string;
  color: string;
  stations: Station[];
};

export type MetroArea = {
  id: string;
  name: string;
  lines: Line[];
  center: [number, number];
  labelOffset?: [number, number];
};

export type MetroMap = {
  areas: MetroArea[];
  connectorLines: Line[];
  width: number;
  height: number;
};

// ============================================================
// PROJECTS — Blue Line Family (top-left quadrant)
// ============================================================

const projectsLines: Line[] = [
  {
    id: 'blue',
    name: 'Blue Line',
    color: '#0039A6',
    stations: [
      {
        id: 'p-cloud-orchestrator',
        name: 'Cloud Orchestrator',
        position: [180, 120],
        description: 'Distributed cloud infrastructure management platform',
        details: 'Built a distributed system for orchestrating cloud resources across multiple providers. Features auto-scaling, health monitoring, and cost optimization. Handles 10K+ deployments daily with 99.9% uptime.',
        tags: ['Go', 'Kubernetes', 'Terraform', 'AWS'],
        link: '#',
        logo: 'logos/placeholder.svg',
        media: {
          mockup: 'dashboard',
          architecture: {
            nodes: [
              { id: 'lb', label: 'Load Balancer', x: 50, y: 15, color: '#0039A6' },
              { id: 'api', label: 'API Server', x: 25, y: 45, color: '#0039A6' },
              { id: 'sched', label: 'Scheduler', x: 75, y: 45, color: '#FF6319' },
              { id: 'aws', label: 'AWS', x: 15, y: 80, color: '#00933C' },
              { id: 'gcp', label: 'GCP', x: 50, y: 80, color: '#00933C' },
              { id: 'db', label: 'PostgreSQL', x: 85, y: 80, color: '#7B2D8E' },
            ],
            edges: [
              { from: 'lb', to: 'api' },
              { from: 'lb', to: 'sched' },
              { from: 'api', to: 'aws', label: 'deploy' },
              { from: 'api', to: 'gcp', label: 'deploy' },
              { from: 'sched', to: 'db', label: 'state' },
            ],
          },
          github: 'kubernetes/kubernetes',
        },
      },
      {
        id: 'p-data-pipeline',
        name: 'Data Pipeline',
        position: [260, 120],
        description: 'Real-time data processing and analytics engine',
        details: 'Designed and implemented a streaming data pipeline processing 2M+ events/sec. Integrates with Kafka, Spark, and custom ML models for real-time anomaly detection and alerting.',
        tags: ['Python', 'Apache Kafka', 'Spark', 'Redis'],
        link: '#',
        isInterchange: true,
        media: {
          mockup: 'pipeline-monitor',
          github: 'apache/kafka',
        },
      },
      {
        id: 'p-ml-dashboard',
        name: 'ML Dashboard',
        position: [340, 120],
        description: 'Machine learning model monitoring dashboard',
        details: 'Interactive dashboard for monitoring ML model performance, drift detection, and A/B test results. Real-time visualization of model metrics across production environments.',
        tags: ['React', 'D3.js', 'Python', 'FastAPI'],
        link: '#',
        media: {
          mockup: 'dashboard',
          architecture: {
            nodes: [
              { id: 'ui', label: 'React UI', x: 50, y: 15, color: '#0078C8' },
              { id: 'api', label: 'FastAPI', x: 25, y: 50, color: '#00933C' },
              { id: 'ml', label: 'ML Models', x: 75, y: 50, color: '#7B2D8E' },
              { id: 'ts', label: 'TimescaleDB', x: 50, y: 85, color: '#FF6319' },
            ],
            edges: [
              { from: 'ui', to: 'api', label: 'REST' },
              { from: 'api', to: 'ml', label: 'predict' },
              { from: 'api', to: 'ts', label: 'metrics' },
              { from: 'ml', to: 'ts', label: 'log' },
            ],
          },
        },
      },
      {
        id: 'p-api-gateway',
        name: 'API Gateway',
        position: [420, 120],
        description: 'High-performance API gateway with rate limiting',
        details: 'Custom API gateway handling 50K req/s with intelligent rate limiting, request transformation, and circuit breaking. Reduced p99 latency by 40% compared to previous solution.',
        tags: ['Rust', 'Redis', 'gRPC', 'Docker'],
        link: '#',
        media: {
          mockup: 'api-docs',
          github: 'envoyproxy/envoy',
        },
      },
      {
        id: 'p-devtools',
        name: 'DevTools Suite',
        position: [500, 120],
        description: 'Internal developer productivity toolkit',
        details: 'Suite of CLI tools and VS Code extensions for streamlining development workflows. Automated code generation, testing scaffolds, and deployment helpers used by 200+ engineers.',
        tags: ['TypeScript', 'Node.js', 'VS Code API'],
        link: '#',
        isInterchange: true,
      },
    ],
  },
  {
    id: 'light-blue',
    name: 'Light Blue Line',
    color: '#0078C8',
    stations: [
      {
        id: 'p-mobile-app',
        name: 'Mobile App',
        position: [200, 60],
        description: 'Cross-platform mobile application',
        details: 'Feature-rich mobile app with offline support, push notifications, and biometric authentication. 50K+ downloads with 4.7 star rating across both platforms.',
        tags: ['React Native', 'TypeScript', 'Firebase'],
        link: '#',
        media: {
          mockup: 'mobile-app',
        },
      },
      {
        id: 'p-data-pipeline-lb',
        name: 'Data Pipeline',
        position: [260, 120],
        description: 'Real-time data processing and analytics engine',
        details: 'Designed and implemented a streaming data pipeline processing 2M+ events/sec.',
        tags: ['Python', 'Apache Kafka', 'Spark', 'Redis'],
        isInterchange: true,
      },
      {
        id: 'p-design-system',
        name: 'Design System',
        position: [320, 180],
        description: 'Component library and design token system',
        details: 'Comprehensive design system with 60+ components, accessibility built-in, and automated visual regression testing. Adopted across 12 product teams, reducing UI development time by 35%.',
        tags: ['React', 'Storybook', 'CSS-in-JS', 'Figma'],
        link: '#',
        labelDir: 'below',
      },
      {
        id: 'p-search-engine',
        name: 'Search Engine',
        position: [380, 240],
        description: 'Full-text search with semantic understanding',
        details: 'Built a search engine combining traditional full-text search with vector embeddings for semantic search. Supports fuzzy matching, faceted search, and personalized ranking.',
        tags: ['Elasticsearch', 'Python', 'BERT', 'React'],
        link: '#',
        labelDir: 'below',
        isInterchange: true,
        media: {
          mockup: 'search-ui',
          github: 'elastic/elasticsearch',
        },
      },
    ],
  },
  {
    id: 'cyan',
    name: 'Cyan Line',
    color: '#00A1DE',
    stations: [
      {
        id: 'p-blockchain',
        name: 'Chain Explorer',
        position: [140, 180],
        description: 'Blockchain transaction explorer and analytics',
        details: 'Real-time blockchain explorer with transaction visualization, wallet tracking, and smart contract analysis. Processes and indexes blocks within seconds of confirmation.',
        tags: ['TypeScript', 'Web3.js', 'PostgreSQL', 'React'],
        link: '#',
        labelDir: 'below',
        media: {
          mockup: 'blockchain-explorer',
        },
      },
      {
        id: 'p-blockchain-mid',
        name: 'Protocol Bridge',
        position: [200, 180],
        description: 'Cross-chain bridge protocol',
        details: 'Secure cross-chain asset bridge supporting EVM-compatible chains. Implemented atomic swap mechanism with multi-sig validation and fraud proofs.',
        tags: ['Solidity', 'Go', 'TypeScript'],
        link: '#',
        labelDir: 'below',
      },
      {
        id: 'p-data-pipeline-cy',
        name: 'Data Pipeline',
        position: [260, 120],
        description: 'Real-time data processing and analytics engine',
        details: 'Designed and implemented a streaming data pipeline processing 2M+ events/sec.',
        tags: ['Python', 'Apache Kafka'],
        isInterchange: true,
      },
      {
        id: 'p-viz-tool',
        name: 'Viz Studio',
        position: [340, 40],
        description: 'Interactive data visualization builder',
        details: 'Drag-and-drop visualization builder supporting 20+ chart types with real-time data connections. Export to PDF, SVG, and embeddable widgets.',
        tags: ['D3.js', 'React', 'Canvas', 'WebGL'],
        link: '#',
        media: {
          mockup: 'data-viz',
        },
      },
    ],
  },
];

// ============================================================
// EXPERIENCE — Red/Orange Line Family (top-right quadrant)
// ============================================================

const experienceLines: Line[] = [
  {
    id: 'red',
    name: 'Red Line',
    color: '#EE352E',
    stations: [
      {
        id: 'e-current',
        name: 'Senior Engineer',
        position: [700, 100],
        description: 'Senior Software Engineer — Current Role',
        details: 'Leading a team of 6 engineers building distributed systems for real-time data processing. Architected migration from monolith to microservices, improving deployment frequency by 10x. Mentoring junior engineers and driving technical strategy.',
        tags: ['2023–Present', 'Tech Lead', 'Distributed Systems'],
        isInterchange: true,
      },
      {
        id: 'e-mid',
        name: 'Software Engineer',
        position: [780, 100],
        description: 'Software Engineer — Growth Team',
        details: 'Built experimentation platform supporting 200+ concurrent A/B tests. Developed ML-powered recommendation engine that increased user engagement by 25%. Owned end-to-end development of key growth features.',
        tags: ['2021–2023', 'Full Stack', 'ML'],
        isInterchange: true,
      },
      {
        id: 'e-junior',
        name: 'Junior Developer',
        position: [860, 100],
        description: 'Junior Developer — Platform Team',
        details: 'First engineering role. Built internal tools, maintained CI/CD pipelines, and contributed to the core API. Shipped features used by millions of users within first 6 months.',
        tags: ['2019–2021', 'Backend', 'DevOps'],
      },
      {
        id: 'e-intern',
        name: 'Engineering Intern',
        position: [940, 100],
        description: 'Software Engineering Intern',
        details: 'Summer internship focused on building data visualization tools. Created an internal dashboard that became a key tool for the analytics team. Received return offer.',
        tags: ['Summer 2019', 'Internship', 'Data Viz'],
      },
    ],
  },
  {
    id: 'orange',
    name: 'Orange Line',
    color: '#FF6319',
    stations: [
      {
        id: 'e-opensource',
        name: 'Open Source',
        position: [720, 40],
        description: 'Open source contributions and maintainership',
        details: 'Active contributor to several major open source projects. Maintainer of a popular utility library with 5K+ GitHub stars. Regular speaker at meetups about open source development.',
        tags: ['Ongoing', 'Community', 'GitHub'],
      },
      {
        id: 'e-mid-o',
        name: 'Software Engineer',
        position: [780, 100],
        description: 'Software Engineer — Growth Team',
        details: 'Built experimentation platform supporting 200+ concurrent A/B tests.',
        tags: ['2021–2023', 'Full Stack'],
        isInterchange: true,
      },
      {
        id: 'e-freelance',
        name: 'Freelance',
        position: [840, 160],
        description: 'Freelance consulting and contract work',
        details: 'Consulted for 10+ startups on architecture, scaling, and technical strategy. Built MVPs, optimized databases, and helped teams establish engineering best practices.',
        tags: ['2018–2020', 'Consulting', 'Architecture'],
        labelDir: 'below',
      },
      {
        id: 'e-teaching',
        name: 'Teaching Asst',
        position: [900, 220],
        description: 'Teaching Assistant — Computer Science',
        details: 'TA for Data Structures and Algorithms course. Led weekly lab sessions for 40+ students. Created supplementary learning materials and automated grading scripts.',
        tags: ['2018–2019', 'Education', 'Mentoring'],
        labelDir: 'below',
        isInterchange: true,
      },
    ],
  },
  {
    id: 'dark-red',
    name: 'Maroon Line',
    color: '#A4262C',
    stations: [
      {
        id: 'e-hackathon',
        name: 'Hackathon Wins',
        position: [720, 160],
        description: 'Hackathon victories and notable projects',
        details: 'Won 3 major hackathons including HackMIT and TreeHacks. Projects ranged from AR navigation for visually impaired users to a real-time collaborative coding platform.',
        tags: ['2018–2022', 'Innovation', 'Rapid Prototyping'],
        labelDir: 'below',
      },
      {
        id: 'e-mid-dr',
        name: 'Software Engineer',
        position: [780, 100],
        description: 'Software Engineer — Growth Team',
        details: 'Built experimentation platform supporting 200+ concurrent A/B tests.',
        tags: ['2021–2023'],
        isInterchange: true,
      },
      {
        id: 'e-research',
        name: 'Research Asst',
        position: [840, 40],
        description: 'Undergraduate research assistant',
        details: 'Research assistant in the HCI lab focused on novel interaction paradigms. Co-authored a paper on gesture-based interfaces published at CHI 2020.',
        tags: ['2018–2019', 'HCI', 'Research'],
      },
    ],
  },
];

// ============================================================
// EDUCATION — Green Line Family (bottom-left quadrant)
// ============================================================

const educationLines: Line[] = [
  {
    id: 'green',
    name: 'Green Line',
    color: '#00933C',
    stations: [
      {
        id: 'ed-university',
        name: 'University',
        position: [180, 420],
        description: 'B.S. Computer Science — State University',
        details: 'Bachelor of Science in Computer Science with honors. GPA: 3.8/4.0. Focus areas in distributed systems and machine learning. Dean\'s List all semesters. Senior thesis on efficient graph partitioning algorithms.',
        tags: ['2016–2020', 'B.S. CS', 'Honors'],
      },
      {
        id: 'ed-algorithms',
        name: 'Algorithms',
        position: [260, 420],
        description: 'Advanced Algorithms & Data Structures',
        details: 'Graduate-level algorithms course covering advanced graph algorithms, approximation algorithms, randomized algorithms, and computational geometry. Final project on parallel sorting algorithms.',
        tags: ['Course', 'Theory', 'Graduate Level'],
        isInterchange: true,
      },
      {
        id: 'ed-systems',
        name: 'Systems',
        position: [340, 420],
        description: 'Distributed Systems',
        details: 'Comprehensive course on distributed systems including consensus protocols, replication strategies, and fault tolerance. Built a simplified Raft implementation as the final project.',
        tags: ['Course', 'Distributed', 'Raft'],
        isInterchange: true,
      },
      {
        id: 'ed-ml',
        name: 'Machine Learning',
        position: [420, 420],
        description: 'Introduction to Machine Learning',
        details: 'Foundational ML course covering supervised/unsupervised learning, neural networks, and reinforcement learning. Implemented a CNN for medical image classification achieving 94% accuracy.',
        tags: ['Course', 'ML', 'Deep Learning'],
      },
      {
        id: 'ed-capstone',
        name: 'Capstone',
        position: [500, 420],
        description: 'Senior Capstone Project',
        details: 'Year-long capstone project building a real-time collaborative development environment. Won Best Technical Achievement award. Project was later adopted by the CS department for teaching.',
        tags: ['2020', 'Project', 'Award'],
        isInterchange: true,
      },
    ],
  },
  {
    id: 'light-green',
    name: 'Light Green Line',
    color: '#6CBE45',
    stations: [
      {
        id: 'ed-bootcamp',
        name: 'Web Dev Bootcamp',
        position: [200, 360],
        description: 'Full-stack web development intensive',
        details: '12-week immersive bootcamp covering modern web development. Built 5 full-stack applications. Learned React, Node.js, PostgreSQL, and deployment with AWS.',
        tags: ['2016', 'Full Stack', 'Intensive'],
      },
      {
        id: 'ed-algorithms-lg',
        name: 'Algorithms',
        position: [260, 420],
        description: 'Advanced Algorithms & Data Structures',
        details: 'Graduate-level algorithms course.',
        tags: ['Course', 'Theory'],
        isInterchange: true,
      },
      {
        id: 'ed-databases',
        name: 'Databases',
        position: [320, 480],
        description: 'Database Systems',
        details: 'Course on database internals, query optimization, transaction processing, and distributed databases. Built a simple storage engine with B+ tree indexing from scratch.',
        tags: ['Course', 'SQL', 'Storage Engines'],
        labelDir: 'below',
      },
      {
        id: 'ed-security',
        name: 'Security',
        position: [380, 480],
        description: 'Computer Security',
        details: 'Course covering cryptography, network security, web security, and secure system design. CTF competition participant. Learned penetration testing and secure coding practices.',
        tags: ['Course', 'Cryptography', 'CTF'],
        labelDir: 'below',
      },
    ],
  },
  {
    id: 'teal',
    name: 'Teal Line',
    color: '#00897B',
    stations: [
      {
        id: 'ed-mooc',
        name: 'Online Courses',
        position: [200, 480],
        description: 'Self-directed online learning',
        details: 'Completed 20+ courses on Coursera, edX, and MIT OCW covering topics from quantum computing to financial engineering. Continuous learner committed to expanding knowledge.',
        tags: ['Ongoing', 'Self-Directed', 'MOOCs'],
        labelDir: 'below',
      },
      {
        id: 'ed-algorithms-t',
        name: 'Algorithms',
        position: [260, 420],
        description: 'Advanced Algorithms & Data Structures',
        details: 'Graduate-level algorithms course.',
        tags: ['Course'],
        isInterchange: true,
      },
      {
        id: 'ed-certifications',
        name: 'Certifications',
        position: [320, 360],
        description: 'Professional certifications',
        details: 'AWS Solutions Architect Professional, Kubernetes Administrator (CKA), and Google Cloud Professional Data Engineer. Maintaining active certifications through continuous learning.',
        tags: ['AWS', 'Kubernetes', 'GCP'],
      },
    ],
  },
];

// ============================================================
// SKILLS & INTERESTS — Purple/Yellow Line Family (bottom-right)
// ============================================================

const skillsLines: Line[] = [
  {
    id: 'purple',
    name: 'Purple Line',
    color: '#7B2D8E',
    stations: [
      {
        id: 's-languages',
        name: 'Languages',
        position: [680, 400],
        description: 'Programming languages',
        details: 'Proficient in TypeScript, Python, Go, and Rust. Comfortable with Java, C++, and SQL. Always exploring new languages — currently learning Zig and Gleam.',
        tags: ['TypeScript', 'Python', 'Go', 'Rust'],
        isInterchange: true,
      },
      {
        id: 's-frontend',
        name: 'Frontend',
        position: [760, 400],
        description: 'Frontend technologies and frameworks',
        details: 'Expert in React ecosystem including Next.js, Remix, and React Native. Strong CSS skills with Tailwind and CSS-in-JS. Experience with WebGL, Canvas, and SVG for data visualization.',
        tags: ['React', 'Next.js', 'Tailwind', 'WebGL'],
        isInterchange: true,
      },
      {
        id: 's-backend',
        name: 'Backend',
        position: [840, 400],
        description: 'Backend technologies and infrastructure',
        details: 'Experienced with Node.js, Django, and Go services. Strong in database design (PostgreSQL, Redis, MongoDB). Familiar with message queues (Kafka, RabbitMQ) and caching strategies.',
        tags: ['Node.js', 'Go', 'PostgreSQL', 'Kafka'],
      },
      {
        id: 's-devops',
        name: 'DevOps',
        position: [920, 400],
        description: 'DevOps and infrastructure',
        details: 'Kubernetes orchestration, CI/CD pipeline design, infrastructure as code with Terraform. Experience with AWS, GCP, and Azure. Monitoring with Datadog and Grafana.',
        tags: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
        isInterchange: true,
      },
    ],
  },
  {
    id: 'yellow',
    name: 'Yellow Line',
    color: '#FCCC0A',
    stations: [
      {
        id: 's-photography',
        name: 'Photography',
        position: [700, 340],
        description: 'Street and landscape photography',
        details: 'Passionate street and landscape photographer. Shooting with a Fujifilm X-T5. Work featured in local galleries. Love capturing the geometry of urban architecture and the mood of city life.',
        tags: ['Fujifilm', 'Street', 'Landscape'],
      },
      {
        id: 's-frontend-y',
        name: 'Frontend',
        position: [760, 400],
        description: 'Frontend technologies and frameworks',
        details: 'Expert in React ecosystem.',
        tags: ['React', 'Next.js'],
        isInterchange: true,
      },
      {
        id: 's-music',
        name: 'Music',
        position: [820, 460],
        description: 'Music production and guitar',
        details: 'Amateur music producer and guitarist. Create lo-fi and ambient electronic music. Play acoustic guitar — mostly fingerstyle. Music is my go-to creative outlet outside of coding.',
        tags: ['Production', 'Guitar', 'Lo-fi'],
        labelDir: 'below',
      },
      {
        id: 's-running',
        name: 'Running',
        position: [880, 460],
        description: 'Distance running and marathons',
        details: 'Completed 3 marathons and 10+ half-marathons. Current marathon PR: 3:28. Running is my meditation — it\'s where I do my best thinking and problem-solving.',
        tags: ['Marathon', 'Trail Running', 'Fitness'],
        labelDir: 'below',
      },
    ],
  },
  {
    id: 'lavender',
    name: 'Lavender Line',
    color: '#B07CC6',
    stations: [
      {
        id: 's-writing',
        name: 'Tech Writing',
        position: [700, 460],
        description: 'Technical writing and blogging',
        details: 'Maintain a technical blog with 50K+ monthly readers. Topics include distributed systems, developer tooling, and software architecture. Guest posts on major tech publications.',
        tags: ['Blog', 'Documentation', 'Speaking'],
        labelDir: 'below',
      },
      {
        id: 's-frontend-l',
        name: 'Frontend',
        position: [760, 400],
        description: 'Frontend technologies and frameworks',
        details: 'Expert in React ecosystem.',
        tags: ['React'],
        isInterchange: true,
      },
      {
        id: 's-ai',
        name: 'AI / ML',
        position: [820, 340],
        description: 'Artificial intelligence and machine learning',
        details: 'Hands-on experience with LLMs, prompt engineering, and RAG systems. Built several AI-powered tools including a code review assistant and an intelligent search system.',
        tags: ['LLMs', 'RAG', 'PyTorch', 'Prompt Engineering'],
      },
      {
        id: 's-oss',
        name: 'Open Source',
        position: [920, 340],
        description: 'Open source community involvement',
        details: 'Active open source contributor and maintainer. Believe strongly in giving back to the community. Mentor new contributors and help maintain welcoming project cultures.',
        tags: ['GitHub', 'Community', 'Mentoring'],
      },
    ],
  },
];

// ============================================================
// BLOG / TECHNICAL WRITING — Emerald/Copper Lines (center)
// ============================================================

const blogLines: Line[] = [
  {
    id: 'emerald',
    name: 'Emerald Line',
    color: '#10B981',
    stations: [
      {
        id: 'b-systems',
        name: 'Systems Deep Dive',
        position: [480, 300],
        description: 'Understanding Consensus: From Paxos to Raft',
        details: `## Understanding Consensus: From Paxos to Raft

Distributed consensus is the backbone of every reliable system. Here is what I learned implementing both protocols from scratch.

### The Problem

When multiple nodes need to agree on a value — who is the leader, what is the latest write, which transaction committed — you need a consensus protocol. Getting it wrong means split-brain, lost data, or silent corruption.

\`\`\`go
func (r *Raft) AppendEntries(args AppendEntriesArgs) {
    if args.Term < r.currentTerm {
        return // reject stale leader
    }
    r.resetElectionTimer()
    // replicate log entries
}
\`\`\`

### Paxos vs Raft

| Property | Paxos | Raft |
|----------|-------|------|
| Understandability | Complex | Designed for clarity |
| Leader election | Multi-round | Single round |
| Log replication | Implicit | Explicit |

### Key Takeaway

Raft's genius is not algorithmic novelty — it is **decomposition**. By splitting consensus into leader election, log replication, and safety, it becomes something you can actually implement correctly.`,
        tags: ['Distributed Systems', 'Consensus', 'Go'],
        markdown: true,
        labelDir: 'left',
      },
      {
        id: 'b-central',
        name: 'Blog Central',
        position: [560, 300],
        description: 'Technical writing hub — all posts converge here',
        details: 'The central station of the Blog district. This is where all technical writing lines converge. Browse posts on systems design, frontend craft, open source, and the writing process itself.',
        tags: ['Hub', 'Technical Writing'],
        isInterchange: true,
      },
      {
        id: 'b-frontend',
        name: 'Frontend Craft',
        position: [640, 300],
        description: 'Building Performant SVG Animations in React',
        details: `## Building Performant SVG Animations in React

This portfolio is itself an SVG metro map with animated trains. Here is how it stays at 60fps.

### The Challenge

Animating elements along SVG paths sounds simple — until you have dozens of trains, each following a unique polyline, and the user is panning and zooming simultaneously.

\`\`\`tsx
function useTrainAnimation(pathRef: RefObject<SVGPolylineElement>) {
  const trainRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame: number;
    const animate = (time: number) => {
      const pos = interpolateAlongPath(pathRef.current!, time);
      trainRef.current?.setAttribute('cx', String(pos.x));
      trainRef.current?.setAttribute('cy', String(pos.y));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return trainRef;
}
\`\`\`

### Performance Rules

- **Use \`requestAnimationFrame\`**, not CSS transitions, for path-following
- **Avoid React re-renders** — mutate DOM attributes directly via refs
- **Batch SVG updates** — group transforms under a single \`<g>\` element
- **Respect \`prefers-reduced-motion\`** — freeze trains for users who need it`,
        tags: ['React', 'SVG', 'Animation', 'Performance'],
        markdown: true,
        labelDir: 'right',
      },
    ],
  },
  {
    id: 'copper',
    name: 'Copper Line',
    color: '#D97706',
    stations: [
      {
        id: 'b-writing',
        name: 'Writing Process',
        position: [500, 240],
        description: 'My Technical Writing Workflow',
        details: `## My Technical Writing Workflow

Good technical writing is rewriting. Here is the process behind every post on this site.

### The Five Stages

1. **Capture** — jot the core idea in a single sentence
2. **Outline** — structure with headers before writing any prose
3. **Draft** — write fast, do not stop to edit
4. **Review** — read aloud, then cut 30% of the words
5. **Publish** — ship it, then iterate based on feedback

### Tools I Use

- **Obsidian** for drafting and linking ideas into a knowledge graph
- **Vale** for automated style checking against a custom ruleset
- **Carbon** for beautiful code screenshots in posts

> "The first draft of anything is garbage." — Hemingway (paraphrased)

### Why Engineers Should Write

Writing forces clarity of thought. If you cannot explain a system in plain language, you do not fully understand it. Every blog post I write makes me a better engineer.`,
        tags: ['Writing', 'Process', 'Workflow'],
        markdown: true,
      },
      {
        id: 'b-central-copper',
        name: 'Blog Central',
        position: [560, 300],
        description: 'Technical writing hub',
        details: 'Central hub for the blog district.',
        tags: ['Hub'],
        isInterchange: true,
      },
      {
        id: 'b-oss',
        name: 'OSS Stories',
        position: [620, 360],
        description: 'Lessons from Maintaining a 5K-Star Library',
        details: `## Lessons from Maintaining a 5K-Star Library

What nobody tells you about open source maintainership — and what I wish I had known before my first project took off.

### What I Learned

- **Triage ruthlessly** — not every issue deserves a response within 24 hours
- **Write CONTRIBUTING.md first** — it saves hundreds of hours of back-and-forth
- **Automate everything** — CI, releases, changelog generation, label bots

### The Human Side

> The hardest part of open source is not the code. It is saying "no" kindly to well-intentioned contributions that do not fit the project's direction.

Burnout is real. I learned to set boundaries: no GitHub notifications on weekends, a clear roadmap that says "not planned" as often as "planned."

### By the Numbers

- **127** pull requests merged from external contributors
- **5,200+** GitHub stars
- **3** breaking changes across 2 years (semver works)
- **0** known vulnerabilities in production`,
        tags: ['Open Source', 'Community', 'GitHub'],
        markdown: true,
        labelDir: 'below',
      },
    ],
  },
];

// ============================================================
// CONNECTOR LINES — Cross-area routes
// ============================================================

const connectorLines: Line[] = [
  {
    id: 'gold',
    name: 'Gold Line',
    color: '#C4820E',
    stations: [
      {
        id: 'c-devtools',
        name: 'DevTools Suite',
        position: [500, 120],
        description: 'Internal developer productivity toolkit',
        details: 'Suite of CLI tools and VS Code extensions for streamlining development workflows. Automated code generation, testing scaffolds, and deployment helpers used by 200+ engineers.',
        tags: ['TypeScript', 'Node.js', 'VS Code API'],
        isInterchange: true,
      },
      {
        id: 'c-midtown',
        name: 'Midtown',
        position: [600, 120],
        description: 'Central connector station',
        details: 'A central hub linking the Projects district to the Experience corridor. This station represents the bridge between building things and professional growth.',
        tags: ['Connector', 'North Corridor'],
      },
      {
        id: 'c-city-center',
        name: 'City Center',
        position: [680, 120],
        description: 'Northern interchange point',
        details: 'Gateway station connecting to the Experience district from the north corridor.',
        tags: ['Connector', 'North Corridor'],
      },
      {
        id: 'c-senior-eng',
        name: 'Senior Engineer',
        position: [700, 100],
        description: 'Senior Software Engineer — Current Role',
        details: 'Leading a team of 6 engineers building distributed systems for real-time data processing. Architected migration from monolith to microservices, improving deployment frequency by 10x.',
        tags: ['2023–Present', 'Tech Lead', 'Distributed Systems'],
        isInterchange: true,
      },
    ],
  },
  {
    id: 'brown',
    name: 'Brown Line',
    color: '#8B4513',
    stations: [
      {
        id: 'c-capstone',
        name: 'Capstone',
        position: [500, 420],
        description: 'Senior Capstone Project',
        details: 'Year-long capstone project building a real-time collaborative development environment. Won Best Technical Achievement award.',
        tags: ['2020', 'Project', 'Award'],
        isInterchange: true,
      },
      {
        id: 'c-southbank',
        name: 'Southbank',
        position: [580, 420],
        description: 'Southern connector station',
        details: 'Connecting the Education district to the Skills & Interests quarter. Where academic foundations meet practical expertise.',
        tags: ['Connector', 'South Corridor'],
      },
      {
        id: 'c-riverside',
        name: 'Riverside',
        position: [660, 420],
        description: 'Southern interchange point',
        details: 'Gateway station to the Skills & Interests district from the south corridor.',
        tags: ['Connector', 'South Corridor'],
      },
      {
        id: 'c-languages',
        name: 'Languages',
        position: [680, 400],
        description: 'Programming languages',
        details: 'Proficient in TypeScript, Python, Go, and Rust. Comfortable with Java, C++, and SQL. Always exploring new languages — currently learning Zig and Gleam.',
        tags: ['TypeScript', 'Python', 'Go', 'Rust'],
        isInterchange: true,
      },
    ],
  },
  {
    id: 'silver',
    name: 'Silver Line',
    color: '#8C8C8C',
    stations: [
      {
        id: 'c-search-engine',
        name: 'Search Engine',
        position: [380, 240],
        description: 'Full-text search with semantic understanding',
        details: 'Built a search engine combining traditional full-text search with vector embeddings for semantic search. Supports fuzzy matching, faceted search, and personalized ranking.',
        tags: ['Elasticsearch', 'Python', 'BERT', 'React'],
        isInterchange: true,
      },
      {
        id: 'c-westbridge',
        name: 'Westbridge',
        position: [340, 280],
        description: 'Western connector station',
        details: 'Linking the Projects district to the Education quarter along the western corridor. Where ideas become curriculum.',
        tags: ['Connector', 'West Corridor'],
      },
      {
        id: 'c-systems',
        name: 'Systems',
        position: [340, 420],
        description: 'Distributed Systems',
        details: 'Comprehensive course on distributed systems including consensus protocols, replication strategies, and fault tolerance. Built a simplified Raft implementation as the final project.',
        tags: ['Course', 'Distributed', 'Raft'],
        isInterchange: true,
      },
    ],
  },
  {
    id: 'pink',
    name: 'Pink Line',
    color: '#E75480',
    stations: [
      {
        id: 'c-teaching',
        name: 'Teaching Asst',
        position: [900, 220],
        description: 'Teaching Assistant — Computer Science',
        details: 'TA for Data Structures and Algorithms course. Led weekly lab sessions for 40+ students. Created supplementary learning materials and automated grading scripts.',
        tags: ['2018–2019', 'Education', 'Mentoring'],
        isInterchange: true,
      },
      {
        id: 'c-eastside',
        name: 'Eastside',
        position: [920, 240],
        description: 'Eastern connector station',
        details: 'Connecting the Experience corridor to the Skills & Interests quarter along the eastern edge. Where work experience meets personal passions.',
        tags: ['Connector', 'East Corridor'],
      },
      {
        id: 'c-devops',
        name: 'DevOps',
        position: [920, 400],
        description: 'DevOps and infrastructure',
        details: 'Kubernetes orchestration, CI/CD pipeline design, infrastructure as code with Terraform. Experience with AWS, GCP, and Azure. Monitoring with Datadog and Grafana.',
        tags: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
        isInterchange: true,
      },
    ],
  },
  {
    id: 'gazette',
    name: 'Gazette Line',
    color: '#4B5563',
    stations: [
      {
        id: 'c-midtown-gz',
        name: 'Midtown',
        position: [600, 120],
        description: 'Central connector station',
        details: 'A central hub linking the Projects district to the Experience corridor. This station represents the bridge between building things and professional growth.',
        tags: ['Connector', 'North Corridor'],
        isInterchange: true,
      },
      {
        id: 'c-press-square',
        name: 'Press Square',
        position: [580, 210],
        description: 'Northern approach to the Blog district',
        details: 'Connector station linking the north corridor to the Blog district center.',
        tags: ['Connector', 'Blog Corridor'],
      },
      {
        id: 'c-blog-central',
        name: 'Blog Central',
        position: [560, 300],
        description: 'Technical writing hub',
        details: 'Central hub for the blog district where all writing lines converge.',
        tags: ['Hub', 'Blog'],
        isInterchange: true,
      },
      {
        id: 'c-newsstand',
        name: 'Newsstand',
        position: [580, 360],
        description: 'Southern approach from the Blog district',
        details: 'Connector station linking the Blog district to the south corridor.',
        tags: ['Connector', 'Blog Corridor'],
      },
      {
        id: 'c-southbank-gz',
        name: 'Southbank',
        position: [580, 420],
        description: 'Southern connector station',
        details: 'Connecting the Education district to the Skills & Interests quarter. Where academic foundations meet practical expertise.',
        tags: ['Connector', 'South Corridor'],
        isInterchange: true,
      },
    ],
  },
];

// ============================================================
// ASSEMBLED MAP
// ============================================================

export const metroMap: MetroMap = {
  width: 1100,
  height: 600,
  connectorLines,
  areas: [
    {
      id: 'projects',
      name: 'PROJECTS',
      lines: projectsLines,
      center: [340, 140],
      labelOffset: [0, -60],
    },
    {
      id: 'experience',
      name: 'EXPERIENCE',
      lines: experienceLines,
      center: [790, 120],
      labelOffset: [0, -60],
    },
    {
      id: 'education',
      name: 'EDUCATION',
      lines: educationLines,
      center: [320, 430],
      labelOffset: [0, -60],
    },
    {
      id: 'skills',
      name: 'SKILLS & INTERESTS',
      lines: skillsLines,
      center: [790, 400],
      labelOffset: [0, -60],
    },
    {
      id: 'blog',
      name: 'BLOG',
      lines: blogLines,
      center: [560, 300],
      labelOffset: [0, -60],
    },
  ],
};

// Helper: collect all lines (area lines + connector lines)
function allLines(): Line[] {
  const lines: Line[] = [];
  for (const area of metroMap.areas) {
    for (const line of area.lines) {
      lines.push(line);
    }
  }
  for (const line of metroMap.connectorLines) {
    lines.push(line);
  }
  return lines;
}

// Helper: get all unique stations (dedup interchanges by position)
export function getAllStations(): Station[] {
  const seen = new Set<string>();
  const stations: Station[] = [];
  for (const line of allLines()) {
    for (const station of line.stations) {
      const key = `${station.position[0]},${station.position[1]}`;
      if (!seen.has(key)) {
        seen.add(key);
        stations.push(station);
      }
    }
  }
  return stations;
}

// Helper: get the canonical station at a position (first occurrence)
export function getStationAt(x: number, y: number): Station | undefined {
  for (const line of allLines()) {
    for (const station of line.stations) {
      if (station.position[0] === x && station.position[1] === y) {
        return station;
      }
    }
  }
  return undefined;
}

// Helper: find a station by its ID (first occurrence across all lines)
export function getStationById(id: string): Station | undefined {
  for (const line of allLines()) {
    for (const station of line.stations) {
      if (station.id === id) return station;
    }
  }
  return undefined;
}

// Helper: find the area containing a station position
export function getAreaForStation(station: Station): MetroArea | undefined {
  for (const area of metroMap.areas) {
    for (const line of area.lines) {
      for (const s of line.stations) {
        if (s.position[0] === station.position[0] && s.position[1] === station.position[1]) {
          return area;
        }
      }
    }
  }
  return undefined;
}

// Helper: get all lines passing through a position
export function getLinesAtPosition(x: number, y: number): Line[] {
  const lines: Line[] = [];
  for (const line of allLines()) {
    for (const station of line.stations) {
      if (station.position[0] === x && station.position[1] === y) {
        lines.push(line);
        break;
      }
    }
  }
  return lines;
}
