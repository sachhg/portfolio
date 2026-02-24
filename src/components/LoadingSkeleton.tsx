export default function LoadingSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--map-bg, #f5f1eb)',
        position: 'relative',
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#1a1a1a',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          SN
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--map-text, #1a1a1a)',
              letterSpacing: 2,
              textTransform: 'uppercase' as const,
              lineHeight: 1.3,
            }}
          >
            SN Metropolitan
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--map-text-muted, #9ca3af)',
              letterSpacing: 2.5,
              textTransform: 'uppercase' as const,
            }}
          >
            Transit Authority
          </div>
        </div>
      </div>

      {/* Placeholder SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1100 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g opacity={0.4}>
          <polyline
            points="180,120 260,120 340,120 420,120 500,120"
            fill="none"
            stroke="var(--map-grid, #ccc5b9)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <polyline
            points="700,100 780,100 860,100 940,100"
            fill="none"
            stroke="var(--map-grid, #ccc5b9)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <polyline
            points="180,420 260,420 340,420 420,420 500,420"
            fill="none"
            stroke="var(--map-grid, #ccc5b9)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <polyline
            points="680,400 760,400 840,400 920,400"
            fill="none"
            stroke="var(--map-grid, #ccc5b9)"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Blog area (center) */}
          <polyline
            points="480,300 560,300 640,300"
            fill="none"
            stroke="var(--map-grid, #ccc5b9)"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
