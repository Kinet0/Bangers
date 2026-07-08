import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export let dbMode = 'mock';
export let supabase = null;
export let supabaseAdmin = null;

const isConfigured = (val) => val && val !== '' && !val.includes('your_');

if (isConfigured(supabaseUrl) && isConfigured(supabaseAnonKey)) {
  dbMode = 'supabase';
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  if (isConfigured(supabaseServiceKey)) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } else {
    supabaseAdmin = supabase; // Fallback
  }
  console.log('Database Mode: SUPABASE');
} else {
  console.log('Database Mode: MOCK (In-memory fallback database for local testing)');
}
