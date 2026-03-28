import type { Severity } from '@/types';
import { SEVERITY_COLORS, SEVERITY_BG } from '@/constants/config';

interface SeverityBadgeProps {
  severity: Severity;
  showLabel?: boolean;
  cvss?: number;
}

export default function SeverityBadge({ severity, showLabel = true, cvss }: SeverityBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${SEVERITY_BG[severity]} ${SEVERITY_COLORS[severity]}`}
      >
        {showLabel && severity}
      </span>
      {cvss !== undefined && (
        <span className={`text-[11px] font-mono-hud tabular-nums font-semibold ${SEVERITY_COLORS[severity]}`}>
          {cvss.toFixed(1)}
        </span>
      )}
    </div>
  );
}
