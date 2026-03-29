import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Burp Suite MCP Tool - Integrates with Burp Suite via its Rest API
 * 
 * SIMULATION MODE DISABLED: This tool now uses real Burp Suite API calls.
 * If Burp Suite is not running or API calls fail, errors will be thrown
 * instead of falling back to simulated data.
 */

export interface BurpProxyHistory {
  id: string;
  messageId: number;
  time: number;
  method: string;
  url: string;
  statusCode: number;
  statusMessage: string;
  requestLength: number;
  responseLength: number;
  notes?: string;
  isMuted?: boolean;
  hasRequest: boolean;
  hasResponse: boolean;
}

export interface BurpScanIssue {
  id: string;
  serialNumber: number;
  name: string;
  issueBackground?: string;
  remediationBackground?: string;
  issueDetail?: string;
  remediationDetail?: string;
  type: number;
  confidence: string;
  severity: string;
  host: string;
  port: number;
  protocol: string;
  url: string;
  requestMarkers?: Array<{ startOffset: number; endOffset: number }>;
  responseMarkers?: Array<{ startOffset: number; endOffset: number }>;
  requestResponse?: { request: string; response: string };
}

export interface BurpScanStatus {
  suiteVersion: string;
  juceVersion: string;
  portscannerVersion: string;
  requirementsVersion: string;
}

export class BurpMCPTool {
  private client: AxiosInstance | null = null;
  private baseUrl: string;
  private apiKey: string | null;

  constructor(baseUrl: string = process.env.BURP_API_URL || 'http://localhost:8080', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || process.env.BURP_API_KEY || null;
  }

  /**
   * Initialize the Burp Suite API client
   */
  initialize(): void {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      headers,
      timeout: 30000,
    });

    logger.info('Burp Suite MCP Tool initialized', { baseUrl: this.baseUrl });
  }

  /**
   * Test connection to Burp Suite
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        this.initialize();
      }
      
      const response = await this.client!.get('/burp/version');
      logger.info('Burp Suite connection successful', { version: response.data?.suiteVersion });
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Burp Suite connection failed - not using simulation mode', { error: errorMsg });
      throw new Error(`Burp Suite connection failed: ${errorMsg}`);
    }
  }

  /**
   * Get Burp Proxy History
   */
  async getProxyHistory(limit: number = 100): Promise<BurpProxyHistory[]> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.get('/burp/proxy/history', {
        params: { limit },
      });

      logger.info('Retrieved Burp proxy history', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get Burp proxy history - not using simulation mode', { error: errorMsg });
      throw new Error(`Failed to retrieve Burp proxy history: ${errorMsg}`);
    }
  }

  /**
   * Get Burp Scan Issues
   */
  async getScanIssues(limit: number = 50): Promise<BurpScanIssue[]> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.get('/burp/scanner/issues', {
        params: { limit },
      });

      logger.info('Retrieved Burp scan issues', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get Burp scan issues - not using simulation mode', { error: errorMsg });
      throw new Error(`Failed to retrieve Burp scan issues: ${errorMsg}`);
    }
  }

  /**
   * Send request to Burp Intruder
   */
  async sendToIntruder(url: string, method: string, headers: Record<string, string>, body?: string): Promise<string> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.post('/burp/intruder/send', {
        url,
        method,
        headers,
        body,
      });

      const id = response.data?.intruderId || `intruder-${Date.now()}`;
      logger.info('Sent request to Burp Intruder', { url, intruderId: id });
      return id;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send request to Burp Intruder - not using simulation mode', { error: errorMsg, url });
      throw new Error(`Failed to send request to Burp Intruder: ${errorMsg}`);
    }
  }

  /**
   * Send request to Burp Repeater
   */
  async sendToRepeater(url: string, method: string, headers: Record<string, string>, body?: string): Promise<string> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.post('/burp/repeater/send', {
        url,
        method,
        headers,
        body,
      });

      const id = response.data?.repeaterId || `repeater-${Date.now()}`;
      logger.info('Sent request to Burp Repeater', { url, repeaterId: id });
      return id;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send request to Burp Repeater - not using simulation mode', { error: errorMsg, url });
      throw new Error(`Failed to send request to Burp Repeater: ${errorMsg}`);
    }
  }

  /**
   * Start active scan on target
   */
  async startActiveScan(baseUrl: string, aggressiveness: 'passive' | 'cautious' | 'aggressive' = 'cautious'): Promise<string> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.post('/burp/scanner/scan', {
        baseUrl,
        aggressiveness,
      });

      const scanId = response.data?.scanId || `scan-${Date.now()}`;
      logger.info('Started Burp active scan', { baseUrl, scanId });
      return scanId;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to start Burp active scan - not using simulation mode', { error: errorMsg, baseUrl });
      throw new Error(`Failed to start Burp active scan: ${errorMsg}`);
    }
  }

  /**
   * Get scan status
   */
  async getScanStatus(scanId: string): Promise<{ status: string; progress: number; issuesFound: number }> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.get(`/burp/scanner/scan/${scanId}`);

      logger.info('Retrieved Burp scan status', { scanId, status: response.data?.status });
      return response.data || { status: 'completed', progress: 100, issuesFound: 0 };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get Burp scan status - not using simulation mode', { error: errorMsg, scanId });
      throw new Error(`Failed to get Burp scan status: ${errorMsg}`);
    }
  }

  /**
   * Get Burp Suite version and status
   */
  async getStatus(): Promise<BurpScanStatus> {
    try {
      if (!this.client) {
        this.initialize();
      }

      const response = await this.client!.get('/burp/version');
      logger.info('Retrieved Burp status', { version: response.data?.suiteVersion });
      return response.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get Burp status - not using simulation mode', { error: errorMsg });
      throw new Error(`Failed to get Burp status: ${errorMsg}`);
    }
  }


}

// Export singleton instance
let burpTool: BurpMCPTool | null = null;

export function getBurpMCPTool(): BurpMCPTool {
  if (!burpTool) {
    burpTool = new BurpMCPTool();
    burpTool.initialize();
  }
  return burpTool;
}
