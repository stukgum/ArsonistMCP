import { create } from 'zustand';
import apiClient from '@/services/apiClient';
import type { Agent } from '@/types';

interface AgentsState {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAgents: () => Promise<void>;
  createAgent: (agent: Omit<Agent, 'id' | 'status' | 'progress' | 'findings' | 'requestsSent' | 'startedAt' | 'lastAction' | 'createdAt'>) => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  startAgent: (id: string) => Promise<void>;
  stopAgent: (id: string) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getAgents();

      if (response.success) {
        set({ agents: response.data });
      } else {
        set({ error: 'Failed to fetch agents' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to fetch agents' });
    } finally {
      set({ isLoading: false });
    }
  },

  createAgent: async (agentData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.createAgent(agentData);

      if (response.success) {
        // Refresh agents list
        await get().fetchAgents();
      } else {
        set({ error: 'Failed to create agent' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to create agent' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAgent: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.updateAgent(id, updates);

      if (response.success) {
        // Update local state
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent
          )
        }));
      } else {
        set({ error: 'Failed to update agent' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to update agent' });
    } finally {
      set({ isLoading: false });
    }
  },

  startAgent: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.startAgent(id);

      if (response.success) {
        // Update agent status locally
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, status: 'running', startedAt: new Date().toISOString(), lastAction: 'Agent started' }
              : agent
          )
        }));

        // Join WebSocket room for real-time updates
        apiClient.joinAgentRoom(id);
      } else {
        set({ error: 'Failed to start agent' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to start agent' });
    } finally {
      set({ isLoading: false });
    }
  },

  stopAgent: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.stopAgent(id);

      if (response.success) {
        // Update agent status locally
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, status: 'idle', lastAction: 'Agent stopped' }
              : agent
          )
        }));

        // Leave WebSocket room
        apiClient.leaveAgentRoom(id);
      } else {
        set({ error: 'Failed to stop agent' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to stop agent' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAgent: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.deleteAgent(id);

      if (response.success) {
        // Remove from local state
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id)
        }));
      } else {
        set({ error: 'Failed to delete agent' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to delete agent' });
    } finally {
      set({ isLoading: false });
    }
  },
}));