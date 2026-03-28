import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/database.js';
import { generateText } from '../config/ai.js';
import { logger } from '../utils/logger.js';
import { createApiError } from '../middleware/error-handler.js';

interface SupabaseError {
  code?: string;
  message: string;
}

const router = express.Router();

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  target: z.string().url().optional(),
  safetyMode: z.enum(['passive', 'cautious', 'aggressive']).default('cautious'),
  promptTemplate: z.string().optional()
});

const updateAgentSchema = z.object({
  status: z.enum(['idle', 'running', 'paused', 'completed', 'error']).optional(),
  progress: z.number().min(0).max(100).optional(),
  findings: z.number().min(0).optional(),
  lastAction: z.string().optional()
});

// Get all agents
router.get('/', async (req, res) => {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: agents || []
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get agents', { error: errorMessage });
    throw createApiError('Failed to get agents', 500);
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as SupabaseError).code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Agent not found' }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: agent
    });
    return;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get agent', { error: errorMessage, agentId: req.params.id });
    throw createApiError('Failed to get agent', 500);
  }
});

// Create new agent
router.post('/', async (req, res) => {
  try {
    const agentData = createAgentSchema.parse(req.body);

    const newAgent = {
      ...agentData,
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'idle' as const,
      progress: 0,
      findings: 0,
      requests_sent: 0,
      started_at: null,
      last_action: 'Agent created',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: agent, error } = await supabase
      .from('agents')
      .insert(newAgent)
      .select()
      .single();

    if (error) throw error;

    logger.info('Agent created successfully', { agentId: agent.id, name: agent.name });

    res.status(201).json({
      success: true,
      data: agent
    });
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: error.errors }
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to create agent', { error: errorMessage });
    throw createApiError('Failed to create agent', 500);
  }
});

// Update agent
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = updateAgentSchema.parse(req.body);

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if ((error as SupabaseError).code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Agent not found' }
        });
      }
      throw error;
    }

    logger.info('Agent updated successfully', { agentId: id, updates });

    res.json({
      success: true,
      data: agent
    });
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: error.errors }
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to update agent', { error: errorMessage, agentId: req.params.id });
    throw createApiError('Failed to update agent', 500);
  }
});

// Start agent
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;

    // Get agent details
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !agent) {
      return res.status(404).json({
        success: false,
        error: { message: 'Agent not found' }
      });
    }

    // Update agent status
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        last_action: 'Agent started',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Start agent processing (this would be more complex in real implementation)
    // For now, we'll simulate some AI processing
    setTimeout(async () => {
      try {
        const prompt = `You are a ${agent.type} security agent. Your target is ${agent.target || 'general reconnaissance'}.
        Current safety mode: ${agent.safety_mode}. Please provide your first action.`;

        const aiResponse = await generateText(prompt, 'google');

        // Log the AI response
        await supabase.from('agent_logs').insert({
          agent_id: id,
          type: 'thought',
          content: aiResponse,
          timestamp: new Date().toISOString()
        });

        // Update agent progress
        await supabase
          .from('agents')
          .update({
            progress: 25,
            last_action: 'Initial reconnaissance completed',
            findings: 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Agent processing failed', { error: errorMessage, agentId: id });
      }
    }, 2000);

    logger.info('Agent started successfully', { agentId: id, name: agent.name });

    res.json({
      success: true,
      data: updatedAgent,
      message: 'Agent started successfully'
    });
    return;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to start agent', { error: errorMessage, agentId: req.params.id });
    throw createApiError('Failed to start agent', 500);
  }
});

// Stop agent
router.post('/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        status: 'idle',
        last_action: 'Agent stopped',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if ((error as SupabaseError).code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Agent not found' }
        });
      }
      throw error;
    }

    logger.info('Agent stopped successfully', { agentId: id });

    res.json({
      success: true,
      data: agent,
      message: 'Agent stopped successfully'
    });
    return;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to stop agent', { error: errorMessage, agentId: req.params.id });
    throw createApiError('Failed to stop agent', 500);
  }
});

// Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('Agent deleted successfully', { agentId: id });

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to delete agent', { error: errorMessage, agentId: req.params.id });
    throw createApiError('Failed to delete agent', 500);
  }
});

export default router;