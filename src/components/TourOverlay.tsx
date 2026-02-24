import { TOUR_STOPS } from '../data/tourRoute';
import type { TourNarration } from '../hooks/useTourMode';

type Props = {
  narration: TourNarration | null;
  progress: number; // 0..totalStops (how many stops completed)
  totalStops: number;
  onExit: () => void;
};

export default function TourOverlay({ narration, progress, totalStops, onExit }: Props) {
  return (
    <>
      {/* Progress bar + exit — top center */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full shadow-lg"
        style={{
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {TOUR_STOPS.map((stop, i) => (
            <div key={stop.areaId} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i < progress
                      ? 'var(--map-interchange-stroke)'
                      : 'var(--panel-border)',
                  transform: narration?.stopIndex === i ? 'scale(1.5)' : 'scale(1)',
                }}
                title={stop.title}
              />
              {i < totalStops - 1 && (
                <div
                  className="w-3 h-px"
                  style={{
                    backgroundColor:
                      i < progress - 1
                        ? 'var(--map-interchange-stroke)'
                        : 'var(--panel-border)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Exit button */}
        <button
          onClick={onExit}
          className="ml-2 p-1 rounded-full transition-colors duration-200"
          style={{ color: 'var(--panel-text-secondary)' }}
          aria-label="Exit tour"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3L11 11M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Narration card — bottom center */}
      {narration && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md w-[calc(100%-2rem)] rounded-xl shadow-2xl p-5 animate-tour-card-in"
          style={{
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              Stop {narration.stopIndex + 1} of {totalStops}
            </div>
            <div
              className="text-[10px] font-medium"
              style={{ color: 'var(--panel-text-secondary)', opacity: 0.6 }}
            >
              Esc to exit
            </div>
          </div>
          <h3
            className="text-lg font-bold mb-1.5 transition-colors duration-300"
            style={{ color: 'var(--panel-text)' }}
          >
            {narration.title}
          </h3>
          <p
            className="text-sm leading-relaxed transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)' }}
          >
            {narration.text}
          </p>

          {/* Auto-advance progress bar */}
          <div
            className="mt-3 h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--panel-border)' }}
          >
            <div
              className="h-full rounded-full animate-tour-progress"
              style={{ backgroundColor: 'var(--map-interchange-stroke)' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
