import React, { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, Profile } from './AuthContext';

const PROFILE_CACHE_KEY = 'vintech-profile-cache';
const SESSION_FLAG_KEY  = 'vintech-session-active';
const LOGOUT_FLAG_KEY   = 'vintech-explicit-logout';

export const readCachedProfile = (): Profile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeCachedProfile = (profile: Profile | null) => {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      sessionStorage.setItem(SESSION_FLAG_KEY, '1');
      sessionStorage.removeItem(LOGOUT_FLAG_KEY);
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession]   = useState<Session | null>(null);
  const [user, setUser]         = useState<User | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(readCachedProfile);
  const [loading, setLoading]   = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, winery:wineries(name, slug)`)
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('fetchProfile error:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const data = await fetchProfile(user.id);
    if (data) { setProfile(data); writeCachedProfile(data); }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const fresh = await fetchProfile(session.user.id);
        if (mounted && fresh) { setProfile(fresh); writeCachedProfile(fresh); }
      } else {
        // Sem sessão real: limpa apenas se foi logout explícito
        if (sessionStorage.getItem(LOGOUT_FLAG_KEY) === '1') {
          setProfile(null);
          writeCachedProfile(null);
          sessionStorage.removeItem(SESSION_FLAG_KEY);
        }
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const fresh = await fetchProfile(session.user.id);
          if (mounted && fresh) { setProfile(fresh); writeCachedProfile(fresh); }
        }
        if (mounted) setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        writeCachedProfile(null);
        sessionStorage.removeItem(SESSION_FLAG_KEY);
        if (mounted) setLoading(false);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    // Marca logout explícito ANTES de chamar signOut
    sessionStorage.setItem(LOGOUT_FLAG_KEY, '1');
    sessionStorage.removeItem(SESSION_FLAG_KEY);
    localStorage.removeItem(PROFILE_CACHE_KEY);
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, signInWithGoogle, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
