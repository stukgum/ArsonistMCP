// Production database using Supabase
// SIMULATION MODE DISABLED: No longer using in-memory database for demo purposes
// Now requires real Supabase credentials and will fail if database is unavailable

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required for production mode');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = supabase; // For admin operations, use service role key in production