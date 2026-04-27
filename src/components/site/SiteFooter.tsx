import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export const SiteFooter = () => {
  return (
    <footer id="contato" className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
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
              <li className="text-sidebar-foreground/70">contato@vintech.com.br</li>
              <li className="text-sidebar-foreground/70">+55 54 99999-0000</li>
              <li className="text-sidebar-foreground/70">Bento Gonçalves, RS</li>
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
