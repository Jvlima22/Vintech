import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import vineyardImg from "@/assets/vineyard.jpg";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error("Erro ao entrar com Google: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast.error("Erro ao entrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex">
      {/* ── Painel Esquerdo (decorativo) ── */}
      <aside className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden p-12">
        {/* Background */}
        <img
          src={vineyardImg}
          alt="Vinhedo ao pôr do sol"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/90 via-primary/80 to-primary-deep/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--gold)/0.18),transparent_60%)]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <Logo variant="light" />
          </Link>
        </div>

        {/* Copy central */}
        <div className="relative z-10 animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="text-xs font-medium uppercase tracking-widest text-gold-soft">
              Sistema Integrado de Gestão Vinícola
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground xl:text-5xl">
            Bem-vindo de <span className="text-gold">volta.</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-foreground/70">
            A plataforma completa para vinícolas modernas — do controle de
            estoque ao enoturismo, tudo integrado em um único sistema.
          </p>

          {/* Stats */}
          <div className="mt-10 border-t border-primary-foreground/10 pt-8">
            <div className="inline-flex items-start gap-8">
              {[
                { value: "5", label: "Módulos" },
                { value: "100%", label: "Multi-tenant" },
                { value: "24/7", label: "Suporte" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-bold text-gold">{s.value}</div>
                  <div className="mt-0.5 text-xs uppercase tracking-wider text-primary-foreground/55">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé lateral */}
        <p className="relative z-10 text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Vintech. Todos os direitos reservados.
        </p>
      </aside>

      {/* ── Painel Direito (formulário) ── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 sm:px-12">
        {/* Logo mobile */}
        <div className="mb-10 lg:hidden">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Entrar na sua conta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Criar gratuitamente
              </Link>
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Endereço de e-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10 h-11 border-input focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-10 pr-10 h-11 border-input focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full group mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Entrando…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-xs text-muted-foreground">ou continue com</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Social */}
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3 border-border hover:border-primary/40 hover:bg-primary/5"
            type="button"
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Entrar com Google
          </Button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ao entrar, você concorda com nossos{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};
