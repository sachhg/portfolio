import { useRef, useEffect, useCallback, useState, lazy, Suspense } from 'react';
import type { Station, Line } from '../../data/mapData';
import StationMediaPanel from '../media/StationMediaPanel';

const MarkdownContent = lazy(() => import('../MarkdownContent'));

type Props = {
  station: Station | null;
  lines: Line[];
  onClose: () => void;
  onTagClick?: (tag: string) => void;
};

export default function MobileBottomSheet({ station, lines, onClose, onTagClick }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Drag-to-dismiss state
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // Focus management
  useEffect(() => {
    if (station) {
      previousFocusRef.current = document.activeElement;
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else {
      setDragY(0);
      if (previousFocusRef.current) {
        const prev = previousFocusRef.current as HTMLElement;
        if ('focus' in prev) prev.focus();
        previousFocusRef.current = null;
      }
    }
  }, [station]);

  // Escape key
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
    const panel = sheetRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  // Touch drag handlers (on the handle area)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  }, [dragY, onClose]);

  const isOpen = station !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={station ? 'mobile-station-title' : undefined}
        aria-hidden={!isOpen}
        onKeyDown={handleKeyDown}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          backgroundColor: 'var(--panel-bg)',
          fontFamily: "'Inter', sans-serif",
          maxHeight: '70vh',
          transform: isOpen
            ? `translateY(${dragY}px)`
            : 'translateY(100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-8 h-1 rounded-full"
            style={{ backgroundColor: 'var(--panel-border)' }}
          />
        </div>

        {station && (
          <div className="flex flex-col max-h-[calc(70vh-24px)] overflow-hidden">
            {/* Header */}
            <div
              className="px-5 pb-3 transition-colors duration-300"
              style={{ borderBottom: '1px solid var(--panel-border)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2
                    id="mobile-station-title"
                    className="text-lg font-bold mb-0.5 transition-colors duration-300"
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
                  className="ml-3 p-1.5 rounded-full transition-colors duration-200"
                  style={{
                    color: 'var(--panel-text-secondary)',
                    backgroundColor: 'var(--panel-tag-bg)',
                  }}
                  aria-label="Close station details"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 4L12 12M12 4L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Line badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {lines.map((line) => (
                  <span
                    key={line.id}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: line.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60" />
                    {line.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
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

              {station.media && <StationMediaPanel media={station.media} compact />}

              {station.tags && station.tags.length > 0 && (
                <div className="mt-4">
                  <h3
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 transition-colors duration-300"
                    style={{ color: 'var(--panel-text-secondary)' }}
                  >
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {station.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagClick?.(tag)}
                        className="text-xs font-medium px-2 py-0.5 rounded transition-all duration-200 hover:brightness-90 active:scale-95"
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
                <div className="mt-4 relative inline-flex flex-col group/link">
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

            {/* Footer */}
            <div
              className="px-5 py-3 transition-colors duration-300"
              style={{ borderTop: '1px solid var(--panel-border-light)' }}
            >
              <p
                className="text-[10px] text-center transition-colors duration-300"
                style={{ color: 'var(--panel-text-secondary)' }}
              >
                SM Metropolitan Transit Authority
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
