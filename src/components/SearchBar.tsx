import { useState, useRef, useEffect } from 'react';

type Props = {
  onSearch: (query: string) => void;
  matchCount: number;
  totalCount: number;
  externalQuery?: string;
};

export default function SearchBar({ onSearch, matchCount, totalCount, externalQuery }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with externally-set query (e.g. tag click)
  useEffect(() => {
    if (externalQuery !== undefined && externalQuery !== query) {
      setQuery(externalQuery);
    }
  }, [externalQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && focused) {
        setQuery('');
        onSearch('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focused, onSearch]);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const hasQuery = query.length > 0;

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
      style={{ fontFamily: "'Inter', sans-serif" }}
      role="search"
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 ${
          focused ? 'shadow-md' : ''
        }`}
        style={{
          backgroundColor: 'var(--panel-bg)',
          border: `1px solid ${focused ? 'var(--map-interchange-stroke)' : 'var(--panel-border)'}`,
          minWidth: 220,
        }}
      >
        {/* Search icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{ opacity: 0.5, flexShrink: 0 }}
        >
          <circle
            cx="6.5"
            cy="6.5"
            r="5"
            stroke="var(--panel-text-secondary)"
            strokeWidth="1.5"
          />
          <path
            d="M10.5 10.5L14.5 14.5"
            stroke="var(--panel-text-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search stations..."
          aria-label="Search stations"
          className="bg-transparent outline-none text-xs font-medium flex-1 min-w-0 placeholder:opacity-50 transition-colors duration-300"
          style={{ color: 'var(--panel-text)' }}
        />

        {/* Match count */}
        {hasQuery && (
          <span
            className="text-[10px] font-medium shrink-0 transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)' }}
          >
            {matchCount}/{totalCount}
          </span>
        )}

        {/* Clear button */}
        {hasQuery && (
          <button
            onClick={handleClear}
            className="p-0.5 rounded transition-colors duration-200 shrink-0"
            style={{ color: 'var(--panel-text-secondary)' }}
            aria-label="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 3L9 9M9 3L3 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {/* Keyboard shortcut hint */}
        {!hasQuery && !focused && (
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0 transition-colors duration-300"
            style={{
              backgroundColor: 'var(--panel-tag-bg)',
              color: 'var(--panel-text-secondary)',
            }}
          >
            ⌘K
          </span>
        )}
      </div>
    </div>
  );
}
