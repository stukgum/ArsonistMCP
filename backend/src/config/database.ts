// Production database using Supabase
// SIMULATION MODE DISABLED: No longer using in-memory database for demo purposes
// Now requires real Supabase credentials and will fail if database is unavailable

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required for production mode');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});

export const supabaseAdmin = supabase; // For admin operations, use service role key in production