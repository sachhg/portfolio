import { Fragment } from 'react';
import { currentlyItems } from '../data/currently';

type Props = {
  visible: boolean;
};

export default function CurrentlyBar({ visible }: Props) {
  if (!visible || currentlyItems.length === 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 backdrop-blur-sm transition-colors duration-300"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: 'var(--panel-bg)',
        borderTop: '1px solid var(--panel-border-light)',
      }}
    >
      <div className="flex items-center justify-center gap-1.5 h-8 px-4 overflow-hidden">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors duration-300"
          style={{ color: 'var(--panel-text-secondary)' }}
        >
          Currently
        </span>
        {currentlyItems.map((item, i) => (
          <Fragment key={i}>
            <span
              className="text-[11px] shrink-0 transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)', opacity: 0.4 }}
            >
              ·
            </span>
            {item.emoji && (
              <span className="text-[11px] shrink-0">{item.emoji}</span>
            )}
            <span
              className="text-[11px] shrink-0 transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              {item.label}{' '}
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline transition-colors duration-300"
                  style={{ color: 'var(--panel-text)' }}
                >
                  {item.value}
                </a>
              ) : (
                <span
                  className="font-medium transition-colors duration-300"
                  style={{ color: 'var(--panel-text)' }}
                >
                  {item.value}
                </span>
              )}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
