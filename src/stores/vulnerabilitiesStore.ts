import { create } from 'zustand';
import apiClient from '@/services/apiClient';
import type { Vulnerability } from '@/types';

interface VulnerabilitiesState {
  vulnerabilities: Vulnerability[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;

  // Filters
  severityFilter: string;
  categoryFilter: string;
  targetFilter: string;

  // Actions
  fetchVulnerabilities: (params?: {
    page?: number;
    limit?: number;
    severity?: string;
    category?: string;
    target?: string;
  }) => Promise<void>;

  createVulnerability: (vuln: Omit<Vulnerability, 'id' | 'foundAt'>) => Promise<void>;
  updateVulnerability: (id: string, updates: Partial<Vulnerability>) => Promise<void>;
  deleteVulnerability: (id: string) => Promise<void>;

  // Scanning
  startScan: (target: string, tools?: string[]) => Promise<string>;
  getScanResults: (scanId: string) => Promise<any>;

  // Filters
  setSeverityFilter: (severity: string) => void;
  setCategoryFilter: (category: string) => void;
  setTargetFilter: (target: string) => void;
  clearFilters: () => void;
}

export const useVulnerabilitiesStore = create<VulnerabilitiesState>((set, get) => ({
  vulnerabilities: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 50,

  severityFilter: '',
  categoryFilter: '',
  targetFilter: '',

  fetchVulnerabilities: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });

      const {
        page = 1,
        limit = get().pageSize,
        severity = get().severityFilter,
        category = get().categoryFilter,
        target = get().targetFilter,
      } = params;

      const queryParams: any = {
        limit,
        offset: (page - 1) * limit,
      };

      if (severity) queryParams.severity = severity;
      if (category) queryParams.category = category;
      if (target) queryParams.target = target;

      const response = await apiClient.getVulnerabilities(queryParams);

      if (response.success) {
        set({
          vulnerabilities: response.data,
          totalCount: response.meta?.total || response.data.length,
          currentPage: page,
        });
      } else {
        set({ error: 'Failed to fetch vulnerabilities' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to fetch vulnerabilities' });
    } finally {
      set({ isLoading: false });
    }
  },

  createVulnerability: async (vulnData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.createVulnerability(vulnData);

      if (response.success) {
        // Refresh vulnerabilities list
        await get().fetchVulnerabilities();
      } else {
        set({ error: 'Failed to create vulnerability' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to create vulnerability' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateVulnerability: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.updateVulnerability(id, updates);

      if (response.success) {
        // Update local state
        set((state) => ({
          vulnerabilities: state.vulnerabilities.map((vuln) =>
            vuln.id === id ? { ...vuln, ...updates } : vuln
          )
        }));
      } else {
        set({ error: 'Failed to update vulnerability' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to update vulnerability' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVulnerability: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.deleteVulnerability(id);

      if (response.success) {
        // Remove from local state
        set((state) => ({
          vulnerabilities: state.vulnerabilities.filter((vuln) => vuln.id !== id),
          totalCount: state.totalCount - 1
        }));
      } else {
        set({ error: 'Failed to delete vulnerability' });
      }
    } catch (error) {
      set({ error: error.message || 'Failed to delete vulnerability' });
    } finally {
      set({ isLoading: false });
    }
  },

  startScan: async (target, tools = ['nmap']) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.startScan(target, tools);

      if (response.success) {
        return response.data.id || 'scan-started';
      } else {
        set({ error: 'Failed to start scan' });
        return '';
      }
    } catch (error) {
      set({ error: error.message || 'Failed to start scan' });
      return '';
    } finally {
      set({ isLoading: false });
    }
  },

  getScanResults: async (scanId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getScanResults(scanId);

      if (response.success) {
        return response.data;
      } else {
        set({ error: 'Failed to get scan results' });
        return null;
      }
    } catch (error) {
      set({ error: error.message || 'Failed to get scan results' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setSeverityFilter: (severity) => {
    set({ severityFilter: severity });
    get().fetchVulnerabilities({ severity });
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category });
    get().fetchVulnerabilities({ category });
  },

  setTargetFilter: (target) => {
    set({ targetFilter: target });
    get().fetchVulnerabilities({ target });
  },

  clearFilters: () => {
    set({
      severityFilter: '',
      categoryFilter: '',
      targetFilter: ''
    });
    get().fetchVulnerabilities();
  },
}));