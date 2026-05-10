import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import vineyardImg from "@/assets/vineyard.jpg";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      toast.error("Erro ao enviar e-mail: " + error.message);
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
              Segurança da sua conta
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground xl:text-5xl">
            Recupere o seu <span className="text-gold">acesso.</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-foreground/70">
            Sem estresse — acontece com todos. Enviaremos um link seguro para
            você criar uma nova senha em segundos.
          </p>

          <div className="mt-10 border-t border-primary-foreground/10 pt-8">
            <div className="inline-flex items-start gap-8">
              {[
                { value: "SSL", label: "Criptografado" },
                { value: "2min", label: "Processo rápido" },
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
          {!sent ? (
            <>
              {/* Cabeçalho */}
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  Redefinir senha
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Digite o e-mail da sua conta e enviaremos um link de recuperação.
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-5">
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
                      placeholder="Endereço de e-mail cadastrado"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Enviando…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Enviar link de recuperação
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Estado de Sucesso */
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
                E-mail enviado!
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Enviamos um link de recuperação para{" "}
                <span className="font-semibold text-foreground">{email}</span>.
                <br />
                Verifique sua caixa de entrada (e o spam).
              </p>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Tentar outro e-mail
              </Button>
            </div>
          )}

          {/* Voltar ao login */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
