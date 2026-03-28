import { useAppStore } from '@/stores/appStore';
import { DEFAULT_MODELS } from '@/constants/config';
import { Check, Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function ModelSelector() {
  const selectedModel = useAppStore((s) => s.selectedModel);
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);

  return (
    <div className="space-y-2">
      {DEFAULT_MODELS.map((model) => {
        const active = selectedModel === model.id;
        return (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left ${
              active
                ? 'border-[hsl(157_100%_50%/0.25)] bg-[hsl(157_100%_50%/0.05)] glow-neon'
                : 'border-dim bg-surface hover:bg-[hsl(var(--surface-hover))]'
            }`}
          >
            <div className={`flex items-center justify-center size-8 rounded ${
              active ? 'bg-[hsl(157_100%_50%/0.15)]' : 'bg-[hsl(var(--surface-elevated))]'
            }`}>
              {active ? (
                <Check className="size-4 text-neon" />
              ) : model.status === 'loading' ? (
                <Loader2 className="size-4 text-[hsl(var(--text-muted))] animate-spin" />
              ) : model.status === 'connected' ? (
                <Wifi className="size-3.5 text-neon" />
              ) : (
                <WifiOff className="size-3.5 text-[hsl(var(--text-muted))]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-medium ${active ? 'text-neon' : 'text-[hsl(var(--text-primary))]'}`}>
                {model.name}
              </p>
              <p className="text-[10px] text-[hsl(var(--text-muted))] font-mono-hud truncate">
                {model.provider} / {model.model}
              </p>
            </div>

            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              model.status === 'connected'
                ? 'text-neon bg-[hsl(157_100%_50%/0.08)]'
                : model.status === 'loading'
                ? 'text-medium bg-[hsl(38_100%_50%/0.08)]'
                : 'text-[hsl(var(--text-muted))] bg-[hsl(var(--surface-elevated))]'
            }`}>
              {model.status}
            </span>
          </button>
        );
      })}
    </div>
  );
}
