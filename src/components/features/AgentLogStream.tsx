import { useRef, useEffect } from 'react';
import { AGENT_LOGS } from '@/constants/mockData';
import { Brain, Zap, Eye, AlertTriangle, Bug } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  thought: { icon: Brain, color: 'text-cyan-hud', label: 'THINK' },
  action: { icon: Zap, color: 'text-neon', label: 'ACT' },
  observation: { icon: Eye, color: 'text-[hsl(var(--text-secondary))]', label: 'OBS' },
  finding: { icon: AlertTriangle, color: 'text-medium', label: 'FIND' },
  error: { icon: Bug, color: 'text-critical', label: 'ERR' },
};

export default function AgentLogStream() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="hud-panel flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dim">
        <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
          Agent Reasoning Stream
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-neon animate-pulse-neon" />
          <span className="text-[10px] text-neon font-medium">LIVE</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {AGENT_LOGS.map((log, i) => {
          const config = TYPE_CONFIG[log.type];
          const Icon = config.icon;

          return (
            <div
              key={log.id}
              className="flex gap-2 py-1.5 group animate-fadeIn"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="text-[10px] font-mono-hud text-[hsl(var(--text-muted))] tabular-nums shrink-0 pt-0.5">
                {log.timestamp}
              </span>
              <div className={`flex items-center justify-center size-5 rounded shrink-0 ${config.color}`}>
                <Icon className="size-3" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${config.color} mr-1.5`}>
                  [{config.label}]
                </span>
                <span className="text-[11px] text-[hsl(var(--text-secondary))] font-mono-hud leading-relaxed">
                  {log.content}
                </span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[10px] font-mono-hud text-[hsl(var(--text-muted))]">19:16:00</span>
          <span className="h-px flex-1 bg-[hsl(var(--border-dim))]" />
          <span className="text-[10px] text-neon font-mono-hud animate-type-cursor border-r-2 border-neon pr-1">
            Processing...
          </span>
        </div>
      </div>
    </div>
  );
}
