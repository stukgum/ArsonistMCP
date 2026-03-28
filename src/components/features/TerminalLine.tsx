import { useEffect, useState, useRef } from 'react';
import { Brain, Zap, Eye, AlertTriangle, Bug, Terminal, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import type { TerminalLine as TLine } from '@/hooks/useTerminal';

interface TerminalLineProps {
  line: TLine;
  onTypingComplete?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string; bg: string }> = {
  input: { icon: ChevronRight, color: 'text-neon', label: 'CMD', bg: 'bg-[hsl(157_100%_50%/0.04)]' },
  thought: { icon: Brain, color: 'text-cyan-hud', label: 'THINK', bg: '' },
  action: { icon: Zap, color: 'text-neon', label: 'ACT', bg: '' },
  observation: { icon: Eye, color: 'text-[hsl(var(--text-secondary))]', label: 'OBS', bg: '' },
  finding: { icon: AlertTriangle, color: 'text-medium', label: 'FIND', bg: 'bg-[hsl(38_100%_50%/0.03)]' },
  error: { icon: Bug, color: 'text-critical', label: 'ERR', bg: 'bg-[hsl(348_100%_60%/0.03)]' },
  system: { icon: Terminal, color: 'text-[hsl(var(--text-muted))]', label: 'SYS', bg: '' },
  success: { icon: CheckCircle2, color: 'text-neon', label: 'OK', bg: 'bg-[hsl(157_100%_50%/0.03)]' },
  info: { icon: Info, color: 'text-cyan-hud', label: 'INFO', bg: '' },
};

const TYPING_SPEED = 12; // ms per char

export default function TerminalLineComponent({ line, onTypingComplete }: TerminalLineProps) {
  const config = TYPE_CONFIG[line.type] || TYPE_CONFIG.system;
  const Icon = config.icon;
  const [displayedText, setDisplayedText] = useState(line.isTyping ? '' : line.content);
  const charIndexRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!line.isTyping) {
      setDisplayedText(line.content);
      return;
    }

    charIndexRef.current = 0;
    setDisplayedText('');

    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime >= TYPING_SPEED) {
        charIndexRef.current += 1;
        const nextText = line.content.slice(0, charIndexRef.current);
        setDisplayedText(nextText);
        lastTime = time;

        if (charIndexRef.current >= line.content.length) {
          onTypingComplete?.(line.id);
          return;
        }
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [line.isTyping, line.content, line.id, onTypingComplete]);

  return (
    <div className={`flex gap-2 py-1 px-2 rounded group ${config.bg} hover:bg-[hsl(var(--surface-hover)/0.5)] transition-colors`}>
      <span className="text-[10px] font-mono-hud text-[hsl(var(--text-muted))] tabular-nums shrink-0 pt-0.5 select-none opacity-60">
        {line.timestamp}
      </span>
      <div className={`flex items-center justify-center size-4 shrink-0 mt-0.5 ${config.color}`}>
        <Icon className="size-3" />
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-widest shrink-0 mt-[3px] w-9 ${config.color}`}>
        {config.label}
      </span>
      <span className={`text-[11px] font-mono-hud leading-relaxed flex-1 min-w-0 break-words ${
        line.type === 'input' ? 'text-neon font-medium' :
        line.type === 'finding' ? 'text-medium' :
        line.type === 'error' ? 'text-critical' :
        line.type === 'success' ? 'text-neon' :
        'text-[hsl(var(--text-secondary))]'
      }`}>
        {displayedText}
        {line.isTyping && displayedText.length < line.content.length && (
          <span className="inline-block w-[6px] h-[13px] bg-current ml-[1px] animate-type-cursor align-middle" />
        )}
      </span>
    </div>
  );
}
