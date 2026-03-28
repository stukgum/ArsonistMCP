import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SafetyMode, AgentStatus } from '@/types';
import { DEFAULT_CONFIG, DEFAULT_MODELS } from '@/constants/config';
import apiClient from '@/services/apiClient';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  safetyMode: SafetyMode;
  setSafetyMode: (mode: SafetyMode) => void;

  selectedModel: string;
  setSelectedModel: (id: string) => void;

  mcpStatus: 'connected' | 'disconnected' | 'connecting';
  setMcpStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;

  burpConnected: boolean;
  setBurpConnected: (connected: boolean) => void;

  agentStatuses: Record<string, AgentStatus>;
  setAgentStatus: (id: string, status: AgentStatus) => void;

  bookmarkedVulns: string[];
  toggleBookmark: (id: string) => void;

  terminalInput: string;
  setTerminalInput: (v: string) => void;

  activeTab: string;
  setActiveTab: (t: string) => void;

  // Real API integration
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Auth state
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;

  user: any;
  setUser: (user: any) => void;

  // Initialize app
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      safetyMode: DEFAULT_CONFIG.safetyMode,
      setSafetyMode: (mode) => set({ safetyMode: mode }),

      selectedModel: DEFAULT_CONFIG.selectedModel,
      setSelectedModel: (id) => set({ selectedModel: id }),

      mcpStatus: 'connecting',
      setMcpStatus: (status) => set({ mcpStatus: status }),

      burpConnected: false,
      setBurpConnected: (connected) => set({ burpConnected: connected }),

      agentStatuses: {},
      setAgentStatus: (id, status) =>
        set((s) => ({ agentStatuses: { ...s.agentStatuses, [id]: status } })),

      bookmarkedVulns: [],
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

      // API integration
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),

      isAuthenticated: !!localStorage.getItem('auth_token'),
      setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),

      user: null,
      setUser: (user) => set({ user }),

      initialize: async () => {
        try {
          set({ isLoading: true, error: null });

          // Check authentication
          const token = localStorage.getItem('auth_token');
          if (token) {
            try {
              const profile = await apiClient.getProfile();
              if (profile.success) {
                set({ user: profile.data, isAuthenticated: true });
              }
            } catch (error) {
              localStorage.removeItem('auth_token');
              set({ isAuthenticated: false, user: null });
            }
          }

          // Initialize WebSocket connection
          apiClient.initSocket();

          // Check MCP status
          try {
            const mcpStatus = await apiClient.getMCPStatus();
            if (mcpStatus.success) {
              set({ mcpStatus: 'connected' });
            }
          } catch (error) {
            set({ mcpStatus: 'disconnected' });
          }

          // Check Burp connection (this would be implemented in the backend)
          // For now, we'll simulate it
          set({ burpConnected: true });

        } catch (error) {
          set({ error: error.message || 'Failed to initialize app' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'arsonist-mcp-store',
      // Don't persist sensitive data
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        safetyMode: state.safetyMode,
        selectedModel: state.selectedModel,
        bookmarkedVulns: state.bookmarkedVulns,
        activeTab: state.activeTab,
      })
    }
  )
);
