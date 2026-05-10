import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export const LegalLayout = ({ children, title, lastUpdated }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/login" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Última atualização: {lastUpdated}
            </p>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-p:text-muted-foreground prose-p:leading-relaxed space-y-8">
            {children}
          </div>
          
          <div className="mt-20 border-t pt-8 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Vintech. Todos os direitos reservados.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
