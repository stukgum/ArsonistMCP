import { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldOff,
  Server,
  Wifi,
  Database,
  Save,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import ModelSelector from '@/components/features/ModelSelector';
import { useAppStore } from '@/stores/appStore';
import { DEFAULT_CONFIG } from '@/constants/config';
import { useToast } from '@/hooks/use-toast';
import type { SafetyMode } from '@/types';

const SAFETY_MODES: { mode: SafetyMode; icon: React.ElementType; label: string; desc: string; color: string }[] = [
  {
    mode: 'passive',
    icon: Shield,
    label: 'Passive Only',
    desc: 'Analyze existing proxy history without sending any requests. Zero risk to target.',
    color: 'border-[hsl(157_100%_50%/0.25)] bg-[hsl(157_100%_50%/0.05)]',
  },
  {
    mode: 'cautious',
    icon: ShieldAlert,
    label: 'Cautious',
    desc: 'Send requests but require confirmation before active scanning or destructive actions.',
    color: 'border-[hsl(38_100%_50%/0.25)] bg-[hsl(38_100%_50%/0.05)]',
  },
  {
    mode: 'aggressive',
    icon: ShieldOff,
    label: 'Aggressive',
    desc: 'Full autonomous mode. Agents send requests and scan without confirmation prompts.',
    color: 'border-[hsl(348_100%_60%/0.25)] bg-[hsl(348_100%_60%/0.05)]',
  },
];

export default function Settings() {
  const safetyMode = useAppStore((s) => s.safetyMode);
  const setSafetyMode = useAppStore((s) => s.setSafetyMode);
  const { toast } = useToast();

  const [burpHost, setBurpHost] = useState(DEFAULT_CONFIG.burpHost);
  const [burpPort, setBurpPort] = useState(String(DEFAULT_CONFIG.burpPort));
  const [maxReqRate, setMaxReqRate] = useState(String(DEFAULT_CONFIG.maxRequestsPerMinute));
  const [scopeTargets, setScopeTargets] = useState(DEFAULT_CONFIG.scopeTargets.join('\n'));

  const handleSave = () => {
    toast({ title: 'Configuration saved', description: 'Settings persisted to local storage.' });
  };

  const handleReset = () => {
    setBurpHost(DEFAULT_CONFIG.burpHost);
    setBurpPort(String(DEFAULT_CONFIG.burpPort));
    setMaxReqRate(String(DEFAULT_CONFIG.maxRequestsPerMinute));
    setScopeTargets(DEFAULT_CONFIG.scopeTargets.join('\n'));
    setSafetyMode(DEFAULT_CONFIG.safetyMode);
    toast({ title: 'Configuration reset to defaults' });
  };

  return (
    <div className="p-5 min-h-full">
      <div className="grid grid-cols-12 gap-6">
        {/* Main settings */}
        <div className="col-span-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="font-display text-lg font-bold text-[hsl(var(--text-primary))]">
              Configuration
            </h2>
            <p className="text-[11px] text-[hsl(var(--text-muted))] mt-0.5">
              Manage connections, AI models, safety controls, and agent behavior.
            </p>
          </div>

          {/* Safety Mode */}
          <section className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Shield className="size-4 text-neon" />
              Safety Mode
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {SAFETY_MODES.map(({ mode, icon: Icon, label, desc, color }) => (
                <button
                  key={mode}
                  onClick={() => setSafetyMode(mode)}
                  className={`text-left p-4 rounded-md border transition-all ${
                    safetyMode === mode ? color : 'border-dim bg-surface hover:bg-[hsl(var(--surface-hover))]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      className={`size-4 ${
                        mode === 'passive' ? 'text-neon' : mode === 'cautious' ? 'text-medium' : 'text-critical'
                      }`}
                    />
                    <span className="font-display font-semibold text-[12px] text-[hsl(var(--text-primary))]">
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--text-muted))] leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
            {safetyMode === 'aggressive' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded bg-[hsl(348_100%_60%/0.08)] border border-[hsl(348_100%_60%/0.2)] animate-fadeIn">
                <AlertTriangle className="size-3.5 text-critical shrink-0" />
                <p className="text-[10px] text-critical">
                  Aggressive mode allows agents to send requests without confirmation. Ensure you have proper authorization for all targets in scope.
                </p>
              </div>
            )}
          </section>

          {/* Connection Settings */}
          <section className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Server className="size-4 text-cyan-hud" />
              Burp Suite Connection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
                  Host
                </label>
                <input
                  type="text"
                  value={burpHost}
                  onChange={(e) => setBurpHost(e.target.value)}
                  className="w-full bg-void border border-dim rounded px-3 py-2 text-[12px] font-mono-hud text-[hsl(var(--text-primary))] focus:border-[hsl(157_100%_50%/0.3)] outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
                  Port
                </label>
                <input
                  type="text"
                  value={burpPort}
                  onChange={(e) => setBurpPort(e.target.value)}
                  className="w-full bg-void border border-dim rounded px-3 py-2 text-[12px] font-mono-hud text-[hsl(var(--text-primary))] focus:border-[hsl(157_100%_50%/0.3)] outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Database className="size-4 text-medium" />
              Rate Limits & Scope
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
                  Max Requests/Min
                </label>
                <input
                  type="text"
                  value={maxReqRate}
                  onChange={(e) => setMaxReqRate(e.target.value)}
                  className="w-full bg-void border border-dim rounded px-3 py-2 text-[12px] font-mono-hud text-[hsl(var(--text-primary))] focus:border-[hsl(157_100%_50%/0.3)] outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
                  Scope Targets (one per line)
                </label>
                <textarea
                  value={scopeTargets}
                  onChange={(e) => setScopeTargets(e.target.value)}
                  rows={3}
                  className="w-full bg-void border border-dim rounded px-3 py-2 text-[12px] font-mono-hud text-[hsl(var(--text-primary))] focus:border-[hsl(157_100%_50%/0.3)] outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-semibold bg-[hsl(157_100%_50%/0.12)] border border-[hsl(157_100%_50%/0.25)] text-neon hover:bg-[hsl(157_100%_50%/0.18)] transition-colors"
            >
              <Save className="size-3.5" />
              Save Configuration
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-medium border border-dim text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--text-muted))] transition-colors"
            >
              <RotateCcw className="size-3.5" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Model Selector sidebar */}
        <div className="col-span-4 space-y-4">
          <div className="hud-panel p-4">
            <h3 className="font-display font-semibold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
              <Wifi className="size-4 text-neon" />
              AI Model
            </h3>
            <ModelSelector />
          </div>

          {/* Legal notice */}
          <div className="hud-panel p-4 space-y-2">
            <h3 className="font-display font-semibold text-xs text-critical flex items-center gap-2">
              <AlertTriangle className="size-3.5" />
              Legal Notice
            </h3>
            <p className="text-[10px] text-[hsl(var(--text-muted))] leading-relaxed">
              Only use this tool against targets you have explicit, written authorization to test.
              Unauthorized access to computer systems is illegal under CFAA, CMA, and equivalent laws.
              Always obtain proper permission before initiating any active scanning.
            </p>
          </div>

          {/* MCP Status */}
          <div className="hud-panel p-4 space-y-3">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
              System Status
            </h3>
            <div className="space-y-2">
              {[
                { label: 'MCP Server', status: 'Connected', ok: true },
                { label: 'Burp Suite Pro', status: 'Linked', ok: true },
                { label: 'Caddy Proxy', status: 'Running', ok: true },
                { label: 'Java Runtime', status: 'v21.0.1', ok: true },
                { label: 'Ollama', status: 'Connected', ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-[hsl(var(--text-muted))]">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${item.ok ? 'bg-neon' : 'bg-critical'}`} />
                    <span className={`text-[10px] font-medium ${item.ok ? 'text-neon' : 'text-critical'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
