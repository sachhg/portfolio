import type { Station } from '../data/mapData';

type Props = {
  station: Station;
  x: number;
  y: number;
};

export default function StationTooltip({ station, x, y }: Props) {
  const tags = station.tags?.slice(0, 3) ?? [];

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        left: x,
        top: y - 16,
        transform: 'translateX(-50%) translateY(-100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="rounded-lg shadow-lg overflow-hidden backdrop-blur-md transition-colors duration-300"
        style={{
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          maxWidth: 240,
          padding: '10px 12px',
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
              className="text-[12px] font-semibold leading-tight transition-colors duration-300"
              style={{ color: 'var(--panel-text)' }}
            >
              {station.name}
            </p>
            <p
              className="text-[10px] mt-0.5 leading-snug transition-colors duration-300"
              style={{
                color: 'var(--panel-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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

        <p
          className="text-[9px] mt-1.5 transition-colors duration-300"
          style={{ color: 'var(--panel-text-secondary)', opacity: 0.6 }}
        >
          Click to explore →
        </p>
      </div>
    </div>
  );
}
