import { forwardRef } from 'react';
import type { Station, Line } from '../../data/mapData';

type Props = {
  station: Station;
  lines: Line[];
  isSelected: boolean;
  onSelect: (station: Station) => void;
  isLast: boolean;
  primaryColor: string;
  revealRef?: (el: HTMLElement | null) => void;
  revealDirection?: 'left' | 'right';
};

const MobileStationCard = forwardRef<HTMLButtonElement, Props>(
  function MobileStationCard({ station, lines, isSelected, onSelect, isLast, primaryColor, revealRef, revealDirection }, ref) {
    const isInterchange = lines.length > 1;
    const revealClass = revealDirection === 'right' ? 'mobile-card-reveal-right' : 'mobile-card-reveal';

    return (
      <button
        ref={(el) => {
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
          revealRef?.(el);
        }}
        onClick={() => onSelect(station)}
        className={`flex items-stretch gap-3 w-full text-left min-h-[56px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500 ${revealClass}`}
        style={{
          backgroundColor: isSelected ? `${primaryColor}10` : 'transparent',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Timeline track */}
        <div className="relative flex flex-col items-center w-10 shrink-0">
          {/* Top segment of the vertical line */}
          <div className="flex-1 w-0.5 mobile-track-segment" style={{ backgroundColor: primaryColor }} />
          {/* Station dot */}
          <div className="relative shrink-0 my-0.5">
            {isInterchange ? (
              <div
                className="w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: 'var(--map-station-fill)',
                  borderColor: 'var(--map-interchange-stroke)',
                }}
              />
            ) : (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
            {/* Interchange color dots */}
            {isInterchange && lines.length <= 4 && (
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                {lines.slice(0, 3).map((line) => (
                  <div
                    key={line.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: line.color }}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Bottom segment — hidden for last station */}
          <div
            className="flex-1 w-0.5 mobile-track-segment"
            style={{ backgroundColor: isLast ? 'transparent' : primaryColor }}
          />
        </div>

        {/* Station content */}
        <div className="flex-1 py-3 pr-4">
          <p
            className="text-sm font-semibold leading-tight transition-colors duration-300"
            style={{ color: 'var(--panel-text)' }}
          >
            {station.name}
          </p>
          <p
            className="text-xs mt-0.5 leading-snug transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)' }}
          >
            {station.description}
          </p>
          {station.tags && station.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {station.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--panel-tag-bg)',
                    color: 'var(--panel-tag-text)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    );
  }
);

export default MobileStationCard;
