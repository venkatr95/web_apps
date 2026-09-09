import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are present and not default placeholders
const isUrlValid = supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL" && supabaseUrl !== "";
const isKeyValid = supabaseAnonKey && supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY" && supabaseAnonKey !== "";

export const isSupabaseConfigured = isUrlValid && isKeyValid;

if (!isSupabaseConfigured) {
  console.warn('Supabase is not fully configured. Auth features will be disabled.');
}

// Fallback to prevent crash, but requests will fail if not configured
const url = isUrlValid ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isKeyValid ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(url, key);
