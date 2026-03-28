import { useState, useCallback, useRef } from 'react';

export type TerminalLineType =
  | 'input'
  | 'thought'
  | 'action'
  | 'observation'
  | 'finding'
  | 'error'
  | 'system'
  | 'success'
  | 'info';

export interface TerminalLine {
  id: string;
  type: TerminalLineType;
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

const MAX_HISTORY = 50;

function now(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

let lineCounter = 0;
function uid(): string {
  lineCounter += 1;
  return `tl-${Date.now()}-${lineCounter}`;
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: uid(), type: 'system', content: 'Arsonist-MCP AI v1.0.0 — Autonomous Cybersecurity Command Center', timestamp: now() },
    { id: uid(), type: 'system', content: 'MCP Server connected. Burp Suite Professional active on 127.0.0.1:8080.', timestamp: now() },
    { id: uid(), type: 'info', content: 'Model: Llama 3.1 70B (Ollama) | Safety: Cautious | Scope: *.target.com', timestamp: now() },
    { id: uid(), type: 'system', content: 'Type a command or describe an objective in natural language. Use /help for available commands.', timestamp: now() },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortRef = useRef(false);

  const addLine = useCallback((type: TerminalLineType, content: string) => {
    const line: TerminalLine = { id: uid(), type, content, timestamp: now() };
    setLines((prev) => [...prev.slice(-200), line]);
    return line.id;
  }, []);

  const addTypingLine = useCallback((type: TerminalLineType, content: string) => {
    const line: TerminalLine = { id: uid(), type, content, timestamp: now(), isTyping: true };
    setLines((prev) => [...prev.slice(-200), line]);
    return line.id;
  }, []);

  const markTypingComplete = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, isTyping: false } : l))
    );
  }, []);

  const clearTerminal = useCallback(() => {
    setLines([
      { id: uid(), type: 'system', content: 'Terminal cleared.', timestamp: now() },
    ]);
  }, []);

  const pushHistory = useCallback((cmd: string) => {
    setCommandHistory((prev) => {
      const deduped = prev.filter((c) => c !== cmd);
      return [...deduped, cmd].slice(-MAX_HISTORY);
    });
    setHistoryIndex(-1);
  }, []);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down'): string | null => {
      if (commandHistory.length === 0) return null;

      let newIndex: number;
      if (direction === 'up') {
        newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      } else {
        if (historyIndex === -1) return null;
        newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          return '';
        }
      }
      setHistoryIndex(newIndex);
      return commandHistory[newIndex] ?? null;
    },
    [commandHistory, historyIndex]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return {
    lines,
    commandHistory,
    isProcessing,
    setIsProcessing,
    addLine,
    addTypingLine,
    markTypingComplete,
    clearTerminal,
    pushHistory,
    navigateHistory,
    abort,
    abortRef,
  };
}
