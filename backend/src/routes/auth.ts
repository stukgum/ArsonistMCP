import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { createApiError } from '../middleware/error-handler.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Generate JWT token
function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign({ userId }, secret as string, { expiresIn: '24h' });
}

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        created_at: new Date().toISOString()
      })
      .select('id, email, name, created_at')
      .single();

    if (error) throw error;

    // Generate token
    const token = generateToken(user.id);

    logger.info('User registered successfully', { userId: user.id, email });

    res.status(201).json({
      success: true,
      data: {
        user,
        token
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

    logger.error('Registration failed', { error: error instanceof Error ? error.message : String(error) });
    throw createApiError('Registration failed', 500);
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, password')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
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

    logger.error('Login failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('Login failed', 500);
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // In a real app, you'd get userId from JWT middleware
    // For now, return a mock profile
    const mockProfile = {
      id: 'user-1',
      email: 'user@arsonist-mcp.ai',
      name: 'Security Researcher',
      role: 'admin',
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockProfile
    });
    return;

  } catch (error) {
    logger.error('Failed to get profile', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw createApiError('Failed to get profile', 500);
  }
});

export default router;