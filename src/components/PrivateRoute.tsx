import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Verifica se existe sessão válida no localStorage do Supabase
const hasSupabaseSession = (): boolean => {
  try {
    // Verifica a flag de sessão ativa no sessionStorage
    if (sessionStorage.getItem('vintech-session-active') === '1') return true;

    // Verifica perfil cacheado
    const profile = localStorage.getItem('vintech-profile-cache');
    if (profile) return true;

    // Verifica token do Supabase diretamente no localStorage
    const key = Object.keys(localStorage).find(
      k => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (!key) return false;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const expiresAt = data?.expires_at;
    // Considera válido se não expirou
    if (expiresAt && Date.now() / 1000 > expiresAt + 60) return false;
    return !!data?.access_token;
  } catch {
    return false;
  }
};

// Verifica se o usuário explicitamente clicou em "Sair"
const wasExplicitLogout = (): boolean => {
  return sessionStorage.getItem('vintech-explicit-logout') === '1';
};

export const PrivateRoute: React.FC = () => {
  const { session, loading } = useAuth();

  // IRON GATE: Só redireciona se for logout explícito OU se confirmado sem sessão
  // Nunca redireciona apenas por loading ou falha técnica temporária
  if (!session && !loading) {
    // Só vai para login se:
    // 1. Foi logout explícito (clicou em Sair), OU
    // 2. Não há NENHUMA evidência de sessão em nenhum storage
    if (wasExplicitLogout() || !hasSupabaseSession()) {
      return <Navigate to="/login" replace />;
    }
  }

  // Tem sessão no storage mas ainda carregando: mostra conteúdo (sem spinner)
  if (loading && hasSupabaseSession()) {
    return <Outlet />;
  }

  // Carregando e sem nenhuma sessão: spinner breve
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
