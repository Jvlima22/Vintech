import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import vineyardImg from "@/assets/vineyard.jpg";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  // Verificar se o usuário caiu aqui via link de recuperação (hash na URL)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Se não houver sessão ativa (token no hash), o link pode ser inválido
        // Mas o Supabase Auth costuma colocar a sessão automaticamente ao clicar no link
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Senha alterada com sucesso!");
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      toast.error("Erro ao atualizar senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex">
      {/* ── Painel Esquerdo (decorativo) ── */}
      <aside className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden p-12">
        <img
          src={vineyardImg}
          alt="Vinhedo ao pôr do sol"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/90 via-primary/80 to-primary-deep/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--gold)/0.18),transparent_60%)]" />

        <div className="relative z-10">
          <Link to="/">
            <Logo variant="light" />
          </Link>
        </div>

        <div className="relative z-10 animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="text-xs font-medium uppercase tracking-widest text-gold-soft">
              Atualização de Credenciais
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground xl:text-5xl">
            Escolha sua nova <span className="text-gold">senha.</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-foreground/70">
            Sua segurança é nossa prioridade. Defina uma senha forte para 
            garantir que seus dados permaneçam protegidos.
          </p>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Vintech. Todos os direitos reservados.
        </p>
      </aside>

      {/* ── Painel Direito (formulário) ── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 sm:px-12">
        <div className="mb-10 lg:hidden">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          {!success ? (
            <>
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  Nova senha
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Crie uma senha segura para acessar sua conta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="pl-10 pr-10 h-11 border-input focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="pl-10 h-11 border-input focus-visible:ring-primary"
                    />
                  </div>
                </div>

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
                      Atualizando…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Redefinir Senha
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
                Senha atualizada!
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes.
              </p>
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Ir para o Login agora
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
