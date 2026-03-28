export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export type SafetyMode = 'passive' | 'cautious' | 'aggressive';

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  target: string;
  endpoint: string;
  method: string;
  description: string;
  evidence: string;
  remediation: string;
  foundAt: string;
  agentName: string;
  confirmed: boolean;
  cvss: number;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  status: AgentStatus;
  target: string;
  progress: number;
  findings: number;
  requestsSent: number;
  startedAt: string | null;
  lastAction: string;
  promptTemplate: string;
  safetyMode: SafetyMode;
}

export interface TrafficEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  size: number;
  source: string;
  flagged: boolean;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lessons: number;
  completedLessons: number;
  duration: string;
  topics: string[];
  locked: boolean;
}

export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: string;
  type: 'thought' | 'action' | 'observation' | 'finding' | 'error';
  content: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio' | 'huggingface' | 'openai' | 'anthropic';
  model: string;
  active: boolean;
  status: 'connected' | 'disconnected' | 'loading';
}

export interface AppConfig {
  burpPath: string;
  burpHost: string;
  burpPort: number;
  mcpServerStatus: 'connected' | 'disconnected' | 'connecting';
  caddyStatus: 'running' | 'stopped';
  selectedModel: string;
  safetyMode: SafetyMode;
  autoConfirm: boolean;
  maxRequestsPerMinute: number;
  scopeTargets: string[];
}

export interface DashboardStats {
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  activeAgents: number;
  requestsProcessed: number;
  uptime: string;
}
