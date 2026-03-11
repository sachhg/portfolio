import { useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import type { Station, Line } from '../data/mapData';
import { SOCIAL_LINKS } from '../data/socialLinks';
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
      className={`fixed top-3 right-3 h-[calc(100%-24px)] w-full max-w-md shadow-2xl z-50 rounded-xl overflow-hidden transition-transform duration-500 ${
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
                <div className="flex items-center gap-3">
                  {station.logo && (
                    <img
                      src={`/${station.logo}`}
                      alt=""
                      className="w-8 h-8 rounded shrink-0 object-contain"
                      style={{
                        border: '1px solid var(--panel-border)',
                        backgroundColor: 'var(--panel-tag-bg)',
                      }}
                    />
                  )}
                  <h2
                    id="station-detail-title"
                    className="text-xl font-bold mb-1 transition-colors duration-300"
                    style={{ color: 'var(--panel-text)' }}
                  >
                    {station.name}
                  </h2>
                </div>
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
              <div className="mt-6 panel-stagger-5 relative inline-flex flex-col group/link">
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
                <span
                  className="absolute top-full left-0 mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover/link:opacity-100 transition-opacity duration-150 group-hover/link:delay-200 pointer-events-none whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--panel-tag-bg)',
                    color: 'var(--panel-text-secondary)',
                  }}
                >
                  {(() => { try { return new URL(station.link).hostname; } catch { return station.link; } })()}
                </span>
              </div>
            )}
          </div>

          {/* About station — social links row */}
          {station.id === 'about' && (
            <div
              className="px-5 py-4 flex items-center gap-2 panel-stagger-5"
              style={{ borderTop: '1px solid var(--panel-border-light)' }}
            >
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--panel-tag-bg)',
                  color: 'var(--panel-text)',
                  border: '1px solid var(--panel-border)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M6 15c0-1 0-2.5 0-3.2 0-.6.2-1.1.6-1.5-2.2-.2-4.1-1.1-4.1-4.8 0-1 .4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.7-2 4.6-4.1 4.8.3.3.5.9.5 1.8V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                GitHub
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--panel-tag-bg)',
                  color: 'var(--panel-text)',
                  border: '1px solid var(--panel-border)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.5 7v3.5M8 10.5V8.5a1.5 1.5 0 0 1 3 0v2M5.5 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                LinkedIn
              </a>
              <a
                href={SOCIAL_LINKS.email}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--panel-tag-bg)',
                  color: 'var(--panel-text)',
                  border: '1px solid var(--panel-border)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 4.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Email
              </a>
              <a
                href={SOCIAL_LINKS.resume}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--panel-tag-bg)',
                  color: 'var(--panel-text)',
                  border: '1px solid var(--panel-border)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M4.5 7.5 8 11l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 13.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Resume
              </a>
            </div>
          )}

          {/* Footer */}
          <div
            className="p-4 transition-colors duration-300 panel-stagger-5"
            style={{ borderTop: '1px solid var(--panel-border-light)' }}
          >
            <p
              className="text-xs text-center transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              SM Metropolitan Transit Authority
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
