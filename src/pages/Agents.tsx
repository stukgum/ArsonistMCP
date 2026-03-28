import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import AgentCard from '@/components/features/AgentCard';
import AgentLogStream from '@/components/features/AgentLogStream';
import { AGENTS } from '@/constants/mockData';
import { AGENT_TEMPLATES } from '@/constants/config';
import { useAppStore } from '@/stores/appStore';
import { useToast } from '@/hooks/use-toast';
import heroImg from '@/assets/agents-hero.jpg';

const FILTERS = ['all', 'running', 'paused', 'completed', 'idle'] as const;

export default function Agents() {
  const [filter, setFilter] = useState<string>('all');
  const [showNewAgent, setShowNewAgent] = useState(false);
  const agentStatuses = useAppStore((s) => s.agentStatuses);
  const { toast } = useToast();

  const filtered = AGENTS.filter((a) => {
    if (filter === 'all') return true;
    return (agentStatuses[a.id] ?? a.status) === filter;
  });

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img src={heroImg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--void))] via-[hsl(var(--void)/0.6)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="font-display text-xl font-bold text-[hsl(var(--text-primary))]">
            Agent Orchestration
          </h2>
          <p className="text-[12px] text-[hsl(var(--text-secondary))] mt-1">
            Deploy, monitor, and control autonomous vulnerability hunting agents via MCP.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-[hsl(var(--text-muted))]" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-[hsl(157_100%_50%/0.1)] text-neon border border-[hsl(157_100%_50%/0.2)]'
                    : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewAgent(!showNewAgent)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold bg-[hsl(157_100%_50%/0.1)] border border-[hsl(157_100%_50%/0.2)] text-neon hover:bg-[hsl(157_100%_50%/0.15)] transition-colors"
          >
            <Plus className="size-3.5" />
            Deploy Agent
          </button>
        </div>

        {/* Template picker */}
        {showNewAgent && (
          <div className="hud-panel-active p-4 animate-fadeIn">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))] mb-3">
              Select Agent Template
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {AGENT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    toast({ title: `${t.name} agent queued for deployment` });
                    setShowNewAgent(false);
                  }}
                  className="text-left p-3 rounded border border-dim hover:border-[hsl(157_100%_50%/0.2)] hover:bg-[hsl(var(--surface-hover))] transition-colors"
                >
                  <p className="text-[12px] font-medium text-[hsl(var(--text-primary))]">{t.name}</p>
                  <p className="text-[10px] text-[hsl(var(--text-muted))] mt-0.5 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-12 gap-5">
          {/* Agents grid */}
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="hud-panel flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-[hsl(var(--text-secondary))]">No agents match this filter.</p>
                <p className="text-[11px] text-[hsl(var(--text-muted))] mt-1">Deploy a new agent or change the filter.</p>
              </div>
            )}
          </div>

          {/* Log stream */}
          <div className="col-span-4" style={{ height: '640px' }}>
            <AgentLogStream />
          </div>
        </div>
      </div>
    </div>
  );
}
