import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Vinhedo",
    price: "297",
    desc: "Para vinícolas boutique iniciando a digitalização.",
    features: ["Até 3 usuários", "Módulos Produtos & Vendas", "1.000 pedidos/mês", "Suporte por email"],
    highlighted: false,
  },
  {
    name: "Reserva",
    price: "697",
    desc: "Para vinícolas em crescimento com enoturismo ativo.",
    features: [
      "Até 15 usuários",
      "Todos os 5 módulos",
      "Pedidos ilimitados",
      "Clube de assinatura",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Grand Cru",
    price: "Sob consulta",
    desc: "Para grupos vinícolas e operações multi-rótulo.",
    features: [
      "Usuários ilimitados",
      "Multi-tenant avançado",
      "API & integrações custom",
      "SLA 99.9%",
      "Gerente dedicado",
    ],
    highlighted: false,
  },
];

export const Pricing = () => {
  return (
    <section id="planos" className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Planos transparentes
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Escolha o plano que combina com o
            <span className="text-primary"> ritmo da sua colheita.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative rounded-2xl border p-8 transition-all hover:-translate-y-1",
                p.highlighted
                  ? "border-primary/40 bg-wine text-primary-foreground shadow-elegant scale-[1.02]"
                  : "border-border bg-card shadow-card hover:shadow-elegant"
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                  Mais escolhido
                </span>
              )}

              <h3 className={cn("font-display text-2xl font-bold", p.highlighted && "text-gold")}>
                {p.name}
              </h3>
              <p className={cn("mt-2 text-sm", p.highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {p.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                {p.price === "Sob consulta" ? (
                  <span className="font-display text-4xl font-bold">Sob consulta</span>
                ) : (
                  <>
                    <span className="text-2xl font-medium opacity-70">R$</span>
                    <span className="font-display text-5xl font-bold">{p.price}</span>
                    <span className={cn("text-sm", p.highlighted ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      /mês
                    </span>
                  </>
                )}
              </div>

              <Button
                asChild
                variant={p.highlighted ? "hero" : "outline"}
                size="lg"
                className="mt-6 w-full"
              >
                <Link to="/dashboard">Começar agora</Link>
              </Button>

              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.highlighted ? "text-gold" : "text-primary")} />
                    <span className={p.highlighted ? "text-primary-foreground/85" : "text-foreground/80"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
