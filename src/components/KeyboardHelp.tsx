import { useEffect, useRef, useCallback } from 'react';

type Props = {
  onClose: () => void;
};

const shortcuts = [
  {
    group: 'Navigation',
    items: [
      { keys: ['←', '→'], description: 'Traverse stations on a line' },
      { keys: ['↑', '↓'], description: 'Switch lines at interchange' },
      { keys: ['1', '–', '5'], description: 'Jump to area' },
    ],
  },
  {
    group: 'General',
    items: [
      { keys: ['⌘', 'K'], description: 'Search stations' },
      { keys: ['Esc'], description: 'Close / Zoom out' },
      { keys: ['?'], description: 'Toggle this help' },
    ],
  },
];

export default function KeyboardHelp({ onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      const prev = previousFocusRef.current as HTMLElement | null;
      if (prev && 'focus' in prev) {
        prev.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-lg shadow-2xl overflow-hidden transition-colors duration-300"
        style={{
          fontFamily: "'Inter', sans-serif",
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          maxWidth: 360,
          width: '90vw',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 transition-colors duration-300"
          style={{ borderBottom: '1px solid var(--panel-border-light)' }}
        >
          <h2
            id="keyboard-help-title"
            className="text-sm font-bold uppercase tracking-wider transition-colors duration-300"
            style={{ color: 'var(--panel-text)' }}
          >
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded transition-colors duration-200"
            style={{ color: 'var(--panel-text-secondary)' }}
            aria-label="Close keyboard shortcuts"
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

        {/* Shortcut groups */}
        <div className="p-5 space-y-5">
          {shortcuts.map((group) => (
            <div key={group.group}>
              <h3
                className="text-[10px] font-semibold uppercase tracking-wider mb-3 transition-colors duration-300"
                style={{ color: 'var(--panel-text-secondary)' }}
              >
                {group.group}
              </h3>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span
                      className="text-[12px] transition-colors duration-300"
                      style={{ color: 'var(--panel-text)' }}
                    >
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, ki) => (
                        <kbd
                          key={ki}
                          className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-[11px] font-medium transition-colors duration-300"
                          style={{
                            backgroundColor: 'var(--panel-tag-bg)',
                            color: 'var(--panel-tag-text)',
                            border: '1px solid var(--panel-border)',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            Press <kbd className="font-medium">?</kbd> or <kbd className="font-medium">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
