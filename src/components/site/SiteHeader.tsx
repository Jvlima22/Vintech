import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "#modulos", label: "Módulos" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#planos", label: "Planos" },
  { href: "#contato", label: "Contato" },
];

export const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLanding = pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || !onLanding
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/">
          <Logo variant={scrolled || !onLanding ? "default" : "light"} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors",
                scrolled || !onLanding
                  ? "text-foreground/70 hover:text-primary"
                  : "text-primary-foreground/80 hover:text-gold"
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm" className={cn(!scrolled && onLanding && "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground")}>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/register">Começar grátis</Link>
          </Button>
        </div>

        <button
          className={cn("md:hidden", scrolled || !onLanding ? "text-foreground" : "text-primary-foreground")}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-4 py-6">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                {l.label}
              </a>
            ))}
            <Button asChild variant="hero" size="sm" className="mt-2">
              <Link to="/dashboard">Começar grátis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
