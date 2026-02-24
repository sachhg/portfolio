type Props = {
  onZoomOut: () => void;
  currentArea: string | null;
  dark: boolean;
  onToggleTheme: () => void;
};

export default function Header({ onZoomOut, currentArea, dark, onToggleTheme }: Props) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center justify-between p-4">
        {/* Transit Authority Branding */}
        <button
          className="pointer-events-auto flex items-center gap-3 cursor-pointer select-none bg-transparent border-none p-0"
          onClick={onZoomOut}
          aria-label="SN Metropolitan Transit Authority — return to full map"
        >
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] dark:bg-[#e5e1db] flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300">
            <span className="text-white dark:text-[#0d1117] font-bold text-xs tracking-tight transition-colors duration-300">
              SN
            </span>
          </div>
          <div className="text-left">
            <h1 className="text-xs font-bold text-[#1a1a1a] dark:text-[#e5e1db] leading-tight tracking-[0.15em] uppercase transition-colors duration-300">
              SN Metropolitan
            </h1>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold tracking-[0.2em] uppercase transition-colors duration-300">
              Transit Authority
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Day/Night Service Toggle */}
          <button
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--map-area-label-bg)',
              color: 'var(--map-text)',
              border: '1px solid var(--map-area-label-border)',
            }}
            onClick={onToggleTheme}
            aria-label={dark ? 'Switch to day service' : 'Switch to night service'}
          >
            {dark ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.6 3.4L11.5 4.5M4.5 11.5L3.4 12.6M12.6 12.6L11.5 11.5M4.5 4.5L3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Day
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5 6 6 0 1 0 13.5 9.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Night
              </>
            )}
          </button>

          {/* Back button */}
          {currentArea && (
            <button
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all duration-300 text-xs font-medium"
              style={{
                backgroundColor: 'var(--map-area-label-bg)',
                color: 'var(--map-text)',
                border: '1px solid var(--map-area-label-border)',
              }}
              onClick={onZoomOut}
              aria-label="Back to system map"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
                <path
                  d="M8 1.5L3 6L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              System map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
