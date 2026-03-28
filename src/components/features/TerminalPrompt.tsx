import { useState } from 'react';
import { Send, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QUICK_COMMANDS = [
  'Hunt for IDOR vulnerabilities on *.target.com',
  'Analyze proxy history for sensitive data exposure',
  'Run full reconnaissance on api.target.com',
  'Generate vulnerability report for today\'s findings',
];

export default function TerminalPrompt() {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const handleSubmit = (command: string) => {
    if (!command.trim()) return;
    toast({
      title: 'Command received',
      description: `Agent dispatching: "${command.slice(0, 60)}..."`,
    });
    setInput('');
  };

  return (
    <div className="hud-panel-active overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-dim">
        <Flame className="size-3.5 text-neon" />
        <span className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
          Command Interface
        </span>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Quick commands */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSubmit(cmd)}
              className="px-2.5 py-1 rounded border border-dim text-[10px] text-[hsl(var(--text-secondary))] hover:border-[hsl(157_100%_50%/0.2)] hover:text-neon transition-colors truncate max-w-[260px]"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 bg-void rounded border border-dim focus-within:border-[hsl(157_100%_50%/0.3)] transition-colors">
          <span className="text-neon text-[12px] font-mono-hud pl-3 select-none">❯</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(input)}
            placeholder="Describe your objective or type a command..."
            className="flex-1 bg-transparent text-[12px] font-mono-hud text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] py-2.5 outline-none"
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim()}
            className="px-3 py-2 text-neon hover:text-[hsl(var(--text-primary))] disabled:opacity-30 transition-colors"
            aria-label="Send command"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
