import type { ModelConfig, AppConfig } from '@/types';

export const APP_NAME = 'Arsonist-MCP AI';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Autonomous Cybersecurity Command Center';

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-critical',
  high: 'text-high',
  medium: 'text-medium',
  low: 'text-low',
  info: 'text-cyan-hud',
};

export const SEVERITY_BG: Record<string, string> = {
  critical: 'bg-[hsl(348_100%_60%/0.12)] border-[hsl(348_100%_60%/0.25)]',
  high: 'bg-[hsl(20_100%_55%/0.12)] border-[hsl(20_100%_55%/0.25)]',
  medium: 'bg-[hsl(38_100%_50%/0.12)] border-[hsl(38_100%_50%/0.25)]',
  low: 'bg-[hsl(195_100%_42%/0.12)] border-[hsl(195_100%_42%/0.25)]',
  info: 'bg-[hsl(220_70%_55%/0.12)] border-[hsl(220_70%_55%/0.25)]',
};

export const STATUS_COLORS: Record<string, string> = {
  idle: 'text-[hsl(var(--text-muted))]',
  running: 'text-neon',
  paused: 'text-medium',
  completed: 'text-cyan-hud',
  error: 'text-critical',
};

export const DEFAULT_MODELS: ModelConfig[] = [
  { id: 'ollama-llama', name: 'Llama 3.1 70B', provider: 'ollama', model: 'llama3.1:70b', active: true, status: 'connected' },
  { id: 'ollama-deepseek', name: 'DeepSeek Coder V2', provider: 'ollama', model: 'deepseek-coder-v2', active: false, status: 'disconnected' },
  { id: 'lmstudio-mistral', name: 'Mistral Nemo 12B', provider: 'lmstudio', model: 'mistral-nemo-12b', active: false, status: 'disconnected' },
  { id: 'hf-pentest', name: 'SecBERT PentestGPT', provider: 'huggingface', model: 'whiterabbitneo/Llama-3-WhiteRabbitNeo-8B', active: false, status: 'disconnected' },
  { id: 'anthropic-claude', name: 'Claude 3.5 Sonnet', provider: 'anthropic', model: 'claude-3-5-sonnet', active: false, status: 'disconnected' },
  { id: 'openai-gpt4', name: 'GPT-4o', provider: 'openai', model: 'gpt-4o', active: false, status: 'disconnected' },
];

export const DEFAULT_CONFIG: AppConfig = {
  burpPath: '/Applications/Burp Suite Community Edition.app',
  burpHost: '127.0.0.1',
  burpPort: 8080,
  mcpServerStatus: 'connected',
  caddyStatus: 'running',
  selectedModel: 'ollama-llama',
  safetyMode: 'cautious',
  autoConfirm: false,
  maxRequestsPerMinute: 60,
  scopeTargets: ['*.target.com', 'api.target.com'],
};

export const NAV_ITEMS = [
  { path: '/', label: 'Command Center', icon: 'LayoutDashboard' },
  { path: '/agents', label: 'Agents', icon: 'Bot' },
  { path: '/training', label: 'Training', icon: 'GraduationCap' },
  { path: '/reports', label: 'Reports', icon: 'FileText' },
  { path: '/settings', label: 'Configuration', icon: 'Settings' },
] as const;

export const AGENT_TEMPLATES = [
  { id: 'passive_hunter', name: 'Passive Hunter', description: 'Analyzes proxy history for vulnerabilities without sending requests' },
  { id: 'idor_hunter', name: 'IDOR Hunter', description: 'Detects insecure direct object reference vulnerabilities' },
  { id: 'logic_flaw_hunter', name: 'Logic Flaw Hunter', description: 'Identifies business logic vulnerabilities in application workflows' },
  { id: 'ssrf_scanner', name: 'SSRF Scanner', description: 'Tests for server-side request forgery across endpoints' },
  { id: 'auth_bypass', name: 'Auth Bypass Finder', description: 'Attempts authentication and authorization bypass techniques' },
  { id: 'report_writer', name: 'Report Writer', description: 'Generates professional vulnerability reports from findings' },
  { id: 'full_recon', name: 'Full Recon Agent', description: 'Comprehensive reconnaissance and vulnerability enumeration' },
  { id: 'api_fuzzer', name: 'API Fuzzer', description: 'Intelligent API endpoint discovery and parameter fuzzing' },
] as const;
