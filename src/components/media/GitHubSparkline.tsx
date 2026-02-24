import { useGitHubActivity } from '../../hooks/useGitHubActivity';

type Props = {
  repo: string;
  compact?: boolean;
};

export default function GitHubSparkline({ repo, compact = false }: Props) {
  const { data, loading, error } = useGitHubActivity(repo);
  const height = compact ? 48 : 60;
  const viewW = 380;
  const viewH = 40;
  const padX = 4;
  const padY = 4;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <h3
          className="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
          style={{ color: 'var(--panel-text-secondary)' }}
        >
          Commit Activity
        </h3>
        <span
          className="text-[10px] font-normal transition-colors duration-300"
          style={{ color: 'var(--panel-text-secondary)', opacity: 0.6 }}
        >
          {repo}
        </span>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--panel-border)', height }}
      >
        {loading && (
          <div className="w-full h-full flex items-end justify-center gap-[3px] px-3 pb-2">
            {Array.from({ length: 26 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm animate-pulse"
                style={{
                  backgroundColor: 'var(--panel-tag-bg)',
                  height: `${20 + ((i * 37 + 13) % 60)}%`,
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-[10px] transition-colors duration-300"
              style={{ color: 'var(--panel-text-secondary)' }}
            >
              Activity data unavailable
            </span>
          </div>
        )}

        {data && (
          <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
          >
            {(() => {
              const max = Math.max(...data, 1);
              const step = (viewW - padX * 2) / (data.length - 1);
              const points = data.map((val, i) => {
                const x = padX + i * step;
                const y = viewH - padY - (val / max) * (viewH - padY * 2);
                return `${x},${y}`;
              });
              const polyline = points.join(' ');
              const lastX = padX + (data.length - 1) * step;
              const areaPath =
                `M ${padX},${viewH - padY} ` +
                points.map((p) => `L ${p}`).join(' ') +
                ` L ${lastX},${viewH - padY} Z`;

              return (
                <>
                  <path d={areaPath} fill="var(--panel-tag-bg)" opacity="0.6" />
                  <polyline
                    points={polyline}
                    fill="none"
                    stroke="var(--panel-text-secondary)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </>
              );
            })()}
          </svg>
        )}
      </div>
    </div>
  );
}
