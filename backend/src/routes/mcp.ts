import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/database.js';
import { generateText } from '../config/ai.js';
import { getBurpMCPTool } from '../config/burp-mcp-tool.js';
import { logger } from '../utils/logger.js';
import { createApiError } from '../middleware/error-handler.js';

const router = express.Router();

// MCP Protocol schemas
const mcpInitializeSchema = z.object({
  protocolVersion: z.string(),
  capabilities: z.object({
    sampling: z.object({}).optional(),
    tools: z.object({}).optional(),
    resources: z.object({}).optional(),
    prompts: z.object({}).optional()
  }).optional(),
  clientInfo: z.object({
    name: z.string(),
    version: z.string()
  })
});

const mcpToolCallSchema = z.object({
  method: z.string(),
  params: z.record(z.unknown()),
  id: z.string()
});

// MCP Server capabilities
const MCP_CAPABILITIES = {
  tools: {
    "arsonist-scan": {
      description: "Perform vulnerability scanning on a target",
      inputSchema: {
        type: "object",
        properties: {
          target: { type: "string", description: "Target URL or IP to scan" },
          tools: {
            type: "array",
            items: { type: "string", enum: ["nmap", "zap", "burp"] },
            default: ["nmap"]
          }
        },
        required: ["target"]
      }
    },
    "arsonist-agent": {
      description: "Deploy an AI security agent",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Agent type (recon, exploit, etc.)" },
          target: { type: "string", description: "Target for the agent" },
          safetyMode: {
            type: "string",
            enum: ["passive", "cautious", "aggressive"],
            default: "cautious"
          }
        },
        required: ["type", "target"]
      }
    },
    "arsonist-analyze": {
      description: "Analyze security findings with AI",
      inputSchema: {
        type: "object",
        properties: {
          data: { type: "string", description: "Security data to analyze" },
          context: { type: "string", description: "Additional context" }
        },
        required: ["data"]
      }
    },
    "burp-proxy-history": {
      description: "Get HTTP request/response history from Burp Suite proxy",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum number of items to retrieve", default: 100 }
        }
      }
    },
    "burp-scan-issues": {
      description: "Get vulnerability findings from Burp Suite active scan",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum number of issues to retrieve", default: 50 }
        }
      }
    },
    "burp-start-scan": {
      description: "Start an active scan on target with Burp Suite",
      inputSchema: {
        type: "object",
        properties: {
          baseUrl: { type: "string", description: "Base URL to scan" },
          aggressiveness: {
            type: "string",
            enum: ["passive", "cautious", "aggressive"],
            default: "cautious",
            description: "Scan aggressiveness level"
          }
        },
        required: ["baseUrl"]
      }
    },
    "burp-send-to-intruder": {
      description: "Send HTTP request to Burp Suite Intruder for fuzzing",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Request URL" },
          method: { type: "string", description: "HTTP method (GET, POST, etc.)", default: "GET" },
          headers: { type: "object", description: "HTTP headers" },
          body: { type: "string", description: "Request body" }
        },
        required: ["url"]
      }
    },
    "burp-status": {
      description: "Get Burp Suite connection status and version",
      inputSchema: {
        type: "object",
        properties: {}
      }
    }
  },
  resources: {
    "vulnerabilities": {
      description: "Access to vulnerability database",
      mimeType: "application/json"
    },
    "agents": {
      description: "Access to active agents",
      mimeType: "application/json"
    },
    "traffic": {
      description: "Access to traffic monitoring data",
      mimeType: "application/json"
    }
  }
};

// MCP Initialize
router.post('/initialize', async (req, res) => {
  try {
    const initData = mcpInitializeSchema.parse(req.body);

    logger.info('MCP client initialized', {
      clientName: initData.clientInfo.name,
      version: initData.clientInfo.version
    });

    // Store MCP session
    const sessionId = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await supabase.from('mcp_sessions').insert({
      id: sessionId,
      status: 'active',
      created_at: new Date().toISOString()
    } as any);

    res.json({
      protocolVersion: "2024-11-05",
      capabilities: MCP_CAPABILITIES,
      serverInfo: {
        name: "Arsonist-MCP",
        version: "1.0.0"
      }
    });
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params",
          data: error.errors
        }
      });
    }

    logger.error('MCP initialization failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('MCP initialization failed', 500);
  }
});

// MCP Tools
router.post('/tools/call', async (req, res) => {
  try {
    const { method, params, id } = mcpToolCallSchema.parse(req.body);

    logger.info('MCP tool call', { method, id });

    let result: unknown = {};

    switch (method) {
      case 'arsonist-scan': {
        // Perform vulnerability scan
        const { performVulnerabilityScan } = await import('../config/security-tools.js');
        result = await performVulnerabilityScan(String(params.target), (params.tools as string[]) || ['nmap']);
        break;
      }

      case 'arsonist-agent': {
        // Create and start an agent
        const agentData = {
          name: `${params.type} Agent`,
          type: params.type,
          description: `AI-powered ${params.type} agent`,
          target: params.target,
          safety_mode: params.safetyMode || 'cautious',
          prompt_template: `You are a ${params.type} security agent targeting ${params.target}. Safety mode: ${params.safetyMode || 'cautious'}.`
        };

        const { data: agent } = await supabase
          .from('agents')
          .insert({
            ...agentData,
            id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'running',
            progress: 0,
            findings: 0,
            requests_sent: 0,
            started_at: new Date().toISOString(),
            last_action: 'Agent deployed via MCP',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        result = { agent, status: 'deployed' };
        break;
      }

      case 'arsonist-analyze': {
        // AI analysis of security data
        const analysisPrompt = `Analyze the following security data and provide insights:\n\nData: ${String(params.data)}\n\nContext: ${String(params.context || 'No additional context')}\n\nProvide a detailed security analysis.`;

        const analysis = await generateText(analysisPrompt, 'google');
        result = { analysis };
        break;
      }

      case 'burp-proxy-history': {
        // Get Burp proxy history
        const burp = getBurpMCPTool();
        const limit = (params.limit as number) || 100;
        result = { proxyHistory: await burp.getProxyHistory(limit) };
        break;
      }

      case 'burp-scan-issues': {
        // Get Burp scan issues
        const burp = getBurpMCPTool();
        const limit = (params.limit as number) || 50;
        result = { scanIssues: await burp.getScanIssues(limit) };
        break;
      }

      case 'burp-start-scan': {
        // Start Burp active scan
        const burp = getBurpMCPTool();
        const scanId = await burp.startActiveScan(
          String(params.baseUrl),
          (params.aggressiveness as 'passive' | 'cautious' | 'aggressive') || 'cautious'
        );
        result = { scanId, status: 'started' };
        break;
      }

      case 'burp-send-to-intruder': {
        // Send request to Burp Intruder
        const burp = getBurpMCPTool();
        const intruderId = await burp.sendToIntruder(
          String(params.url),
          (params.method as string) || 'GET',
          (params.headers as Record<string, string>) || {},
          params.body as string | undefined
        );
        result = { intruderId, status: 'sent' };
        break;
      }

      case 'burp-status': {
        // Get Burp status
        const burp = getBurpMCPTool();
        result = { status: await burp.getStatus() };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${method}`);
    }

    res.json({
      jsonrpc: "2.0",
      id,
      result
    });
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        jsonrpc: "2.0",
        id: req.body.id,
        error: {
          code: -32602,
          message: "Invalid params",
          data: error.errors
        }
      });
    }

    logger.error('MCP tool call failed', { error: error instanceof Error ? error.message : 'Unknown error', method: req.body.method });
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body.id,
      error: {
        code: -32603,
        message: "Internal error",
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return;
  }
});

// MCP Resources
router.post('/resources/read', async (req, res) => {
  try {
    const { uri } = req.body;

    logger.info('MCP resource read', { uri });

    let result: unknown = {};

    if (uri === 'vulnerabilities') {
      const { data } = await supabase
        .from('vulnerabilities')
        .select('*')
        .order('found_at', { ascending: false })
        .limit(100);

      result = { vulnerabilities: data || [] };

    } else if (uri === 'agents') {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      result = { agents: data || [] };

    } else if (uri === 'traffic') {
      const { data } = await supabase
        .from('traffic_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      result = { traffic: data || [] };

    } else {
      throw new Error(`Unknown resource: ${uri}`);
    }

    res.json({
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify(result, null, 2)
      }]
    });
    return;

  } catch (error) {
    logger.error('MCP resource read failed', { error: error instanceof Error ? error.message : 'Unknown error', uri: req.body.uri });
    res.status(500).json({
      error: {
        code: -32603,
        message: "Internal error",
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return;
  }
});

// Get MCP server status
router.get('/status', async (req, res) => {
  try {
    const { data: sessions } = await supabase
      .from('mcp_sessions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        status: 'operational',
        capabilities: MCP_CAPABILITIES,
        activeSessions: sessions?.length || 0,
        recentSessions: sessions || []
      }
    });
    return;

  } catch (error) {
    logger.error('Failed to get MCP status', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('Failed to get MCP status', 500);
  }
});

export default router;