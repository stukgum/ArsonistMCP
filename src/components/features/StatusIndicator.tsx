import type { AgentStatus } from '@/types';
import { STATUS_COLORS } from '@/constants/config';

interface StatusIndicatorProps {
  status: AgentStatus;
}

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'IDLE',
  running: 'RUNNING',
  paused: 'PAUSED',
  completed: 'COMPLETE',
  error: 'ERROR',
};

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const isLive = status === 'running';

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex size-2">
        {isLive && (
          <span className="absolute inline-flex size-full rounded-full bg-neon opacity-50 animate-ping" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            status === 'running'
              ? 'bg-neon'
              : status === 'paused'
              ? 'bg-medium'
              : status === 'completed'
              ? 'bg-cyan'
              : status === 'error'
              ? 'bg-critical'
              : 'bg-[hsl(var(--text-muted))]'
          }`}
        />
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    </div>
  );
}
