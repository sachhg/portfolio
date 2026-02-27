import { SOCIAL_LINKS } from '../data/socialLinks';

type Props = {
  onZoomOut: () => void;
  currentArea: string | null;
  dark: boolean;
  onToggleTheme: () => void;
  onStartTour?: () => void;
  tourActive?: boolean;
  isSearchActive?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
};

const socialButtonClass =
  'pointer-events-auto relative group/social flex items-center justify-center w-8 h-8 rounded-full shadow-sm hover:shadow transition-all duration-300';

const socialButtonStyle = {
  backgroundColor: 'var(--map-area-label-bg)',
  color: 'var(--map-text)',
  border: '1px solid var(--map-area-label-border)',
};

function SocialTooltip({ label }: { label: string }) {
  return (
    <span
      className="absolute top-full mt-2 px-2 py-0.5 rounded text-[9px] font-medium opacity-0 group-hover/social:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap"
      style={{
        backgroundColor: 'var(--map-area-label-bg)',
        color: 'var(--map-text)',
        border: '1px solid var(--map-area-label-border)',
      }}
    >
      {label}
    </span>
  );
}

export default function Header({ onZoomOut, currentArea, dark, onToggleTheme, onStartTour, tourActive, isSearchActive, soundEnabled, onToggleSound }: Props) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center justify-between p-4">
        {/* Identity */}
        <button
          className="pointer-events-auto flex items-center gap-3 cursor-pointer select-none bg-transparent border-none p-0"
          onClick={onZoomOut}
          aria-label="Sachit Madaan — return to full map"
        >
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] dark:bg-[#e5e1db] flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300">
            <span className="text-white dark:text-[#0d1117] font-bold text-xs tracking-tight transition-colors duration-300">
              SM
            </span>
          </div>
          <div className="text-left">
            <h1 className="text-xs font-bold text-[#1a1a1a] dark:text-[#e5e1db] leading-tight tracking-[0.15em] uppercase transition-colors duration-300">
              Sachit Madaan
            </h1>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold tracking-[0.2em] uppercase transition-colors duration-300">
              Software Engineer
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Social Links */}
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={socialButtonClass}
            style={socialButtonStyle}
            aria-label="GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 15c0-1 0-2.5 0-3.2 0-.6.2-1.1.6-1.5-2.2-.2-4.1-1.1-4.1-4.8 0-1 .4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.7-2 4.6-4.1 4.8.3.3.5.9.5 1.8V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <SocialTooltip label="GitHub" />
          </a>

          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={socialButtonClass}
            style={socialButtonStyle}
            aria-label="LinkedIn"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5.5 7v3.5M8 10.5V8.5a1.5 1.5 0 0 1 3 0v2M5.5 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <SocialTooltip label="LinkedIn" />
          </a>

          <a
            href={SOCIAL_LINKS.email}
            className={socialButtonClass}
            style={socialButtonStyle}
            aria-label="Email"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 4.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <SocialTooltip label="Email" />
          </a>

          <a
            href={SOCIAL_LINKS.resume}
            download
            className={socialButtonClass}
            style={socialButtonStyle}
            aria-label="Download Resume"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M4.5 7.5 8 11l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 13.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <SocialTooltip label="Resume" />
          </a>

          {/* Divider */}
          <div
            className="w-px h-4 pointer-events-none"
            style={{ backgroundColor: 'var(--map-area-label-border)' }}
          />

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

          {/* Sound toggle */}
          {onToggleSound && (
            <button
              className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full shadow-sm hover:shadow transition-all duration-300"
              style={{
                backgroundColor: 'var(--map-area-label-bg)',
                color: 'var(--map-text)',
                border: '1px solid var(--map-area-label-border)',
              }}
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L4 5.5H1.5V10.5H4L8 14V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 5.5C11.8 6.3 12.25 7.4 12.25 8.5C12.25 9.6 11.8 10.7 11 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L4 5.5H1.5V10.5H4L8 14V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 6L10 10M10 6L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}

          {/* Take a Tour button — visible when at the overview level */}
          {!tourActive && !currentArea && !isSearchActive && onStartTour && (
            <button
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--map-area-label-bg)',
                color: 'var(--map-text)',
                border: '1px solid var(--map-area-label-border)',
              }}
              onClick={onStartTour}
              aria-label="Take a guided tour of the portfolio"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 3L12 8L5 13V3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Tour
            </button>
          )}

          {/* Back button */}
          {currentArea && !tourActive && (
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
