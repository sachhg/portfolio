import type { Station } from '../data/mapData';
import type { Visitor } from '../hooks/usePresence';

type Props = {
  station: Station;
  x: number;
  y: number;
  visitorsHere?: Visitor[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export default function StationTooltip({ station, x, y, visitorsHere = [], onMouseEnter, onMouseLeave }: Props) {
  const tags = station.tags?.slice(0, 4) ?? [];

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: x,
        top: y - 18,
        transform: 'translateX(-50%) translateY(-100%)',
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="rounded-xl shadow-xl overflow-hidden backdrop-blur-xl transition-all duration-300"
        style={{
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          maxWidth: 280,
          padding: '12px 16px',
        }}
      >
        <div className="flex items-center gap-2">
          {station.logo && (
            <img
              src={`/${station.logo}`}
              alt=""
              className="w-7 h-7 rounded shrink-0 object-contain"
              style={{
                border: '1px solid var(--panel-border)',
                backgroundColor: 'var(--panel-tag-bg)',
              }}
            />
          )}
          <div className="min-w-0">
            <p
              className="text-[13px] font-bold leading-tight transition-colors duration-300"
              style={{ color: 'var(--panel-text)' }}
            >
              {station.name}
            </p>
            <p
              className="text-[11px] mt-1 leading-snug transition-colors duration-300"
              style={{
                color: 'var(--panel-text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {station.description}
            </p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors duration-300"
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

        {visitorsHere.length > 0 && (
          <div
            className="flex items-center gap-1.5 mt-2.5 text-[10px] transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)' }}
          >
            <span className="flex gap-0.5">
              {visitorsHere.slice(0, 3).map((v) => (
                <span
                  key={v.id}
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: v.color }}
                />
              ))}
            </span>
            <span style={{ opacity: 0.7 }}>
              {visitorsHere.length === 1
                ? `Visitor #${visitorsHere[0].number} is here`
                : `${visitorsHere.length} visitors here`}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t transition-colors duration-300 pt-2" style={{ borderColor: 'var(--panel-border)' }}>
          <p
            className="text-[10px] font-medium transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)', opacity: 0.8 }}
          >
            {station.link ? 'Click map station for more' : 'Click to explore →'}
          </p>
          {station.link && (
            <a
              href={station.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-md text-[10px] font-semibold hover:-translate-y-0.5 transition-transform duration-200 shadow-sm"
              style={{
                backgroundColor: 'var(--map-station-selected)',
                color: 'var(--map-bg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              View Repo / Site
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
