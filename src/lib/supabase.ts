import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Singleton: evita múltiplas instâncias durante HMR do Vite
declare global { var __vintech_supabase__: SupabaseClient | undefined; }

if (!globalThis.__vintech_supabase__) {
  globalThis.__vintech_supabase__ = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // CORREÇÃO RAIZ: Substitui o Navigator Lock por uma função simples
      // Elimina o NavigatorLockAcquireTimeoutError completamente
      lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
        return fn();
      },
    }
  });
}

export const supabase = globalThis.__vintech_supabase__!;
