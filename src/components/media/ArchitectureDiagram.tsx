import type { ArchDiagram } from '../../data/mapData';

type Props = {
  diagram: ArchDiagram;
  compact?: boolean;
};

export default function ArchitectureDiagram({ diagram, compact = false }: Props) {
  const viewH = compact ? 140 : 180;
  const viewW = 380;
  const nodeW = 72;
  const nodeH = 28;

  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300"
        style={{ color: 'var(--panel-text-secondary)' }}
      >
        Architecture
      </h3>
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--panel-border)' }}
      >
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          width="100%"
          style={{ display: 'block', backgroundColor: 'var(--panel-bg)' }}
        >
          <defs>
            <marker
              id="arch-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L8,3 L0,6" fill="var(--panel-text-secondary)" opacity="0.6" />
            </marker>
          </defs>

          {/* Edges (behind nodes) */}
          {diagram.edges.map((edge, i) => {
            const from = diagram.nodes.find((n) => n.id === edge.from);
            const to = diagram.nodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;

            const fx = (from.x / 100) * viewW;
            const fy = (from.y / 100) * viewH;
            const tx = (to.x / 100) * viewW;
            const ty = (to.y / 100) * viewH;

            // Offset line endpoints to node edges
            const dx = tx - fx;
            const dy = ty - fy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / dist;
            const uy = dy / dist;

            const x1 = fx + ux * (nodeW / 2 + 2);
            const y1 = fy + uy * (nodeH / 2 + 2);
            const x2 = tx - ux * (nodeW / 2 + 6);
            const y2 = ty - uy * (nodeH / 2 + 6);

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--panel-text-secondary)"
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arch-arrow)"
                />
                {edge.label && (
                  <text
                    x={(fx + tx) / 2}
                    y={(fy + ty) / 2 - 8}
                    textAnchor="middle"
                    fontSize="7"
                    fill="var(--panel-text-secondary)"
                    fontFamily="'Inter', sans-serif"
                    opacity="0.7"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {diagram.nodes.map((node) => {
            const cx = (node.x / 100) * viewW;
            const cy = (node.y / 100) * viewH;
            const hasColor = !!node.color;

            return (
              <g key={node.id}>
                <rect
                  x={cx - nodeW / 2}
                  y={cy - nodeH / 2}
                  width={nodeW}
                  height={nodeH}
                  rx={4}
                  fill={node.color ? `${node.color}20` : 'var(--panel-tag-bg)'}
                  stroke={node.color ?? 'var(--panel-border)'}
                  strokeWidth="1"
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fontWeight="600"
                  fill={hasColor ? node.color! : 'var(--panel-text)'}
                  fontFamily="'Inter', sans-serif"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
