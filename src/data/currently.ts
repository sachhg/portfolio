export type StatusItem = {
  label: string;
  value: string;
  link?: string;
  emoji?: string;
};

export const currentlyItems: StatusItem[] = [
  { label: 'Building at', value: 'Company', link: 'https://example.com', emoji: '🔨' },
  { label: 'Listening to', value: 'Album — Artist', emoji: '🎵' },
  { label: 'Reading', value: 'Book Title', link: 'https://example.com', emoji: '📖' },
];
