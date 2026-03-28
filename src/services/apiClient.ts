import axios, { AxiosInstance, AxiosResponse } from 'axios';
import io, { Socket } from 'socket.io-client';

class ApiClient {
  private client: AxiosInstance;
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Initialize WebSocket connection
  initSocket(): void {
    if (this.socket?.connected) return;

    this.socket = io(this.baseURL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  // Socket event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  // Join agent room for real-time updates
  joinAgentRoom(agentId: string): void {
    this.socket?.emit('join-agent-room', agentId);
  }

  // Leave agent room
  leaveAgentRoom(agentId: string): void {
    this.socket?.off('leave-agent-room', agentId);
  }

  // HTTP methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }

  // Auth methods
  async login(email: string, password: string): Promise<any> {
    const response = await this.post('/api/auth/login', { email, password });
    if (response.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  }

  async register(email: string, password: string, name: string): Promise<any> {
    const response = await this.post('/api/auth/register', { email, password, name });
    if (response.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  }

  async getProfile(): Promise<any> {
    return this.get('/api/auth/profile');
  }

  // Agent methods
  async getAgents(): Promise<any> {
    return this.get('/api/agents');
  }

  async getAgent(id: string): Promise<any> {
    return this.get(`/api/agents/${id}`);
  }

  async createAgent(agent: any): Promise<any> {
    return this.post('/api/agents', agent);
  }

  async updateAgent(id: string, updates: any): Promise<any> {
    return this.patch(`/api/agents/${id}`, updates);
  }

  async startAgent(id: string): Promise<any> {
    return this.post(`/api/agents/${id}/start`);
  }

  async stopAgent(id: string): Promise<any> {
    return this.post(`/api/agents/${id}/stop`);
  }

  async deleteAgent(id: string): Promise<any> {
    return this.delete(`/api/agents/${id}`);
  }

  // Vulnerability methods
  async getVulnerabilities(params?: any): Promise<any> {
    return this.get('/api/vulnerabilities', params);
  }

  async getVulnerability(id: string): Promise<any> {
    return this.get(`/api/vulnerabilities/${id}`);
  }

  async createVulnerability(vuln: any): Promise<any> {
    return this.post('/api/vulnerabilities', vuln);
  }

  async updateVulnerability(id: string, updates: any): Promise<any> {
    return this.patch(`/api/vulnerabilities/${id}`, updates);
  }

  async startScan(target: string, tools: string[] = ['nmap']): Promise<any> {
    return this.post('/api/vulnerabilities/scan', { target, tools });
  }

  async getScanResults(scanId: string): Promise<any> {
    return this.get(`/api/vulnerabilities/scan/${scanId}`);
  }

  async deleteVulnerability(id: string): Promise<any> {
    return this.delete(`/api/vulnerabilities/${id}`);
  }

  // MCP methods
  async initializeMCP(clientInfo: any): Promise<any> {
    return this.post('/api/mcp/initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo
    });
  }

  async callMCPTool(method: string, params: any): Promise<any> {
    return this.post('/api/mcp/tools/call', {
      method,
      params,
      id: `call-${Date.now()}`
    });
  }

  async readMCPResource(uri: string): Promise<any> {
    return this.post('/api/mcp/resources/read', { uri });
  }

  async getMCPStatus(): Promise<any> {
    return this.get('/api/mcp/status');
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      return await this.get('/health');
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;