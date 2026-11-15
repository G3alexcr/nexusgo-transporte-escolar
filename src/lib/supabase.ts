import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  typeof import.meta !== 'undefined' ? (import.meta.env?.['VITE_SUPABASE_URL'] as string | undefined) : undefined;
const supabaseKey =
  typeof import.meta !== 'undefined'
    ? (import.meta.env?.['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined)
    : undefined;

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return cachedClient;
}

/**
 * Ephemeral client without session persistence so an admin can register
 * another user via auth.signUp without overwriting their own active session.
 */
export function createEphemeralSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
