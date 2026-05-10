import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const links = [
  { href: "#modulos", label: "Módulos" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#planos", label: "Planos" },
  { href: "#contato", label: "Contato" },
];

export const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sessão encerrada");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao sair");
    }
  };

  const onLanding = pathname === "/";
  
  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  
  const formatName = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) return name;
    return `${parts[0]} ${parts[1]}`;
  };

  const displayName = formatName(rawName);
  const userInitial = displayName?.charAt(0) || "U";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

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

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "text-sm font-medium",
                  scrolled || !onLanding ? "text-foreground" : "text-primary-foreground"
                )}>
                  {displayName}
                </span>
              </div>
              
              <Button asChild variant="hero" size="sm" className="gap-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Acessar sistema
                </Link>
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className={cn(
                  "h-8 w-8",
                  scrolled || !onLanding ? "text-muted-foreground hover:text-destructive" : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className={cn(!scrolled && onLanding && "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground")}>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/register">Começar grátis</Link>
              </Button>
            </>
          )}
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
            {user && (
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {displayName}
                  </span>
                  <button onClick={handleSignOut} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive">
                    <LogOut className="h-3 w-3" /> Sair da conta
                  </button>
                </div>
              </div>
            )}
            
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                {l.label}
              </a>
            ))}
            
            <Button asChild variant="hero" size="sm" className="mt-2">
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                {user ? "Acessar sistema" : "Começar grátis"}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
