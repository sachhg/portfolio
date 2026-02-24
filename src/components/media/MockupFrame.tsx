import type { MockupType } from '../../data/mapData';

type Props = {
  type: MockupType;
  compact?: boolean;
};

function DashboardContent({ h }: { h: number }) {
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Metric cards row */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${12 + i * 122}, 10)`}>
          <rect width="114" height="40" rx="4" fill="var(--panel-tag-bg)" />
          <rect x="8" y="8" width="40" height="6" rx="3" fill="var(--panel-text-secondary)" opacity="0.4" />
          <rect x="8" y="22" width="60" height="10" rx="3" fill="var(--panel-text)" opacity="0.3" />
        </g>
      ))}
      {/* Bar chart */}
      <g transform={`translate(12, 60)`}>
        <rect width="230" height={h - 70} rx="4" fill="var(--panel-tag-bg)" />
        {Array.from({ length: 8 }).map((_, i) => {
          const barH = 15 + ((i * 37 + 13) % 50);
          return (
            <rect key={i} x={14 + i * 27} y={h - 70 - 10 - barH} width="18" height={barH} rx="2" fill="#0039A6" opacity={0.5 + (i % 3) * 0.15} />
          );
        })}
      </g>
      {/* Line chart */}
      <g transform={`translate(250, 60)`}>
        <rect width="118" height={h - 70} rx="4" fill="var(--panel-tag-bg)" />
        <polyline
          points={`10,${h - 90} 30,${h - 110} 50,${h - 95} 70,${h - 120} 90,${h - 105} 108,${h - 125}`}
          fill="none" stroke="#00933C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"
        />
      </g>
    </g>
  );
}

function CodeEditorContent({ h }: { h: number }) {
  const lineWidths = [120, 80, 160, 60, 140, 100, 180, 40, 110, 130, 90, 70];
  const colors = ['#EE352E', '#0039A6', '#00933C', '#7B2D8E', '#FF6319', '#0078C8'];
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Sidebar */}
      <rect x="0" y="0" width="36" height={h} fill="var(--panel-tag-bg)" />
      {/* Line numbers + code lines */}
      {lineWidths.slice(0, Math.floor(h / 14)).map((w, i) => (
        <g key={i} transform={`translate(0, ${6 + i * 14})`}>
          <text x="18" y="8" textAnchor="middle" fontSize="7" fill="var(--panel-text-secondary)" opacity="0.4" fontFamily="monospace">{i + 1}</text>
          <rect x={44 + (i % 3) * 12} y="2" width={Math.min(w, 280)} height="8" rx="2" fill={colors[i % colors.length]} opacity="0.25" />
          {i % 4 === 1 && <rect x={44 + (i % 3) * 12 + w + 6} y="2" width="50" height="8" rx="2" fill={colors[(i + 2) % colors.length]} opacity="0.2" />}
        </g>
      ))}
    </g>
  );
}

function ApiDocsContent({ h }: { h: number }) {
  const methods = [
    { method: 'GET', color: '#00933C', path: '/api/v1/users' },
    { method: 'POST', color: '#0039A6', path: '/api/v1/users' },
    { method: 'GET', color: '#00933C', path: '/api/v1/users/:id' },
    { method: 'PUT', color: '#FF6319', path: '/api/v1/users/:id' },
    { method: 'DEL', color: '#EE352E', path: '/api/v1/users/:id' },
    { method: 'GET', color: '#00933C', path: '/api/v1/projects' },
  ];
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Title */}
      <rect x="16" y="10" width="100" height="10" rx="3" fill="var(--panel-text)" opacity="0.2" />
      {/* Endpoint rows */}
      {methods.slice(0, Math.floor((h - 30) / 24)).map((ep, i) => (
        <g key={i} transform={`translate(16, ${30 + i * 24})`}>
          <rect width="34" height="16" rx="3" fill={ep.color} opacity="0.8" />
          <text x="17" y="12" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="monospace">{ep.method}</text>
          <text x="42" y="12" fontSize="8" fill="var(--panel-text-secondary)" fontFamily="monospace" opacity="0.7">{ep.path}</text>
          <rect x="260" y="2" width="40" height="12" rx="6" fill="var(--panel-tag-bg)" />
          <text x="280" y="11" textAnchor="middle" fontSize="6" fill="var(--panel-text-secondary)" opacity="0.6">200</text>
        </g>
      ))}
    </g>
  );
}

function TerminalContent({ h }: { h: number }) {
  const lines = [
    { prompt: true, text: 'deploy --env production', w: 180 },
    { prompt: false, text: '', w: 140, color: '#00933C' },
    { prompt: false, text: '', w: 200, color: '#00933C' },
    { prompt: false, text: '', w: 100, color: '#FCCC0A' },
    { prompt: false, text: '', w: 160, color: '#00933C' },
    { prompt: true, text: 'status --all', w: 120 },
    { prompt: false, text: '', w: 220, color: '#0078C8' },
    { prompt: false, text: '', w: 180, color: '#0078C8' },
  ];
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="#1a1a2e" />
      {lines.slice(0, Math.floor(h / 16)).map((line, i) => (
        <g key={i} transform={`translate(12, ${8 + i * 16})`}>
          {line.prompt && (
            <text x="0" y="10" fontSize="8" fill="#00933C" fontFamily="monospace" opacity="0.9">$</text>
          )}
          <rect x={line.prompt ? 14 : 4} y="2" width={line.w} height="9" rx="2" fill={line.color ?? '#e0e0e0'} opacity="0.25" />
        </g>
      ))}
    </g>
  );
}

function MobileAppContent({ h }: { h: number }) {
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Phone frame */}
      <rect x="120" y="6" width="140" height={h - 12} rx="12" fill="var(--panel-tag-bg)" stroke="var(--panel-border)" strokeWidth="1.5" />
      {/* Status bar */}
      <rect x="155" y="12" width="70" height="4" rx="2" fill="var(--panel-text-secondary)" opacity="0.2" />
      {/* Nav bar */}
      <rect x="130" y="22" width="120" height="16" rx="0" fill="var(--panel-border)" opacity="0.5" />
      <rect x="136" y="27" width="50" height="6" rx="3" fill="var(--panel-text)" opacity="0.2" />
      {/* Cards */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(130, ${44 + i * 36})`}>
          <rect width="120" height="30" rx="4" fill="var(--panel-bg)" stroke="var(--panel-border)" strokeWidth="0.5" />
          <rect x="6" y="6" width="18" height="18" rx="4" fill="#0039A6" opacity="0.3" />
          <rect x="30" y="8" width="60" height="5" rx="2" fill="var(--panel-text)" opacity="0.2" />
          <rect x="30" y="17" width="40" height="4" rx="2" fill="var(--panel-text-secondary)" opacity="0.2" />
        </g>
      ))}
      {/* Tab bar */}
      <rect x="120" y={h - 24} width="140" height="18" rx="0" fill="var(--panel-border)" opacity="0.3" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={136 + i * 30} y={h - 20} width="14" height="10" rx="2" fill="var(--panel-text-secondary)" opacity={i === 0 ? 0.5 : 0.2} />
      ))}
    </g>
  );
}

function DataVizContent({ h }: { h: number }) {
  const dots = Array.from({ length: 20 }).map((_, i) => ({
    cx: 30 + ((i * 73 + 17) % 320),
    cy: 10 + ((i * 41 + 29) % (h - 30)),
    r: 2 + (i % 3) * 1.5,
  }));
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Axes */}
      <line x1="24" y1="8" x2="24" y2={h - 12} stroke="var(--panel-text-secondary)" strokeWidth="1" opacity="0.3" />
      <line x1="24" y1={h - 12} x2="368" y2={h - 12} stroke="var(--panel-text-secondary)" strokeWidth="1" opacity="0.3" />
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="24" y1={8 + f * (h - 20)} x2="368" y2={8 + f * (h - 20)} stroke="var(--panel-border)" strokeWidth="0.5" opacity="0.5" />
      ))}
      {/* Scatter dots */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={i < 10 ? '#0039A6' : '#EE352E'} opacity="0.5" />
      ))}
      {/* Legend */}
      <rect x="300" y="10" width="8" height="8" rx="4" fill="#0039A6" opacity="0.5" />
      <rect x="314" y="12" width="30" height="4" rx="2" fill="var(--panel-text-secondary)" opacity="0.3" />
      <rect x="300" y="22" width="8" height="8" rx="4" fill="#EE352E" opacity="0.5" />
      <rect x="314" y="24" width="30" height="4" rx="2" fill="var(--panel-text-secondary)" opacity="0.3" />
    </g>
  );
}

function PipelineContent({ h }: { h: number }) {
  const nodes = [
    { x: 50, label: 'Source', color: '#0039A6' },
    { x: 140, label: 'Process', color: '#FF6319' },
    { x: 230, label: 'Transform', color: '#7B2D8E' },
    { x: 320, label: 'Output', color: '#00933C' },
  ];
  const cy = h / 2;
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Arrows between nodes */}
      {nodes.slice(0, -1).map((n, i) => (
        <line key={i} x1={n.x + 30} y1={cy} x2={nodes[i + 1].x - 30} y2={cy} stroke="var(--panel-text-secondary)" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 2" />
      ))}
      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x - 28} y={cy - 16} width="56" height="32" rx="6" fill={n.color} opacity="0.2" stroke={n.color} strokeWidth="1" />
          <text x={n.x} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="600" fill={n.color} fontFamily="'Inter', sans-serif">{n.label}</text>
          {/* Status dot */}
          <circle cx={n.x + 20} cy={cy - 10} r="3" fill="#00933C" opacity="0.8" />
        </g>
      ))}
      {/* Throughput label */}
      <rect x="140" y={cy + 24} width="100" height="14" rx="4" fill="var(--panel-tag-bg)" />
      <text x="190" y={cy + 33} textAnchor="middle" fontSize="7" fill="var(--panel-text-secondary)" fontFamily="'Inter', sans-serif">2.1M events/sec</text>
    </g>
  );
}

function SearchUIContent({ h }: { h: number }) {
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Search bar */}
      <rect x="40" y="12" width="300" height="24" rx="12" fill="var(--panel-tag-bg)" stroke="var(--panel-border)" strokeWidth="1" />
      <circle cx="56" cy="24" r="6" fill="none" stroke="var(--panel-text-secondary)" strokeWidth="1.5" opacity="0.4" />
      <rect x="70" y="20" width="80" height="6" rx="3" fill="var(--panel-text-secondary)" opacity="0.25" />
      {/* Result cards */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(40, ${46 + i * 34})`}>
          <rect width="300" height="28" rx="4" fill="var(--panel-tag-bg)" opacity="0.6" />
          <rect x="8" y="6" width={120 + i * 20} height="6" rx="3" fill="var(--panel-text)" opacity="0.2" />
          <rect x="8" y="16" width={200 - i * 30} height="5" rx="2" fill="var(--panel-text-secondary)" opacity="0.15" />
        </g>
      ))}
    </g>
  );
}

function BlockchainContent({ h }: { h: number }) {
  const blocks = [
    { x: 30, label: '#1847' },
    { x: 120, label: '#1848' },
    { x: 210, label: '#1849' },
    { x: 300, label: '#1850' },
  ];
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Chain links */}
      {blocks.slice(0, -1).map((b, i) => (
        <line key={i} x1={b.x + 44} y1={24} x2={blocks[i + 1].x + 6} y2={24} stroke="var(--panel-text-secondary)" strokeWidth="2" opacity="0.3" />
      ))}
      {/* Blocks */}
      {blocks.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y="10" width="50" height="28" rx="4" fill="var(--panel-tag-bg)" stroke="var(--panel-border)" strokeWidth="1" />
          <text x={b.x + 25} y="28" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--panel-text)" opacity="0.6" fontFamily="monospace">{b.label}</text>
        </g>
      ))}
      {/* Transaction rows */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(16, ${48 + i * 22})`}>
          <rect x="0" y="0" width="348" height="16" rx="3" fill="var(--panel-tag-bg)" opacity="0.4" />
          <rect x="6" y="4" width="60" height="8" rx="2" fill="var(--panel-text-secondary)" opacity="0.2" />
          <text x="80" y="11" fontSize="7" fill="var(--panel-text-secondary)" opacity="0.4" fontFamily="monospace">0x7f3a...c42d</text>
          <rect x="280" y="3" width="44" height="10" rx="5" fill="#00933C" opacity="0.2" />
          <text x="302" y="11" textAnchor="middle" fontSize="6" fill="#00933C" opacity="0.7">confirmed</text>
        </g>
      ))}
    </g>
  );
}

function DesignSystemContent({ h }: { h: number }) {
  const swatches = ['#0039A6', '#EE352E', '#00933C', '#7B2D8E', '#FF6319', '#FCCC0A'];
  return (
    <g>
      <rect x="0" y="0" width="380" height={h} fill="var(--panel-bg)" />
      {/* Color swatches */}
      <rect x="12" y="8" width="50" height="6" rx="3" fill="var(--panel-text)" opacity="0.2" />
      {swatches.map((c, i) => (
        <rect key={i} x={12 + i * 30} y="20" width="24" height="24" rx="4" fill={c} opacity="0.7" />
      ))}
      {/* Component cards */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${12 + i * 186}, 52)`}>
          <rect width="174" height={h - 62} rx="6" fill="var(--panel-tag-bg)" stroke="var(--panel-border)" strokeWidth="0.5" />
          <rect x="10" y="8" width="80" height="20" rx="4" fill="#0039A6" opacity="0.3" />
          <rect x="10" y="34" width="120" height="6" rx="3" fill="var(--panel-text)" opacity="0.15" />
          <rect x="10" y="44" width="90" height="5" rx="2" fill="var(--panel-text-secondary)" opacity="0.1" />
        </g>
      ))}
    </g>
  );
}

function renderContent(type: MockupType, h: number) {
  switch (type) {
    case 'dashboard': return <DashboardContent h={h} />;
    case 'code-editor': return <CodeEditorContent h={h} />;
    case 'api-docs': return <ApiDocsContent h={h} />;
    case 'terminal': return <TerminalContent h={h} />;
    case 'mobile-app': return <MobileAppContent h={h} />;
    case 'data-viz': return <DataVizContent h={h} />;
    case 'pipeline-monitor': return <PipelineContent h={h} />;
    case 'search-ui': return <SearchUIContent h={h} />;
    case 'blockchain-explorer': return <BlockchainContent h={h} />;
    case 'design-system': return <DesignSystemContent h={h} />;
  }
}

export default function MockupFrame({ type, compact = false }: Props) {
  const contentH = compact ? 132 : 172;
  const totalH = contentH + 28;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--panel-border)' }}
    >
      <svg viewBox={`0 0 380 ${totalH}`} width="100%" style={{ display: 'block' }}>
        {/* Browser chrome */}
        <rect x="0" y="0" width="380" height="28" fill="var(--panel-tag-bg)" />
        <circle cx="14" cy="14" r="4" fill="#EE352E" opacity="0.6" />
        <circle cx="28" cy="14" r="4" fill="#FCCC0A" opacity="0.6" />
        <circle cx="42" cy="14" r="4" fill="#00933C" opacity="0.6" />
        <rect x="60" y="8" width="260" height="12" rx="6" fill="var(--panel-border)" opacity="0.5" />

        {/* Content area */}
        <g transform="translate(0, 28)">
          {renderContent(type, contentH)}
        </g>
      </svg>
    </div>
  );
}
