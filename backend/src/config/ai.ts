import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
// Ollama (local) - commented out for now due to import issues
// import * as ollama from 'ollama';
import { logger } from '../utils/logger.js';

// AI Service Instances
let googleAI: GoogleGenerativeAI | null = null;
let openai: OpenAI | null = null;
let huggingface: HfInference | null = null;

// Initialize AI Services
export async function initializeAI(): Promise<void> {
  try {
    // Google AI
    if (process.env.GOOGLE_AI_API_KEY) {
      googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      logger.info('Google AI initialized');
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      logger.info('OpenAI initialized');
    }

    // HuggingFace
    if (process.env.HUGGINGFACE_API_KEY) {
      huggingface = new HfInference(process.env.HUGGINGFACE_API_KEY);
      logger.info('HuggingFace initialized');
    }

    // Ollama (local) - temporarily disabled
    // if (process.env.OLLAMA_BASE_URL) {
    //   try {
    //     await ollama.list();
    //     logger.info('Ollama initialized');
    //   } catch (error) {
    //     logger.warn('Ollama not available', { error: error.message });
    //   }
    // }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to initialize AI services', { error: errorMessage });
    throw error;
  }
}

// AI Service Functions
export async function generateWithGoogleAI(prompt: string, model: string = 'gemini-pro'): Promise<string> {
  if (!googleAI) throw new Error('Google AI not initialized');

  try {
    const genModel = googleAI.getGenerativeModel({ model });
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Google AI generation failed', { error: errorMessage });
    throw error;
  }
}

export async function generateWithOpenAI(prompt: string, model: string = 'gpt-4'): Promise<string> {
  if (!openai) throw new Error('OpenAI not initialized');

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('OpenAI generation failed', { error: errorMessage });
    throw error;
  }
}

export async function generateWithHuggingFace(prompt: string, model: string = 'microsoft/DialoGPT-medium'): Promise<string> {
  if (!huggingface) throw new Error('HuggingFace not initialized');

  try {
    const result = await huggingface.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
      },
    });
    return result.generated_text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('HuggingFace generation failed', { error: errorMessage });
    throw error;
  }
}

export async function generateWithOllama(prompt: string, model: string = 'llama2'): Promise<string> {
  // Temporarily disabled due to import issues
  logger.warn('Ollama integration temporarily disabled');
  return `Ollama response for: ${prompt.substring(0, 50)}...`;
}

// Unified AI generation function
export async function generateText(
  prompt: string,
  provider: 'google' | 'openai' | 'huggingface' | 'ollama' = 'google',
  options: { model?: string } = {}
): Promise<string> {
  switch (provider) {
    case 'google':
      return generateWithGoogleAI(prompt, options.model);
    case 'openai':
      return generateWithOpenAI(prompt, options.model);
    case 'huggingface':
      return generateWithHuggingFace(prompt, options.model);
    case 'ollama':
      return generateWithOllama(prompt, options.model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}