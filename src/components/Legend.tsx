import { metroMap } from '../data/mapData';

type Props = {
  visible: boolean;
  onLineHover: (lineId: string | null) => void;
  onLineClick: (lineId: string) => void;
};

export default function Legend({ visible, onLineHover, onLineClick }: Props) {
  if (!visible) return null;

  const areaGroups = metroMap.areas.map((area) => ({
    name: area.name,
    lines: area.lines,
  }));

  return (
    <div
      className="absolute bottom-4 left-4 rounded-lg shadow-lg z-30 overflow-hidden backdrop-blur-sm transition-colors duration-300"
      role="complementary"
      aria-label="Line directory"
      style={{
        fontFamily: "'Inter', sans-serif",
        maxWidth: 200,
        backgroundColor: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)',
      }}
    >
      <div
        className="px-4 pt-3 pb-2 transition-colors duration-300"
        style={{ borderBottom: '1px solid var(--panel-border-light)' }}
      >
        <h3
          className="text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-300"
          style={{ color: 'var(--panel-text-secondary)' }}
        >
          Line Directory
        </h3>
      </div>
      <div className="p-3 space-y-3">
        {areaGroups.map((group) => (
          <div key={group.name}>
            <p
              className="text-[9px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              {group.name}
            </p>
            <div className="space-y-1">
              {group.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => onLineHover(line.id)}
                  onMouseLeave={() => onLineHover(null)}
                  onClick={() => onLineClick(line.id)}
                >
                  <div
                    className="w-4 h-0.75 rounded-full shrink-0"
                    style={{ backgroundColor: line.color }}
                  />
                  <span
                    className="text-[10px] font-medium transition-colors duration-300"
                    style={{ color: 'var(--panel-text)' }}
                  >
                    {line.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {metroMap.connectorLines.length > 0 && (
          <div>
            <p
              className="text-[9px] font-semibold uppercase tracking-wider mb-1 transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              CONNECTORS
            </p>
            <div className="space-y-1">
              {metroMap.connectorLines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center gap-2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => onLineHover(line.id)}
                  onMouseLeave={() => onLineHover(null)}
                  onClick={() => onLineClick(line.id)}
                >
                  <div
                    className="w-4 h-0.75 rounded-full shrink-0"
                    style={{ backgroundColor: line.color }}
                  />
                  <span
                    className="text-[10px] font-medium transition-colors duration-300"
                    style={{ color: 'var(--panel-text)' }}
                  >
                    {line.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        className="px-3 pb-3 pt-1 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--panel-border-light)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300"
            style={{
              border: '1.5px solid var(--map-interchange-stroke)',
              backgroundColor: 'var(--map-station-fill)',
            }}
          />
          <span
            className="text-[10px] transition-colors duration-300"
            style={{ color: 'var(--panel-text-secondary)' }}
          >
            Interchange
          </span>
        </div>
      </div>
    </div>
  );
}
