export type StatusItem = {
  label: string;
  value: string;
  link?: string;
  emoji?: string;
};

export const currentlyItems: StatusItem[] = [
  { label: 'Building at', value: 'Conmitto Inc.', link: 'https://conmitto.io/dock-optimizer', emoji: '🔨' },
  { label: 'Listening to', value: 'Starboy - The Weeknd', emoji: '🎵' },
  { label: 'Reading', value: 'Atomic Habits by James Clear', link: 'https://jamesclear.com/atomic-habits', emoji: '📖' },
];
