import { DASHBOARD_STATS } from '@/constants/mockData';

const BARS = [
  { label: 'CRIT', count: DASHBOARD_STATS.criticalCount, color: 'bg-critical', textColor: 'text-critical' },
  { label: 'HIGH', count: DASHBOARD_STATS.highCount, color: 'bg-high', textColor: 'text-high' },
  { label: 'MED', count: DASHBOARD_STATS.mediumCount, color: 'bg-medium', textColor: 'text-medium' },
  { label: 'LOW', count: DASHBOARD_STATS.lowCount, color: 'bg-low', textColor: 'text-low' },
];

export default function SeveritySummary() {
  const maxCount = Math.max(...BARS.map((b) => b.count));

  return (
    <div className="hud-panel p-4 h-full flex flex-col">
      <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))] mb-4">
        Severity Breakdown
      </h3>
      <div className="flex-1 space-y-3">
        {BARS.map((bar) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold tracking-widest ${bar.textColor}`}>
                {bar.label}
              </span>
              <span className={`text-sm font-display font-bold tabular-nums ${bar.textColor}`}>
                {bar.count}
              </span>
            </div>
            <div className="h-2 bg-[hsl(var(--surface-elevated))] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-700 ease-out`}
                style={{ width: `${maxCount > 0 ? (bar.count / maxCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-dim flex items-center justify-between">
        <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider">Total</span>
        <span className="text-lg font-display font-bold text-[hsl(var(--text-primary))] tabular-nums">
          {DASHBOARD_STATS.totalVulnerabilities}
        </span>
      </div>
    </div>
  );
}
