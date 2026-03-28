import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Shield, ShieldAlert, ShieldOff, Clock, Activity } from 'lucide-react';
import { DASHBOARD_STATS } from '@/constants/mockData';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Command Center',
  '/agents': 'Agent Orchestration',
  '/training': 'Training Academy',
  '/reports': 'Vulnerability Reports',
  '/settings': 'Configuration',
};

const SAFETY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  passive: { label: 'PASSIVE', icon: Shield, color: 'text-neon bg-[hsl(157_100%_50%/0.1)] border-[hsl(157_100%_50%/0.2)]' },
  cautious: { label: 'CAUTIOUS', icon: ShieldAlert, color: 'text-medium bg-[hsl(38_100%_50%/0.1)] border-[hsl(38_100%_50%/0.2)]' },
  aggressive: { label: 'AGGRESSIVE', icon: ShieldOff, color: 'text-critical bg-[hsl(348_100%_60%/0.1)] border-[hsl(348_100%_60%/0.2)]' },
};

export default function TopBar() {
  const { pathname } = useLocation();
  const safetyMode = useAppStore((s) => s.safetyMode);
  const safety = SAFETY_CONFIG[safetyMode];
  const SafetyIcon = safety.icon;

  return (
    <header className="h-12 bg-abyss border-b border-dim flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="font-display font-semibold text-base text-[hsl(var(--text-primary))]">
          {PAGE_TITLES[pathname] ?? 'Arsonist-MCP'}
        </h1>
        <div className="h-4 w-px bg-[hsl(var(--border-dim))]" />
        <span className="text-[11px] text-[hsl(var(--text-muted))] font-mono-hud tabular-nums flex items-center gap-1.5">
          <Clock className="size-3" />
          Uptime {DASHBOARD_STATS.uptime}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Live request counter */}
        <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--text-secondary))] font-mono-hud tabular-nums">
          <Activity className="size-3 text-neon animate-pulse-neon" />
          <span>{DASHBOARD_STATS.requestsProcessed.toLocaleString()} req</span>
        </div>

        <div className="h-4 w-px bg-[hsl(var(--border-dim))]" />

        {/* Safety mode badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold tracking-wider ${safety.color}`}
        >
          <SafetyIcon className="size-3" />
          {safety.label}
        </div>
      </div>
    </header>
  );
}
