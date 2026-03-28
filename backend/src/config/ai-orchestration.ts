import { generateText } from './ai.js';
import { getBurpMCPTool } from './burp-mcp-tool.js';
import { logger } from '../utils/logger.js';

/**
 * AI Security Analysis Orchestrator
 * Coordinates multiple AI models to analyze Burp Suite findings
 * and autonomously identify vulnerabilities, price manipulation, etc.
 */

export interface SecurityAnalysis {
  targets: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  findings: SecurityFinding[];
  recommendations: string[];
  analysisDetails: string;
  timestamp: string;
}

export interface SecurityFinding {
  type: 'vulnerability' | 'price-manipulation' | 'data-leakage' | 'authentication' | 'logic-flaw' | 'configuration' | 'other';
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  remediation: string;
  evidence: string;
  confidence: number; // 0-100
  aiModel: string;
}

export interface AnalysisContext {
  targets: string[];
  proxyHistory: any[];
  scanIssues: any[];
  previousFindings: any[];
}

/**
 * Analyze security data using multiple AI models
 */
export async function orchestrateSecurityAnalysis(context: AnalysisContext): Promise<SecurityAnalysis> {
  const startTime = Date.now();
  const findings: SecurityFinding[] = [];
  const recommendations: Set<string> = new Set();

  logger.info('Starting orchestrated security analysis', {
    targets: context.targets.length,
    proxyHistoryItems: context.proxyHistory.length,
    scanIssues: context.scanIssues.length
  });

  try {
    // Phase 1: Analyze with multiple AI models in parallel
    const [
      vulnFindings,
      priceFindings,
      dataLeakFindings,
      authFindings,
      logicFindings
    ] = await Promise.all([
      analyzeForVulnerabilities(context, 'google'),
      analyzePriceManipulation(context, 'openai'),
      analyzeDataLeakage(context, 'huggingface'),
      analyzeAuthenticationIssues(context, 'google'),
      analyzeLogicFlaws(context, 'openai')
    ]);

    // Combine all findings
    findings.push(...vulnFindings, ...priceFindings, ...dataLeakFindings, ...authFindings, ...logicFindings);

    // Phase 2: Deduplicate and rank findings by severity
    const uniqueFindings = deduplicateFindings(findings);
    uniqueFindings.sort((a, b) => {
      const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityRank[a.severity] - severityRank[b.severity];
    });

    // Phase 3: Generate recommendations based on findings
    const recs = await generateRecommendations(uniqueFindings, context);
    recs.forEach(rec => recommendations.add(rec));

    // Phase 4: Generate detailed analysis report
    const analysisDetails = await generateAnalysisReport(uniqueFindings, recs, context);

    // Determine overall risk level
    const riskLevel = calculateRiskLevel(uniqueFindings);

    const analysis: SecurityAnalysis = {
      targets: context.targets.join(', '),
      riskLevel,
      findings: uniqueFindings.slice(0, 100), // Top 100 findings
      recommendations: Array.from(recommendations),
      analysisDetails,
      timestamp: new Date().toISOString()
    };

    logger.info('Security analysis completed', {
      duration: Date.now() - startTime,
      findingsCount: analysis.findings.length,
      riskLevel: analysis.riskLevel,
      recommendationsCount: analysis.recommendations.length
    });

    return analysis;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Security analysis orchestration failed', { error: errorMessage });
    
    // Return minimal analysis on error
    return {
      targets: context.targets.join(', '),
      riskLevel: 'medium',
      findings: [],
      recommendations: ['Analysis failed - please check logs and try again'],
      analysisDetails: `Error during analysis: ${errorMessage}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Analyze for common vulnerabilities (SQL Injection, XSS, CSRF, etc.)
 */
async function analyzeForVulnerabilities(context: AnalysisContext, aiProvider: 'google' | 'openai' | 'huggingface' = 'google'): Promise<SecurityFinding[]> {
  const prompt = `You are a security vulnerability analyst. Analyze the following security data and identify common web vulnerabilities.

Targets: ${context.targets.join(', ')}

Proxy History (sample): ${JSON.stringify(context.proxyHistory.slice(0, 5))}

Scan Issues: ${JSON.stringify(context.scanIssues.slice(0, 10))}

Identify and list specific vulnerabilities found. For each vulnerability, provide:
1. Type (SQL Injection, XSS, CSRF, etc.)
2. Title
3. Severity (critical/high/medium/low)
4. Description
5. Impact
6. Remediation
7. Confidence (0-100)

Format as JSON array of vulnerability objects.`;

  try {
    const response = await generateText(prompt, aiProvider);
    const findings = parseSecurityFindings(response, 'vulnerability', aiProvider);
    logger.info(`Vulnerability analysis completed via ${aiProvider}`, { findingsCount: findings.length });
    return findings;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn(`Vulnerability analysis failed for ${aiProvider}`, { error: errorMessage });
    return [];
  }
}

/**
 * Analyze for price manipulation and financial anomalies
 */
async function analyzePriceManipulation(context: AnalysisContext, aiProvider: 'google' | 'openai' | 'huggingface' = 'openai'): Promise<SecurityFinding[]> {
  const prompt = `You are a cybersecurity expert specializing in e-commerce fraud detection. Analyze the following data for price manipulation, transaction tampering, and financial anomalies.

Targets: ${context.targets.join(', ')}

HTTP Requests (analyzing for price parameters): ${JSON.stringify(context.proxyHistory.slice(0, 15))}

Previous Price-Related Findings: ${context.previousFindings.filter((f: any) => f.type === 'price-manipulation').slice(0, 5)}

Identify price manipulation vulnerabilities such as:
1. Client-side price validation bypass
2. Price parameter manipulation in requests
3. Negative price exploitation
4. Quantity overflow/underflow
5. Discount code abuse
6. Currency conversion errors
7. Tax calculation bypass

For each finding, provide:
- Type: "price-manipulation"
- Title
- Severity
- Description
- Impact
- Remediation
- Confidence (0-100)

Format as JSON array.`;

  try {
    const response = await generateText(prompt, aiProvider);
    const findings = parseSecurityFindings(response, 'price-manipulation', aiProvider);
    logger.info(`Price manipulation analysis completed via ${aiProvider}`, { findingsCount: findings.length });
    return findings;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn(`Price manipulation analysis failed for ${aiProvider}`, { error: errorMessage });
    return [];
  }
}

/**
 * Analyze for data leakage and information disclosure
 */
async function analyzeDataLeakage(context: AnalysisContext, aiProvider: 'google' | 'openai' | 'huggingface' = 'huggingface'): Promise<SecurityFinding[]> {
  const prompt = `You are a data security analyst. Analyze for data leakage, information disclosure, and sensitive data exposure.

Targets: ${context.targets.join(', ')}

Response Data (looking for sensitive information): ${JSON.stringify(context.proxyHistory.slice(0, 10).map((r: any) => ({ method: r.method, url: r.url, statusCode: r.statusCode })))}

Scan Issues (sensitive data): ${JSON.stringify(context.scanIssues.filter((s: any) => s.severity === 'high' || s.severity === 'critical').slice(0, 10))}

Analyze for:
1. Exposed API keys or tokens in responses
2. Sensitive user data in URLs or responses
3. Information disclosure via error messages
4. Exposed internal IP addresses or hostnames
5. Database connection string exposure
6. Source code or configuration exposure
7. Session token exposure
8. Password hints or reset tokens

For each finding provide:
- Type: "data-leakage"
- Title
- Severity
- Description
- Impact
- Remediation
- Confidence

Format as JSON array.`;

  try {
    const response = await generateText(prompt, aiProvider);
    const findings = parseSecurityFindings(response, 'data-leakage', aiProvider);
    logger.info(`Data leakage analysis completed via ${aiProvider}`, { findingsCount: findings.length });
    return findings;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn(`Data leakage analysis failed for ${aiProvider}`, { error: errorMessage });
    return [];
  }
}

/**
 * Analyze for authentication and authorization issues
 */
async function analyzeAuthenticationIssues(context: AnalysisContext, aiProvider: 'google' | 'openai' | 'huggingface' = 'google'): Promise<SecurityFinding[]> {
  const prompt = `You are an authentication security specialist. Analyze for authentication bypass, weak auth mechanisms, and privilege escalation.

Authentication Requests from history: ${JSON.stringify(context.proxyHistory.filter((r: any) => r.url.includes('login') || r.url.includes('auth')).slice(0, 10))}

Scan Issues (auth-related): ${JSON.stringify(context.scanIssues.filter((s: any) => s.name.toLowerCase().includes('auth')).slice(0, 10))}

Targets: ${context.targets.join(', ')}

Analyze for:
1. Weak password policies
2. Session management flaws
3. Insecure password reset
4. Privilege escalation paths
5. Multi-factor authentication bypass
6. JWT vulnerabilities
7. OAuth misconfiguration
8. CORS-based auth bypass
9. Hard-coded credentials
10. Brute-force protection bypass

For each finding:
- Type: "authentication"
- Title
- Severity
- Description
- Impact
- Remediation
- Confidence

Format as JSON array.`;

  try {
    const response = await generateText(prompt, aiProvider);
    const findings = parseSecurityFindings(response, 'authentication', aiProvider);
    logger.info(`Authentication analysis completed via ${aiProvider}`, { findingsCount: findings.length });
    return findings;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn(`Authentication analysis failed for ${aiProvider}`, { error: errorMessage });
    return [];
  }
}

/**
 * Analyze for business logic flaws
 */
async function analyzeLogicFlaws(context: AnalysisContext, aiProvider: 'google' | 'openai' | 'huggingface' = 'openai'): Promise<SecurityFinding[]> {
  const prompt = `You are a penetration tester specializing in business logic vulnerabilities. Analyze for workflow bypass, race conditions, and logic flaws.

Application Workflows (from requests): ${JSON.stringify(context.proxyHistory.slice(0, 20))}

Existing Findings: ${JSON.stringify(context.scanIssues.slice(0, 10))}

Targets: ${context.targets.join(', ')}

Look for:
1. Workflow bypass (skipping steps)
2. Race condition vulnerabilities
3. Order processing logic flaws
4. Access control bypass through logic
5. State management issues
6. Duplicate transaction processing
7. Inventory bypass
8. Timing-based exploits
9. Parameter pollution
10. Inconsistent validation

For each finding:
- Type: "logic-flaw"
- Title
- Severity
- Description
- Impact
- Remediation
- Confidence

Format as JSON array.`;

  try {
    const response = await generateText(prompt, aiProvider);
    const findings = parseSecurityFindings(response, 'logic-flaw', aiProvider);
    logger.info(`Logic flaw analysis completed via ${aiProvider}`, { findingsCount: findings.length });
    return findings;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn(`Logic flaw analysis failed for ${aiProvider}`, { error: errorMessage });
    return [];
  }
}

/**
 * Parse AI responses into structured findings
 */
function parseSecurityFindings(response: string, defaultType: string, aiModel: string): SecurityFinding[] {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      logger.warn('No JSON found in AI response', { aiModel, responseLength: response.length });
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]) as any[];
    
    return parsed
      .filter(item => item.title && item.severity) // Validate required fields
      .map(item => ({
        type: item.type || defaultType,
        title: item.title,
        severity: item.severity || 'medium',
        description: item.description || '',
        impact: item.impact || '',
        remediation: item.remediation || '',
        evidence: item.evidence || '',
        confidence: Math.min(100, Math.max(0, item.confidence || 75)),
        aiModel
      }));

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Failed to parse AI findings', { error: errorMsg, aiModel });
    return [];
  }
}

/**
 * Remove duplicate findings and keep highest confidence version
 */
function deduplicateFindings(findings: SecurityFinding[]): SecurityFinding[] {
  const uniqueMap = new Map<string, SecurityFinding>();

  for (const finding of findings) {
    const key = `${finding.type}-${finding.title.toLowerCase()}`;
    const existing = uniqueMap.get(key);

    if (!existing || finding.confidence > existing.confidence) {
      uniqueMap.set(key, finding);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Generate remediation recommendations
 */
async function generateRecommendations(findings: SecurityFinding[], context: AnalysisContext): Promise<string[]> {
  const criticalFindings = findings.filter(f => f.severity === 'critical' || f.severity === 'high');

  if (criticalFindings.length === 0) {
    return ['Continue regular security testing and monitoring'];
  }

  const prompt = `You are a security remediation specialist. Based on these security findings, provide specific, actionable remediation recommendations.

Critical/High Findings:
${criticalFindings.map(f => `- ${f.title}: ${f.description}`).join('\n')}

Provide 5-10 prioritized recommendations that address the root causes, not just symptoms. Focus on:
- Immediate fixes (can be done today)
- Short-term improvements (this week)
- Long-term architectural changes
- Security best practices
- Testing improvements

Format as a simple numbered list.`;

  try {
    const response = await generateText(prompt, 'openai');
    const recommendations = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    return recommendations.length > 0 ? recommendations : ['Review findings and implement security improvements'];

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Failed to generate recommendations', { error: errorMsg });
    return ['Manual review of findings recommended'];
  }
}

/**
 * Generate detailed analysis report
 */
async function generateAnalysisReport(findings: SecurityFinding[], recommendations: string[], context: AnalysisContext): Promise<string> {
  const summary = {
    totalFindings: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    byType: groupBy(findings, f => f.type)
  };

  const prompt = `You are a security report writer. Generate an executive summary of this security analysis.

Summary:
${JSON.stringify(summary, null, 2)}

Top Findings:
${findings.slice(0, 10).map(f => `- ${f.title} (${f.severity}): ${f.description}`).join('\n')}

Write a 2-3 paragraph executive summary that:
1. Describes the overall security posture
2. Highlights the most critical issues
3. Explains potential business impact
4. Recommends next steps

Keep it technical but accessible to non-security stakeholders.`;

  try {
    const report = await generateText(prompt, 'google');
    return report;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Failed to generate report', { error: errorMsg });
    return `Analysis Summary: ${findings.length} findings identified, ${recommendations.length} recommendations provided.`;
  }
}

/**
 * Calculate overall risk level
 */
function calculateRiskLevel(findings: SecurityFinding[]): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  if (findings.some(f => f.severity === 'critical')) return 'critical';
  if (findings.some(f => f.severity === 'high')) return 'high';
  if (findings.some(f => f.severity === 'medium')) return 'medium';
  if (findings.some(f => f.severity === 'low')) return 'low';
  return 'info';
}

/**
 * Group array by function
 */
function groupBy<T>(array: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  array.forEach(item => {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}

/**
 * Execute continuous AI-driven scanning via Burp MCP
 */
export async function executeAutonomousScan(target: string, aggressiveness: 'passive' | 'cautious' | 'aggressive' = 'cautious'): Promise<void> {
  const burp = getBurpMCPTool();
  
  logger.info('Starting autonomous AI-driven security scan', { target, aggressiveness });

  try {
    // Phase 1: Start active scan
    logger.info('Phase 1: Starting Burp Suite active scan');
    const scanId = await burp.startActiveScan(target, aggressiveness);

    // Phase 2: Poll for scan progress (in real implementation, use webhooks)
    logger.info('Phase 2: Monitoring scan progress', { scanId });
    // Scan runs in background

    // Phase 3: Retrieve and analyze results
    setTimeout(async () => {
      try {
        logger.info('Phase 3: Retrieving scan results');
        const [proxyHistory, scanIssues] = await Promise.all([
          burp.getProxyHistory(100),
          burp.getScanIssues(50)
        ]);

        // Phase 4: Run AI analysis
        logger.info('Phase 4: Running AI analysis');
        const analysis = await orchestrateSecurityAnalysis({
          targets: [target],
          proxyHistory,
          scanIssues,
          previousFindings: []
        });

        logger.info('Autonomous scan completed', {
          target,
          findingsCount: analysis.findings.length,
          riskLevel: analysis.riskLevel
        });

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error in autonomous scan analysis phase', { error: errorMsg });
      }
    }, 5000); // Wait 5 seconds for scan to start

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Autonomous scan failed', { error: errorMsg, target });
  }
}
