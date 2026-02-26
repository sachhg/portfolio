type Props = {
  count: number;
  connected: boolean;
};

export default function VisitorCounter({ count, connected }: Props) {
  if (!connected || count === 0) return null;

  return (
    <div
      className="fixed z-20 pointer-events-none"
      style={{
        left: 16,
        bottom: 48,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="rounded-full shadow-lg px-3 py-1.5 flex items-center gap-2 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: '#10B981',
            boxShadow: '0 0 4px #10B981',
            animation: 'visitor-pulse 2s ease-in-out infinite',
          }}
        />
        <span
          className="text-[11px] font-medium transition-colors duration-300 whitespace-nowrap"
          style={{ color: 'var(--panel-text-secondary)' }}
        >
          {count} {count === 1 ? 'traveler' : 'travelers'} on the network
        </span>
      </div>
    </div>
  );
}
