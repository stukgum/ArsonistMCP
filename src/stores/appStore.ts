import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SafetyMode, AgentStatus } from '@/types';
import { AGENTS, VULNERABILITIES } from '@/constants/mockData';
import { DEFAULT_CONFIG, DEFAULT_MODELS } from '@/constants/config';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  safetyMode: SafetyMode;
  setSafetyMode: (mode: SafetyMode) => void;

  selectedModel: string;
  setSelectedModel: (id: string) => void;

  mcpStatus: 'connected' | 'disconnected' | 'connecting';
  burpConnected: boolean;

  agentStatuses: Record<string, AgentStatus>;
  setAgentStatus: (id: string, status: AgentStatus) => void;

  bookmarkedVulns: string[];
  toggleBookmark: (id: string) => void;

  terminalInput: string;
  setTerminalInput: (v: string) => void;

  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      safetyMode: DEFAULT_CONFIG.safetyMode,
      setSafetyMode: (mode) => set({ safetyMode: mode }),

      selectedModel: DEFAULT_CONFIG.selectedModel,
      setSelectedModel: (id) => set({ selectedModel: id }),

      mcpStatus: 'connected',
      burpConnected: true,

      agentStatuses: Object.fromEntries(AGENTS.map((a) => [a.id, a.status])),
      setAgentStatus: (id, status) =>
        set((s) => ({ agentStatuses: { ...s.agentStatuses, [id]: status } })),

      bookmarkedVulns: VULNERABILITIES.filter((v) => v.severity === 'critical').map((v) => v.id),
      toggleBookmark: (id) =>
        set((s) => ({
          bookmarkedVulns: s.bookmarkedVulns.includes(id)
            ? s.bookmarkedVulns.filter((v) => v !== id)
            : [...s.bookmarkedVulns, id],
        })),

      terminalInput: '',
      setTerminalInput: (v) => set({ terminalInput: v }),

      activeTab: 'all',
      setActiveTab: (t) => set({ activeTab: t }),
    }),
    { name: 'arsonist-mcp-store' }
  )
);
