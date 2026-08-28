import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[Supabase Frontend Init Warning]', err.message);
  }
}

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
export const getSupabase = () => supabase;
export default supabase;
