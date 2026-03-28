import { Play, Pause, Square, RotateCcw, Search } from 'lucide-react';
import type { Agent } from '@/types';
import StatusIndicator from './StatusIndicator';
import { useAppStore } from '@/stores/appStore';
import { useToast } from '@/hooks/use-toast';

interface AgentCardProps {
  agent: Agent;
  index: number;
}

export default function AgentCard({ agent, index }: AgentCardProps) {
  const setAgentStatus = useAppStore((s) => s.setAgentStatus);
  const status = useAppStore((s) => s.agentStatuses[agent.id]) ?? agent.status;
  const { toast } = useToast();

  const handleAction = (action: string) => {
    if (action === 'start') {
      setAgentStatus(agent.id, 'running');
      toast({ title: `${agent.name} started` });
    } else if (action === 'pause') {
      setAgentStatus(agent.id, 'paused');
      toast({ title: `${agent.name} paused` });
    } else if (action === 'stop') {
      setAgentStatus(agent.id, 'idle');
      toast({ title: `${agent.name} stopped` });
    } else if (action === 'restart') {
      setAgentStatus(agent.id, 'running');
      toast({ title: `${agent.name} restarted` });
    }
  };

  return (
    <div
      className={`hud-panel overflow-hidden animate-fadeIn ${
        status === 'running' ? 'border-[hsl(157_100%_50%/0.15)] glow-neon' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center size-8 rounded-md ${
                status === 'running'
                  ? 'bg-[hsl(157_100%_50%/0.1)]'
                  : 'bg-[hsl(var(--surface-elevated))]'
              }`}
            >
              <Search className={`size-4 ${status === 'running' ? 'text-neon' : 'text-[hsl(var(--text-muted))]'}`} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-[hsl(var(--text-primary))]">
                {agent.name}
              </h3>
              <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider">
                {agent.type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <StatusIndicator status={status} />
        </div>

        {/* Description */}
        <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-2">
          {agent.description}
        </p>

        {/* Target */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[hsl(var(--text-muted))]">Target:</span>
          <span className="font-mono-hud text-cyan-hud">{agent.target}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[hsl(var(--text-muted))]">Progress</span>
            <span className="tabular-nums font-medium text-[hsl(var(--text-secondary))]">{agent.progress}%</span>
          </div>
          <div className="h-1.5 bg-[hsl(var(--surface-elevated))] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                status === 'running'
                  ? 'bg-neon'
                  : status === 'completed'
                  ? 'bg-cyan'
                  : 'bg-[hsl(var(--text-muted))]'
              }`}
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-void rounded px-2.5 py-1.5">
            <span className="text-[10px] text-[hsl(var(--text-muted))] block">Findings</span>
            <span className="text-sm font-display font-bold text-[hsl(var(--text-primary))] tabular-nums">
              {agent.findings}
            </span>
          </div>
          <div className="bg-void rounded px-2.5 py-1.5">
            <span className="text-[10px] text-[hsl(var(--text-muted))] block">Requests</span>
            <span className="text-sm font-display font-bold text-[hsl(var(--text-primary))] tabular-nums">
              {agent.requestsSent}
            </span>
          </div>
        </div>

        {/* Last action */}
        <div className="bg-void rounded px-3 py-2 border border-dim">
          <span className="text-[10px] text-[hsl(var(--text-muted))] block mb-0.5">Last Action</span>
          <p className="text-[11px] text-[hsl(var(--text-secondary))] font-mono-hud truncate">
            {agent.lastAction}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 pt-1">
          {(status === 'idle' || status === 'paused') && (
            <button
              onClick={() => handleAction('start')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium bg-[hsl(157_100%_50%/0.1)] border border-[hsl(157_100%_50%/0.2)] text-neon hover:bg-[hsl(157_100%_50%/0.15)] transition-colors"
              aria-label="Start agent"
            >
              <Play className="size-3" />
              {status === 'paused' ? 'Resume' : 'Deploy'}
            </button>
          )}
          {status === 'running' && (
            <button
              onClick={() => handleAction('pause')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium bg-[hsl(38_100%_50%/0.1)] border border-[hsl(38_100%_50%/0.2)] text-medium hover:bg-[hsl(38_100%_50%/0.15)] transition-colors"
              aria-label="Pause agent"
            >
              <Pause className="size-3" />
              Pause
            </button>
          )}
          {(status === 'running' || status === 'paused') && (
            <button
              onClick={() => handleAction('stop')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium border border-dim text-[hsl(var(--text-secondary))] hover:border-[hsl(348_100%_60%/0.3)] hover:text-critical transition-colors"
              aria-label="Stop agent"
            >
              <Square className="size-3" />
              Stop
            </button>
          )}
          {status === 'completed' && (
            <button
              onClick={() => handleAction('restart')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium border border-dim text-[hsl(var(--text-secondary))] hover:text-cyan-hud transition-colors"
              aria-label="Restart agent"
            >
              <RotateCcw className="size-3" />
              Restart
            </button>
          )}
          <div className="flex-1" />
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              agent.safetyMode === 'passive'
                ? 'text-neon bg-[hsl(157_100%_50%/0.08)]'
                : agent.safetyMode === 'cautious'
                ? 'text-medium bg-[hsl(38_100%_50%/0.08)]'
                : 'text-critical bg-[hsl(348_100%_60%/0.08)]'
            }`}
          >
            {agent.safetyMode}
          </span>
        </div>
      </div>
    </div>
  );
}
