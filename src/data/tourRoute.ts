export type Point = [number, number];

export type TourStop = {
  waypointIndex: number;
  areaId: string;
  title: string;
  narration: string;
};

// Express route: Education → Projects → Experience → Skills → Blog
export const TOUR_WAYPOINTS: Point[] = [
  // Start in Education
  [180, 420],
  [340, 420],
  // Up Silver connector
  [340, 280],
  [380, 240],
  // Into Projects
  [420, 120],
  [500, 120],
  // Gold connector → Experience
  [600, 120],
  [700, 100],
  // Across Experience
  [780, 100],
  [860, 100],
  // Pink connector → Skills
  [900, 220],
  [920, 400],
  // Across Skills
  [840, 400],
  [760, 400],
  [680, 400],
  // Brown connector back toward center
  [660, 420],
  [580, 420],
  // Gazette connector up → Blog
  [580, 360],
  [560, 300],
];

export const TOUR_STOPS: TourStop[] = [
  {
    waypointIndex: 0,
    areaId: 'education',
    title: 'Education',
    narration:
      'Where it all started — CS fundamentals, algorithms, and the curiosity to understand how things work beneath the surface.',
  },
  {
    waypointIndex: 5,
    areaId: 'projects',
    title: 'Projects',
    narration:
      'The things I\u2019ve built — distributed systems, real-time pipelines, and developer tools used by hundreds of engineers.',
  },
  {
    waypointIndex: 7,
    areaId: 'experience',
    title: 'Experience',
    narration:
      'From intern to senior engineer — each role shaped how I think about systems, teams, and shipping software.',
  },
  {
    waypointIndex: 11,
    areaId: 'skills',
    title: 'Skills & Interests',
    narration:
      'The full toolkit — languages, frameworks, and the passions outside of code that keep the creativity flowing.',
  },
  {
    waypointIndex: 18,
    areaId: 'blog',
    title: 'Blog',
    narration:
      'Turning experience into words — technical writing that teaches, reflects, and connects the dots across disciplines.',
  },
];

export const TOUR_TRAIN_SPEED = 120; // pixels per second
export const NARRATION_DURATION = 4000; // ms per narration stop
