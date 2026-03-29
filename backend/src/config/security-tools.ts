import axios from 'axios';
import { logger } from '../utils/logger.js';
import { getBurpMCPTool } from './burp-mcp-tool.js';

// Security Tool Configurations
// SIMULATION MODE DISABLED: All security tools now use real integrations.
// ZAP and Nmap integrations are not implemented and will throw errors.
// Only Burp Suite integration is available in production mode.
export interface BurpSuiteConfig {
  url: string;
  apiKey?: string;
}

export interface ZapConfig {
  url: string;
  apiKey?: string;
}

export interface NmapConfig {
  timeout: number;
  aggressive: boolean;
}

export interface ProxyHistoryItem {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  size: number;
  timestamp: string;
}

export interface ScanResult {
  target: string;
  ports: PortInfo[];
  services: ServiceInfo[];
  vulnerabilities: VulnerabilityInfo[];
  scanTime: number;
}

export interface PortInfo {
  port: number;
  state: string;
  service: string;
}

export interface ServiceInfo {
  name: string;
  version?: string;
  port: number;
}

export interface VulnerabilityInfo {
  id: string;
  title: string;
  severity: string;
  description: string;
  cvss: number;
}

export interface ScanResults {
  target: string;
  timestamp: string;
  tools: {
    nmap?: ScanResult | { error: string };
    zap?: { scanId: string; status: string } | { error: string };
  };
}

// Initialize security tools
export async function initializeSecurityTools(): Promise<void> {
  try {
    // Test real Burp Suite connection instead of simulation
    const burpTool = getBurpMCPTool();
    await burpTool.testConnection();
    logger.info('Burp Suite connection verified - production mode enabled');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Burp Suite connection failed - server will start but Burp features will be unavailable', { error: errorMessage });
    // Don't throw error - allow server to start even without Burp
  }
}

// Burp Suite Integration (production mode)
export async function testBurpConnection(): Promise<boolean> {
  const burpTool = getBurpMCPTool();
  return await burpTool.testConnection();
}

export async function getBurpProxyHistory(): Promise<ProxyHistoryItem[]> {
  const burpTool = getBurpMCPTool();
  const history = await burpTool.getProxyHistory();
  return history.map(item => ({
    id: item.id,
    method: item.method,
    url: item.url,
    statusCode: item.statusCode,
    responseTime: 0, // Not available in Burp API
    size: item.responseLength,
    timestamp: new Date(item.time).toISOString()
  }));
}

export async function sendToBurpIntruder(url: string, method: string, headers: any, body?: string): Promise<void> {
  const burpTool = getBurpMCPTool();
  await burpTool.sendToIntruder(url, method, headers, body);
}

// OWASP ZAP Integration (production mode - not implemented)
export async function testZapConnection(): Promise<boolean> {
  throw new Error('OWASP ZAP integration not implemented - not using simulation mode');
}

export async function startZapScan(url: string): Promise<string> {
  throw new Error('OWASP ZAP integration not implemented - not using simulation mode');
}

export async function getZapScanStatus(scanId: string): Promise<any> {
  throw new Error('OWASP ZAP integration not implemented - not using simulation mode');
}

// Nmap Integration (production mode - not implemented)
export async function testNmapAvailability(): Promise<boolean> {
  throw new Error('Nmap integration not implemented - not using simulation mode');
}

export async function runNmapScan(target: string, options: Partial<NmapConfig> = {}): Promise<ScanResult> {
  throw new Error('Nmap integration not implemented - not using simulation mode');
}

// Vulnerability scanning orchestration
export async function performVulnerabilityScan(target: string, tools: string[] = ['nmap', 'zap']): Promise<ScanResults> {
  const results: ScanResults = {
    target,
    timestamp: new Date().toISOString(),
    tools: {}
  };

  // Run Nmap scan
  if (tools.includes('nmap')) {
    try {
      results.tools.nmap = await runNmapScan(target);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.tools.nmap = { error: errorMessage };
    }
  }

  // Run ZAP scan
  if (tools.includes('zap')) {
    try {
      const scanId = await startZapScan(target);
      results.tools.zap = { scanId, status: 'started' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.tools.zap = { error: errorMessage };
    }
  }

  return results;
}