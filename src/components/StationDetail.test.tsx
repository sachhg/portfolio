import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationDetail from './StationDetail';
import type { Station, Line } from '../data/mapData';

const mockStation: Station = {
  id: 'test-station',
  name: 'Test Station',
  position: [100, 200],
  description: 'A test station for unit testing',
  details: 'Detailed description of the test station.',
  tags: ['TypeScript', 'React'],
};

const mockLines: Line[] = [
  {
    id: 'test-line',
    name: 'Test Line',
    color: '#0039A6',
    stations: [mockStation],
  },
];

describe('StationDetail', () => {
  it('renders station name and description when open', () => {
    render(<StationDetail station={mockStation} lines={mockLines} onClose={() => {}} />);
    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('A test station for unit testing')).toBeInTheDocument();
  });

  it('is aria-hidden when station is null', () => {
    const { container } = render(
      <StationDetail station={null} lines={[]} onClose={() => {}} />
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<StationDetail station={mockStation} lines={mockLines} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders tags', () => {
    render(<StationDetail station={mockStation} lines={mockLines} onClose={() => {}} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
