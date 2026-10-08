import { createClient } from '@supabase/supabase-js';

// The project URL specified by user instruction
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {
    // ignore
  }
  return '';
};

export const SUPABASE_URL =
  getEnvVar('VITE_SUPABASE_URL') || 'https://emnnltbzxzdutnisvzni.supabase.co';

export const SUPABASE_ANON_KEY =
  getEnvVar('VITE_SUPABASE_ANON_KEY') || '';

// Create and export the Supabase client
export const supabase = SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
};

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  status: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      status: 'Awaiting publishable/anon key in configuration',
    };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (res.ok || res.status === 200) {
      return { connected: true, status: 'Online and Connected' };
    } else {
      return {
        connected: false,
        status: `Supabase returned HTTP ${res.status}`,
        error: await res.text(),
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      status: 'Connection error',
      error: err?.message || 'Network failure',
    };
  }
}
