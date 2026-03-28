import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex flex-1 items-center justify-center bg-void min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 text-neon animate-spin" />
        <p className="font-display text-sm text-[hsl(var(--text-secondary))] tracking-wide uppercase">
          Initializing Module
        </p>
      </div>
    </div>
  );
}
