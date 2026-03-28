import { TRAFFIC_ENTRIES } from '@/constants/mockData';

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-neon',
  POST: 'text-cyan-hud',
  PUT: 'text-medium',
  PATCH: 'text-medium',
  DELETE: 'text-critical',
  OPTIONS: 'text-[hsl(var(--text-muted))]',
};

const STATUS_COLORS: Record<string, string> = {
  '2': 'text-neon',
  '3': 'text-cyan-hud',
  '4': 'text-medium',
  '5': 'text-critical',
};

export default function TrafficMonitor() {
  return (
    <div className="hud-panel flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dim">
        <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
          Live Traffic
        </h3>
        <span className="text-[10px] text-[hsl(var(--text-muted))] tabular-nums font-mono-hud">
          {TRAFFIC_ENTRIES.length} entries
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider border-b border-dim">
              <th className="text-left py-2 px-3 font-medium">Time</th>
              <th className="text-left py-2 px-2 font-medium">Method</th>
              <th className="text-left py-2 px-2 font-medium">URL</th>
              <th className="text-right py-2 px-2 font-medium">Status</th>
              <th className="text-right py-2 px-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {TRAFFIC_ENTRIES.map((entry) => (
              <tr
                key={entry.id}
                className={`border-b border-[hsl(var(--border-dim)/0.5)] hover:bg-[hsl(var(--surface-hover))] transition-colors ${
                  entry.flagged ? 'bg-[hsl(157_100%_50%/0.02)]' : ''
                }`}
              >
                <td className="py-1.5 px-3 font-mono-hud text-[hsl(var(--text-muted))] tabular-nums whitespace-nowrap">
                  {entry.timestamp}
                </td>
                <td className="py-1.5 px-2">
                  <span className={`font-mono-hud font-medium ${METHOD_COLORS[entry.method] ?? 'text-[hsl(var(--text-secondary))]'}`}>
                    {entry.method}
                  </span>
                </td>
                <td className="py-1.5 px-2 font-mono-hud text-[hsl(var(--text-secondary))] truncate max-w-[280px]">
                  <div className="flex items-center gap-1.5">
                    {entry.flagged && <span className="size-1.5 rounded-full bg-neon shrink-0" />}
                    <span className="truncate">{entry.url}</span>
                  </div>
                </td>
                <td className="py-1.5 px-2 text-right">
                  <span
                    className={`font-mono-hud font-medium tabular-nums ${
                      STATUS_COLORS[String(entry.statusCode)[0]] ?? 'text-[hsl(var(--text-muted))]'
                    }`}
                  >
                    {entry.statusCode}
                  </span>
                </td>
                <td className="py-1.5 px-3 text-right font-mono-hud text-[hsl(var(--text-muted))] tabular-nums whitespace-nowrap">
                  {entry.responseTime}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
