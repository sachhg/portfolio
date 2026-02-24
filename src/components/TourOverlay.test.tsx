import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TourOverlay from './TourOverlay';

describe('TourOverlay', () => {
  it('renders progress dots matching totalStops', () => {
    const { container } = render(
      <TourOverlay narration={null} progress={0} totalStops={5} onExit={() => {}} />
    );
    // Each stop renders a dot (w-2 h-2 rounded-full)
    const dots = container.querySelectorAll('[title]');
    expect(dots.length).toBe(5);
  });

  it('shows narration card when narration is provided', () => {
    render(
      <TourOverlay
        narration={{ title: 'Education', text: 'Where it all started.', stopIndex: 0 }}
        progress={1}
        totalStops={5}
        onExit={() => {}}
      />
    );
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Where it all started.')).toBeInTheDocument();
  });

  it('hides narration card when narration is null', () => {
    render(
      <TourOverlay narration={null} progress={0} totalStops={5} onExit={() => {}} />
    );
    expect(screen.queryByText('Education')).not.toBeInTheDocument();
  });

  it('calls onExit when exit button is clicked', () => {
    const onExit = vi.fn();
    render(
      <TourOverlay narration={null} progress={0} totalStops={5} onExit={onExit} />
    );
    const exitButton = screen.getByLabelText('Exit tour');
    fireEvent.click(exitButton);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
