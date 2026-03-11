import { useRef, useEffect, useCallback, useState, lazy, Suspense } from 'react';
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

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--panel-tag-bg)',
  borderRadius: '10px',
};

export default function StationDetail({ station, lines, onClose, onTagClick }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const [copied, setCopied] = useState(false);

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

          {/* Card 1 — Header */}
          <div className="px-5 pt-5 pb-4 panel-stagger-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {station.logo && (
                    <img
                      src={`/${station.logo}`}
                      alt=""
                      className="w-10 h-10 rounded-lg shrink-0 object-contain"
                      style={{
                        border: '1px solid var(--panel-border)',
                        backgroundColor: 'var(--panel-tag-bg)',
                      }}
                    />
                  )}
                  <div>
                    <h2
                      id="station-detail-title"
                      className="text-xl font-bold transition-colors duration-300"
                      style={{ color: 'var(--panel-text)' }}
                    >
                      {station.name}
                    </h2>
                    <p
                      className="text-sm mt-0.5 transition-colors duration-300"
                      style={{ color: 'var(--panel-text-secondary)' }}
                    >
                      {station.description}
                    </p>
                  </div>
                </div>
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

          {/* Scrollable card area */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <div className="flex flex-col gap-3">

              {/* Card 2 — About */}
              <div
                className="p-4 panel-stagger-3"
                style={CARD_STYLE}
              >
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

              {/* Card 3 — Preview (media) */}
              {station.media && (
                <div
                  className="p-4 panel-stagger-4"
                  style={CARD_STYLE}
                >
                  <h3
                    className="text-[10px] font-semibold uppercase tracking-widest mb-2 transition-colors duration-300"
                    style={{ color: 'var(--panel-text-secondary)' }}
                  >
                    Preview
                  </h3>
                  <StationMediaPanel media={station.media} />
                </div>
              )}

              {/* Card 4 — Tech Stack (tags) */}
              {station.tags && station.tags.length > 0 && (
                <div
                  className="p-4 panel-stagger-4"
                  style={CARD_STYLE}
                >
                  <h3
                    className="text-[10px] font-semibold uppercase tracking-widest mb-3 transition-colors duration-300"
                    style={{ color: 'var(--panel-text-secondary)' }}
                  >
                    Built With
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {station.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagClick?.(tag)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-200 hover:brightness-90 active:scale-95"
                        style={{
                          backgroundColor: 'var(--panel-bg)',
                          color: 'var(--panel-tag-text)',
                          border: '1px solid var(--panel-border)',
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

              {/* Card 5 — Actions row */}
              {(station.link || station.id === 'about') && (
                <div
                  className="p-4 panel-stagger-5 flex items-center gap-2 flex-wrap"
                  style={CARD_STYLE}
                >
                  {station.link && (
                    <a
                      href={station.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={{ backgroundColor: lines[0]?.color ?? '#0039A6' }}
                    >
                      View Project
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M5 2H12M12 2V9M12 2L2 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const url = station.link ?? window.location.href;
                      navigator.clipboard.writeText(url).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:brightness-90 active:scale-95"
                    style={{
                      backgroundColor: 'var(--panel-bg)',
                      color: 'var(--panel-text-secondary)',
                      border: '1px solid var(--panel-border)',
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>

                  {/* About station — social links */}
                  {station.id === 'about' && (
                    <>
                      <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--panel-border)' }} />
                      <a
                        href={SOCIAL_LINKS.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--panel-bg)',
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--panel-bg)',
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--panel-bg)',
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--panel-bg)',
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
                    </>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 transition-colors duration-300 panel-stagger-5"
            style={{ borderTop: '1px solid var(--panel-border-light)' }}
          >
            <p
              className="text-[10px] text-center transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)', opacity: 0.6 }}
            >
              SM Metropolitan Transit Authority
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
