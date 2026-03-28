import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/database.js';
import { performVulnerabilityScan } from '../config/security-tools.js';
import { logger } from '../utils/logger.js';
import { createApiError } from '../middleware/error-handler.js';

interface SupabaseError {
  code?: string;
  message: string;
}

const router = express.Router();

// Validation schemas
const createVulnerabilitySchema = z.object({
  title: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  category: z.string().min(1),
  target: z.string().min(1),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  description: z.string().min(1),
  evidence: z.string().optional(),
  remediation: z.string().optional(),
  agentName: z.string().optional(),
  cvss: z.number().min(0).max(10).optional()
});

const scanTargetSchema = z.object({
  target: z.string().url('Invalid URL format'),
  tools: z.array(z.enum(['nmap', 'zap', 'burp'])).default(['nmap']),
  agentId: z.string().optional()
});

// Get all vulnerabilities
router.get('/', async (req, res) => {
  try {
    const { severity, category, target, limit = '50', offset = '0' } = req.query;

    let query = supabase
      .from('vulnerabilities')
      .select('*')
      .order('found_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (severity) query = query.eq('severity', String(severity));
    if (category) query = query.eq('category', String(category));
    if (target) query = query.ilike('target', `%${String(target)}%`);

    const { data: vulnerabilities, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: vulnerabilities || [],
      meta: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });

  } catch (error) {
    logger.error('Failed to get vulnerabilities', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('Failed to get vulnerabilities', 500);
  }
});

// Get vulnerability by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vulnerability, error } = await supabase
      .from('vulnerabilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as SupabaseError).code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Vulnerability not found' }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: vulnerability
    });
    return;

  } catch (error) {
    logger.error('Failed to get vulnerability', { error: error instanceof Error ? error.message : 'Unknown error', vulnId: req.params.id });
    throw createApiError('Failed to get vulnerability', 500);
  }
});

// Create new vulnerability
router.post('/', async (req, res) => {
  try {
    const vulnData = createVulnerabilitySchema.parse(req.body);

    const newVulnerability = {
      ...vulnData,
      id: `vuln-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      found_at: new Date().toISOString(),
      confirmed: vulnData.evidence ? true : false,
      cvss: vulnData.cvss || 5.0
    };

    const { data: vulnerability, error } = await supabase
      .from('vulnerabilities')
      .insert(newVulnerability)
      .select()
      .single();

    if (error) throw error;

    const vulnTyped = vulnerability as any;
    logger.info('Vulnerability created successfully', {
      vulnId: vulnTyped.id,
      title: vulnTyped.title,
      severity: vulnTyped.severity
    });

    res.status(201).json({
      success: true,
      data: vulnerability
    });
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: error.errors }
      });
    }

    logger.error('Failed to create vulnerability', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('Failed to create vulnerability', 500);
  }
});

// Update vulnerability
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: vulnerability, error } = await supabase
      .from('vulnerabilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if ((error as SupabaseError).code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Vulnerability not found' }
        });
      }
      throw error;
    }

    logger.info('Vulnerability updated successfully', { vulnId: id, updates });

    res.json({
      success: true,
      data: vulnerability
    });
    return;

  } catch (error) {
    logger.error('Failed to update vulnerability', { error: error instanceof Error ? error.message : 'Unknown error', vulnId: req.params.id });
    throw createApiError('Failed to update vulnerability', 500);
  }
});

// Start vulnerability scan
router.post('/scan', async (req, res) => {
  try {
    const { target, tools, agentId } = scanTargetSchema.parse(req.body);

    logger.info('Starting vulnerability scan', { target, tools, agentId });

    // Start the scan asynchronously
    performVulnerabilityScan(target, tools).then(async (results) => {
      try {
        // Store scan results
        const scanRecord = {
          id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          target,
          tools: tools.join(','),
          status: 'completed',
          results: JSON.stringify(results),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          agent_id: agentId || null
        };

        await supabase.from('scans').insert(scanRecord);

        // Extract vulnerabilities from results and store them
        const nmapResult = results.tools.nmap as any;
        if (nmapResult && !nmapResult.error && nmapResult.vulnerabilities) {
          for (const vuln of nmapResult.vulnerabilities) {
            await supabase.from('vulnerabilities').insert({
              title: vuln.title,
              severity: vuln.severity,
              category: 'Network',
              target,
              description: vuln.description,
              evidence: JSON.stringify(vuln),
              remediation: 'Verify and update affected services',
              agent_name: agentId ? `Agent ${agentId}` : 'Automated Scan',
              cvss: vuln.cvss || 5.0,
              found_at: new Date().toISOString(),
              confirmed: true
            });
          }
        }

        const findings = (nmapResult && !nmapResult.error && nmapResult.vulnerabilities) ? nmapResult.vulnerabilities.length : 0;
        logger.info('Vulnerability scan completed', { target, findings });

      } catch (error) {
        logger.error('Failed to process scan results', { error: error instanceof Error ? error.message : 'Unknown error', target });
      }
    }).catch((error) => {
      logger.error('Vulnerability scan failed', { error: error instanceof Error ? error.message : 'Unknown error', target });
    });

    res.json({
      success: true,
      message: 'Scan started successfully',
      data: {
        target,
        tools,
        status: 'running'
      }
    });
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: error.errors }
      });
    }

    logger.error('Failed to start vulnerability scan', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('Failed to start vulnerability scan', 500);
  }
});

// Get scan results
router.get('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const { data: scan, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) {
      if ((error as SupabaseError).code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Scan not found' }
        });
      }
      throw error;
    }

    const scanData = scan as any;
    res.json({
      success: true,
      data: {
        ...scanData,
        results: scanData && scanData.results ? JSON.parse(scanData.results) : null
      }
    });
    return;

  } catch (error) {
    logger.error('Failed to get scan results', { error: error instanceof Error ? error.message : 'Unknown error', scanId: req.params.scanId });
    throw createApiError('Failed to get scan results', 500);
  }
});

// Delete vulnerability
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vulnerabilities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('Vulnerability deleted successfully', { vulnId: id });

    res.json({
      success: true,
      message: 'Vulnerability deleted successfully'
    });
    return;

  } catch (error) {
    logger.error('Failed to delete vulnerability', { error: error instanceof Error ? error.message : 'Unknown error', vulnId: req.params.id });
    throw createApiError('Failed to delete vulnerability', 500);
  }
});

export default router;