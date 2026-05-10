import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export const SiteFooter = () => {
  return (
    <footer id="contato" className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo variant="light" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-sidebar-foreground/65">
              A plataforma SaaS multi-tenant para gestão integrada de vinícolas modernas.
              Da vindima à última taça.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Produto
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#modulos" className="text-sidebar-foreground/70 hover:text-gold transition-colors">Módulos</a></li>
              <li><a href="#planos" className="text-sidebar-foreground/70 hover:text-gold transition-colors">Planos</a></li>
              <li><Link to="/dashboard" className="text-sidebar-foreground/70 hover:text-gold transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Contato
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-sidebar-foreground/70">contato.vintech@gmail.com</li>
              <li className="text-sidebar-foreground/70">+55 (11) 97567-8074</li>
              <li className="text-sidebar-foreground/70">São Paulo, SP</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
              Institucional
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/terms" className="text-sidebar-foreground/70 hover:text-gold transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="text-sidebar-foreground/70 hover:text-gold transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-sidebar-border pt-8 md:flex-row">
          <p className="text-xs text-sidebar-foreground/55">
            © 2026 Vintech. Feito com paixão pelo vinho.
          </p>
          <p className="text-xs text-sidebar-foreground/55">
            Multi-tenant · LGPD · ISO 27001
          </p>
        </div>
      </div>
    </footer>
  );
};
