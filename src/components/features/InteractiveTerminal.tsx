import { useState, useRef, useEffect, useCallback } from 'react';
import { Flame, Send, Trash2, StopCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useTerminal } from '@/hooks/useTerminal';
import TerminalLineComponent from '@/components/features/TerminalLine';

const QUICK_COMMANDS = [
  'Hunt for IDOR vulnerabilities',
  'Analyze proxy history',
  'Run full recon on scope',
  'Generate vuln report',
];

const SIMULATED_RESPONSES: Record<string, Array<{ type: string; content: string; delay: number }>> = {
  help: [
    { type: 'info', content: 'Available commands:', delay: 200 },
    { type: 'info', content: '  /help           — Show available commands', delay: 100 },
    { type: 'info', content: '  /clear          — Clear terminal output', delay: 100 },
    { type: 'info', content: '  /status         — Show MCP & Burp connection status', delay: 100 },
    { type: 'info', content: '  /agents         — List active agents and status', delay: 100 },
    { type: 'info', content: '  /scope          — Show current target scope', delay: 100 },
    { type: 'info', content: '  /model          — Display active AI model info', delay: 100 },
    { type: 'info', content: '  /safety [mode]  — Set safety mode (passive|cautious|aggressive)', delay: 100 },
    { type: 'info', content: '  /stop           — Abort current agent operation', delay: 100 },
    { type: 'info', content: 'Or type any natural language objective to dispatch an agent.', delay: 200 },
  ],
  status: [
    { type: 'info', content: 'Checking subsystem status...', delay: 300 },
    { type: 'success', content: 'MCP Server:   CONNECTED (stdio transport)', delay: 200 },
    { type: 'success', content: 'Burp Suite:   ACTIVE on 127.0.0.1:8080 (Community v2024.1)', delay: 150 },
    { type: 'success', content: 'Caddy Proxy:  RUNNING (reverse proxy on :8443)', delay: 150 },
    { type: 'success', content: 'AI Backend:   Ollama — Llama 3.1 70B (quantized, 42GB VRAM)', delay: 150 },
    { type: 'info', content: 'All systems operational. Uptime: 4h 23m.', delay: 200 },
  ],
  agents: [
    { type: 'info', content: 'Active agent registry:', delay: 200 },
    { type: 'action', content: '[RUNNING]   Passive Recon Alpha    — *.target.com       67% | 12 findings', delay: 120 },
    { type: 'action', content: '[RUNNING]   IDOR Strike Team       — api.target.com     43% | 5 findings', delay: 120 },
    { type: 'action', content: '[RUNNING]   Logic Flaw Seeker      — app.target.com     28% | 3 findings', delay: 120 },
    { type: 'observation', content: '[PAUSED]    SSRF Probe Delta       — api.target.com     89% | 2 findings', delay: 120 },
    { type: 'success', content: '[COMPLETE]  Auth Bypass Epsilon    — *.target.com      100% | 4 findings', delay: 120 },
    { type: 'system', content: '[IDLE]      API Fuzz Zeta          — api.target.com      0% | 0 findings', delay: 120 },
    { type: 'info', content: 'Total: 6 agents | 3 running | 1 paused | 1 complete | 1 idle', delay: 200 },
  ],
  scope: [
    { type: 'info', content: 'Current target scope:', delay: 200 },
    { type: 'action', content: '  IN SCOPE:  *.target.com', delay: 100 },
    { type: 'action', content: '  IN SCOPE:  api.target.com', delay: 100 },
    { type: 'system', content: '  EXCLUDED:  cdn.target.com, static.target.com', delay: 100 },
    { type: 'info', content: '14,827 requests captured in proxy history for scope.', delay: 200 },
  ],
  model: [
    { type: 'info', content: 'Active AI model configuration:', delay: 200 },
    { type: 'success', content: 'Provider:     Ollama (local)', delay: 120 },
    { type: 'success', content: 'Model:        Llama 3.1 70B (Q4_K_M quantization)', delay: 120 },
    { type: 'info', content: 'VRAM Usage:   42.1 GB / 48.0 GB', delay: 120 },
    { type: 'info', content: 'Context Len:  128K tokens', delay: 120 },
    { type: 'info', content: 'Temperature:  0.3 (tuned for accuracy)', delay: 120 },
    { type: 'info', content: 'MCP Tools:    18 registered (proxy, repeater, scanner, etc.)', delay: 200 },
  ],
};

function getAgentResponseForNL(input: string): Array<{ type: string; content: string; delay: number }> {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('idor') || lowerInput.includes('access control')) {
    return [
      { type: 'thought', content: 'Analyzing request: user wants IDOR vulnerability detection. I need to examine proxy history for endpoints with user-specific identifiers (IDs, UUIDs) and test cross-account access.', delay: 600 },
      { type: 'action', content: 'MCP_CALL: burp.proxy.getHistory() — fetching all captured HTTP traffic from proxy history', delay: 800 },
      { type: 'observation', content: 'Retrieved 14,827 requests. Filtering for endpoints containing path parameters and ID references...', delay: 700 },
      { type: 'thought', content: 'Found 23 unique endpoints with user-identifiable parameters: /api/v2/users/{id}, /api/v2/orders/{id}, /api/v2/payments/{id}. Prioritizing by sensitivity.', delay: 900 },
      { type: 'action', content: 'MCP_CALL: burp.repeater.sendRequest() — Testing GET /api/v2/users/12346/details with User A auth token (expected: 403 if access control is correct)', delay: 1000 },
      { type: 'observation', content: 'Response: HTTP 200 OK — Full PII returned for user 12346 including email, address, phone. Authorization check is MISSING on this endpoint.', delay: 800 },
      { type: 'finding', content: 'IDOR CONFIRMED on /api/v2/users/{id}/details — Any authenticated user can access other users\' personal data. Severity: HIGH (CVSS 7.5). Evidence captured.', delay: 600 },
      { type: 'thought', content: 'Expanding test to related endpoints: /orders, /payments, /settings. Testing vertical escalation to admin resources next.', delay: 700 },
      { type: 'action', content: 'MCP_CALL: burp.repeater.sendRequest() — Testing 5 additional endpoints with ID substitution...', delay: 900 },
      { type: 'observation', content: '3 of 5 endpoints vulnerable. /api/v2/orders/{id} and /api/v2/payments/{id}/receipt return data for other users. /settings properly blocks.', delay: 800 },
      { type: 'finding', content: '2 ADDITIONAL IDORs CONFIRMED — Order history and payment receipts accessible cross-user. Total findings: 3 IDOR vulnerabilities. Agent continues scanning...', delay: 500 },
      { type: 'success', content: 'IDOR Hunt phase 1 complete. 3 vulnerabilities found. Continuing with vertical privilege testing...', delay: 400 },
    ];
  }

  if (lowerInput.includes('proxy') || lowerInput.includes('analyze') || lowerInput.includes('history')) {
    return [
      { type: 'thought', content: 'User requests proxy history analysis. I will scan all captured traffic for sensitive data exposure, security misconfigurations, and information leakage patterns.', delay: 600 },
      { type: 'action', content: 'MCP_CALL: burp.proxy.getHistory() — loading full proxy history for passive analysis', delay: 700 },
      { type: 'observation', content: 'Loaded 14,827 requests across 156 unique endpoints. Beginning multi-pass analysis...', delay: 600 },
      { type: 'thought', content: 'Pass 1: Scanning response headers for missing security controls (X-Frame-Options, CSP, HSTS, cookie flags).', delay: 800 },
      { type: 'observation', content: 'Found 45 responses missing X-Frame-Options. All API responses lack Content-Security-Policy. 3 authentication endpoints set cookies without Secure/HttpOnly flags.', delay: 900 },
      { type: 'finding', content: 'SECURITY HEADER GAPS — Multiple missing headers across 45+ endpoints. Cookie security attributes missing on auth flows. Severity: LOW-MEDIUM.', delay: 500 },
      { type: 'thought', content: 'Pass 2: Scanning response bodies for sensitive data patterns — API keys, tokens, PII, internal IPs, stack traces.', delay: 700 },
      { type: 'action', content: 'MCP_CALL: burp.scanner.passiveScan() — running enhanced passive scan rules on captured traffic', delay: 900 },
      { type: 'observation', content: 'Detected: 2 API keys in JS bundles, server version disclosure (nginx/1.21.3), detailed stack traces on 500 errors exposing PostgreSQL query structure.', delay: 800 },
      { type: 'finding', content: 'INFORMATION DISCLOSURE — API keys in client bundles, server version exposed, database error details in responses. 4 issues found across 3 severity levels.', delay: 500 },
      { type: 'success', content: 'Proxy history analysis complete. 6 findings generated. Full report available in Reports section.', delay: 400 },
    ];
  }

  if (lowerInput.includes('recon') || lowerInput.includes('reconnaissance') || lowerInput.includes('full')) {
    return [
      { type: 'thought', content: 'Full reconnaissance requested. I will perform comprehensive enumeration: endpoint discovery, technology fingerprinting, hidden parameter detection, and attack surface mapping.', delay: 700 },
      { type: 'action', content: 'MCP_CALL: burp.proxy.getHistory() — loading proxy history for endpoint enumeration', delay: 600 },
      { type: 'observation', content: 'Extracted 156 unique endpoints from proxy history. Identifying API patterns and versioning schemes...', delay: 700 },
      { type: 'thought', content: 'API follows RESTful pattern at /api/v2/. Testing for /api/v1/ and /api/v3/ version exposure. Checking for GraphQL, WebSocket, and gRPC endpoints.', delay: 800 },
      { type: 'action', content: 'MCP_CALL: burp.repeater.sendRequest() — probing 12 potential hidden endpoints based on API pattern analysis', delay: 1000 },
      { type: 'observation', content: 'Discovered: /api/v1/ still active (deprecated but accessible), /graphql endpoint with introspection enabled, /api/internal/health exposing build info.', delay: 900 },
      { type: 'finding', content: 'HIDDEN ENDPOINTS — Deprecated API v1 still accessible, GraphQL introspection enabled (142 types exposed), internal health endpoint leaking build metadata.', delay: 600 },
      { type: 'thought', content: 'Mapping technology stack from response headers and behaviors: nginx reverse proxy, Node.js backend, PostgreSQL database, Redis caching, S3 file storage.', delay: 700 },
      { type: 'action', content: 'MCP_CALL: burp.scanner.activeScan() — launching targeted active scan on discovered endpoints with cautious throttling', delay: 800 },
      { type: 'observation', content: 'Active scan in progress. Initial results: 2 injection points detected, 1 potential SSRF vector, 3 reflected parameters in error pages.', delay: 900 },
      { type: 'success', content: 'Recon phase 1 complete. Attack surface mapped: 168 endpoints, 3 API versions, 5 technologies identified. Active scanning continues in background.', delay: 400 },
    ];
  }

  if (lowerInput.includes('report') || lowerInput.includes('generate')) {
    return [
      { type: 'thought', content: 'Report generation requested. Compiling all vulnerability findings from active agents into structured security assessment format.', delay: 500 },
      { type: 'action', content: 'Aggregating findings from 5 agents: 47 total vulnerabilities (3 critical, 8 high, 19 medium, 12 low, 5 info).', delay: 700 },
      { type: 'observation', content: 'Cross-referencing findings for duplicate detection and attack chain analysis...', delay: 600 },
      { type: 'thought', content: 'Identified 2 attack chains: (1) Info Disclosure → IDOR → Account Takeover, (2) SSRF → Internal API Access → Privilege Escalation. These will be highlighted.', delay: 900 },
      { type: 'action', content: 'Generating executive summary, detailed findings with evidence, remediation priorities, and risk scoring matrix...', delay: 800 },
      { type: 'success', content: 'Report generated: "Security Assessment — target.com" (47 findings, 2 attack chains, CVSS-weighted risk score: 87/100). Available in Reports section as Markdown and PDF.', delay: 500 },
    ];
  }

  // Default generic response
  return [
    { type: 'thought', content: `Analyzing request: "${input}". Determining optimal agent configuration and MCP tool selection for this objective.`, delay: 600 },
    { type: 'action', content: 'MCP_CALL: burp.proxy.getHistory() — pulling proxy traffic relevant to the requested analysis', delay: 800 },
    { type: 'observation', content: 'Proxy history loaded. Identifying relevant endpoints and request patterns for the objective...', delay: 700 },
    { type: 'thought', content: 'Selecting appropriate testing strategy based on objective. Configuring agent with cautious safety mode and scope validation.', delay: 800 },
    { type: 'action', content: 'Dispatching specialized agent for the requested task. MCP tools engaged: proxy, repeater, scanner.', delay: 700 },
    { type: 'observation', content: 'Agent is now actively processing the objective. Initial analysis underway — monitoring for findings.', delay: 600 },
    { type: 'success', content: 'Agent deployed successfully. Real-time reasoning will stream below as the agent processes your objective.', delay: 400 },
  ];
}

interface InteractiveTerminalProps {
  expanded?: boolean;
}

export default function InteractiveTerminal({ expanded: initialExpanded = false }: InteractiveTerminalProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminal = useTerminal();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [terminal.lines, scrollToBottom]);

  const handleTypingComplete = useCallback(
    (lineId: string) => {
      terminal.markTypingComplete(lineId);
      scrollToBottom();
    },
    [terminal, scrollToBottom]
  );

  const simulateAgentResponse = useCallback(
    async (responses: Array<{ type: string; content: string; delay: number }>) => {
      terminal.setIsProcessing(true);
      terminal.abortRef.current = false;

      for (const response of responses) {
        if (terminal.abortRef.current) {
          terminal.addLine('error', 'Operation aborted by user.');
          break;
        }

        await new Promise<void>((resolve) => setTimeout(resolve, response.delay));

        if (terminal.abortRef.current) {
          terminal.addLine('error', 'Operation aborted by user.');
          break;
        }

        const lineType = response.type as Parameters<typeof terminal.addTypingLine>[0];
        terminal.addTypingLine(lineType, response.content);
        scrollToBottom();
      }

      terminal.setIsProcessing(false);
    },
    [terminal, scrollToBottom]
  );

  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      terminal.addLine('input', trimmed);
      terminal.pushHistory(trimmed);
      setInput('');

      // Slash commands
      if (trimmed.startsWith('/')) {
        const command = trimmed.slice(1).toLowerCase().split(' ')[0];

        if (command === 'clear') {
          terminal.clearTerminal();
          return;
        }

        if (command === 'stop') {
          terminal.abort();
          terminal.addLine('system', 'Abort signal sent to active operation.');
          return;
        }

        const simulated = SIMULATED_RESPONSES[command];
        if (simulated) {
          simulateAgentResponse(simulated);
        } else {
          terminal.addLine('error', `Unknown command: /${command}. Type /help for available commands.`);
        }
        return;
      }

      // Natural language — dispatch agent simulation
      const responses = getAgentResponseForNL(trimmed);
      simulateAgentResponse(responses);
    },
    [terminal, simulateAgentResponse]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        executeCommand(input);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = terminal.navigateHistory('up');
        if (prev !== null) setInput(prev);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = terminal.navigateHistory('down');
        if (next !== null) setInput(next);
        return;
      }

      if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        if (terminal.isProcessing) {
          terminal.abort();
          terminal.addLine('error', '^C — Operation interrupted.');
          terminal.setIsProcessing(false);
        } else {
          setInput('');
        }
      }

      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        terminal.clearTerminal();
      }
    },
    [input, terminal, executeCommand]
  );

  useEffect(() => {
    terminal.resetTerminal();
  }, [terminal]);

  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={`hud-panel-active flex flex-col overflow-hidden transition-all duration-300 ${
        isExpanded ? 'h-[520px]' : 'h-[320px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dim shrink-0">
        <div className="flex items-center gap-2">
          <Flame className="size-3.5 text-neon" />
          <span className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
            Command Interface
          </span>
          {terminal.isProcessing && (
            <span className="flex items-center gap-1.5 ml-2">
              <span className="size-1.5 rounded-full bg-neon animate-pulse-neon" />
              <span className="text-[10px] text-neon font-medium font-mono-hud">PROCESSING</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={terminal.clearTerminal}
            className="p-1.5 rounded text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-hover))] transition-colors"
            title="Clear terminal (Ctrl+L)"
          >
            <Trash2 className="size-3.5" />
          </button>
          {terminal.isProcessing && (
            <button
              onClick={() => {
                terminal.abort();
                terminal.addLine('error', 'Operation aborted by user.');
                terminal.setIsProcessing(false);
              }}
              className="p-1.5 rounded text-critical hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(348_100%_60%/0.1)] transition-colors"
              title="Stop agent (Ctrl+C)"
            >
              <StopCircle className="size-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded((e) => !e)}
            className="p-1.5 rounded text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-hover))] transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[hsl(var(--border-dim)/0.5)] shrink-0">
        <span className="text-[9px] text-[hsl(var(--text-muted))] uppercase tracking-wider mr-1 shrink-0">Quick:</span>
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            disabled={terminal.isProcessing}
            className="px-2 py-0.5 rounded border border-dim text-[10px] text-[hsl(var(--text-secondary))] hover:border-[hsl(157_100%_50%/0.2)] hover:text-neon transition-colors disabled:opacity-40 disabled:cursor-not-allowed truncate"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-y-auto px-1 py-2 space-y-0 cursor-text bg-[hsl(var(--void))]"
      >
        {terminal.lines.map((line) => (
          <TerminalLineComponent
            key={line.id}
            line={line}
            onTypingComplete={handleTypingComplete}
          />
        ))}

        {terminal.isProcessing && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="text-[10px] font-mono-hud text-[hsl(var(--text-muted))]">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <div className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-neon animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="size-1 rounded-full bg-neon animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="size-1 rounded-full bg-neon animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] text-neon font-mono-hud">Agent reasoning...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--abyss))] border-t border-dim shrink-0">
        <span className="text-neon text-[12px] font-mono-hud select-none font-bold">❯</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={terminal.isProcessing ? 'Agent processing... (Ctrl+C to abort)' : 'Describe your objective or type /help for commands...'}
          disabled={false}
          className="flex-1 bg-transparent text-[12px] font-mono-hud text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] outline-none"
          autoFocus
        />
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] text-[hsl(var(--text-muted))] font-mono-hud hidden sm:block">
            {terminal.commandHistory.length > 0 && '↑↓ history'}
          </span>
          <button
            onClick={() => executeCommand(input)}
            disabled={!input.trim()}
            className="p-1.5 text-neon hover:text-[hsl(var(--text-primary))] disabled:opacity-30 transition-colors"
            aria-label="Send command"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
