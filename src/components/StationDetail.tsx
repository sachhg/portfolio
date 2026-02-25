import { useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import type { Station, Line } from '../data/mapData';
import StationMediaPanel from './media/StationMediaPanel';

const MarkdownContent = lazy(() => import('./MarkdownContent'));

type Props = {
  station: Station | null;
  lines: Line[];
  onClose: () => void;
  onTagClick?: (tag: string) => void;
};

export default function StationDetail({ station, lines, onClose, onTagClick }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Focus management: save previous focus on open, restore on close
  useEffect(() => {
    if (station) {
      previousFocusRef.current = document.activeElement;
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      const prev = previousFocusRef.current as HTMLElement | SVGElement;
      if ('focus' in prev) {
        (prev as HTMLElement).focus();
      }
      previousFocusRef.current = null;
    }
  }, [station]);

  // Escape key to close
  useEffect(() => {
    if (!station) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [station, onClose]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={station ? 'station-detail-title' : undefined}
      aria-hidden={!station}
      onKeyDown={handleKeyDown}
      className={`fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 transition-transform duration-500 ${
        station ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: 'var(--panel-bg)',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {station && (
        <div key={station.id} className="h-full flex flex-col">
          {/* Line accent bar */}
          <div
            className="h-[3px]"
            style={{
              background: lines.length > 1
                ? `linear-gradient(to right, ${lines.map((l) => l.color).join(', ')})`
                : lines[0]?.color ?? 'var(--panel-border)',
            }}
          />

          {/* Header */}
          <div
            className="p-6 transition-colors duration-300"
            style={{ borderBottom: '1px solid var(--panel-border)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 panel-stagger-1">
                <h2
                  id="station-detail-title"
                  className="text-xl font-bold mb-1 transition-colors duration-300"
                  style={{ color: 'var(--panel-text)' }}
                >
                  {station.name}
                </h2>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: 'var(--panel-text-secondary)' }}
                >
                  {station.description}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="ml-4 p-1 rounded transition-colors duration-200"
                style={{ color: 'var(--panel-text-secondary)' }}
                aria-label="Close station details"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Line badges */}
            <div className="flex flex-wrap gap-2 mt-3 panel-stagger-2">
              {lines.map((line) => (
                <span
                  key={line.id}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: line.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-white"
                    style={{ opacity: 0.6 }}
                  />
                  {line.name}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="panel-stagger-3">
              {station.markdown ? (
                <Suspense
                  fallback={
                    <p
                      className="text-sm leading-relaxed transition-colors duration-300"
                      style={{ color: 'var(--panel-text)' }}
                    >
                      {station.details.replace(/[#*`>|\-[\]]/g, '').slice(0, 200)}...
                    </p>
                  }
                >
                  <MarkdownContent content={station.details} />
                </Suspense>
              ) : (
                <p
                  className="text-sm leading-relaxed transition-colors duration-300"
                  style={{ color: 'var(--panel-text)' }}
                >
                  {station.details}
                </p>
              )}
            </div>

            {station.media && (
              <div className="panel-stagger-4">
                <StationMediaPanel media={station.media} />
              </div>
            )}

            {station.tags && station.tags.length > 0 && (
              <div className="mt-6 panel-stagger-4">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300"
                  style={{ color: 'var(--panel-text-secondary)' }}
                >
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {station.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onTagClick?.(tag)}
                      className="text-xs font-medium px-2.5 py-1 rounded transition-all duration-200 hover:brightness-90 active:scale-95"
                      style={{
                        backgroundColor: 'var(--panel-tag-bg)',
                        color: 'var(--panel-tag-text)',
                        cursor: onTagClick ? 'pointer' : 'default',
                      }}
                      aria-label={`Search for stations tagged "${tag}"`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {station.link && (
              <div className="mt-6 panel-stagger-5">
                <a
                  href={station.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  View Project
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M5 2H12M12 2V9M12 2L2 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="p-4 transition-colors duration-300 panel-stagger-5"
            style={{ borderTop: '1px solid var(--panel-border-light)' }}
          >
            <p
              className="text-xs text-center transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              SN Metropolitan Transit Authority
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
