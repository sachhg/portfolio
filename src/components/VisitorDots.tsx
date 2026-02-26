import type { Visitor, Ping } from '../hooks/usePresence';

type Props = {
  visitors: Visitor[];
  pings: Ping[];
  reducedMotion: boolean;
};

export default function VisitorDots({ visitors, pings, reducedMotion }: Props) {
  return (
    <g role="presentation" aria-hidden="true">
      {visitors.map((v) => (
        <g key={v.id} className="visitor-dot">
          {/* Hover target — larger invisible circle for easier hover */}
          <circle
            cx={v.x}
            cy={v.y}
            r={12}
            fill="transparent"
            style={{ cursor: 'default' }}
          />
          {/* Outer glow ring */}
          <circle
            cx={v.x}
            cy={v.y}
            r={6}
            fill="none"
            stroke={v.color}
            strokeWidth={1}
            opacity={0.3}
            style={{ pointerEvents: 'none' }}
          />
          {/* Solid dot */}
          <circle
            cx={v.x}
            cy={v.y}
            r={3.5}
            fill={v.color}
            opacity={0.85}
            style={{
              filter: `drop-shadow(0 0 4px ${v.color})`,
              pointerEvents: 'none',
            }}
          />
          {/* Inner highlight */}
          <circle
            cx={v.x}
            cy={v.y}
            r={1.5}
            fill="white"
            opacity={0.5}
            style={{ pointerEvents: 'none' }}
          />
          {/* Hover label */}
          <g className="visitor-label" style={{ pointerEvents: 'none' }}>
            <rect
              x={v.x - 30}
              y={v.y - 22}
              width={60}
              height={14}
              rx={3}
              fill="var(--panel-bg)"
              stroke="var(--panel-border)"
              strokeWidth={0.5}
              opacity={0.95}
            />
            <text
              x={v.x}
              y={v.y - 13}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fontWeight={600}
              fontFamily="'Inter', sans-serif"
              fill={v.color}
              letterSpacing={0.5}
            >
              Visitor #{v.number}
            </text>
          </g>
        </g>
      ))}

      {!reducedMotion && pings.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          fill="none"
          stroke={p.color}
          strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        >
          <animate attributeName="r" from="0" to="20" dur="0.8s" fill="freeze" />
          <animate attributeName="opacity" from="0.5" to="0" dur="0.8s" fill="freeze" />
        </circle>
      ))}
    </g>
  );
}
